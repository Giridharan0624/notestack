# NoteStack

A serverless notes & file platform built with DDD architecture.

## Tech Stack

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS
- **Backend:** AWS Lambda (Python 3.11) + API Gateway
- **Database:** DynamoDB (single-table design)
- **Storage:** S3 (pre-signed URLs)
- **Auth:** AWS Cognito
- **IaC:** AWS CDK (Python)

## Project Structure

```
notestack/
├── backend/
│   ├── contexts/  # DDD bounded contexts (Lambda code)
│   ├── infra/     # AWS CDK infrastructure
│   └── tests/     # Unit + integration tests
└── frontend/      # Next.js application
```

## Setup

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt
pytest
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Infrastructure
```bash
cd backend/infra
pip install -r requirements.txt
cdk synth
cdk deploy
```
