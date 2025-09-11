from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    role: str = "user"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class TeamBase(BaseModel):
    name: str
    conference: str
    division: str
    revenue_share_cap: float = 20500000.0
    nil_budget: float = 0.0

class TeamCreate(TeamBase):
    pass

class TeamResponse(TeamBase):
    id: int
    coach_id: int
    current_revenue_share: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class AthleteBase(BaseModel):
    name: str
    position: str
    year: str
    height: Optional[str] = None
    weight: Optional[int] = None
    hometown: Optional[str] = None
    high_school: Optional[str] = None
    team_id: int

class AthleteCreate(AthleteBase):
    games_played: int = 0
    passing_yards: int = 0
    passing_tds: int = 0
    rushing_yards: int = 0
    rushing_tds: int = 0
    receiving_yards: int = 0
    receiving_tds: int = 0
    tackles: int = 0
    sacks: float = 0.0
    interceptions: int = 0

class AthleteUpdate(BaseModel):
    name: Optional[str] = None
    position: Optional[str] = None
    year: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[int] = None
    games_played: Optional[int] = None
    passing_yards: Optional[int] = None
    passing_tds: Optional[int] = None
    rushing_yards: Optional[int] = None
    rushing_tds: Optional[int] = None
    receiving_yards: Optional[int] = None
    receiving_tds: Optional[int] = None
    tackles: Optional[int] = None
    sacks: Optional[float] = None
    interceptions: Optional[int] = None
    is_active: Optional[bool] = None
    transfer_portal_status: Optional[str] = None

class AthleteResponse(AthleteBase):
    id: int
    games_played: int
    passing_yards: int
    passing_tds: int
    rushing_yards: int
    rushing_tds: int
    receiving_yards: int
    receiving_tds: int
    tackles: int
    sacks: float
    interceptions: int
    baron_hopson_score: float
    market_value: float
    nil_value: float
    revenue_share_value: float
    is_active: bool
    transfer_portal_status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class NILDealBase(BaseModel):
    athlete_id: int
    deal_type: str
    brand_name: str
    deal_value: float
    deal_length_months: int

class NILDealCreate(NILDealBase):
    pass

class NILDealResponse(NILDealBase):
    id: int
    status: str
    compliance_status: str
    title_ix_compliant: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class TransferPortalBase(BaseModel):
    athlete_id: int
    reason: str
    target_schools: Optional[List[str]] = []

class TransferPortalCreate(TransferPortalBase):
    pass

class TransferPortalResponse(TransferPortalBase):
    id: int
    entry_date: datetime
    status: str
    baron_hopson_score_at_entry: Optional[float]
    market_value_at_entry: Optional[float]
    
    class Config:
        from_attributes = True

class RevenueShareBase(BaseModel):
    team_id: int
    athlete_id: int
    allocation_amount: float
    academic_year: str

class RevenueShareCreate(RevenueShareBase):
    pass

class RevenueShareResponse(RevenueShareBase):
    id: int
    allocation_percentage: float
    status: str
    title_ix_compliant: bool
    back_pay_eligible: bool
    back_pay_amount: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class ComplianceReportBase(BaseModel):
    team_id: int
    report_type: str
    report_data: Dict[str, Any]

class ComplianceReportCreate(ComplianceReportBase):
    pass

class ComplianceReportResponse(ComplianceReportBase):
    id: int
    generated_by: int
    generated_at: datetime
    status: str
    
    class Config:
        from_attributes = True
