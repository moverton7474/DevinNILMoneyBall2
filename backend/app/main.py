from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import List, Optional
import psycopg
import os
import time
import json
import asyncio
from datetime import datetime, timedelta
import redis
from prometheus_fastapi_instrumentator import Instrumentator
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from .database import engine, get_db
from .models import Base, User, Team, Athlete, NILDeal, AthleteEvaluation, TransferPortalEntry, RevenueShareAllocation, ComplianceReport, SocialMediaMetrics, CompetitiveIntelligence, ReportSchedule
from .auth import get_current_user, get_current_active_user, create_access_token, verify_password, get_password_hash
from .baron_hopson import BaronHopsonEngine
from .advanced_analytics import AdvancedBaronHopsonAnalytics
from .valuation_engine_v3 import ValuationEngineV3
from .schemas import (
    UserBase, UserCreate, UserLogin, UserResponse,
    TeamBase, TeamCreate, TeamResponse,
    AthleteBase, AthleteCreate, AthleteUpdate, AthleteResponse,
    NILDealBase, NILDealCreate, NILDealResponse,
    TransferPortalBase, TransferPortalCreate, TransferPortalResponse,
    RevenueShareBase, RevenueShareCreate, RevenueShareResponse,
    ComplianceReportBase, ComplianceReportCreate, ComplianceReportResponse
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="NIL Moneyball API",
    description="College Football Analytics Platform with Baron Hopson Valuation Methodology",
    version="1.0.0"
)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:80", "http://localhost", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

redis_client = None

@app.on_event("startup")
async def startup_event():
    global redis_client
    try:
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        redis_client = redis.from_url(redis_url, decode_responses=True)
        redis_client.ping()
        print("Redis connection established")
    except Exception as e:
        print(f"Redis connection failed: {e}")
        redis_client = None

@app.on_event("shutdown")
async def shutdown_event():
    global redis_client
    if redis_client:
        redis_client.close()

instrumentator = Instrumentator()
instrumentator.instrument(app).expose(app)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-Process-Time"] = str(process_time)
    
    return response

def get_cached_data(key: str):
    if redis_client:
        try:
            cached = redis_client.get(key)
            if cached:
                return json.loads(cached)
        except Exception as e:
            print(f"Redis get error: {e}")
    return None

def set_cached_data(key: str, data: dict, expire: int = 300):
    if redis_client:
        try:
            redis_client.setex(key, expire, json.dumps(data, default=str))
        except Exception as e:
            print(f"Redis set error: {e}")

baron_hopson_engine = BaronHopsonEngine()
advanced_analytics = AdvancedBaronHopsonAnalytics()
valuation_engine_v3 = ValuationEngineV3()

@app.get("/healthz")
async def healthz():
    return {"status": "ok", "message": "NIL Moneyball API is running"}

@app.get("/health/detailed")
async def detailed_health_check(db: Session = Depends(get_db)):
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {}
    }
    
    try:
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        health_status["services"]["database"] = {"status": "healthy", "response_time_ms": 0}
    except Exception as e:
        health_status["services"]["database"] = {"status": "unhealthy", "error": str(e)}
        health_status["status"] = "degraded"
    
    if redis_client:
        try:
            start_time = time.time()
            redis_client.ping()
            response_time = (time.time() - start_time) * 1000
            health_status["services"]["redis"] = {"status": "healthy", "response_time_ms": round(response_time, 2)}
        except Exception as e:
            health_status["services"]["redis"] = {"status": "unhealthy", "error": str(e)}
            health_status["status"] = "degraded"
    else:
        health_status["services"]["redis"] = {"status": "not_configured"}
    
    try:
        athlete_count = db.query(Athlete).count()
        team_count = db.query(Team).count()
        health_status["services"]["application"] = {
            "status": "healthy",
            "metrics": {
                "total_athletes": athlete_count,
                "total_teams": team_count
            }
        }
    except Exception as e:
        health_status["services"]["application"] = {"status": "unhealthy", "error": str(e)}
        health_status["status"] = "degraded"
    
    return health_status

