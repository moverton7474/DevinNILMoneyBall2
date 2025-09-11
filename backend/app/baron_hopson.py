import numpy as np
import pandas as pd
from typing import Dict, List, Optional
from .models import Athlete, AthleteEvaluation

class BaronHopsonEngine:
    """
    Baron Hopson Valuation Methodology for College Football Athletes
    
    The methodology evaluates athletes across 5 key dimensions:
    1. Performance Score (40% weight)
    2. Potential Score (25% weight) 
    3. Marketability Score (20% weight)
    4. Leadership Score (10% weight)
    5. Academic Score (5% weight)
    """
    
    WEIGHTS = {
        'performance': 0.40,
        'potential': 0.25,
        'marketability': 0.20,
        'leadership': 0.10,
        'academic': 0.05
    }
    
    POSITION_MULTIPLIERS = {
        'QB': 1.5,
        'RB': 1.2,
        'WR': 1.2,
        'TE': 1.0,
        'OL': 0.9,
        'DL': 1.0,
        'LB': 1.1,
        'DB': 1.1,
        'K': 0.7,
        'P': 0.6
    }
    
    def __init__(self):
        self.base_nil_value = 50000  # Base NIL value for average player
        self.max_nil_value = 2000000  # Maximum NIL value
        self.revenue_share_per_point = 1000  # Revenue share per Baron Hopson point
    
    def calculate_performance_score(self, athlete: Athlete) -> float:
        """Calculate performance score based on position-specific stats"""
        if not athlete.games_played:
            return 0.0
            
        position = athlete.position.upper()
        score = 0.0
        
        if position == 'QB':
            passing_efficiency = (athlete.passing_tds * 6 - athlete.interceptions * 2) / max(athlete.games_played, 1)
            yards_per_game = athlete.passing_yards / athlete.games_played
            score = min(100, (yards_per_game / 300 * 50) + (passing_efficiency * 10))
            
        elif position in ['RB', 'FB']:
            yards_per_game = athlete.rushing_yards / athlete.games_played
            tds_per_game = athlete.rushing_tds / athlete.games_played
            score = min(100, (yards_per_game / 150 * 60) + (tds_per_game * 20))
            
        elif position in ['WR', 'TE']:
            yards_per_game = athlete.receiving_yards / athlete.games_played
            tds_per_game = athlete.receiving_tds / athlete.games_played
            score = min(100, (yards_per_game / 100 * 60) + (tds_per_game * 25))
            
        elif position in ['DE', 'DT', 'NT']:
            sacks_per_game = athlete.sacks / athlete.games_played
            tackles_per_game = athlete.tackles / athlete.games_played
            score = min(100, (sacks_per_game * 30) + (tackles_per_game / 8 * 40))
            
        elif position in ['LB', 'ILB', 'OLB']:
            tackles_per_game = athlete.tackles / athlete.games_played
            sacks_per_game = athlete.sacks / athlete.games_played
            ints_per_game = athlete.interceptions / athlete.games_played
            score = min(100, (tackles_per_game / 10 * 50) + (sacks_per_game * 20) + (ints_per_game * 15))
            
        elif position in ['CB', 'S', 'FS', 'SS']:
            ints_per_game = athlete.interceptions / athlete.games_played
            tackles_per_game = athlete.tackles / athlete.games_played
            score = min(100, (ints_per_game * 40) + (tackles_per_game / 6 * 30))
            
        else:
            score = 50.0
            
        return max(0.0, min(100.0, score))
    
    def calculate_potential_score(self, athlete: Athlete) -> float:
        """Calculate potential score based on year, physical attributes, and trajectory"""
        score = 50.0  # Base score
        
        year_adjustments = {'FR': 25, 'SO': 15, 'JR': 5, 'SR': -5, 'GRAD': -10}
        score += year_adjustments.get(athlete.year, 0)
        
        if athlete.position in ['QB', 'WR', 'DB'] and athlete.weight:
            if 170 <= athlete.weight <= 220:
                score += 10
        elif athlete.position in ['OL', 'DL'] and athlete.weight:
            if athlete.weight >= 280:
                score += 15
            elif athlete.weight >= 250:
                score += 10
                
        if athlete.games_played >= 30:
            score += 10
        elif athlete.games_played >= 20:
            score += 5
            
        return max(0.0, min(100.0, score))
    
    def calculate_marketability_score(self, athlete: Athlete) -> float:
        """Calculate marketability score based on position, performance, and other factors"""
        base_score = 40.0
        
        position_bonus = {
            'QB': 30, 'RB': 20, 'WR': 25, 'TE': 10,
            'DE': 15, 'LB': 10, 'DB': 15, 'K': 5
        }.get(athlete.position, 8)
        
        base_score += position_bonus
        
        if athlete.baron_hopson_score > 80:
            base_score += 20
        elif athlete.baron_hopson_score > 60:
            base_score += 10
            
        if athlete.high_school and any(keyword in athlete.high_school.lower() 
                                     for keyword in ['prep', 'academy', 'christian']):
            base_score += 5
            
        return max(0.0, min(100.0, base_score))
    
    def calculate_leadership_score(self, athlete: Athlete) -> float:
        """Calculate leadership score - would typically come from coach evaluations"""
        base_score = 50.0
        
        if athlete.year in ['SR', 'GRAD']:
            base_score += 20
        elif athlete.year == 'JR':
            base_score += 10
            
        if athlete.position in ['QB', 'C', 'MLB']:
            base_score += 15
            
        return max(0.0, min(100.0, base_score))
    
    def calculate_academic_score(self, athlete: Athlete) -> float:
        """Calculate academic score - simplified for demo"""
        return 75.0  # Assume good academic standing
    
    def calculate_baron_hopson_score(self, athlete: Athlete) -> float:
        """Calculate overall Baron Hopson score"""
        performance = self.calculate_performance_score(athlete)
        potential = self.calculate_potential_score(athlete)
        marketability = self.calculate_marketability_score(athlete)
        leadership = self.calculate_leadership_score(athlete)
        academic = self.calculate_academic_score(athlete)
        
        weighted_score = (
            performance * self.WEIGHTS['performance'] +
            potential * self.WEIGHTS['potential'] +
            marketability * self.WEIGHTS['marketability'] +
            leadership * self.WEIGHTS['leadership'] +
            academic * self.WEIGHTS['academic']
        )
        
        position_multiplier = self.POSITION_MULTIPLIERS.get(athlete.position, 1.0)
        final_score = weighted_score * position_multiplier
        
        return max(0.0, min(100.0, final_score))
    
    def calculate_nil_value(self, baron_hopson_score: float, athlete: Athlete) -> float:
        """Calculate recommended NIL value based on Baron Hopson score"""
        normalized_score = baron_hopson_score / 100.0
        nil_value = self.base_nil_value * (1 + normalized_score ** 2 * 10)
        
        position_multiplier = self.POSITION_MULTIPLIERS.get(athlete.position, 1.0)
        nil_value *= position_multiplier
        
        year_multipliers = {'FR': 0.7, 'SO': 0.85, 'JR': 1.0, 'SR': 1.2, 'GRAD': 1.1}
        nil_value *= year_multipliers.get(athlete.year, 1.0)
        
        return min(self.max_nil_value, max(0, nil_value))
    
    def calculate_revenue_share_value(self, baron_hopson_score: float, athlete: Athlete) -> float:
        """Calculate recommended revenue share allocation"""
        base_share = baron_hopson_score * self.revenue_share_per_point
        
        position_multiplier = self.POSITION_MULTIPLIERS.get(athlete.position, 1.0)
        revenue_share = base_share * position_multiplier
        
        return min(500000, max(0, revenue_share))
    
    def evaluate_athlete(self, athlete: Athlete) -> Dict[str, float]:
        """Complete athlete evaluation using Baron Hopson methodology"""
        baron_hopson_score = self.calculate_baron_hopson_score(athlete)
        nil_value = self.calculate_nil_value(baron_hopson_score, athlete)
        revenue_share_value = self.calculate_revenue_share_value(baron_hopson_score, athlete)
        
        return {
            'baron_hopson_score': baron_hopson_score,
            'performance_score': self.calculate_performance_score(athlete),
            'potential_score': self.calculate_potential_score(athlete),
            'marketability_score': self.calculate_marketability_score(athlete),
            'leadership_score': self.calculate_leadership_score(athlete),
            'academic_score': self.calculate_academic_score(athlete),
            'nil_value': nil_value,
            'revenue_share_value': revenue_share_value,
            'market_value': nil_value + revenue_share_value
        }
    
    def optimize_roster_allocation(self, athletes: List[Athlete], total_budget: float) -> Dict:
        """Optimize budget allocation across roster using Baron Hopson scores"""
        evaluations = []
        for athlete in athletes:
            eval_data = self.evaluate_athlete(athlete)
            eval_data['athlete_id'] = athlete.id
            eval_data['athlete_name'] = athlete.name
            eval_data['position'] = athlete.position
            evaluations.append(eval_data)
        
        evaluations.sort(key=lambda x: x['baron_hopson_score'], reverse=True)
        
        total_score = sum(eval['baron_hopson_score'] for eval in evaluations)
        
        for eval_data in evaluations:
            if total_score > 0:
                allocation_percentage = eval_data['baron_hopson_score'] / total_score
                eval_data['recommended_allocation'] = total_budget * allocation_percentage
            else:
                eval_data['recommended_allocation'] = 0
        
        return {
            'total_budget': total_budget,
            'total_allocated': sum(eval['recommended_allocation'] for eval in evaluations),
            'athlete_allocations': evaluations,
            'optimization_summary': {
                'top_performers': evaluations[:5],
                'average_score': total_score / len(evaluations) if evaluations else 0,
                'budget_efficiency': total_score / total_budget if total_budget > 0 else 0
            }
        }
