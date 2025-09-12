import asyncio
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import get_db, engine
from app.models import (
    Base, User, Team, Athlete, NILDeal, AthleteEvaluation, 
    TransferPortalEntry, RevenueShareAllocation, ComplianceReport,
    SocialMediaMetrics, CompetitiveIntelligence, ReportSchedule
)
from app.auth import get_password_hash

Base.metadata.create_all(bind=engine)

def get_db_session():
    db = next(get_db())
    return db

CONFERENCES = ["SEC", "Big Ten", "Big 12", "ACC", "Pac-12", "AAC", "Mountain West", "Conference USA"]

TEAMS_DATA = [
    {"name": "Alabama Crimson Tide", "conference": "SEC", "division": "West"},
    {"name": "Georgia Bulldogs", "conference": "SEC", "division": "East"},
    {"name": "Ohio State Buckeyes", "conference": "Big Ten", "division": "East"},
    {"name": "Michigan Wolverines", "conference": "Big Ten", "division": "East"},
    {"name": "Texas Longhorns", "conference": "Big 12", "division": "South"},
    {"name": "Oklahoma Sooners", "conference": "Big 12", "division": "South"},
    {"name": "Clemson Tigers", "conference": "ACC", "division": "Atlantic"},
    {"name": "Florida State Seminoles", "conference": "ACC", "division": "Atlantic"},
    {"name": "USC Trojans", "conference": "Pac-12", "division": "South"},
    {"name": "Oregon Ducks", "conference": "Pac-12", "division": "North"},
]

POSITIONS = ["QB", "RB", "WR", "TE", "OL", "DL", "LB", "CB", "S", "K", "P"]
YEARS = ["FR", "SO", "JR", "SR", "GRAD"]

FIRST_NAMES = [
    "Jayden", "Mason", "Ethan", "Noah", "Jacob", "Michael", "Alexander", "William",
    "Joshua", "Daniel", "Anthony", "Christopher", "Matthew", "David", "Andrew",
    "Caleb", "Hunter", "Cameron", "Tyler", "Logan", "Ryan", "Brandon", "Lucas",
    "Zachary", "Nathan", "Christian", "Gabriel", "Isaiah", "Austin", "Jordan"
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
    "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
    "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"
]

CITIES = [
    "Atlanta, GA", "Dallas, TX", "Miami, FL", "Los Angeles, CA", "Chicago, IL",
    "Houston, TX", "Phoenix, AZ", "Philadelphia, PA", "San Antonio, TX", "San Diego, CA",
    "Detroit, MI", "San Jose, CA", "Indianapolis, IN", "Jacksonville, FL", "San Francisco, CA",
    "Columbus, OH", "Charlotte, NC", "Fort Worth, TX", "Detroit, MI", "El Paso, TX"
]

HIGH_SCHOOLS = [
    "Central High School", "North High School", "South High School", "East High School",
    "West High School", "Memorial High School", "Lincoln High School", "Washington High School",
    "Roosevelt High School", "Jefferson High School", "Madison High School", "Jackson High School",
    "Wilson High School", "Kennedy High School", "Adams High School", "Franklin High School"
]

NIL_BRANDS = [
    "Nike", "Adidas", "Under Armour", "Gatorade", "Coca-Cola", "Pepsi", "McDonald's",
    "Subway", "Pizza Hut", "Domino's", "Local Car Dealership", "Regional Bank",
    "Sports Memorabilia Store", "Fitness Center", "Restaurant Chain", "Clothing Brand"
]

def generate_baron_hopson_score():
    """Generate realistic Baron Hopson scores with proper distribution"""
    base_score = random.normalvariate(3.0, 0.8)
    return max(1.0, min(5.0, base_score))

def generate_market_value(baron_score, position):
    """Generate market value based on Baron Hopson score and position"""
    position_multipliers = {
        "QB": 1.5, "RB": 1.2, "WR": 1.3, "TE": 1.0, "OL": 0.9,
        "DL": 1.1, "LB": 1.0, "CB": 1.2, "S": 1.0, "K": 0.7, "P": 0.6
    }
    
    base_value = baron_score * 50000 * position_multipliers.get(position, 1.0)
    variation = random.uniform(0.7, 1.3)
    return int(base_value * variation)

def generate_nil_value(market_value):
    """Generate NIL value as percentage of market value"""
    percentage = random.uniform(0.3, 0.8)
    return int(market_value * percentage)

