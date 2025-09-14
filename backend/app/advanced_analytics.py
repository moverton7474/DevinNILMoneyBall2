import numpy as np
import pandas as pd
import math
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from .models import Athlete, AthleteEvaluation, Team, SocialMediaMetrics
from .baron_hopson import BaronHopsonEngine

class AdvancedBaronHopsonAnalytics:
    """
    Advanced analytics for Baron Hopson methodology including:
    - Predictive modeling for future performance
    - Trend analysis for score trajectories  
    - Comparative benchmarking across teams/conferences
    """
    
    def __init__(self):
        self.baron_engine = BaronHopsonEngine()
        self.scaler = StandardScaler()
        
    def predict_future_performance(self, athlete: Athlete, db: Session, months_ahead: int = 12) -> Dict:
        """
        Predict athlete's Baron Hopson score and market value for future periods
        using historical evaluation data and performance trends
        """
        evaluations = db.query(AthleteEvaluation).filter(
            AthleteEvaluation.athlete_id == athlete.id
        ).order_by(AthleteEvaluation.evaluation_date).all()
        
        if len(evaluations) < 3:
            current_score = athlete.baron_hopson_score or 50.0
            return {
                'predicted_score': current_score,
                'confidence_interval': (current_score * 0.8, current_score * 1.2),
                'trend': 'insufficient_data',
                'risk_factors': ['Limited historical data'],
                'prediction_horizon_months': months_ahead
            }
        
        dates = [eval.evaluation_date for eval in evaluations]
        scores = [eval.overall_score for eval in evaluations]
        
        base_date = min(dates)
        x_data = np.array([(d - base_date).days for d in dates]).reshape(-1, 1)
        y_data = np.array(scores)
        
        model = LinearRegression()
        model.fit(x_data, y_data)
        
        future_days = (datetime.utcnow() - base_date).days + (months_ahead * 30)
        predicted_score = model.predict([[future_days]])[0]
        
        residuals = y_data - model.predict(x_data)
        std_error = np.std(residuals)
        confidence_interval = (
            max(0, predicted_score - 1.96 * std_error),
            min(100, predicted_score + 1.96 * std_error)
        )
        
        slope = model.coef_[0]
        if slope > 0.1:
            trend = 'improving'
        elif slope < -0.1:
            trend = 'declining'
        else:
            trend = 'stable'
            
        risk_factors = []
        if athlete.year in ['SR', 'GRAD']:
            risk_factors.append('Senior eligibility risk')
        if athlete.transfer_portal_status == 'portal':
            risk_factors.append('Transfer portal uncertainty')
        if predicted_score < athlete.baron_hopson_score:
            risk_factors.append('Declining performance trend')
            
        return {
            'predicted_score': round(predicted_score, 2),
            'confidence_interval': (round(confidence_interval[0], 2), round(confidence_interval[1], 2)),
            'trend': trend,
            'trend_slope': round(slope, 4),
            'risk_factors': risk_factors,
            'prediction_horizon_months': months_ahead,
            'model_r2': model.score(x_data, y_data)
        }
    
    def analyze_performance_trends(self, athlete: Athlete, db: Session) -> Dict:
        """
        Analyze historical performance trends and identify patterns
        """
        evaluations = db.query(AthleteEvaluation).filter(
            AthleteEvaluation.athlete_id == athlete.id
        ).order_by(AthleteEvaluation.evaluation_date).all()
        
        if len(evaluations) < 2:
            return {'error': 'Insufficient historical data for trend analysis'}
        
        dates = [eval.evaluation_date for eval in evaluations]
        overall_scores = [eval.overall_score for eval in evaluations]
        performance_scores = [eval.performance_score for eval in evaluations]
        potential_scores = [eval.potential_score for eval in evaluations]
        marketability_scores = [eval.marketability_score for eval in evaluations]
        
        def calculate_trend(scores):
            if len(scores) < 2:
                return 0
            x = np.arange(len(scores))
            slope, _ = np.polyfit(x, scores, 1)
            return slope
        
        trends = {
            'overall': calculate_trend(overall_scores),
            'performance': calculate_trend(performance_scores),
            'potential': calculate_trend(potential_scores),
            'marketability': calculate_trend(marketability_scores)
        }
        
        latest_eval = evaluations[-1]
        dimension_scores = {
            'performance': latest_eval.performance_score,
            'potential': latest_eval.potential_score,
            'marketability': latest_eval.marketability_score,
            'leadership': latest_eval.leadership_score,
            'academic': latest_eval.academic_score
        }
        
        strongest_dimension = max(dimension_scores.items(), key=lambda x: x[1])
        weakest_dimension = min(dimension_scores.items(), key=lambda x: x[1])
        
        overall_volatility = np.std(overall_scores) if len(overall_scores) > 1 else 0
        
        return {
            'evaluation_count': len(evaluations),
            'date_range': {
                'start': dates[0].isoformat(),
                'end': dates[-1].isoformat()
            },
            'trends': {
                'overall_trend': round(trends['overall'], 3),
                'performance_trend': round(trends['performance'], 3),
                'potential_trend': round(trends['potential'], 3),
                'marketability_trend': round(trends['marketability'], 3)
            },
            'current_scores': dimension_scores,
            'strongest_dimension': {
                'area': strongest_dimension[0],
                'score': round(strongest_dimension[1], 2)
            },
            'weakest_dimension': {
                'area': weakest_dimension[0],
                'score': round(weakest_dimension[1], 2)
            },
            'volatility': round(overall_volatility, 2),
            'stability_rating': 'high' if overall_volatility < 5 else 'medium' if overall_volatility < 10 else 'low'
        }
    
    def comparative_benchmarking(self, athlete: Athlete, db: Session, comparison_scope: str = 'position') -> Dict:
        """
        Compare athlete against peers based on position, conference, or national averages
        """
        base_query = db.query(Athlete).filter(Athlete.is_active == True)
        
        if comparison_scope == 'position':
            peers = base_query.filter(Athlete.position == athlete.position).all()
            scope_description = f"All {athlete.position} players"
        elif comparison_scope == 'team':
            peers = base_query.filter(Athlete.team_id == athlete.team_id).all()
            scope_description = f"Team {athlete.team.name if athlete.team else 'Unknown'}"
        elif comparison_scope == 'conference':
            if athlete.team and athlete.team.conference:
                team_ids = db.query(Team.id).filter(Team.conference == athlete.team.conference).all()
                team_ids = [t[0] for t in team_ids]
                peers = base_query.filter(Athlete.team_id.in_(team_ids)).all()
                scope_description = f"{athlete.team.conference} Conference"
            else:
                peers = base_query.all()
                scope_description = "National average"
        else:  # national
            peers = base_query.all()
            scope_description = "National average"
        
        if not peers:
            return {'error': 'No comparison data available'}
        
        peer_scores = [p.baron_hopson_score for p in peers if p.baron_hopson_score]
        peer_market_values = [p.market_value for p in peers if p.market_value]
        peer_nil_values = [p.nil_value for p in peers if p.nil_value]
        
        if not peer_scores:
            return {'error': 'No peer scoring data available'}
        
        athlete_score = athlete.baron_hopson_score or 0
        athlete_market_value = athlete.market_value or 0
        athlete_nil_value = athlete.nil_value or 0
        
        score_percentile = (sum(1 for score in peer_scores if score < athlete_score) / len(peer_scores)) * 100
        
        market_value_percentile = 0
        if peer_market_values and athlete_market_value > 0:
            market_value_percentile = (sum(1 for val in peer_market_values if val < athlete_market_value) / len(peer_market_values)) * 100
        
        nil_value_percentile = 0
        if peer_nil_values and athlete_nil_value > 0:
            nil_value_percentile = (sum(1 for val in peer_nil_values if val < athlete_nil_value) / len(peer_nil_values)) * 100
        
        top_performers = sorted(peers, key=lambda x: x.baron_hopson_score or 0, reverse=True)[:5]
        
        if top_performers:
            top_score = top_performers[0].baron_hopson_score or 0
            score_gap_to_top = top_score - athlete_score
        else:
            score_gap_to_top = 0
        
        return {
            'comparison_scope': scope_description,
            'peer_count': len(peers),
            'athlete_metrics': {
                'baron_hopson_score': athlete_score,
                'market_value': athlete_market_value,
                'nil_value': athlete_nil_value
            },
            'peer_averages': {
                'baron_hopson_score': round(np.mean(peer_scores), 2),
                'market_value': round(np.mean(peer_market_values), 2) if peer_market_values else 0,
                'nil_value': round(np.mean(peer_nil_values), 2) if peer_nil_values else 0
            },
            'percentiles': {
                'baron_hopson_score': round(score_percentile, 1),
                'market_value': round(market_value_percentile, 1),
                'nil_value': round(nil_value_percentile, 1)
            },
            'performance_tier': self._get_performance_tier(score_percentile),
            'score_gap_to_top': round(score_gap_to_top, 2),
            'top_performers': [
                {
                    'name': p.name,
                    'team': p.team.name if p.team else 'Unknown',
                    'baron_hopson_score': p.baron_hopson_score,
                    'market_value': p.market_value
                } for p in top_performers[:3]
            ]
        }
    
    def _get_performance_tier(self, percentile: float) -> str:
        """Classify performance tier based on percentile"""
        if percentile >= 90:
            return 'Elite (Top 10%)'
        elif percentile >= 75:
            return 'High Performer (Top 25%)'
        elif percentile >= 50:
            return 'Above Average (Top 50%)'
        elif percentile >= 25:
            return 'Below Average (Bottom 50%)'
        else:
            return 'Needs Improvement (Bottom 25%)'
    
    def generate_roi_projections(self, athlete: Athlete, db: Session, investment_scenarios: List[float]) -> Dict:
        """
        Generate ROI projections for different NIL investment scenarios
        """
        current_score = athlete.baron_hopson_score or 50.0
        current_market_value = athlete.market_value or 0
        
        prediction = self.predict_future_performance(athlete, db, 12)
        predicted_score = prediction['predicted_score']
        
        projections = []
        for investment in investment_scenarios:
            investment_boost = min(10, investment / 100000)  # Max 10 point boost for $1M investment
            
            projected_score = min(100, predicted_score + investment_boost)
            projected_market_value = self.baron_engine.calculate_nil_value(projected_score, athlete)
            
            value_increase = projected_market_value - current_market_value
            roi_percentage = ((value_increase - investment) / investment * 100) if investment > 0 else 0
            
            if value_increase > 0:
                payback_months = investment / (value_increase / 12)
                payback_months = min(999.9, payback_months)  # Cap at 999.9 months
            else:
                payback_months = 999.9  # Use large finite number instead of inf
            
            projections.append({
                'investment': investment,
                'projected_score': round(projected_score, 2),
                'projected_market_value': round(projected_market_value, 2),
                'value_increase': round(value_increase, 2),
                'roi_percentage': round(roi_percentage, 2),
                'payback_months': round(payback_months, 1)
            })
        
        valid_projections = [p for p in projections if math.isfinite(p['roi_percentage'])]
        if valid_projections:
            optimal_investment = max(valid_projections, key=lambda x: x['roi_percentage'])
        else:
            optimal_investment = projections[0] if projections else None
        
        return {
            'current_metrics': {
                'baron_hopson_score': current_score,
                'market_value': current_market_value
            },
            'base_prediction': {
                'predicted_score': predicted_score,
                'confidence_interval': prediction['confidence_interval']
            },
            'investment_projections': projections,
            'optimal_investment': optimal_investment,
            'risk_assessment': prediction['risk_factors']
        }
    
    def team_portfolio_analysis(self, team_id: int, db: Session) -> Dict:
        """
        Analyze team's athlete portfolio for optimization opportunities
        """
        athletes = db.query(Athlete).filter(
            Athlete.team_id == team_id,
            Athlete.is_active == True
        ).all()
        
        if not athletes:
            return {'error': 'No active athletes found for team'}
        
        total_baron_score = sum(a.baron_hopson_score or 0 for a in athletes)
        total_market_value = sum(a.market_value or 0 for a in athletes)
        total_nil_value = sum(a.nil_value or 0 for a in athletes)
        
        position_analysis = {}
        for athlete in athletes:
            pos = athlete.position
            if pos not in position_analysis:
                position_analysis[pos] = {
                    'count': 0,
                    'total_score': 0,
                    'total_value': 0,
                    'athletes': []
                }
            
            position_analysis[pos]['count'] += 1
            position_analysis[pos]['total_score'] += athlete.baron_hopson_score or 0
            position_analysis[pos]['total_value'] += athlete.market_value or 0
            position_analysis[pos]['athletes'].append({
                'name': athlete.name,
                'score': athlete.baron_hopson_score,
                'value': athlete.market_value
            })
        
        for pos_data in position_analysis.values():
            pos_data['avg_score'] = pos_data['total_score'] / pos_data['count']
            pos_data['avg_value'] = pos_data['total_value'] / pos_data['count']
        
        sorted_athletes = sorted(athletes, key=lambda x: x.baron_hopson_score or 0, reverse=True)
        top_performers = sorted_athletes[:5]
        bottom_performers = sorted_athletes[-5:]
        
        recommendations = []
        
        key_positions = ['QB', 'RB', 'WR', 'OL', 'DL', 'LB', 'DB']
        for pos in key_positions:
            if pos not in position_analysis:
                recommendations.append(f"Consider recruiting {pos} players - position not represented")
            elif position_analysis[pos]['avg_score'] < 60:
                recommendations.append(f"Upgrade {pos} position - current average score {position_analysis[pos]['avg_score']:.1f}")
        
        for athlete in athletes:
            if (athlete.market_value or 0) > 200000 and (athlete.baron_hopson_score or 0) < 70:
                recommendations.append(f"Review {athlete.name} - high investment, low performance")
        
        return {
            'team_summary': {
                'total_athletes': len(athletes),
                'total_baron_score': round(total_baron_score, 2),
                'average_baron_score': round(total_baron_score / len(athletes), 2),
                'total_market_value': round(total_market_value, 2),
                'total_nil_value': round(total_nil_value, 2)
            },
            'position_analysis': {
                pos: {
                    'count': data['count'],
                    'avg_score': round(data['avg_score'], 2),
                    'avg_value': round(data['avg_value'], 2)
                } for pos, data in position_analysis.items()
            },
            'top_performers': [
                {
                    'name': a.name,
                    'position': a.position,
                    'baron_hopson_score': a.baron_hopson_score,
                    'market_value': a.market_value
                } for a in top_performers
            ],
            'improvement_opportunities': [
                {
                    'name': a.name,
                    'position': a.position,
                    'baron_hopson_score': a.baron_hopson_score,
                    'market_value': a.market_value
                } for a in bottom_performers
            ],
            'recommendations': recommendations,
            'portfolio_efficiency': round((total_baron_score / total_market_value * 1000), 2) if total_market_value > 0 else 0
        }
