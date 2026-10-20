# EcoMap

Environmental issue reporting and mapping app (React + Express + MySQL + Leaflet).

## 1. Database
Open MySQL (Workbench or terminal) and run `database.sql`. It creates the `ecomap` database, tables and 4 demo reports.

## 2. Backend
```
cd backend
npm install
copy .env.example to .env  (Windows)   |   cp .env.example .env  (Mac/Linux)
```
Open `.env` and fill in your MySQL password and any long text for `JWT_SECRET`. Then:
```
node createAdmin.js admin admin123     # creates your admin login
npm start                              # runs on http://localhost:5000
```

## 3. Frontend (new terminal)
```
cd frontend
npm install
npm start                              # opens http://localhost:3000
```

## Pages
/ home · /map · /report · /reports/:id · /dashboard · /about · /admin/login · /admin

## Quick test
1. Submit a report on /report -> it shows "Pending Review"
2. Log in at /admin/login -> change its status
3. Check /map and /dashboard -> numbers and markers update
4. Stop and restart the backend -> data is still there (MySQL)
