#!/usr/bin/env python3
"""
Comprehensive test suite for Enhanced NIL Moneyball Platform
Tests all major components including Baron Hopson methodology, KSU integration, and NIL matching
"""

import unittest
import json
import tempfile
import os
from datetime import datetime, timedelta
import sys

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app import app, db, Athlete, PlayerEvaluation, KSUPlayerEvaluation, Institution, NILOpportunity, ComplianceAudit
from app import EnhancedMoneyballEngine

class TestEnhancedNILMoneyballPlatform(unittest.TestCase):
    
    def setUp(self):
        """Set up test database and test client"""
        self.db_fd, app.config['DATABASE'] = tempfile.mkstemp()
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + app.config['DATABASE']
        
        with app.app_context():
            db.create_all()
            self.create_test_data()
        
        self.client = app.test_client()
        self.engine = EnhancedMoneyballEngine()
    
    def tearDown(self):
        """Clean up test database"""
        os.close(self.db_fd)
        os.unlink(app.config['DATABASE'])
    
    def create_test_data(self):
        """Create test data for comprehensive testing"""
        # Create KSU institution
        ksu = Institution(
            name='Kennesaw State University',
            short_name='KSU',
            conference='Conference USA',
            division='FBS',
            budget_tier='Group5_High',
            academic_gpa_requirement=2.5,
            geographic_preference='Georgia',
            culture_weight=0.25
        )
        db.session.add(ksu)
        
        # Create Baron Hopson-style test athlete
        self.baron_athlete = Athlete(
            external_id='TEST_BARON_001',
            name='Test Baron Hopson',
            position='LB',
            height=73,
            weight=220,
            hometown='Nashville, TN',
            home_state='Tennessee',
            high_school='Test High School',
            previous_school='Tennessee State',
            conference='OVC',
            transfer_from='FCS',
            market_value=15000,
            portal_entry_date=datetime.utcnow().date(),
            days_in_portal=10,
            gpa=3.2,
            sat_score=1180,
            academic_major='Sports Management',
            games_played=12,
            games_started=11,
            total_tackles=89,
            solo_tackles=52,
            assisted_tackles=37,
            tackles_for_loss=12,
            sacks=3.5,
            interceptions=2,
            twitter_followers=2500,
            instagram_followers=3200,
            tiktok_followers=800,
            nil_engagement_score=65.0,
            estimated_nil_value=25000
        )
        db.session.add(self.baron_athlete)
        
        # Create diverse test athletes
        test_athletes = [
            {
                'external_id': 'TEST_QB_001',
                'name': 'Test Quarterback',
                'position': 'QB',
                'previous_school': 'Alabama State',
                'conference': 'SWAC',
                'transfer_from': 'FCS',
                'market_value': 35000,
                'home_state': 'Alabama',
                'gpa': 3.4,
                'games_played': 11,
                'passing_yards': 2845,
                'passing_tds': 22,
                'passing_completions': 198,
                'passing_attempts': 312,
                'passing_interceptions': 8,
                'twitter_followers': 5200,
                'instagram_followers': 7800,
                'estimated_nil_value': 45000
            },
            {
                'external_id': 'TEST_WR_001',
                'name': 'Test Wide Receiver',
                'position': 'WR',
                'previous_school': 'Middle Tennessee',
                'conference': 'Conference USA',
                'transfer_from': 'Group5',
                'market_value': 65000,
                'home_state': 'Georgia',
                'gpa': 3.7,
                'games_played': 12,
                'receptions': 67,
                'receiving_yards': 892,
                'receiving_tds': 8,
                'twitter_followers': 12000,
                'instagram_followers': 18500,
                'estimated_nil_value': 75000
            }
        ]
        
        for athlete_data in test_athletes:
            athlete_data.update({
                'height': 72,
                'weight': 190,
                'hometown': 'Test City',
                'high_school': 'Test High School',
                'portal_entry_date': datetime.utcnow().date(),
                'days_in_portal': 5,
                'academic_major': 'Communications',
                'games_started': 10,
                'nil_engagement_score': 70.0
            })
            
            athlete = Athlete(**athlete_data)
            db.session.add(athlete)
        
        # Create NIL opportunity
        self.test_opportunity = NILOpportunity(
            title='Test Local Restaurant Campaign',
            brand_name='Test Sports Grill',
            opportunity_type='SOCIAL_POST',
            description='Monthly social media posts',
            compensation_amount=500,
            payment_structure='MONTHLY',
            duration_months=6,
            position_requirements='["QB", "WR", "RB"]',
            follower_requirement=5000,
            geographic_requirements='["Georgia", "Alabama"]',
            academic_requirements=2.5,
            max_participants=3,
            application_deadline=(datetime.utcnow() + timedelta(days=30)).date()
        )
        db.session.add(self.test_opportunity)
        
        db.session.commit()

