#!/usr/bin/env python3
"""
Database initialization script for NIL Moneyball Platform
Creates sample data based on Baron Hopson case study and realistic transfer portal scenarios
"""

import sys
import os
from datetime import datetime, timedelta
import random

# Add backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app import app, db, Athlete

def create_sample_athletes():
    """Create comprehensive sample dataset for testing and demonstration"""
    
    sample_athletes = [
        # Baron Hopson profile players (FCS transfers with high value potential)
        {
            'name': 'Marcus Thompson',
            'position': 'LB',
            'previous_school': 'Tennessee State',
            'conference': 'OVC',
            'transfer_from': 'FCS',
            'market_value': 18000,
            'portal_entry_date': datetime(2024, 12, 1).date(),
            'days_in_portal': 12,
            'games_played': 12,
            'total_tackles': 89,
            'solo_tackles': 52,
            'assisted_tackles': 37
        },
        {
            'name': 'Jerome Williams',
            'position': 'LB',
            'previous_school': 'Jackson State',
            'conference': 'SWAC',
            'transfer_from': 'FCS',
            'market_value': 22000,
            'portal_entry_date': datetime(2024, 11, 25).date(),
            'days_in_portal': 18,
            'games_played': 11,
            'total_tackles': 95,
            'solo_tackles': 58,
            'assisted_tackles': 37
        },
        {
            'name': 'Alex Rodriguez',
            'position': 'LB',
            'previous_school': 'North Dakota State',
            'conference': 'MVFC',
            'transfer_from': 'FCS',
            'market_value': 15000,
            'portal_entry_date': datetime(2024, 12, 3).date(),
            'days_in_portal': 10,
            'games_played': 13,
            'total_tackles': 78,
            'solo_tackles': 45,
            'assisted_tackles': 33
        },
        
        # FCS Quarterback transfers
        {
            'name': 'DeAndre Williams',
            'position': 'QB',
            'previous_school': 'Alabama State',
            'conference': 'SWAC',
            'transfer_from': 'FCS',
            'market_value': 35000,
            'portal_entry_date': datetime(2024, 12, 5).date(),
            'days_in_portal': 8,
            'games_played': 11,
            'passing_yards': 2845,
            'completions': 198,
            'attempts': 312,
            'passing_tds': 22,
            'interceptions': 8
        },
        {
            'name': 'Tyler Washington',
            'position': 'QB',
            'previous_school': 'Montana',
            'conference': 'Big Sky',
            'transfer_from': 'FCS',
            'market_value': 42000,
            'portal_entry_date': datetime(2024, 11, 30).date(),
            'days_in_portal': 13,
            'games_played': 12,
            'passing_yards': 3156,
            'completions': 245,
            'attempts': 387,
            'passing_tds': 28,
            'interceptions': 12
        },
        
        # Group5 skill position players
        {
            'name': 'Jaylen Davis',
            'position': 'WR',
            'previous_school': 'Middle Tennessee',
            'conference': 'Conference USA',
            'transfer_from': 'Group5',
            'market_value': 65000,
            'portal_entry_date': datetime(2024, 11, 28).date(),
            'days_in_portal': 15,
            'games_played': 12,
            'receptions': 67,
            'receiving_yards': 892,
            'receiving_tds': 8
        },
        {
            'name': 'Cameron Rodriguez',
            'position': 'RB',
            'previous_school': 'Western Kentucky',
            'conference': 'Conference USA',
            'transfer_from': 'Group5',
            'market_value': 48000,
            'portal_entry_date': datetime(2024, 12, 8).date(),
            'days_in_portal': 5,
            'games_played': 11,
            'rushing_yards': 1245,
            'rushing_tds': 14,
            'receptions': 23,
            'receiving_yards': 187
        },
        {
            'name': 'Michael Johnson',
            'position': 'WR',
            'previous_school': 'Louisiana Tech',
            'conference': 'Conference USA',
            'transfer_from': 'Group5',
            'market_value': 55000,
            'portal_entry_date': datetime(2024, 12, 2).date(),
            'days_in_portal': 11,
            'games_played': 12,
            'receptions': 58,
            'receiving_yards': 1034,
            'receiving_tds': 9
        },
        
        # Power4 transfers (higher cost, proven talent)
        {
            'name': 'Brandon Mitchell',
            'position': 'QB',
            'previous_school': 'Vanderbilt',
            'conference': 'SEC',
            'transfer_from': 'Power4',
            'market_value': 185000,
            'portal_entry_date': datetime(2024, 12, 7).date(),
            'days_in_portal': 6,
            'games_played': 10,
            'passing_yards': 2234,
            'completions': 165,
            'attempts': 287,
            'passing_tds': 15,
            'interceptions': 9
        },
        {
            'name': 'Jordan Thompson',
            'position': 'WR',
            'previous_school': 'Wake Forest',
            'conference': 'ACC',
            'transfer_from': 'Power4',
            'market_value': 125000,
            'portal_entry_date': datetime(2024, 11, 29).date(),
            'days_in_portal': 14,
            'games_played': 11,
            'receptions': 45,
            'receiving_yards': 678,
            'receiving_tds': 5
        },
        
        # Undervalued gems (low cost, high potential)
        {
            'name': 'David Chen',
            'position': 'OL',
            'previous_school': 'Kennesaw State',
            'conference': 'Conference USA',
            'transfer_from': 'Group5',
            'market_value': 28000,
            'portal_entry_date': datetime(2024, 12, 4).date(),
            'days_in_portal': 9,
            'games_played': 12
        },
        {
            'name': 'Antonio Martinez',
            'position': 'DL',
            'previous_school': 'Florida A&M',
            'conference': 'SWAC',
            'transfer_from': 'FCS',
            'market_value': 19000,
            'portal_entry_date': datetime(2024, 12, 6).date(),
            'days_in_portal': 7,
            'games_played': 11
        },
        
        # Expensive but talented (high cost options)
        {
            'name': 'Marcus Johnson',
            'position': 'RB',
            'previous_school': 'South Carolina',
            'conference': 'SEC',
            'transfer_from': 'Power4',
            'market_value': 165000,
            'portal_entry_date': datetime(2024, 12, 9).date(),
            'days_in_portal': 4,
            'games_played': 9,
            'rushing_yards': 756,
            'rushing_tds': 8,
            'receptions': 15,
            'receiving_yards': 123
        },
        {
            'name': 'Kevin Williams',
            'position': 'DB',
            'previous_school': 'Mississippi State',
            'conference': 'SEC',
            'transfer_from': 'Power4',
            'market_value': 95000,
            'portal_entry_date': datetime(2024, 11, 27).date(),
            'days_in_portal': 16,
            'games_played': 10
        },
        
        # Additional depth players for comprehensive testing
        {
            'name': 'Robert Taylor',
            'position': 'TE',
            'previous_school': 'Eastern Washington',
            'conference': 'Big Sky',
            'transfer_from': 'FCS',
            'market_value': 25000,
            'portal_entry_date': datetime(2024, 12, 1).date(),
            'days_in_portal': 12,
            'games_played': 12,
            'receptions': 34,
            'receiving_yards': 445,
            'receiving_tds': 4
        },
        {
            'name': 'Chris Anderson',
            'position': 'DB',
            'previous_school': 'South Alabama',
            'conference': 'Sun Belt',
            'transfer_from': 'Group5',
            'market_value': 38000,
            'portal_entry_date': datetime(2024, 11, 26).date(),
            'days_in_portal': 17,
            'games_played': 12
        }
    ]
    
    athletes_created = 0
    
    for athlete_data in sample_athletes:
        # Check if athlete already exists
        existing = Athlete.query.filter_by(name=athlete_data['name']).first()
        if existing:
            print(f"Athlete {athlete_data['name']} already exists, skipping...")
            continue
        
        try:
            athlete = Athlete(**athlete_data)
            db.session.add(athlete)
            athletes_created += 1
            print(f"Created athlete: {athlete_data['name']} ({athlete_data['position']}) - ${athlete_data['market_value']:,}")
        except Exception as e:
            print(f"Error creating athlete {athlete_data['name']}: {str(e)}")
            db.session.rollback()
            continue
    
    try:
        db.session.commit()
        print(f"\n✅ Successfully created {athletes_created} athletes")
        return athletes_created
    except Exception as e:
        print(f"❌ Error committing to database: {str(e)}")
        db.session.rollback()
        return 0