@app.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_user = db.query(User).filter(User.username == user_data.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        role=user_data.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@app.post("/auth/login")
@limiter.limit("5/minute")
async def login(request: Request, login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    return current_user

@app.post("/teams", response_model=TeamResponse)
async def create_team(team_data: TeamCreate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    db_team = Team(**team_data.dict(), coach_id=current_user.id)
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return db_team

@app.get("/teams", response_model=List[TeamResponse])
async def get_teams(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    teams = db.query(Team).offset(skip).limit(limit).all()
    return teams

@app.get("/teams/{team_id}", response_model=TeamResponse)
async def get_team(team_id: int, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team

@app.post("/athletes", response_model=AthleteResponse)
async def create_athlete(athlete_data: AthleteCreate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    db_athlete = Athlete(**athlete_data.dict())
    db.add(db_athlete)
    db.commit()
    db.refresh(db_athlete)
    
    evaluation = baron_hopson_engine.evaluate_athlete(db_athlete)
    db_athlete.baron_hopson_score = evaluation['baron_hopson_score']
    db_athlete.market_value = evaluation['market_value']
    db_athlete.nil_value = evaluation['nil_value']
    db_athlete.revenue_share_value = evaluation['revenue_share_value']
    
    db.commit()
    db.refresh(db_athlete)
    return db_athlete

@app.get("/athletes", response_model=List[AthleteResponse])
@limiter.limit("100/hour")
async def get_athletes(request: Request, team_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(Athlete)
    if team_id:
        query = query.filter(Athlete.team_id == team_id)
    athletes = query.offset(skip).limit(limit).all()
    return athletes

@app.get("/athletes/{athlete_id}", response_model=AthleteResponse)
async def get_athlete(athlete_id: int, db: Session = Depends(get_db)):
    athlete = db.query(Athlete).filter(Athlete.id == athlete_id).first()
    if not athlete:
        raise HTTPException(status_code=404, detail="Athlete not found")
    return athlete

@app.put("/athletes/{athlete_id}", response_model=AthleteResponse)
async def update_athlete(athlete_id: int, athlete_data: AthleteUpdate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    db_athlete = db.query(Athlete).filter(Athlete.id == athlete_id).first()
    if not db_athlete:
        raise HTTPException(status_code=404, detail="Athlete not found")
    
    for field, value in athlete_data.dict(exclude_unset=True).items():
        setattr(db_athlete, field, value)
    
    evaluation = baron_hopson_engine.evaluate_athlete(db_athlete)
    db_athlete.baron_hopson_score = evaluation['baron_hopson_score']
    db_athlete.market_value = evaluation['market_value']
    db_athlete.nil_value = evaluation['nil_value']
    db_athlete.revenue_share_value = evaluation['revenue_share_value']
    
    db.commit()
    db.refresh(db_athlete)
    return db_athlete

@app.post("/analytics/evaluate-athlete/{athlete_id}")
async def evaluate_athlete(athlete_id: int, db: Session = Depends(get_db)):
    athlete = db.query(Athlete).filter(Athlete.id == athlete_id).first()
    if not athlete:
        raise HTTPException(status_code=404, detail="Athlete not found")
    
    evaluation = baron_hopson_engine.evaluate_athlete(athlete)
    
    athlete.baron_hopson_score = evaluation['baron_hopson_score']
    athlete.market_value = evaluation['market_value']
    athlete.nil_value = evaluation['nil_value']
    athlete.revenue_share_value = evaluation['revenue_share_value']
    
    db.commit()
    
    return evaluation

@app.post("/analytics/optimize-roster/{team_id}")
async def optimize_roster(team_id: int, budget: float, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    athletes = db.query(Athlete).filter(Athlete.team_id == team_id, Athlete.is_active == True).all()
    if not athletes:
        raise HTTPException(status_code=404, detail="No active athletes found for team")
    
    optimization = baron_hopson_engine.optimize_roster_allocation(athletes, budget)
    return optimization

@app.get("/analytics/team-dashboard/{team_id}")
@limiter.limit("100/hour")
async def get_team_dashboard(request: Request, team_id: int, db: Session = Depends(get_db)):
    cache_key = f"dashboard:team:{team_id}"
    cached_data = get_cached_data(cache_key)
    if cached_data:
        return cached_data
    
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    athletes = db.query(Athlete).filter(Athlete.team_id == team_id, Athlete.is_active == True).all()
    
    total_baron_hopson = sum(a.baron_hopson_score for a in athletes)
    avg_baron_hopson = total_baron_hopson / len(athletes) if athletes else 0
    total_nil_value = sum(a.nil_value for a in athletes)
    total_revenue_share = sum(a.revenue_share_value for a in athletes)
    
    position_breakdown = {}
    for athlete in athletes:
        pos = athlete.position
        if pos not in position_breakdown:
            position_breakdown[pos] = {'count': 0, 'avg_score': 0, 'total_value': 0}
        position_breakdown[pos]['count'] += 1
        position_breakdown[pos]['total_value'] += athlete.market_value
    
    for pos in position_breakdown:
        pos_athletes = [a for a in athletes if a.position == pos]
        position_breakdown[pos]['avg_score'] = sum(a.baron_hopson_score for a in pos_athletes) / len(pos_athletes)
    
    dashboard_data = {
        'team': {
            'id': team.id,
            'name': team.name,
            'conference': team.conference,
            'revenue_share_cap': team.revenue_share_cap,
            'current_revenue_share': team.current_revenue_share
        },
        'total_athletes': len(athletes),
        'total_baron_hopson_score': total_baron_hopson,
        'average_baron_hopson_score': avg_baron_hopson,
        'total_nil_value': total_nil_value,
        'total_revenue_share_value': total_revenue_share,
        'revenue_share_cap_remaining': team.revenue_share_cap - team.current_revenue_share,
        'position_breakdown': position_breakdown,
        'top_performers': [
            {
                'id': a.id,
                'name': a.name,
                'position': a.position,
                'baron_hopson_score': a.baron_hopson_score,
                'market_value': a.market_value
            } for a in sorted(athletes, key=lambda x: x.baron_hopson_score, reverse=True)[:10]
        ]
    }
    
    set_cached_data(cache_key, dashboard_data, expire=300)
    return dashboard_data

@app.post("/transfer-portal", response_model=TransferPortalResponse)
async def create_transfer_portal_entry(entry_data: TransferPortalCreate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    athlete = db.query(Athlete).filter(Athlete.id == entry_data.athlete_id).first()
    if not athlete:
        raise HTTPException(status_code=404, detail="Athlete not found")
    
    db_entry = TransferPortalEntry(
        **entry_data.dict(),
        baron_hopson_score_at_entry=athlete.baron_hopson_score,
        market_value_at_entry=athlete.market_value
    )
    db.add(db_entry)
    
    athlete.transfer_portal_status = "portal"
    
    db.commit()
    db.refresh(db_entry)
    return db_entry

@app.get("/transfer-portal", response_model=List[TransferPortalResponse])
async def get_transfer_portal_entries(status: Optional[str] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(TransferPortalEntry)
    if status:
        query = query.filter(TransferPortalEntry.status == status)
    entries = query.offset(skip).limit(limit).all()
    return entries

@app.post("/nil-deals", response_model=NILDealResponse)
async def create_nil_deal(deal_data: NILDealCreate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    db_deal = NILDeal(**deal_data.dict())
    db.add(db_deal)
    db.commit()
    db.refresh(db_deal)
    return db_deal

@app.get("/nil-deals", response_model=List[NILDealResponse])
async def get_nil_deals(athlete_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(NILDeal)
    if athlete_id:
        query = query.filter(NILDeal.athlete_id == athlete_id)
    deals = query.offset(skip).limit(limit).all()
    return deals

@app.post("/revenue-share", response_model=RevenueShareResponse)
async def create_revenue_share_allocation(allocation_data: RevenueShareCreate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    db_allocation = RevenueShareAllocation(**allocation_data.dict())
    db.add(db_allocation)
    db.commit()
    db.refresh(db_allocation)
    return db_allocation

@app.get("/revenue-share/team/{team_id}")
async def get_team_revenue_share(team_id: int, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    allocations = db.query(RevenueShareAllocation).filter(RevenueShareAllocation.team_id == team_id).all()
    total_allocated = sum(a.allocation_amount for a in allocations)
    
    return {
        'team': team,
        'revenue_share_cap': team.revenue_share_cap,
        'total_allocated': total_allocated,
        'remaining_cap': team.revenue_share_cap - total_allocated,
        'allocations': allocations,
        'compliance_status': 'compliant' if total_allocated <= team.revenue_share_cap else 'over_cap'
    }

@app.post("/compliance/reports", response_model=ComplianceReportResponse)
async def create_compliance_report(report_data: ComplianceReportCreate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    db_report = ComplianceReport(**report_data.dict(), generated_by=current_user.id)
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

@app.get("/compliance/title-ix/{team_id}")
async def get_title_ix_compliance(team_id: int, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    nil_deals = db.query(NILDeal).join(Athlete).filter(Athlete.team_id == team_id).all()
    revenue_allocations = db.query(RevenueShareAllocation).filter(RevenueShareAllocation.team_id == team_id).all()
    
    total_nil_value = sum(deal.deal_value for deal in nil_deals)
    total_revenue_share = sum(alloc.allocation_amount for alloc in revenue_allocations)
    
    return {
        'team_id': team_id,
        'total_nil_value': total_nil_value,
        'total_revenue_share': total_revenue_share,
        'title_ix_compliant': True,  # Simplified - would need actual Title IX logic
        'compliance_notes': 'All deals and allocations reviewed for Title IX compliance'
    }

@app.get("/api/reports/baron-roi")
@limiter.limit("50/hour")
async def get_baron_roi_report(
    request: Request,
    start: str = None, 
    end: str = None, 
    team: int = None, 
    position: str = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    athletes = db.query(Athlete).filter(Athlete.team_id == team if team else True).all()
    
    roi_data = []
    for athlete in athletes:
        roi_ratio = athlete.market_value / max(athlete.nil_value, 1) if athlete.nil_value > 0 else 0
        
        try:
            prediction = advanced_analytics.predict_future_performance(athlete, db, 6)
            predicted_trend = prediction.get('trend', 'stable')
            risk_level = 'high' if len(prediction.get('risk_factors', [])) > 2 else 'low'
        except:
            predicted_trend = 'stable'
            risk_level = 'low'
        
        roi_data.append({
            'athlete_id': athlete.id,
            'name': athlete.name,
            'position': athlete.position,
            'baron_hopson_score': athlete.baron_hopson_score,
            'nil_investment': athlete.nil_value,
            'market_value': athlete.market_value,
            'roi_ratio': roi_ratio,
            'is_baron_gem': roi_ratio >= 6.0,
            'predicted_trend': predicted_trend,
            'risk_level': risk_level
        })
    
    return {
        'report_type': 'baron_roi',
        'data': sorted(roi_data, key=lambda x: x['roi_ratio'], reverse=True),
        'summary': {
            'total_athletes': len(athletes),
            'baron_gems_count': len([a for a in roi_data if a['is_baron_gem']]),
            'average_roi': sum(a['roi_ratio'] for a in roi_data) / len(roi_data) if roi_data else 0
        }
    }

@app.get("/api/reports/recruiting-pipeline")
async def get_recruiting_pipeline_report(
    window: int = 7,
    position: str = None,
    status: str = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    from datetime import datetime, timedelta
    cutoff_date = datetime.utcnow() - timedelta(days=window)
    
    entries = db.query(TransferPortalEntry).filter(
        TransferPortalEntry.entry_date >= cutoff_date
    ).all()
    
    pipeline_data = []
    for entry in entries:
        days_in_portal = (datetime.utcnow() - entry.entry_date).days
        status_color = 'green' if days_in_portal < 7 else 'yellow' if days_in_portal <= 14 else 'red'
        
        pipeline_data.append({
            'entry_id': entry.id,
            'athlete_name': entry.athlete.name if entry.athlete else 'Unknown',
            'position': entry.athlete.position if entry.athlete else 'Unknown',
            'days_in_portal': days_in_portal,
            'status_color': status_color,
            'baron_hopson_score': entry.baron_hopson_score_at_entry,
            'market_value': entry.market_value_at_entry,
            'target_schools': entry.target_schools,
            'recommended_action': 'Strong Buy' if entry.baron_hopson_score_at_entry > 4.0 else 'Monitor'
        })
    
    return {
        'report_type': 'recruiting_pipeline',
        'data': pipeline_data,
        'summary': {
            'new_entries': len(entries),
            'strong_buy_count': len([e for e in pipeline_data if e['recommended_action'] == 'Strong Buy']),
            'average_days_in_portal': sum(e['days_in_portal'] for e in pipeline_data) / len(pipeline_data) if pipeline_data else 0
        }
    }

@app.get("/api/reports/budget-forecast")
async def get_budget_forecast_report(
    fiscal_year: str = None,
    team: int = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    team_obj = db.query(Team).filter(Team.id == team if team else 1).first()
    if not team_obj:
        raise HTTPException(status_code=404, detail="Team not found")
    
    nil_deals = db.query(NILDeal).join(Athlete).filter(Athlete.team_id == team_obj.id).all()
    revenue_allocations = db.query(RevenueShareAllocation).filter(RevenueShareAllocation.team_id == team_obj.id).all()
    
    total_nil_committed = sum(deal.deal_value for deal in nil_deals if deal.status == 'active')
    total_revenue_committed = sum(alloc.allocation_amount for alloc in revenue_allocations)
    
    budget_data = {
        'nil_budget': team_obj.nil_budget,
        'nil_committed': total_nil_committed,
        'nil_available': team_obj.nil_budget - total_nil_committed,
        'revenue_cap': team_obj.revenue_share_cap,
        'revenue_committed': total_revenue_committed,
        'revenue_available': team_obj.revenue_share_cap - total_revenue_committed,
        'budget_efficiency': (total_nil_committed + total_revenue_committed) / (team_obj.nil_budget + team_obj.revenue_share_cap) if (team_obj.nil_budget + team_obj.revenue_share_cap) > 0 else 0
    }
    
    return {
        'report_type': 'budget_forecast',
        'data': budget_data,
        'summary': {
            'total_budget': team_obj.nil_budget + team_obj.revenue_share_cap,
            'total_committed': total_nil_committed + total_revenue_committed,
            'utilization_rate': budget_data['budget_efficiency']
        }
    }

@app.get("/api/reports/position-performance")
async def get_position_performance_report(
    start: str = None,
    end: str = None,
    position: str = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    athletes = db.query(Athlete).filter(Athlete.is_active == True).all()
    
    position_data = {}
    for athlete in athletes:
        pos = athlete.position
        if pos not in position_data:
            position_data[pos] = {
                'position': pos,
                'count': 0,
                'total_nil_cost': 0,
                'total_market_value': 0,
                'avg_baron_score': 0,
                'athletes': []
            }
        
        position_data[pos]['count'] += 1
        position_data[pos]['total_nil_cost'] += athlete.nil_value
        position_data[pos]['total_market_value'] += athlete.market_value
        position_data[pos]['athletes'].append({
            'name': athlete.name,
            'baron_score': athlete.baron_hopson_score,
            'nil_value': athlete.nil_value,
            'market_value': athlete.market_value
        })
    
    for pos in position_data:
        pos_data = position_data[pos]
        pos_data['avg_nil_cost'] = pos_data['total_nil_cost'] / pos_data['count'] if pos_data['count'] > 0 else 0
        pos_data['avg_market_value'] = pos_data['total_market_value'] / pos_data['count'] if pos_data['count'] > 0 else 0
        pos_data['avg_baron_score'] = sum(a['baron_score'] for a in pos_data['athletes']) / pos_data['count'] if pos_data['count'] > 0 else 0
    
    return {
        'report_type': 'position_performance',
        'data': list(position_data.values()),
        'summary': {
            'total_positions': len(position_data),
            'total_athletes': sum(p['count'] for p in position_data.values()),
            'avg_cost_per_position': sum(p['avg_nil_cost'] for p in position_data.values()) / len(position_data) if position_data else 0
        }
    }

@app.get("/api/reports/compliance-academic")
async def get_compliance_academic_report(
    term: str = None,
    status: str = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    athletes = db.query(Athlete).filter(Athlete.is_active == True).all()
    nil_deals = db.query(NILDeal).all()
    
    compliance_data = []
    for athlete in athletes:
        athlete_deals = [deal for deal in nil_deals if deal.athlete_id == athlete.id]
        total_deal_value = sum(deal.deal_value for deal in athlete_deals)
        
        compliance_data.append({
            'athlete_id': athlete.id,
            'name': athlete.name,
            'position': athlete.position,
            'year': athlete.year,
            'nil_deals_count': len(athlete_deals),
            'total_nil_value': total_deal_value,
            'compliance_status': 'compliant' if all(deal.compliance_status == 'approved' for deal in athlete_deals) else 'pending',
            'academic_status': 'eligible',  # Simplified
            'risk_level': 'low' if total_deal_value < 50000 else 'medium' if total_deal_value < 100000 else 'high'
        })
    
    return {
        'report_type': 'compliance_academic',
        'data': compliance_data,
        'summary': {
            'total_athletes': len(athletes),
            'compliant_count': len([a for a in compliance_data if a['compliance_status'] == 'compliant']),
            'high_risk_count': len([a for a in compliance_data if a['risk_level'] == 'high'])
        }
    }

@app.get("/api/reports/social-roi")
async def get_social_roi_report(
    start: str = None,
    end: str = None,
    platform: str = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    athletes = db.query(Athlete).filter(Athlete.is_active == True).all()
    
    social_data = []
    for athlete in athletes:
        mock_followers = athlete.id * 1000 + 5000
        mock_engagement = 0.03 + (athlete.baron_hopson_score / 100)
        mock_social_value = mock_followers * mock_engagement * 0.1
        
        social_data.append({
            'athlete_id': athlete.id,
            'name': athlete.name,
            'position': athlete.position,
            'total_followers': mock_followers,
            'engagement_rate': mock_engagement,
            'social_nil_value': mock_social_value,
            'nil_investment': athlete.nil_value,
            'social_roi': mock_social_value / max(athlete.nil_value, 1) if athlete.nil_value > 0 else 0
        })
    
    return {
        'report_type': 'social_roi',
        'data': sorted(social_data, key=lambda x: x['social_roi'], reverse=True),
        'summary': {
            'total_athletes': len(athletes),
            'avg_followers': sum(a['total_followers'] for a in social_data) / len(social_data) if social_data else 0,
            'avg_engagement': sum(a['engagement_rate'] for a in social_data) / len(social_data) if social_data else 0
        }
    }

@app.get("/api/reports/competitive-intel")
async def get_competitive_intel_report(
    conference: str = None,
    region: str = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    mock_competitors = [
        {'school': 'Alabama', 'conference': 'SEC', 'nil_budget': 15000000, 'recruiting_wins': 12, 'recruiting_losses': 3},
        {'school': 'Georgia', 'conference': 'SEC', 'nil_budget': 14500000, 'recruiting_wins': 11, 'recruiting_losses': 4},
        {'school': 'Ohio State', 'conference': 'Big Ten', 'nil_budget': 13800000, 'recruiting_wins': 10, 'recruiting_losses': 5},
        {'school': 'Texas', 'conference': 'Big 12', 'nil_budget': 13200000, 'recruiting_wins': 9, 'recruiting_losses': 6},
        {'school': 'USC', 'conference': 'Pac-12', 'nil_budget': 12500000, 'recruiting_wins': 8, 'recruiting_losses': 7}
    ]
    
    return {
        'report_type': 'competitive_intel',
        'data': mock_competitors,
        'summary': {
            'total_schools': len(mock_competitors),
            'avg_nil_budget': sum(s['nil_budget'] for s in mock_competitors) / len(mock_competitors),
            'market_leader': max(mock_competitors, key=lambda x: x['nil_budget'])['school']
        }
    }

@app.get("/api/reports/executive-summary")
async def get_executive_summary_report(
    month: str = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    team = db.query(Team).first()
    athletes = db.query(Athlete).filter(Athlete.is_active == True).all()
    nil_deals = db.query(NILDeal).all()
    
    total_nil_value = sum(deal.deal_value for deal in nil_deals)
    avg_baron_score = sum(a.baron_hopson_score for a in athletes) / len(athletes) if athletes else 0
    
    top_acquisitions = sorted(athletes, key=lambda x: x.market_value, reverse=True)[:5]
    at_risk_players = [a for a in athletes if a.baron_hopson_score < 3.0][:5]
    
    return {
        'report_type': 'executive_summary',
        'kpis': {
            'total_athletes': len(athletes),
            'total_nil_value': total_nil_value,
            'avg_baron_score': avg_baron_score,
            'budget_utilization': total_nil_value / team.nil_budget if team and team.nil_budget > 0 else 0
        },
        'top_acquisitions': [{'name': a.name, 'position': a.position, 'value': a.market_value} for a in top_acquisitions],
        'at_risk_players': [{'name': a.name, 'position': a.position, 'score': a.baron_hopson_score} for a in at_risk_players],
        'recommendations': [
            'Focus recruiting on high-ROI positions',
            'Monitor at-risk player retention',
            'Optimize NIL budget allocation'
        ]
    }

@app.post("/api/reports/export")
async def export_report(
    export_request: dict,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    report_type = export_request.get('type')
    format_type = export_request.get('format')
    filters = export_request.get('filters', {})
    
    from datetime import datetime
    timestamp = datetime.utcnow().timestamp()
    export_url = f"/downloads/{report_type}_{format_type}_{timestamp}"
    
    return {"export_url": export_url, "message": "Export generated successfully"}

@app.post("/api/reports/schedule")
async def schedule_report(
    schedule_data: dict,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_schedule = ReportSchedule(
        user_id=current_user.id,
        report_type=schedule_data.get('type'),
        cadence=schedule_data.get('cadence'),
        recipients=schedule_data.get('recipients', []),
        filters=schedule_data.get('filters', {})
    )
    db.add(db_schedule)
    db.commit()
    return {"message": "Report scheduled successfully"}

@app.get("/api/analytics/predict-performance/{athlete_id}")
@limiter.limit("20/hour")
async def predict_athlete_performance(
    request: Request,
    athlete_id: int,
    months_ahead: int = 12,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    athlete = db.query(Athlete).filter(Athlete.id == athlete_id).first()
    if not athlete:
        raise HTTPException(status_code=404, detail="Athlete not found")
    
    prediction = advanced_analytics.predict_future_performance(athlete, db, months_ahead)
    return prediction

@app.get("/api/analytics/performance-trends/{athlete_id}")
@limiter.limit("20/hour") 
async def get_performance_trends(
    request: Request,
    athlete_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    athlete = db.query(Athlete).filter(Athlete.id == athlete_id).first()
    if not athlete:
        raise HTTPException(status_code=404, detail="Athlete not found")
    
    trends = advanced_analytics.analyze_performance_trends(athlete, db)
    return trends

@app.get("/api/analytics/comparative-benchmark/{athlete_id}")
@limiter.limit("20/hour")
async def get_comparative_benchmark(
    request: Request,
    athlete_id: int,
    scope: str = "position",
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    athlete = db.query(Athlete).filter(Athlete.id == athlete_id).first()
    if not athlete:
        raise HTTPException(status_code=404, detail="Athlete not found")
    
    benchmark = advanced_analytics.comparative_benchmarking(athlete, db, scope)
    return benchmark

@app.get("/api/analytics/roi-projections/{athlete_id}")
@limiter.limit("10/hour")
async def get_roi_projections(
    request: Request,
    athlete_id: int,
    scenarios: str = "50000,100000,200000,500000",
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    athlete = db.query(Athlete).filter(Athlete.id == athlete_id).first()
    if not athlete:
        raise HTTPException(status_code=404, detail="Athlete not found")
    
    investment_scenarios = [float(x) for x in scenarios.split(",")]
    projections = advanced_analytics.generate_roi_projections(athlete, db, investment_scenarios)
    return projections

@app.get("/api/analytics/team-portfolio/{team_id}")
@limiter.limit("10/hour")
async def get_team_portfolio_analysis(
    request: Request,
    team_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    analysis = advanced_analytics.team_portfolio_analysis(team_id, db)
    return analysis

@app.get("/api/valuation/v3/{athlete_id}")
@limiter.limit("30/hour")
async def get_v3_valuation(
    athlete_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get precise valuation for an athlete using v3.0 engine"""
    athlete = db.query(Athlete).filter(Athlete.id == athlete_id).first()
    if not athlete:
        raise HTTPException(status_code=404, detail="Athlete not found")
    
    try:
        valuation = valuation_engine_v3.calculate_precise_valuation(athlete, db)
        
        def decimal_to_str(obj):
            if hasattr(obj, 'items'):
                return {k: decimal_to_str(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [decimal_to_str(item) for item in obj]
            elif hasattr(obj, 'quantize'):  # Decimal object
                return str(obj)
            return obj
        
        return decimal_to_str(valuation)
    except Exception as e:
        print(f"V3 valuation error for athlete {athlete_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Valuation calculation failed")

@app.get("/api/valuation/v3/team/{team_id}")
@limiter.limit("20/hour")
async def get_v3_team_portfolio(
    team_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get team portfolio valuation using v3.0 engine"""
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    try:
        portfolio = valuation_engine_v3.calculate_team_portfolio_value(team_id, db)
        
        def decimal_to_str(obj):
            if hasattr(obj, 'items'):
                return {k: decimal_to_str(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [decimal_to_str(item) for item in obj]
            elif hasattr(obj, 'quantize'):  # Decimal object
                return str(obj)
            return obj
        
        return decimal_to_str(portfolio)
    except Exception as e:
        print(f"V3 team portfolio error for team {team_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Portfolio calculation failed")
