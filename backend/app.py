from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from datetime import datetime, timedelta
import os
import traceback

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data/nil_moneyball.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-string')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)

# Configure CORS
CORS(app, 
     origins=['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'],
     allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     supports_credentials=True)

# Create data directory if it doesn't exist
os.makedirs('data', exist_ok=True)

# Simple Athlete model for demo
class Athlete(db.Model):
    __tablename__ = 'athletes'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    position = db.Column(db.String(10), nullable=False)
    previous_school = db.Column(db.String(100))
    conference = db.Column(db.String(50))
    transfer_from = db.Column(db.String(20))
    market_value = db.Column(db.Integer)
    portal_entry_date = db.Column(db.Date)
    days_in_portal = db.Column(db.Integer)
    gpa = db.Column(db.Float)
    home_state = db.Column(db.String(20))
    hometown = db.Column(db.String(50))
    height = db.Column(db.String(10))
    weight = db.Column(db.Integer)
    years_eligibility_remaining = db.Column(db.Integer)
    games_played = db.Column(db.Integer)
    total_tackles = db.Column(db.Integer)
    solo_tackles = db.Column(db.Integer)
    passing_yards = db.Column(db.Integer)
    passing_tds = db.Column(db.Integer)
    rushing_yards = db.Column(db.Integer)
    receiving_yards = db.Column(db.Integer)
    receptions = db.Column(db.Integer)
    baron_hopson_score = db.Column(db.Float)
    value_per_dollar = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'position': self.position,
            'previous_school': self.previous_school,
            'conference': self.conference,
            'transfer_from': self.transfer_from,
            'market_value': self.market_value,
            'portal_entry_date': self.portal_entry_date.isoformat() if self.portal_entry_date else None,
            'days_in_portal': self.days_in_portal,
            'gpa': self.gpa,
            'home_state': self.home_state,
            'hometown': self.hometown,
            'height': self.height,
            'weight': self.weight,
            'years_eligibility_remaining': self.years_eligibility_remaining,
            'games_played': self.games_played,
            'total_tackles': self.total_tackles,
            'solo_tackles': self.solo_tackles,
            'passing_yards': self.passing_yards,
            'passing_tds': self.passing_tds,
            'rushing_yards': self.rushing_yards,
            'receiving_yards': self.receiving_yards,
            'receptions': self.receptions,
            'baron_hopson_score': self.baron_hopson_score,
            'value_per_dollar': self.value_per_dollar,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

# Health check endpoint
@app.route('/api/v1/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'NIL Moneyball Backend is running',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '2.0.0',
        'features': [
            'baron_hopson_methodology',
            'ksu_integration', 
            'nil_opportunity_matching',
            'roster_optimization',
            'transfer_portal_management'
        ]
    }), 200

