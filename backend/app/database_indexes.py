from sqlalchemy import text, inspect
from .database import engine

def create_performance_indexes():
    """Create database indexes for performance optimization"""
    
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    core_indexes = [
        ("athletes", "CREATE INDEX IF NOT EXISTS idx_athlete_baron_hopson_score ON athletes(baron_hopson_score DESC);"),
        ("athletes", "CREATE INDEX IF NOT EXISTS idx_athlete_team_active ON athletes(team_id, is_active);"),
        ("athletes", "CREATE INDEX IF NOT EXISTS idx_athlete_position ON athletes(position);"),
        ("athletes", "CREATE INDEX IF NOT EXISTS idx_athlete_market_value ON athletes(market_value DESC);"),
        ("users", "CREATE INDEX IF NOT EXISTS idx_user_username ON users(username);"),
        ("users", "CREATE INDEX IF NOT EXISTS idx_user_email ON users(email);"),
        ("teams", "CREATE INDEX IF NOT EXISTS idx_team_conference ON teams(conference);"),
        ("nil_deals", "CREATE INDEX IF NOT EXISTS idx_nil_deal_athlete_status ON nil_deals(athlete_id, status);"),
        ("transfer_portal_entries", "CREATE INDEX IF NOT EXISTS idx_transfer_portal_status ON transfer_portal_entries(status);"),
        ("revenue_share_allocations", "CREATE INDEX IF NOT EXISTS idx_revenue_share_team ON revenue_share_allocations(team_id);"),
    ]
    
    optional_indexes = [
        ("athlete_evaluations", "CREATE INDEX IF NOT EXISTS idx_athlete_evaluation_score ON athlete_evaluations(baron_hopson_score DESC);"),
        ("social_media_metrics", "CREATE INDEX IF NOT EXISTS idx_social_media_athlete ON social_media_metrics(athlete_id);"),
        ("competitive_intelligence", "CREATE INDEX IF NOT EXISTS idx_competitive_intel_conference ON competitive_intelligence(conference);"),
        ("report_schedules", "CREATE INDEX IF NOT EXISTS idx_report_schedule_active ON report_schedules(is_active);"),
    ]
    
    for table_name, index_sql in core_indexes:
        if table_name in existing_tables:
            with engine.connect() as connection:
                try:
                    connection.execute(text(index_sql))
                    connection.commit()
                    print(f"Created index: {index_sql}")
                except Exception as e:
                    connection.rollback()
                    print(f"Index creation failed: {index_sql} - {e}")
        else:
            print(f"Skipping index for non-existent table: {table_name}")
    
    for table_name, index_sql in optional_indexes:
        if table_name in existing_tables:
            with engine.connect() as connection:
                try:
                    connection.execute(text(index_sql))
                    connection.commit()
                    print(f"Created optional index: {index_sql}")
                except Exception as e:
                    connection.rollback()
                    print(f"Optional index creation failed: {index_sql} - {e}")
        else:
            print(f"Skipping optional index for non-existent table: {table_name}")

if __name__ == "__main__":
    create_performance_indexes()
