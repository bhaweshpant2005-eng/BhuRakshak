# NER-SENTRY Backend — Landslide Risk Prediction Platform

FastAPI backend for the NER-SENTRY (Landslide Risk Prediction, Early Warning & Decision Support Platform) for Northeast Region (NER) India.

## Project Overview

This backend provides APIs for:
- **Risk Zone Management**: Define and query landslide risk zones
- **Risk Prediction**: Call M4's ML model for risk scoring
- **Scenario Simulation**: Project risk under different rainfall conditions
- **Alert Lifecycle**: Create, acknowledge, and resolve alerts
- **Report Management**: Generate and track landslide reports
- **Infrastructure Data**: Access villages, roads, and historical data

## Architecture

### Tech Stack
- **Framework**: FastAPI
- **Database**: Supabase / PostgreSQL (M5 owned)
- **Authentication**: JWT with Supabase Auth
- **ML Integration**: Async calls to M4 service
- **Validation**: Pydantic
- **Testing**: Pytest + pytest-asyncio

### Project Structure
```
backend/
├── api/
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Configuration management
│   ├── routers/             # Endpoint definitions
│   │   ├── dashboard.py     # Dashboard summary
│   │   ├── zones.py         # Risk zones
│   │   ├── risk.py          # Risk prediction
│   │   ├── simulation.py    # Scenario simulation
│   │   ├── alerts.py        # Alert management
│   │   ├── reports.py       # Report management
│   │   ├── infrastructure.py # Villages, roads, history
│   │   └── health.py        # Health check
│   ├── schemas/             # Pydantic models
│   │   ├── auth.py          # User roles and tokens
│   │   ├── errors.py        # Error responses
│   │   ├── risk.py          # Risk-related schemas
│   │   ├── simulation.py    # Simulation schemas
│   │   ├── alerts.py        # Alert schemas
│   │   ├── reports.py       # Report schemas
│   │   └── infrastructure.py # Infrastructure schemas
│   ├── services/            # Business logic
│   │   ├── database.py      # Supabase/DB operations
│   │   ├── ml.py            # M4 integration
│   │   └── mock_data.py     # Mock data (Phase 1)
│   └── dependencies/        # FastAPI dependencies
│       └── auth.py          # JWT validation & roles
├── tests/                   # Unit and integration tests
├── requirements.txt         # Python dependencies
└── .env                     # Configuration (development)
```

## Setup

### Prerequisites
- Python 3.9+
- pip or conda
- Git

### Installation

1. **Clone repository and navigate to backend**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

5. **Run the server**
   ```bash
   python -m backend.api.main
   ```

   Server will start at `http://localhost:8000`

6. **Access API documentation**
   - Swagger UI: `http://localhost:8000/api/v1/docs`
   - ReDoc: `http://localhost:8000/api/v1/redoc`

## API Endpoints

### Health
- `GET /api/v1/health` — Health check

### Dashboard
- `GET /api/v1/dashboard/summary` — Get dashboard overview

### Zones
- `GET /api/v1/risk/zones` — List all risk zones
- `GET /api/v1/zones/{zone_id}` — Get zone details

### Risk Prediction
- `POST /api/v1/risk/predict` — Predict risk for zone (calls M4)

### Simulation
- `POST /api/v1/simulation/run` — Run scenario simulation

### Alerts
- `GET /api/v1/alerts` — List active alerts (with filtering)
- `POST /api/v1/alerts` — Create new alert
- `PATCH /api/v1/alerts/{id}` — Update alert status

### Reports
- `POST /api/v1/reports` — Create report
- `GET /api/v1/reports` — List all reports (ADMIN/AUTHORITY only)
- `GET /api/v1/reports/my` — Get user's reports

### Infrastructure
- `GET /api/v1/villages` — List villages (with zone filtering)
- `GET /api/v1/roads` — List roads (with zone filtering)
- `GET /api/v1/history/landslides` — Landslide history (with zone filtering)

## Authentication

All endpoints (except health) require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Supported Roles
- `ADMIN` — Full access
- `AUTHORITY` — Authority official, can create/update alerts and reports
- `FIELD_OFFICER` — Field staff, can create reports and predict
- `CITIZEN` — Read-only access to public data

## Error Format

All errors follow standardized format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

Common error codes:
- `UNAUTHORIZED` — Missing or invalid token
- `INVALID_ROLE` — User role not permitted for operation
- `ZONE_NOT_FOUND` — Requested zone does not exist
- `ALERT_NOT_FOUND` — Requested alert does not exist
- `ML_SERVICE_UNAVAILABLE` — M4 prediction service down
- `DATABASE_ERROR` — Database operation failed
- `VALIDATION_ERROR` — Invalid request parameters

## Integration Points

### M4 (AI/ML)
- **Service URL**: `http://localhost:8001` (configurable)
- **Endpoints**: 
  - `POST /predict` — Risk prediction
  - `POST /simulate` — Scenario simulation
- **Status**: Expected to handle M4 integration calls

### M5 (Database/Data)
- **Technology**: Supabase / PostgreSQL
- **Status**: Database layer stubs in place, awaiting schema from M5
- **Configuration**: Set `SUPABASE_URL` and `SUPABASE_KEY` in `.env`

### M1 & M2 (Frontend)
- **CORS**: Pre-configured for localhost development
- **Token**: Frontend must provide JWT token from Supabase Auth
- **API Base**: `http://localhost:8000/api/v1`

## Testing

### Run Tests
```bash
pytest backend/tests/
```

### Run with Coverage
```bash
pytest --cov=backend/api backend/tests/
```

## Development Notes

### Phase 1: Mock-First (Current)
- All endpoints return mock data from `MockDataService`
- Allows frontend teams (M1, M2) to integrate without waiting for M5 database
- M4 integration stubs in place for risk prediction and simulation

### Phase 2: Database Integration (Pending M5)
- Replace mock data with Supabase queries
- Implement database layer in `services/database.py`
- Coordinate schema changes with M5

### Phase 3: ML Integration (Pending M4)
- Call actual M4 risk prediction model
- Call M4 scenario simulation
- Handle ML service timeouts and failures

## Git Workflow

**Branch**: `feature/m3-backend-api`

### Commit Before Integration
```bash
git status
git diff
git add backend/
git commit -m "feat(api): <meaningful message>"
git push -u origin feature/m3-backend-api
```

## Team Coordination

- **Database Queries**: Coordinate with M5 on schema
- **ML Predictions**: Wait for M4 service endpoint details
- **Authentication**: Use existing JWT/Supabase Auth setup
- **API Changes**: Notify M1, M2 of contract changes

## Known Limitations (Phase 1)

- Mock data only (no persistent storage)
- M4 service calls will fail if service unavailable
- Database operations not yet implemented
- No real user authentication against Supabase
- Alerts and reports don't persist

## TODO Before Production

- [ ] Implement M5 database queries
- [ ] Integrate M4 ML predictions
- [ ] Set up real Supabase credentials
- [ ] Configure JWT validation against Supabase
- [ ] Add comprehensive error logging
- [ ] Implement database connection pooling
- [ ] Add rate limiting
- [ ] Deploy to staging environment
- [ ] Load testing and optimization
- [ ] Security audit

## Support

For questions or issues:
- Reach out to M5 (Database) for schema clarification
- Reach out to M4 (AI/ML) for prediction API details
- Reach out to M1/M2 (Frontend) for integration feedback