class TestBaronHopsonMethodology(TestEnhancedNILMoneyballPlatform):
    """Test Baron Hopson methodology implementation"""
    
    def test_baron_hopson_production_score(self):
        """Test Baron Hopson production score calculation"""
        with app.app_context():
            # Test exact Baron Hopson scenario
            score = self.engine.calculate_production_score(self.baron_athlete, 'LB')
            
            # Should be close to 92 (Baron Hopson baseline)
            expected_base = (89 / 12 / 11) * 92  # tackles_per_game / 11 * 92
            solo_bonus = (52 / 89) * 20  # solo percentage * 20
            
            self.assertGreater(score, 85)
            self.assertLess(score, 100)
            print(f"✅ Baron Hopson production score: {score}/100")
    
    def test_baron_hopson_similarity(self):
        """Test Baron Hopson similarity calculation"""
        with app.app_context():
            evaluation = self.engine.evaluate_player_comprehensive(
                self.baron_athlete, 'Group5_High'
            )
            
            similarity = evaluation['baron_hopson_similarity']
            
            # Should have high similarity due to matching profile
            self.assertGreater(similarity, 70)
            print(f"✅ Baron Hopson similarity: {similarity:.1f}%")
    
    def test_fcs_transfer_multiplier(self):
        """Test FCS transfer multiplier application"""
        with app.app_context():
            # Test Group5 High tier (should get 3.0x multiplier)
            evaluation = self.engine.evaluate_player_comprehensive(
                self.baron_athlete, 'Group5_High'
            )
            
            self.assertEqual(evaluation['transfer_multiplier'], 3.0)
            
            # Test Power4 Elite tier (should get 1.0x multiplier)
            evaluation_elite = self.engine.evaluate_player_comprehensive(
                self.baron_athlete, 'Power4_Elite'
            )
            
            self.assertEqual(evaluation_elite['transfer_multiplier'], 1.0)
            print(f"✅ FCS multipliers: Group5_High={evaluation['transfer_multiplier']}x, Power4_Elite={evaluation_elite['transfer_multiplier']}x")
    
    def test_value_per_dollar_calculation(self):
        """Test value per dollar ratio calculation"""
        with app.app_context():
            evaluation = self.engine.evaluate_player_comprehensive(
                self.baron_athlete, 'Group5_High'
            )
            
            value_per_dollar = evaluation['value_per_dollar']
            
            # Should achieve good value ratio for Baron Hopson profile
            self.assertGreater(value_per_dollar, 3.0)
            print(f"✅ Value per dollar ratio: {value_per_dollar:.2f}")

