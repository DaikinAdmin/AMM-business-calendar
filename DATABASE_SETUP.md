# Database Setup and Initialization

This document explains how to set up and initialize the database for the AMM Business Calendar application.

## Prerequisites

- PostgreSQL installed and running
- Database created: `amm_calendar`
- Connection details:
  - Host: localhost
  - Port: 5433
  - User: postgres
  - Password: admin
  - Database: amm_calendar

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Apply Database Schema

The schema is already defined in `/db/schema.ts`. To push it to your database:

```bash
npm run db:push
```

This will create all necessary tables:
- users (employees with different roles)
- projects
- project_members
- events (meetings, tasks, reminders, vacations)
- event_participants
- invitations

### 3. Initialize with Sample Data

After the server is running (`npm run dev`), initialize the database with sample users:

**Using curl:**
```bash
curl -X POST http://localhost:3000/api/seed -H "Content-Type: application/json" -d "{\"secret\":\"initialize-amm-calendar-2026\"}"
```

**Using PowerShell:**
```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/seed" -Headers @{"Content-Type"="application/json"} -Body '{"secret":"initialize-amm-calendar-2026"}'
```

This creates the following users:

1. **Administrator**
   - Email: admin@amm.com
   - Password: admin123
   - Role: admin

2. **Manager**
   - Email: manager@amm.com
   - Password: manager123
   - Role: manager

3. **Employees**
   - Email: employee1@amm.com (Alice Smith - Senior Developer)
   - Email: employee2@amm.com (Bob Johnson - Designer)
   - Password: employee123
   - Role: employee

## Features by Role

### Admin
- Full access to all features
- Can create, edit, delete employees
- Can create, edit, delete projects
- Can create, edit, delete events
- Can view all calendars

### Manager
- Can create and manage projects
- Can create and manage employees
- Can create events for themselves and team members
- Can view calendars of all employees

### Employee
- Can view their own calendar
- Can view calendars of other employees
- Can create events for themselves
- Can participate in projects they're assigned to

## Database Schema Overview

### Users Table
Stores all employees with authentication credentials and profile information.

**Fields:**
- id, email, password (hashed), name
- role (admin/manager/employee)
- position, department, phone, avatar
- active status
- timestamps

### Projects Table
Stores project information.

**Fields:**
- id, name, description
- status (pending/in_progress/completed/cancelled)
- priority (low/medium/high/urgent)
- startDate, endDate
- budget, clientName
- createdById (references users)
- timestamps

### Events Table
Stores calendar events (meetings, tasks, reminders, vacations).

**Fields:**
- id, title, description
- type (meeting/task/reminder/vacation)
- startTime, endTime
- location, isAllDay
- priority, status
- projectId (optional reference to projects)
- createdById (references users)
- timestamps

### Relationships
- Projects have many members (through project_members)
- Events have many participants (through event_participants)
- Events can be linked to projects
- Users create projects and events

## Troubleshooting

### Database Connection Issues
If you get connection errors:
1. Verify PostgreSQL is running on port 5433
2. Check database `amm_calendar` exists
3. Verify credentials in `.env.local`

### Schema Push Fails
If `npm run db:push` fails:
1. Ensure database is accessible
2. Check that you have CREATE TABLE permissions
3. Try dropping and recreating the database

### Seed Script Fails
If initialization fails:
1. Ensure the server is running
2. Check that tables were created successfully
3. Verify the secret key in the request body

## Development Tools

### Drizzle Studio
To visually inspect and manage your database:

```bash
npm run db:studio
```

This opens a web interface at http://localhost:4983

### Direct Database Access
You can also connect to the database directly using any PostgreSQL client:

```bash
psql -h localhost -p 5433 -U postgres -d amm_calendar
```

## Next Steps

After successful setup:
1. Visit http://localhost:3000
2. Log in with admin credentials
3. Create additional employees, projects, and events
4. Explore the calendar and project management features
