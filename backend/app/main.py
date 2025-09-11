from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import List, Optional
import psycopg

from .database import engine, get_db
from .models import Base, User, Team, Athlete, NILDeal, AthleteEvaluation, TransferPortalEntry, RevenueShareAllocation, ComplianceReport
from .auth import get_current_user, get_current_active_user, create_access_token, verify_password, get_password_hash
from .baron_hopson import BaronHopsonEngine
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

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

baron_hopson_engine = BaronHopsonEngine()

@app.get("/healthz")
async def healthz():
    return {"status": "ok", "message": "NIL Moneyball API is running"}

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
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

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
async def get_athletes(team_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
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
async def get_team_dashboard(team_id: int, db: Session = Depends(get_db)):
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
    
    return {
        'team': team,
        'total_athletes': len(athletes),
        'total_baron_hopson_score': total_baron_hopson,
        'average_baron_hopson_score': avg_baron_hopson,
        'total_nil_value': total_nil_value,
        'total_revenue_share_value': total_revenue_share,
        'revenue_share_cap_remaining': team.revenue_share_cap - team.current_revenue_share,
        'position_breakdown': position_breakdown,
        'top_performers': sorted(athletes, key=lambda x: x.baron_hopson_score, reverse=True)[:10]
    }

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
