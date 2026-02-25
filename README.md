# Contractual

Simple Contracts. Real Results.

Fixed-price freelance platform with two roles:
- Business
- Freelancer

## Tech Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MySQL
- Authentication: JWT + bcrypt

## Updated Architecture

```text
backend/
|-- config/
|-- controllers/
|-- middleware/
|-- models/
|-- routes/
|-- services/
|-- utils/
|-- sql/
|-- app.js
|-- server.js

frontend/
|-- src/
|   |-- components/
|   |-- pages/
|   |-- services/
|   |-- hooks/
|   |-- context/
|   |-- routes/
|   |-- App.jsx
|   |-- main.jsx
```

## Database Schema
Run: `backend/sql/schema.sql`

Tables:
- `users`
- `projects`
- `freelancer_profiles`
- `messages`
- `notifications`
- `project_ratings`

`bids` table removed.

`projects` fields include:
- `freelancer_id` (nullable FK -> `users.id`)
- `submission_text` (nullable)
- `submission_link` (nullable)
- `submission_files` (JSON nullable)
- `status ENUM('Open', 'Assigned', 'Submitted', 'Completed')`

## Workflow
1. Business posts project with fixed budget.
2. Freelancer browses open projects.
3. Freelancer accepts project.
4. Assigned freelancer submits work.
5. Business marks project completed.

Status flow:
- `Open -> Assigned -> Submitted -> Completed`

## API Endpoints

Auth:
- `POST /api/auth/register`
- `POST /api/auth/login`

Projects:
- `POST /api/projects` (business)
- `GET /api/projects` (authenticated)
- `GET /api/projects/:id` (authenticated)
- `GET /api/projects/mine` (business)
- `PUT /api/projects/:id/accept` (freelancer)
- `PUT /api/projects/:id/submit` (freelancer)
- `PUT /api/projects/:id/complete` (business)

For submission:
- `submissionText` (required)
- `submissionLink` (optional URL)
- `submissionFiles` (optional files, multipart/form-data, up to 5 files)

Profile:
- `GET /api/profile` (freelancer)
- `PUT /api/profile` (freelancer)

Messaging:
- `GET /api/messages/projects/:projectId` (project participants)
- `POST /api/messages/projects/:projectId` (project participants)

Notifications:
- `GET /api/notifications`
- `PUT /api/notifications/:id/read`
- `PUT /api/notifications/read-all`

Ratings:
- `GET /api/ratings/projects/:projectId` (project participants)
- `POST /api/ratings/projects/:projectId` (project participants; only after completion)

## Security Rules
- Only `freelancer` can accept projects.
- Only assigned freelancer can submit work.
- Only project owner (`business`) can complete project.
- `authMiddleware` and `roleMiddleware` enforce access.
- Request validation and global error handling are enabled.

## Setup
Backend:
1. `cd backend`
2. `copy .env.example .env`
3. Update DB/JWT values
4. Run schema in MySQL
5. `npm install`
6. `npm run dev`

Frontend:
1. `cd frontend`
2. `copy .env.example .env`
3. Set `VITE_API_URL=http://localhost:5000`
4. `npm install`
5. `npm run dev`
