# NIL Moneyball Platform

A comprehensive college football roster optimization platform implementing advanced analytics and the Baron Hopson methodology for value-based player evaluation.

## Features

### Core Moneyball Analytics

- **Player Evaluation System**: Position-specific production scores based on Baron Hopson case study
- **Budget Tier Management**: Four distinct budget tiers from Group5 ($800K) to Power4 Elite ($20.5M)
- **Value Optimization**: Calculate value-per-dollar ratios with FCS transfer multipliers
- **Roster Optimization**: Greedy algorithm for optimal roster construction within budget constraints

### Baron Hopson Methodology

- **Production Formula**: Linebackers: (tackles_per_game / 11) \* 92 based on actual case study
- **FCS Transfer Multipliers**: 3.5x for Group5 schools, scaling down to 1.0x for Power4 Elite
- **Value Discovery**: Identify undervalued players with exceptional value-per-dollar ratios

### Market Intelligence

- **Transfer Portal Monitoring**: Real-time price alerts and opportunity identification
- **Competitive Intelligence**: Track rival school activity and budget utilization
- **Market Opportunity Matrix**: Categorize players by value vs cost for strategic targeting

## Budget Tiers

| Tier            | Budget      | Max Individual | Strategy           | FCS Bonus |
| --------------- | ----------- | -------------- | ------------------ | --------- |
| Group5 Low      | $800,000    | $25,000        | Value Maximization | 3.5x      |
| Group5 High     | $1,300,000  | $45,000        | Balanced Value     | 3.0x      |
| Power4 Standard | $8,500,000  | $200,000       | Talent Acquisition | 1.5x      |
| Power4 Elite    | $20,500,000 | $500,000       | Elite Focus        | 1.0x      |

## Technical Architecture

### Backend (Flask)

- **API**: RESTful endpoints for player evaluation and roster optimization
- **Database**: SQLite with SQLAlchemy ORM
- **Engine**: Python-based Moneyball calculation engine
- **Analytics**: Advanced statistical modeling for player valuation

### Frontend (React/TypeScript)

- **Dashboard**: Responsive interface with real-time data visualization
- **Components**: Modular UI components for budget management and player analysis
- **API Integration**: Seamless communication with backend services

### Database Schema

```sql
-- Athletes table with comprehensive stats
-- Player evaluations with tier-specific calculations
-- Optimization runs with historical tracking
-- Market intelligence data
```

## Installation & Deployment

### Quick Start with Docker

```bash
# Clone repository
git clone <repository-url>
cd nil-moneyball-platform

# Build and run with Docker Compose
docker-compose up -d

# Access application at http://localhost
```

### Development Setup

```bash
# Install backend dependencies
cd backend
pip install -r requirements.txt

# Install frontend dependencies
npm install

# Start backend (Terminal 1)
cd backend && python app.py

# Start frontend (Terminal 2)
npm run dev
```

### Production Deployment

```bash
# Build Docker image
docker build -t nil-moneyball-platform .

# Deploy with Docker Compose
docker-compose -f docker-compose.yml up -d
```

## API Endpoints

### Player Management

- `GET /api/athletes` - Retrieve all athletes
- `POST /api/athletes` - Create new athlete
- `POST /api/moneyball/evaluate/{id}` - Evaluate specific player

### Roster Optimization

- `POST /api/moneyball/optimize` - Optimize roster for budget tier
- `POST /api/moneyball/baron-hopson-analysis` - Baron Hopson similarity analysis

### Market Intelligence

- `GET /api/market/opportunity-matrix` - Get market opportunity matrix
- `GET /api/market/price-alerts` - Retrieve price alerts
- `GET /api/market/competitive-intelligence` - Competitive analysis data

## Baron Hopson Case Study

The platform is built around the Baron Hopson success story:

- **Player**: LB transfer from Tennessee State to Kennesaw State
- **Performance**: 11 tackles vs Wake Forest (Power 5 opponent)
- **Cost**: $15,000 NIL value vs $165,000 SEC comparable
- **Value Ratio**: 6.57 per $1000 vs 0.58 for SEC equivalent
- **Multiplier**: 11.3x superior value efficiency

This case study demonstrates how analytical roster construction can level the competitive playing field through value discovery and efficient resource allocation.

## Mathematical Formulas

### Production Score Calculation

```python
# Linebacker (Baron Hopson formula)
production_score = min(100, (tackles_per_game / 11) * 92 + solo_percentage * 20)

# Quarterback
production_score = (completion_rate * 30) + (yards_per_attempt * 5) + (td_int_ratio * 10)
```

### Value Per Dollar

```python
value_per_dollar = (production + efficiency + impact) * transfer_multiplier / 3 / (cost / 1000)
```

### Budget Optimization

- Greedy algorithm selecting highest value-per-dollar players
- Position requirements enforcement
- Budget constraint satisfaction
- Competitive advantage scoring

## Success Metrics

- **Value Discovery**: Target 3-5 players per season with >4.0 value/dollar ratio
- **Budget Efficiency**: Achieve 80% of elite program production per dollar
- **Competitive Balance**: Reduce talent gap between tiers by 25%
- **ROI**: Generate 10-15% cost savings through market timing

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or issues, please open a GitHub issue or contact the development team.

---

**Built with the vision of making college football more competitive through analytical excellence and smart resource allocation.**