# Athletes endpoints
@app.route('/api/v1/athletes', methods=['GET'])
def get_athletes():
    """Get all athletes with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 50, type=int), 100)
        
        # Filters
        position = request.args.get('position')
        transfer_from = request.args.get('transfer_from')
        
        query = Athlete.query
        
        if position:
            query = query.filter(Athlete.position == position)
        if transfer_from:
            query = query.filter(Athlete.transfer_from == transfer_from)
        
        athletes = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'athletes': [athlete.to_dict() for athlete in athletes.items],
            'pagination': {
                'page': athletes.page,
                'pages': athletes.pages,
                'per_page': athletes.per_page,
                'total': athletes.total
            }
        }), 200
        
    except Exception as e:
        print(f"Error getting athletes: {str(e)}")
        return jsonify({'error': 'Failed to retrieve athletes'}), 500

@app.route('/api/v1/athletes', methods=['POST'])
def create_athlete():
    """Create new athlete"""
    try:
        data = request.get_json()
        
        athlete = Athlete(
            name=data.get('name'),
            position=data.get('position'),
            previous_school=data.get('previous_school'),
            conference=data.get('conference'),
            transfer_from=data.get('transfer_from'),
            market_value=data.get('market_value'),
            gpa=data.get('gpa'),
            home_state=data.get('home_state'),
            hometown=data.get('hometown'),
            height=data.get('height'),
            weight=data.get('weight'),
            days_in_portal=data.get('days_in_portal', 0)
        )
        
        db.session.add(athlete)
        db.session.commit()
        
        return jsonify({
            'message': 'Athlete created successfully',
            'athlete_id': athlete.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating athlete: {str(e)}")
        return jsonify({'error': 'Failed to create athlete'}), 500

# Roster upload endpoint
@app.route('/api/v1/roster/upload', methods=['POST'])
def upload_roster():
    """Upload roster data"""
    try:
        data = request.get_json()
        players = data.get('players', [])
        mapping = data.get('mapping', {})
        
        imported_count = 0
        failed_count = 0
        session_id = f"session_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        
        for player_data in players:
            try:
                # Map columns
                mapped_player = {}
                for original_col, mapped_col in mapping.items():
                    if mapped_col and original_col in player_data:
                        mapped_player[mapped_col] = player_data[original_col]
                
                # Create athlete
                athlete = Athlete(
                    name=mapped_player.get('name'),
                    position=mapped_player.get('position'),
                    previous_school=mapped_player.get('previous_school'),
                    gpa=float(mapped_player.get('gpa', 0)) if mapped_player.get('gpa') else None,
                    market_value=int(mapped_player.get('market_value', 0)) if mapped_player.get('market_value') else None,
                    home_state=mapped_player.get('home_state'),
                    hometown=mapped_player.get('hometown'),
                    height=mapped_player.get('height'),
                    weight=int(mapped_player.get('weight', 0)) if mapped_player.get('weight') else None
                )
                
                db.session.add(athlete)
                imported_count += 1
                
            except Exception as e:
                print(f"Error importing player: {str(e)}")
                failed_count += 1
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'imported': imported_count,
            'failed': failed_count,
            'message': f'Successfully imported {imported_count} players'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Roster upload error: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Upload failed: {str(e)}'
        }), 500

# Analytics dashboard endpoint
@app.route('/api/v1/analytics/dashboard', methods=['GET'])
def analytics_dashboard():
    """Get analytics dashboard data"""
    try:
        total_athletes = Athlete.query.count()
        
        # Position breakdown
        position_breakdown = []
        positions = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'DB']
        
        for position in positions:
            count = Athlete.query.filter_by(position=position).count()
            avg_value = db.session.query(db.func.avg(Athlete.market_value)).filter(
                Athlete.position == position,
                Athlete.market_value.isnot(None)
            ).scalar() or 0
            
            position_breakdown.append({
                'position': position,
                'count': count,
                'avg_market_value': int(avg_value)
            })
        
        # Transfer breakdown
        transfer_breakdown = []
        transfer_types = ['FCS', 'Group5', 'Power4']
        
        for transfer_type in transfer_types:
            count = Athlete.query.filter_by(transfer_from=transfer_type).count()
            avg_value = db.session.query(db.func.avg(Athlete.market_value)).filter(
                Athlete.transfer_from == transfer_type,
                Athlete.market_value.isnot(None)
            ).scalar() or 0
            
            transfer_breakdown.append({
                'transfer_from': transfer_type,
                'count': count,
                'avg_market_value': int(avg_value)
            })
        
        return jsonify({
            'overview': {
                'total_athletes': total_athletes,
                'total_evaluations': total_athletes * 2,
                'total_optimizations': 67,
                'baron_hopson_prospects': 23
            },
            'position_breakdown': position_breakdown,
            'transfer_breakdown': transfer_breakdown,
            'baron_hopson_prospects': [],
            'budget_utilization': [
                {'budget_tier': 'Group5 Low', 'avg_utilization': 0.78, 'avg_advantage_score': 76.3},
                {'budget_tier': 'Group5 High', 'avg_utilization': 0.82, 'avg_advantage_score': 78.9},
                {'budget_tier': 'Power4 Standard', 'avg_utilization': 0.71, 'avg_advantage_score': 65.2},
                {'budget_tier': 'Power4 Elite', 'avg_utilization': 0.85, 'avg_advantage_score': 58.7}
            ]
        }), 200
        
    except Exception as e:
        print(f"Dashboard error: {str(e)}")
        return jsonify({'error': 'Failed to load dashboard data'}), 500

# Baron Hopson analysis endpoint
@app.route('/api/v1/baron-hopson/analysis', methods=['POST'])
def baron_hopson_analysis():
    """Run Baron Hopson methodology analysis"""
    try:
        data = request.get_json()
        
        # Calculate Baron Hopson score
        total_tackles = data.get('total_tackles', 0)
        games_played = max(data.get('games_played', 1), 1)
        solo_tackles = data.get('solo_tackles', 0)
        market_value = data.get('market_value', 1)
        
        tackles_per_game = total_tackles / games_played
        solo_percentage = solo_tackles / max(total_tackles, 1)
        
        # Baron formula: 11 tackles = 92/100 score
        production_score = min(100, (tackles_per_game / 11) * 92 + solo_percentage * 20)
        value_per_dollar = production_score / (market_value / 1000)
        
        # Baron baseline comparison
        baron_baseline = {
            'tackles_per_game': 11,
            'production_score': 92,
            'value_per_dollar': 6.57,
            'market_value': 15000
        }
        
        similarity = 100 - abs(value_per_dollar - baron_baseline['value_per_dollar']) * 5
        similarity = max(0, min(100, similarity))
        
        return jsonify({
            'similarity': similarity,
            'playerValueRatio': value_per_dollar,
            'baronBaselineRatio': baron_baseline['value_per_dollar'],
            'advantageMultiplier': value_per_dollar / baron_baseline['value_per_dollar'],
            'recommendation': 'STRONG_RECOMMENDATION' if similarity > 70 else 'MODERATE_INTEREST',
            'subject_profile': {
                'name': data.get('name', 'Unknown'),
                'position': data.get('position', 'LB'),
                'production_score': production_score,
                'value_per_dollar': value_per_dollar
            },
            'baron_hopson_baseline': baron_baseline
        }), 200
        
    except Exception as e:
        print(f"Baron Hopson analysis error: {str(e)}")
        return jsonify({'error': 'Analysis failed'}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

# Initialize database
def create_tables():
    """Create database tables"""
    try:
        db.create_all()
        print("✅ Database tables created successfully")
    except Exception as e:
        print(f"❌ Database creation error: {str(e)}")

if __name__ == '__main__':
    print("🏈 Starting NIL Moneyball Platform Backend...")
    print("=" * 50)
    
    # Create tables
    with app.app_context():
        try:
            db.create_all()
            print("✅ Database tables created")
        except Exception as e:
            print(f"❌ Database error: {str(e)}")
    
    print("🚀 Backend server starting on http://localhost:5000")
    print("📊 API endpoints available at /api/v1/")
    print("💡 Frontend should proxy requests through Vite")
    
    # Run the application
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        use_reloader=True
    )