def generate_stats_by_position(position):
    """Generate realistic stats based on position"""
    stats = {
        "games_played": random.randint(8, 15),
        "passing_yards": 0, "passing_tds": 0,
        "rushing_yards": 0, "rushing_tds": 0,
        "receiving_yards": 0, "receiving_tds": 0,
        "tackles": 0, "sacks": 0.0, "interceptions": 0
    }
    
    if position == "QB":
        stats.update({
            "passing_yards": random.randint(1500, 4500),
            "passing_tds": random.randint(15, 45),
            "rushing_yards": random.randint(0, 800),
            "rushing_tds": random.randint(0, 12)
        })
    elif position == "RB":
        stats.update({
            "rushing_yards": random.randint(400, 2000),
            "rushing_tds": random.randint(3, 25),
            "receiving_yards": random.randint(100, 600),
            "receiving_tds": random.randint(0, 8)
        })
    elif position in ["WR", "TE"]:
        stats.update({
            "receiving_yards": random.randint(200, 1500),
            "receiving_tds": random.randint(2, 18),
            "rushing_yards": random.randint(0, 200),
            "rushing_tds": random.randint(0, 3)
        })
    elif position in ["DL", "LB", "CB", "S"]:
        stats.update({
            "tackles": random.randint(20, 120),
            "sacks": round(random.uniform(0, 15), 1),
            "interceptions": random.randint(0, 8)
        })
    
    return stats

def create_sample_users(db: Session):
    """Create sample users including coaches and admins"""
    users = [
        {
            "email": "admin@nilmoneyball.com",
            "username": "admin",
            "full_name": "System Administrator",
            "role": "admin",
            "password": "admin123"
        },
        {
            "email": "coach.saban@alabama.edu",
            "username": "coach_saban",
            "full_name": "Nick Saban",
            "role": "coach",
            "password": "coach123"
        },
        {
            "email": "coach.smart@georgia.edu",
            "username": "coach_smart",
            "full_name": "Kirby Smart",
            "role": "coach",
            "password": "coach123"
        },
        {
            "email": "coach.day@osu.edu",
            "username": "coach_day",
            "full_name": "Ryan Day",
            "role": "coach",
            "password": "coach123"
        },
        {
            "email": "compliance@nilmoneyball.com",
            "username": "compliance",
            "full_name": "Compliance Officer",
            "role": "compliance",
            "password": "compliance123"
        }
    ]
    
    created_users = []
    for user_data in users:
        password = user_data.pop("password")
        db_user = User(
            **user_data,
            hashed_password=get_password_hash(password)
        )
        db.add(db_user)
        created_users.append(db_user)
    
    db.commit()
    return created_users

def create_sample_teams(db: Session, coaches):
    """Create sample teams with coaches"""
    created_teams = []
    
    for i, team_data in enumerate(TEAMS_DATA):
        coach = coaches[min(i + 1, len(coaches) - 1)]  # Assign coaches, reuse if needed
        
        db_team = Team(
            name=team_data["name"],
            conference=team_data["conference"],
            division=team_data["division"],
            coach_id=coach.id,
            revenue_share_cap=20500000.0,
            current_revenue_share=random.uniform(15000000, 19000000),
            nil_budget=random.uniform(8000000, 15000000)
        )
        db.add(db_team)
        created_teams.append(db_team)
    
    db.commit()
    return created_teams

def create_sample_athletes(db: Session, teams):
    """Create sample athletes for each team"""
    created_athletes = []
    
    for team in teams:
        num_athletes = random.randint(25, 30)
        
        for _ in range(num_athletes):
            name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
            position = random.choice(POSITIONS)
            year = random.choice(YEARS)
            
            if position in ["OL", "DL"]:
                height = f"{random.randint(6, 6)}'{random.randint(2, 8)}\""
                weight = random.randint(280, 350)
            elif position == "QB":
                height = f"{random.randint(6, 6)}'{random.randint(1, 5)}\""
                weight = random.randint(200, 240)
            else:
                height = f"{random.randint(5, 6)}'{random.randint(8, 11)}\""
                weight = random.randint(170, 250)
            
            stats = generate_stats_by_position(position)
            baron_score = generate_baron_hopson_score()
            market_value = generate_market_value(baron_score, position)
            nil_value = generate_nil_value(market_value)
            
            db_athlete = Athlete(
                name=name,
                position=position,
                year=year,
                height=height,
                weight=weight,
                hometown=random.choice(CITIES),
                high_school=random.choice(HIGH_SCHOOLS),
                team_id=team.id,
                baron_hopson_score=baron_score,
                market_value=market_value,
                nil_value=nil_value,
                revenue_share_value=random.uniform(50000, 500000),
                transfer_portal_status=random.choices(
                    ["enrolled", "portal", "transferred"],
                    weights=[85, 10, 5]
                )[0],
                **stats
            )
            db.add(db_athlete)
            created_athletes.append(db_athlete)
    
    db.commit()
    return created_athletes