class TestKSUIntegration(TestEnhancedNILMoneyballPlatform):
    """Test KSU-specific integration features"""
    
    def test_ksu_evaluation_system(self):
        """Test KSU-specific player evaluation"""
        with app.app_context():
            # Create KSU evaluation
            ksu_eval = KSUPlayerEvaluation(
                athlete_id=self.baron_athlete.id,
                academic_fit_score=85,  # Good GPA
                geographic_preference_score=75,  # Southeast region
                culture_fit_score=90,  # Excellent character
                development_potential_score=80,  # High ceiling
                scheme_fit_score=85,  # Good system fit
                recruiting_priority='HIGH',
                ksu_interest_level='STRONG_INTEREST',
                final_ksu_score=83.0,
                recommendation='STRONG_INTEREST',
                evaluated_by='Test Coach'
            )
            db.session.add(ksu_eval)
            db.session.commit()
            
            # Test KSU score calculation
            calculated_score = self.engine.calculate_ksu_specific_score(
                self.baron_athlete, ksu_eval
            )
            
            self.assertGreater(calculated_score, 75)
            print(f"✅ KSU evaluation score: {calculated_score:.1f}/100")
    
    def test_geographic_preference_bonus(self):
        """Test Georgia resident bonus in KSU evaluation"""
        with app.app_context():
            # Create Georgia resident
            ga_athlete = Athlete(
                external_id='TEST_GA_001',
                name='Georgia Test Player',
                position='LB',
                home_state='Georgia',
                previous_school='Georgia Southern',
                conference='Sun Belt',
                transfer_from='Group5',
                market_value=40000,
                portal_entry_date=datetime.utcnow().date(),
                gpa=3.0
            )
            db.session.add(ga_athlete)
            db.session.commit()
            
            # Test geographic scoring
            ksu_score = self.engine.calculate_ksu_specific_score(ga_athlete)
            
            # Should get bonus for Georgia residency
            self.assertGreater(ksu_score, 60)  # Base + Georgia bonus
            print(f"✅ Georgia resident KSU score: {ksu_score:.1f}/100")

class TestRosterOptimization(TestEnhancedNILMoneyballPlatform):
    """Test enhanced roster optimization algorithms"""
    
    def test_budget_tier_optimization(self):
        """Test optimization across different budget tiers"""
        with app.app_context():
            athletes = Athlete.query.all()
            
            position_requirements = {
                'QB': 2, 'RB': 2, 'WR': 4, 'TE': 1,
                'OL': 3, 'DL': 3, 'LB': 3, 'DB': 3
            }
            
            # Test Group5_High optimization
            result = self.engine.optimize_roster(
                athletes, 'Group5_High', position_requirements
            )
            
            self.assertTrue(result['success'])
            self.assertGreater(len(result['selected_players']), 0)
            self.assertLessEqual(result['total_cost'], 1300000)  # Group5_High budget
            
            print(f"✅ Roster optimization: {len(result['selected_players'])} players selected")
            print(f"   Total cost: ${result['total_cost']:,.0f}")
            print(f"   Budget utilization: {result['budget_utilization']*100:.1f}%")
    
    def test_position_requirements_enforcement(self):
        """Test that position requirements are met in optimization"""
        with app.app_context():
            athletes = Athlete.query.all()
            
            position_requirements = {'LB': 2, 'QB': 1, 'WR': 2}
            
            result = self.engine.optimize_roster(
                athletes, 'Group5_High', position_requirements
            )
            
            # Count positions in result
            position_counts = {}
            for player_data in result['selected_players']:
                position = player_data['athlete'].position
                position_counts[position] = position_counts.get(position, 0) + 1
            
            # Verify minimums are met
            for position, min_count in position_requirements.items():
                actual_count = position_counts.get(position, 0)
                self.assertGreaterEqual(actual_count, min_count, 
                    f"Position {position} requirement not met: {actual_count} < {min_count}")
            
            print(f"✅ Position requirements enforced: {position_counts}")

class TestNILOpportunityMatching(TestEnhancedNILMoneyballPlatform):
    """Test NIL opportunity matching system"""
    
    def test_nil_opportunity_matching(self):
        """Test matching athletes to NIL opportunities"""
        with app.app_context():
            # Get athletes that match opportunity criteria
            matching_athletes = Athlete.query.filter(
                Athlete.position.in_(['QB', 'WR', 'RB']),
                Athlete.home_state.in_(['Georgia', 'Alabama'])
            ).all()
            
            self.assertGreater(len(matching_athletes), 0)
            
            # Test match scoring
            for athlete in matching_athletes:
                match_score = 0
                
                # Marketability score (40%)
                marketability = self.engine.calculate_marketability_score(athlete)
                match_score += marketability * 0.4
                
                # Performance score (30%)  
                production = self.engine.calculate_production_score(athlete, athlete.position)
                match_score += production * 0.3
                
                # Social media alignment (20%)
                total_followers = (athlete.twitter_followers + 
                                 athlete.instagram_followers + 
                                 athlete.tiktok_followers)
                follower_score = min(100, (total_followers / 5000) * 100)
                match_score += follower_score * 0.2
                
                # Academic alignment (10%)
                academic_score = 100 if athlete.gpa and athlete.gpa >= 2.5 else 50
                match_score += academic_score * 0.1
                
                self.assertGreaterEqual(match_score, 0)
                self.assertLessEqual(match_score, 100)
                
            print(f"✅ NIL matching tested for {len(matching_athletes)} athletes")
    
    def test_marketability_score_calculation(self):
        """Test marketability score calculation for NIL"""
        with app.app_context():
            # Test high-follower athlete
            high_follower_athlete = Athlete.query.filter(
                Athlete.instagram_followers > 10000
            ).first()
            
            if high_follower_athlete:
                marketability = self.engine.calculate_marketability_score(high_follower_athlete)
                self.assertGreater(marketability, 60)
                print(f"✅ High-follower athlete marketability: {marketability}/100")

