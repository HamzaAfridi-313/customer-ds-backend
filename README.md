Customer DS Project (Frontend + Backend)
----------------------------------------

Frontend:
  - React component located at frontend/src/components/CustomerModule.jsx
  - Run: npm install && npm start (from frontend folder)

Backend:
  - FastAPI app located at backend/main.py
  - Run: pip install -r backend/requirements.txt
         uvicorn backend.main:app --reload --port 5000

Notes:
  - Frontend expects backend at http://localhost:5000 by default.
  - Sample CSV is provided in backend/data/sample.csv