def create_sample_nil_deals(db: Session, athletes):
    """Create sample NIL deals for athletes"""
    deal_types = ["endorsement", "appearance", "social_media", "autograph", "camp"]
    
    for athlete in athletes:
        if random.random() < 0.6:
            num_deals = random.choices([1, 2, 3], weights=[70, 25, 5])[0]
            
            for _ in range(num_deals):
                deal_value = random.uniform(1000, 50000)
                if athlete.baron_hopson_score > 4.0:
                    deal_value *= random.uniform(2, 5)  # Elite players get bigger deals
                
                db_deal = NILDeal(
                    athlete_id=athlete.id,
                    deal_type=random.choice(deal_types),
                    brand_name=random.choice(NIL_BRANDS),
                    deal_value=deal_value,
                    deal_length_months=random.choice([6, 12, 24, 36]),
                    status=random.choices(
                        ["active", "completed", "terminated"],
                        weights=[70, 25, 5]
                    )[0],
                    compliance_status=random.choices(
                        ["approved", "pending", "rejected"],
                        weights=[80, 15, 5]
                    )[0],
                    tax_implications={"estimated_tax_rate": random.uniform(0.15, 0.35)},
                    title_ix_compliant=random.choice([True, True, True, False])  # 75% compliant
                )
                db.add(db_deal)
    
    db.commit()

def create_sample_evaluations(db: Session, athletes, users):
    """Create sample athlete evaluations"""
    evaluators = [u for u in users if u.role in ["coach", "admin"]]
    
    for athlete in athletes:
        if random.random() < 0.4:
            evaluator = random.choice(evaluators)
            
            base_score = random.uniform(2.5, 4.5)
            variation = 0.5
            
            performance = max(1.0, min(5.0, base_score + random.uniform(-variation, variation)))
            potential = max(1.0, min(5.0, base_score + random.uniform(-variation, variation)))
            marketability = max(1.0, min(5.0, base_score + random.uniform(-variation, variation)))
            leadership = max(1.0, min(5.0, base_score + random.uniform(-variation, variation)))
            academic = max(1.0, min(5.0, random.uniform(2.0, 4.5)))
            
            overall = (performance + potential + marketability + leadership + academic) / 5
            
            db_eval = AthleteEvaluation(
                athlete_id=athlete.id,
                evaluator_id=evaluator.id,
                performance_score=performance,
                potential_score=potential,
                marketability_score=marketability,
                leadership_score=leadership,
                academic_score=academic,
                overall_score=overall,
                recommended_nil_value=athlete.market_value * random.uniform(0.4, 0.9),
                recommended_revenue_share=random.uniform(100000, 800000),
                notes=f"Evaluation notes for {athlete.name}",
                evaluation_date=datetime.utcnow() - timedelta(days=random.randint(1, 90))
            )
            db.add(db_eval)
    
    db.commit()

def create_sample_transfer_portal_entries(db: Session, athletes):
    """Create sample transfer portal entries"""
    portal_athletes = [a for a in athletes if a.transfer_portal_status == "portal"]
    
    for athlete in portal_athletes:
        target_schools = random.sample(TEAMS_DATA, random.randint(2, 5))
        
        db_entry = TransferPortalEntry(
            athlete_id=athlete.id,
            entry_date=datetime.utcnow() - timedelta(days=random.randint(1, 60)),
            reason=random.choice([
                "Playing time", "Coaching change", "Academic fit", 
                "NIL opportunities", "Family reasons", "Graduate transfer"
            ]),
            status=random.choices(
                ["active", "committed", "withdrawn"],
                weights=[60, 30, 10]
            )[0],
            target_schools=[school["name"] for school in target_schools],
            baron_hopson_score_at_entry=athlete.baron_hopson_score,
            market_value_at_entry=athlete.market_value
        )
        db.add(db_entry)
    
    db.commit()

