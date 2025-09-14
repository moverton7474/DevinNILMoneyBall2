from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, List, Optional, Tuple
from datetime import datetime
from sqlalchemy.orm import Session
from .models import Athlete, AthleteEvaluation, Team
from .baron_hopson import BaronHopsonEngine

import decimal
decimal.getcontext().prec = 20
decimal.getcontext().rounding = ROUND_HALF_UP

class ValuationEngineV3:
    """
    NIL Valuation Engine v3.0 with decimal precision
    Extends Baron Hopson methodology with financial precision
    """
    
    def __init__(self):
        self.baron_engine = BaronHopsonEngine()
        self.base_value = Decimal('25000.00')
        self.weights = {
            'performance': Decimal('0.40'),
            'potential': Decimal('0.25'), 
            'marketability': Decimal('0.20'),
            'leadership': Decimal('0.10'),
            'academic': Decimal('0.05')
        }
        
    def calculate_precise_valuation(self, athlete: Athlete, db: Session) -> Dict:
        """Calculate athlete valuation with decimal precision"""
        
        performance_score = Decimal(str(self.baron_engine.calculate_performance_score(athlete)))
        potential_score = Decimal(str(self.baron_engine.calculate_potential_score(athlete)))
        marketability_score = Decimal(str(self.baron_engine.calculate_marketability_score(athlete)))
        leadership_score = Decimal(str(self.baron_engine.calculate_leadership_score(athlete)))
        academic_score = Decimal(str(self.baron_engine.calculate_academic_score(athlete)))
        
        weighted_score = (
            performance_score * self.weights['performance'] +
            potential_score * self.weights['potential'] +
            marketability_score * self.weights['marketability'] +
            leadership_score * self.weights['leadership'] +
            academic_score * self.weights['academic']
        )
        
        position_multiplier = self._get_position_multiplier(athlete.position)
        year_multiplier = self._get_year_multiplier(athlete.year)
        
        base_calculation = self.base_value * (weighted_score / Decimal('100')) * position_multiplier * year_multiplier
        
        risk_multiplier = self._calculate_risk_multiplier(athlete)
        final_value = base_calculation * risk_multiplier
        
        confidence = self._calculate_confidence(athlete, db)
        valuation_range = self._calculate_range(final_value, confidence)
        
        return {
            'estimated_value': final_value.quantize(Decimal('0.01')),
            'base_value': self.base_value,
            'adjusted_value': base_calculation.quantize(Decimal('0.01')),
            'value_per_dollar': (final_value / Decimal('100000')).quantize(Decimal('0.0001')),
            'valuation_range': valuation_range,
            'confidence_score': confidence,
            'component_scores': {
                'performance': performance_score.quantize(Decimal('0.01')),
                'potential': potential_score.quantize(Decimal('0.01')),
                'marketability': marketability_score.quantize(Decimal('0.01')),
                'leadership': leadership_score.quantize(Decimal('0.01')),
                'academic': academic_score.quantize(Decimal('0.01'))
            },
            'multipliers': {
                'position': position_multiplier,
                'year': year_multiplier,
                'risk': risk_multiplier
            },
            'valuation_date': datetime.utcnow(),
            'valuation_version': '3.0.0',
            'methodology_used': 'baron_hopson_v3'
        }
    
    def _get_position_multiplier(self, position: str) -> Decimal:
        """Get position multiplier with decimal precision"""
        multipliers = {
            'QB': Decimal('2.5'),
            'WR': Decimal('1.9'), 
            'RB': Decimal('1.8'),
            'TE': Decimal('1.4'),
            'DB': Decimal('1.4'),
            'DL': Decimal('1.3'),
            'LB': Decimal('1.2'),
            'OL': Decimal('1.2'),
            'K': Decimal('0.8'),
            'P': Decimal('0.7')
        }
        return multipliers.get(position, Decimal('1.0'))
    
    def _get_year_multiplier(self, year: str) -> Decimal:
        """Get year multiplier with decimal precision"""
        multipliers = {
            'JR': Decimal('1.4'),
            'SO': Decimal('1.25'),
            'FR': Decimal('1.15'), 
            'SR': Decimal('1.0'),
            'GRAD': Decimal('0.9')
        }
        return multipliers.get(year, Decimal('1.0'))
    
    def _calculate_risk_multiplier(self, athlete: Athlete) -> Decimal:
        """Calculate risk multiplier with decimal precision"""
        risk_score = 0
        if not hasattr(athlete, 'gpa') or (hasattr(athlete, 'gpa') and athlete.gpa and athlete.gpa < 2.5):
            risk_score += 30
        if hasattr(athlete, 'transfer_count') and athlete.transfer_count > 1:
            risk_score += 20
        if not athlete.games_played or athlete.games_played == 0:
            risk_score += 20
            
        if risk_score > 50:
            return Decimal('0.9')  # High risk
        elif risk_score > 25:
            return Decimal('1.0')  # Medium risk
        else:
            return Decimal('1.1')  # Low risk
    
    def _calculate_confidence(self, athlete: Athlete, db: Session) -> int:
        """Calculate confidence score"""
        confidence = 70
        if athlete.games_played and athlete.games_played > 0:
            confidence += 10
        if hasattr(athlete, 'gpa') and hasattr(athlete, 'gpa') and athlete.gpa:
            confidence += 5
        if athlete.baron_hopson_score and athlete.baron_hopson_score > 0:
            confidence += 10
        return min(98, max(60, confidence))
    
    def _calculate_range(self, value: Decimal, confidence: int) -> Dict[str, Decimal]:
        """Calculate valuation range with decimal precision"""
        uncertainty = Decimal(str((100 - confidence) / 100 * 0.3))
        return {
            'pessimistic': (value * (Decimal('1') - uncertainty)).quantize(Decimal('0.01')),
            'expected': value.quantize(Decimal('0.01')),
            'optimistic': (value * (Decimal('1') + uncertainty * Decimal('0.5'))).quantize(Decimal('0.01'))
        }

    def calculate_team_portfolio_value(self, team_id: int, db: Session) -> Dict:
        """Calculate total team portfolio value with decimal precision"""
        athletes = db.query(Athlete).filter(Athlete.team_id == team_id, Athlete.is_active == True).all()
        
        total_estimated_value = Decimal('0.00')
        total_current_nil = Decimal('0.00')
        total_revenue_share = Decimal('0.00')
        
        athlete_valuations = []
        
        for athlete in athletes:
            valuation = self.calculate_precise_valuation(athlete, db)
            athlete_valuations.append({
                'athlete_id': athlete.id,
                'athlete_name': athlete.name,
                'position': athlete.position,
                'estimated_value': valuation['estimated_value'],
                'current_nil_value': Decimal(str(athlete.nil_value or 0)),
                'current_revenue_share': Decimal(str(athlete.revenue_share_value or 0))
            })
            
            total_estimated_value += valuation['estimated_value']
            total_current_nil += Decimal(str(athlete.nil_value or 0))
            total_revenue_share += Decimal(str(athlete.revenue_share_value or 0))
        
        return {
            'team_id': team_id,
            'total_estimated_value': total_estimated_value.quantize(Decimal('0.01')),
            'total_current_nil': total_current_nil.quantize(Decimal('0.01')),
            'total_revenue_share': total_revenue_share.quantize(Decimal('0.01')),
            'athlete_count': len(athletes),
            'average_value_per_athlete': (total_estimated_value / Decimal(str(len(athletes))) if athletes else Decimal('0')).quantize(Decimal('0.01')),
            'portfolio_efficiency': ((total_estimated_value / (total_current_nil + total_revenue_share)) if (total_current_nil + total_revenue_share) > 0 else Decimal('0')).quantize(Decimal('0.01')),
            'athlete_valuations': athlete_valuations
        }
