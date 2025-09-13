from sqlalchemy import text
from .database import engine

def create_performance_indexes():
    """Create database indexes for performance optimization"""
    
    indexes = [
        "CREATE INDEX IF NOT EXISTS idx_athlete_baron_hopson_score ON athletes(baron_hopson_score DESC);",
        "CREATE INDEX IF NOT EXISTS idx_athlete_team_active ON athletes(team_id, is_active);",
        "CREATE INDEX IF NOT EXISTS idx_athlete_position ON athletes(position);",
        "CREATE INDEX IF NOT EXISTS idx_athlete_market_value ON athletes(market_value DESC);",
        "CREATE INDEX IF NOT EXISTS idx_user_username ON users(username);",
        "CREATE INDEX IF NOT EXISTS idx_user_email ON users(email);",
        "CREATE INDEX IF NOT EXISTS idx_team_conference ON teams(conference);",
        "CREATE INDEX IF NOT EXISTS idx_nil_deal_athlete_status ON nil_deals(athlete_id, status);",
        "CREATE INDEX IF NOT EXISTS idx_transfer_portal_status ON transfer_portal_entries(status);",
        "CREATE INDEX IF NOT EXISTS idx_revenue_share_team ON revenue_share_allocations(team_id);",
        "CREATE INDEX IF NOT EXISTS idx_athlete_evaluation_score ON athlete_evaluations(baron_hopson_score DESC);",
        "CREATE INDEX IF NOT EXISTS idx_social_media_athlete ON social_media_metrics(athlete_id);",
        "CREATE INDEX IF NOT EXISTS idx_competitive_intel_conference ON competitive_intelligence(conference);",
        "CREATE INDEX IF NOT EXISTS idx_report_schedule_active ON report_schedules(is_active);"
    ]
    
    with engine.connect() as connection:
        for index_sql in indexes:
            try:
                connection.execute(text(index_sql))
                print(f"Created index: {index_sql}")
            except Exception as e:
                print(f"Index creation failed: {index_sql} - {e}")
        connection.commit()

if __name__ == "__main__":
    create_performance_indexes()