def create_sample_social_media_metrics(db: Session, athletes):
    """Create sample social media metrics"""
    platforms = ["instagram", "twitter", "tiktok", "youtube"]
    
    for athlete in athletes:
        if random.random() < 0.7:
            num_platforms = random.choices([1, 2, 3, 4], weights=[40, 35, 20, 5])[0]
            selected_platforms = random.sample(platforms, num_platforms)
            
            for platform in selected_platforms:
                base_followers = int(athlete.baron_hopson_score * 2000)
                followers = random.randint(base_followers, base_followers * 3)
                
                engagement_rate = random.uniform(0.02, 0.08)  # 2-8%
                posts_count = random.randint(50, 500)
                social_nil_value = followers * engagement_rate * random.uniform(0.1, 0.5)
                
                db_metric = SocialMediaMetrics(
                    athlete_id=athlete.id,
                    platform=platform,
                    followers=followers,
                    engagement_rate=engagement_rate,
                    posts_count=posts_count,
                    social_nil_value=social_nil_value,
                    measurement_date=datetime.utcnow() - timedelta(days=random.randint(1, 30))
                )
                db.add(db_metric)
    
    db.commit()

def create_sample_competitive_intelligence(db: Session):
    """Create sample competitive intelligence data"""
    for team_data in TEAMS_DATA:
        db_intel = CompetitiveIntelligence(
            school_name=team_data["name"],
            conference=team_data["conference"],
            estimated_nil_budget=random.uniform(8000000, 20000000),
            estimated_revenue_share=random.uniform(15000000, 20500000),
            recruiting_wins=random.randint(5, 25),
            recruiting_losses=random.randint(2, 15),
            market_share_region=random.choice(["Southeast", "Midwest", "Southwest", "West Coast", "Northeast"]),
            data_date=datetime.utcnow() - timedelta(days=random.randint(1, 30))
        )
        db.add(db_intel)
    
    db.commit()

def create_sample_revenue_share_allocations(db: Session, teams, athletes):
    """Create sample revenue share allocations"""
    for team in teams:
        team_athletes = [a for a in athletes if a.team_id == team.id]
        
        top_athletes = sorted(team_athletes, key=lambda x: x.baron_hopson_score, reverse=True)[:15]
        
        total_allocated = 0
        for i, athlete in enumerate(top_athletes):
            if total_allocated >= team.current_revenue_share:
                break
                
            base_allocation = (team.current_revenue_share / 15) * (1.5 - (i * 0.05))
            allocation = min(base_allocation, team.current_revenue_share - total_allocated)
            
            if allocation > 0:
                db_allocation = RevenueShareAllocation(
                    team_id=team.id,
                    athlete_id=athlete.id,
                    allocation_amount=allocation,
                    allocation_percentage=(allocation / team.current_revenue_share) * 100,
                    academic_year="2024-25",
                    status=random.choices(
                        ["proposed", "approved", "distributed"],
                        weights=[30, 50, 20]
                    )[0],
                    title_ix_compliant=True,
                    back_pay_eligible=random.choice([True, False]),
                    back_pay_amount=random.uniform(0, 50000) if random.choice([True, False]) else 0
                )
                db.add(db_allocation)
                total_allocated += allocation
    
    db.commit()

def main():
    """Main function to populate database with sample data"""
    print("Starting database seeding...")
    
    db = get_db_session()
    
    try:
        print("Clearing existing data...")
        db.query(ReportSchedule).delete()
        db.query(CompetitiveIntelligence).delete()
        db.query(SocialMediaMetrics).delete()
        db.query(ComplianceReport).delete()
        db.query(RevenueShareAllocation).delete()
        db.query(TransferPortalEntry).delete()
        db.query(AthleteEvaluation).delete()
        db.query(NILDeal).delete()
        db.query(Athlete).delete()
        db.query(Team).delete()
        db.query(User).delete()
        db.commit()
        
        print("Creating sample users...")
        users = create_sample_users(db)
        
        print("Creating sample teams...")
        teams = create_sample_teams(db, users)
        
        print("Creating sample athletes...")
        athletes = create_sample_athletes(db, teams)
        
        print("Creating sample NIL deals...")
        create_sample_nil_deals(db, athletes)
        
        print("Creating sample evaluations...")
        create_sample_evaluations(db, athletes, users)
        
        print("Creating sample transfer portal entries...")
        create_sample_transfer_portal_entries(db, athletes)
        
        print("Creating sample social media metrics...")
        create_sample_social_media_metrics(db, athletes)
        
        print("Creating sample competitive intelligence...")
        create_sample_competitive_intelligence(db)
        
        print("Creating sample revenue share allocations...")
        create_sample_revenue_share_allocations(db, teams, athletes)
        
        print("Database seeding completed successfully!")
        print(f"Created:")
        print(f"  - {len(users)} users")
        print(f"  - {len(teams)} teams")
        print(f"  - {len(athletes)} athletes")
        print(f"  - NIL deals, evaluations, and other supporting data")
        
    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