def create_database_and_sample_data():
    """Initialize database and create sample data"""
    
    with app.app_context():
        try:
            print("🏗️  Creating database tables...")
            db.create_all()
            print("✅ Database tables created successfully")
            
            print("\n📊 Creating sample athletes...")
            athletes_created = create_sample_athletes()
            
            print(f"\n🎯 Database initialization complete!")
            print(f"   - Athletes created: {athletes_created}")
            print(f"   - Total athletes in database: {Athlete.query.count()}")
            
            # Show some statistics
            print(f"\n📈 Dataset Statistics:")
            print(f"   - FCS Transfers: {Athlete.query.filter_by(transfer_from='FCS').count()}")
            print(f"   - Group5 Transfers: {Athlete.query.filter_by(transfer_from='Group5').count()}")
            print(f"   - Power4 Transfers: {Athlete.query.filter_by(transfer_from='Power4').count()}")
            
            # Baron Hopson profile players
            baron_profiles = Athlete.query.filter(
                Athlete.position == 'LB',
                Athlete.transfer_from == 'FCS',
                Athlete.market_value <= 25000
            ).all()
            
            print(f"   - Baron Hopson Profile LBs: {len(baron_profiles)}")
            
            for bp in baron_profiles:
                if bp.total_tackles > 0:
                    tackles_per_game = bp.total_tackles / max(bp.games_played, 1)
                    print(f"     * {bp.name}: {bp.total_tackles} tackles ({tackles_per_game:.1f}/game), ${bp.market_value:,}")
            
        except Exception as e:
            print(f"❌ Error during database initialization: {str(e)}")
            return False
            
    return True

if __name__ == '__main__':
    print("🏈 NIL Moneyball Platform - Database Initialization")
    print("=" * 50)
    
    success = create_database_and_sample_data()
    
    if success:
        print("\n🎉 Ready to start optimizing rosters with Baron Hopson methodology!")
        print("   Run 'python app.py' from the backend directory to start the server")
    else:
        print("\n💥 Database initialization failed. Please check the errors above.")
        sys.exit(1)