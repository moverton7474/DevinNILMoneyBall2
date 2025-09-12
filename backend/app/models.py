from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String, default="user")  # user, admin, coach
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Team(Base):
    __tablename__ = "teams"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    conference = Column(String)
    division = Column(String)
    coach_id = Column(Integer, ForeignKey("users.id"))
    revenue_share_cap = Column(Float, default=20500000.0)  # $20.5M cap
    current_revenue_share = Column(Float, default=0.0)
    nil_budget = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    coach = relationship("User", back_populates="teams")
    athletes = relationship("Athlete", back_populates="team")

User.teams = relationship("Team", back_populates="coach")

class Athlete(Base):
    __tablename__ = "athletes"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    position = Column(String)
    year = Column(String)  # FR, SO, JR, SR, GRAD
    height = Column(String)
    weight = Column(Integer)
    hometown = Column(String)
    high_school = Column(String)
    team_id = Column(Integer, ForeignKey("teams.id"))
    
    games_played = Column(Integer, default=0)
    passing_yards = Column(Integer, default=0)
    passing_tds = Column(Integer, default=0)
    rushing_yards = Column(Integer, default=0)
    rushing_tds = Column(Integer, default=0)
    receiving_yards = Column(Integer, default=0)
    receiving_tds = Column(Integer, default=0)
    tackles = Column(Integer, default=0)
    sacks = Column(Float, default=0.0)
    interceptions = Column(Integer, default=0)
    
    baron_hopson_score = Column(Float, default=0.0)
    market_value = Column(Float, default=0.0)
    nil_value = Column(Float, default=0.0)
    revenue_share_value = Column(Float, default=0.0)
    
    is_active = Column(Boolean, default=True)
    transfer_portal_status = Column(String, default="enrolled")  # enrolled, portal, transferred
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    team = relationship("Team", back_populates="athletes")
    nil_deals = relationship("NILDeal", back_populates="athlete")
    evaluations = relationship("AthleteEvaluation", back_populates="athlete")

class NILDeal(Base):
    __tablename__ = "nil_deals"
    
    id = Column(Integer, primary_key=True, index=True)
    athlete_id = Column(Integer, ForeignKey("athletes.id"))
    deal_type = Column(String)  # endorsement, appearance, social_media, etc.
    brand_name = Column(String)
    deal_value = Column(Float)
    deal_length_months = Column(Integer)
    status = Column(String, default="active")  # active, completed, terminated
    compliance_status = Column(String, default="pending")  # pending, approved, rejected
    
    tax_implications = Column(JSON)
    title_ix_compliant = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    athlete = relationship("Athlete", back_populates="nil_deals")

class AthleteEvaluation(Base):
    __tablename__ = "athlete_evaluations"
    
    id = Column(Integer, primary_key=True, index=True)
    athlete_id = Column(Integer, ForeignKey("athletes.id"))
    evaluator_id = Column(Integer, ForeignKey("users.id"))
    
    performance_score = Column(Float, default=0.0)
    potential_score = Column(Float, default=0.0)
    marketability_score = Column(Float, default=0.0)
    leadership_score = Column(Float, default=0.0)
    academic_score = Column(Float, default=0.0)
    
    overall_score = Column(Float, default=0.0)
    recommended_nil_value = Column(Float, default=0.0)
    recommended_revenue_share = Column(Float, default=0.0)
    
    notes = Column(Text)
    evaluation_date = Column(DateTime, default=datetime.utcnow)
    
    athlete = relationship("Athlete", back_populates="evaluations")
    evaluator = relationship("User")

class TransferPortalEntry(Base):
    __tablename__ = "transfer_portal_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    athlete_id = Column(Integer, ForeignKey("athletes.id"))
    entry_date = Column(DateTime, default=datetime.utcnow)
    reason = Column(String)
    status = Column(String, default="active")  # active, committed, withdrawn
    target_schools = Column(JSON)  # List of schools interested
    
    baron_hopson_score_at_entry = Column(Float)
    market_value_at_entry = Column(Float)
    
    athlete = relationship("Athlete")

class RevenueShareAllocation(Base):
    __tablename__ = "revenue_share_allocations"
    
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"))
    athlete_id = Column(Integer, ForeignKey("athletes.id"))
    allocation_amount = Column(Float)
    allocation_percentage = Column(Float)
    academic_year = Column(String)
    status = Column(String, default="proposed")  # proposed, approved, distributed
    
    title_ix_compliant = Column(Boolean, default=True)
    back_pay_eligible = Column(Boolean, default=False)
    back_pay_amount = Column(Float, default=0.0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    team = relationship("Team")
    athlete = relationship("Athlete")

class ComplianceReport(Base):
    __tablename__ = "compliance_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"))
    report_type = Column(String)  # nil_disclosure, revenue_share, title_ix
    report_data = Column(JSON)
    generated_by = Column(Integer, ForeignKey("users.id"))
    generated_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="draft")  # draft, submitted, approved
    
    team = relationship("Team")
    generator = relationship("User")

class SocialMediaMetrics(Base):
    __tablename__ = "social_media_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    athlete_id = Column(Integer, ForeignKey("athletes.id"))
    platform = Column(String)  # instagram, twitter, tiktok, etc.
    followers = Column(Integer, default=0)
    engagement_rate = Column(Float, default=0.0)
    posts_count = Column(Integer, default=0)
    social_nil_value = Column(Float, default=0.0)
    measurement_date = Column(DateTime, default=datetime.utcnow)
    
    athlete = relationship("Athlete")

class CompetitiveIntelligence(Base):
    __tablename__ = "competitive_intelligence"
    
    id = Column(Integer, primary_key=True, index=True)
    school_name = Column(String)
    conference = Column(String)
    estimated_nil_budget = Column(Float)
    estimated_revenue_share = Column(Float)
    recruiting_wins = Column(Integer, default=0)
    recruiting_losses = Column(Integer, default=0)
    market_share_region = Column(String)
    data_date = Column(DateTime, default=datetime.utcnow)

class ReportSchedule(Base):
    __tablename__ = "report_schedules"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    report_type = Column(String)
    cadence = Column(String)  # daily, weekly, monthly
    recipients = Column(JSON)
    filters = Column(JSON)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")