class TestComplianceAndAuditing(TestEnhancedNILMoneyballPlatform):
    """Test compliance and auditing features"""
    
    def test_compliance_audit_creation(self):
        """Test compliance audit trail creation"""
        with app.app_context():
            # Create audit entry
            audit = ComplianceAudit(
                transaction_type='PLAYER_EVALUATION',
                athlete_id=self.baron_athlete.id,
                action_description='Evaluated player using Baron Hopson methodology',
                financial_amount=0.0,
                compliance_status='APPROVED',
                pay_for_play_risk='LOW',
                created_by='test_system'
            )
            db.session.add(audit)
            db.session.commit()
            
            # Verify audit was created
            audit_count = ComplianceAudit.query.count()
            self.assertGreater(audit_count, 0)
            print(f"✅ Compliance audit created: {audit_count} total entries")

class TestAPIEndpoints(TestEnhancedNILMoneyballPlatform):
    """Test API endpoints functionality"""
    
    def test_health_endpoint(self):
        """Test enhanced health check endpoint"""
        response = self.client.get('/api/v1/health')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'healthy')
        self.assertIn('baron_hopson_methodology', data['features'])
        self.assertIn('ksu_integration', data['features'])
        print("✅ Health endpoint working with enhanced features")
    
    def test_athletes_endpoint(self):
        """Test enhanced athletes endpoint"""
        response = self.client.get('/api/v1/athletes')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertIn('athletes', data)
        self.assertIn('pagination', data)
        self.assertGreater(len(data['athletes']), 0)
        print(f"✅ Athletes endpoint: {len(data['athletes'])} athletes returned")
    
    def test_baron_hopson_analysis_endpoint(self):
        """Test Baron Hopson analysis endpoint"""
        test_data = {
            'name': 'Test Analysis',
            'position': 'LB',
            'total_tackles': 89,
            'solo_tackles': 52,
            'games_played': 12,
            'market_value': 15000,
            'transfer_from': 'FCS'
        }
        
        response = self.client.post('/api/v1/baron-hopson/analysis', 
                                  data=json.dumps(test_data),
                                  content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertIn('subject_profile', data)
        self.assertIn('baron_hopson_baseline', data)
        self.assertIn('similarity_analysis', data)
        self.assertIn('investment_analysis', data)
        print("✅ Baron Hopson analysis endpoint working")

class TestPlatformIntegration(TestEnhancedNILMoneyballPlatform):
    """Test full platform integration scenarios"""
    
    def test_complete_player_evaluation_workflow(self):
        """Test complete player evaluation workflow"""
        with app.app_context():
            # Step 1: Evaluate player with Baron Hopson methodology
            evaluation = self.engine.evaluate_player_comprehensive(
                self.baron_athlete, 'Group5_High'
            )
            
            self.assertIn('production_score', evaluation)
            self.assertIn('baron_hopson_similarity', evaluation)
            
            # Step 2: Create database evaluation record
            player_eval = PlayerEvaluation(
                athlete_id=self.baron_athlete.id,
                budget_tier='Group5_High',
                production_score=evaluation['production_score'],
                efficiency_rating=evaluation['efficiency_rating'],
                positional_impact=evaluation['positional_impact'],
                adjusted_value=evaluation['adjusted_value'],
                value_per_dollar=evaluation['value_per_dollar'],
                transfer_multiplier=evaluation['transfer_multiplier'],
                baron_hopson_similarity=evaluation['baron_hopson_similarity'],
                recommendation=evaluation['recommendation'],
                calculated_by='test_system'
            )
            db.session.add(player_eval)
            
            # Step 3: Create KSU-specific evaluation if applicable
            ksu_eval = KSUPlayerEvaluation(
                athlete_id=self.baron_athlete.id,
                academic_fit_score=85,
                culture_fit_score=90,
                final_ksu_score=82.5,
                recommendation='STRONG_INTEREST',
                evaluated_by='test_ksu_coach'
            )
            db.session.add(ksu_eval)
            
            db.session.commit()
            
            # Verify complete evaluation
            self.assertEqual(PlayerEvaluation.query.count(), 1)
            self.assertEqual(KSUPlayerEvaluation.query.count(), 1)
            print("✅ Complete player evaluation workflow tested")
    
    def test_budget_tier_comparison(self):
        """Test player evaluation across different budget tiers"""
        with app.app_context():
            budget_tiers = ['Group5_Low', 'Group5_High', 'Power4_Standard', 'Power4_Elite']
            results = {}
            
            for tier in budget_tiers:
                evaluation = self.engine.evaluate_player_comprehensive(
                    self.baron_athlete, tier
                )
                results[tier] = evaluation
            
            # Verify FCS multipliers decrease as tier increases
            self.assertEqual(results['Group5_Low']['transfer_multiplier'], 3.5)
            self.assertEqual(results['Group5_High']['transfer_multiplier'], 3.0) 
            self.assertEqual(results['Power4_Standard']['transfer_multiplier'], 1.5)
            self.assertEqual(results['Power4_Elite']['transfer_multiplier'], 1.0)
            
            print("✅ Budget tier comparison completed")
            for tier, result in results.items():
                print(f"   {tier}: {result['transfer_multiplier']}x multiplier, {result['value_per_dollar']:.2f} value/$")

def run_enhanced_platform_tests():
    """Run comprehensive enhanced platform test suite"""
    
    print("🏈 ENHANCED NIL MONEYBALL PLATFORM - COMPREHENSIVE TEST SUITE")
    print("=" * 70)
    
    # Create test suite
    test_suite = unittest.TestSuite()
    
    # Add all test classes
    test_classes = [
        TestBaronHopsonMethodology,
        TestKSUIntegration, 
        TestRosterOptimization,
        TestNILOpportunityMatching,
        TestComplianceAndAuditing,
        TestAPIEndpoints,
        TestPlatformIntegration
    ]
    
    for test_class in test_classes:
        tests = unittest.TestLoader().loadTestsFromTestCase(test_class)
        test_suite.addTests(tests)
    
    # Run tests with detailed output
    runner = unittest.TextTestRunner(verbosity=2, stream=sys.stdout)
    result = runner.run(test_suite)
    
    # Print summary
    print("\n" + "=" * 70)
    print("🎯 TEST RESULTS SUMMARY")
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    
    if result.failures:
        print("\n❌ FAILURES:")
        for test, failure in result.failures:
            print(f"  - {test}: {failure.split('AssertionError:')[-1].strip()}")
    
    if result.errors:
        print("\n💥 ERRORS:")
        for test, error in result.errors:
            print(f"  - {test}: {error.split('Exception:')[-1].strip()}")
    
    if result.wasSuccessful():
        print("\n🎉 ALL TESTS PASSED! Enhanced NIL Moneyball Platform is ready for deployment.")
        print("\n📊 Platform Features Verified:")
        print("   ✅ Baron Hopson Methodology Implementation")
        print("   ✅ KSU Integration & Geographic Preferences")  
        print("   ✅ Enhanced Roster Optimization Algorithms")
        print("   ✅ NIL Opportunity Matching System")
        print("   ✅ Compliance & Audit Trail Functionality")
        print("   ✅ Complete API Endpoint Coverage")
        print("   ✅ End-to-End Platform Integration")
        
        return True
    else:
        print(f"\n⚠️  TESTS COMPLETED WITH {len(result.failures + result.errors)} ISSUES")
        print("Platform needs attention before deployment.")
        return False

if __name__ == '__main__':
    success = run_enhanced_platform_tests()
    exit(0 if success else 1)