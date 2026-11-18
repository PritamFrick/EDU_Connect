# EDUConnect – Campus Social & Academic Collaboration Platform

**Course:** CSE 242: Web Development (Fall 2026)  
**Institution:** East Delta University (EDU), School of Science, Engineering & Technology (SoSET)  
**Course Instructor:** Asst. Prof. Saraf Anika, Dept. of Computer Science & Engineering  

### Project Development Team:
- **Raida Salsabil Sarwar** (ID: `243011912`) – Full-Stack Development & Algorithmic Feed
- **Pritam Barua** (ID: `243007712`) – Backend Architecture & Recommendation Engine
- **Fardin Tajwar Chowdhury** (ID: `243009912`) – UI/UX & Responsive Design System
- **Md. Omar Mahabub** (ID: `243007512`) – Event Management & Data Modeling
- **Anika Thashen Autshe** (ID: `243015112`) – Moderation Center & Security Verification

---

## 1. Project Overview

**EDUConnect** is a web-based campus social network and academic collaboration platform built specifically for **East Delta University**. The platform connects students, student-led clubs, and faculty administrators into a unified digital ecosystem.

### Core Implemented Capabilities:
1. **Algorithmic Newsfeed (2-Section Feed):**
   - **Section 1: Club Events & Announcements Feed:** Dynamically prioritizes posts using a relevance score calculated from followed clubs (+45 pts), official events (+30 pts), and engagement metrics (likes & comments).
   - **Section 2: Recommended Peer Profiles:** Calculates match percentages and compatibility chips based on overlapping technical skills, shared extracurricular interests, and academic department alignment.
2. **Automated Peer Recommendation Algorithm:**
   - Multi-factor scoring engine evaluating student profiles by skills (+25 pts/match), interests (+20 pts/match), department alignment (+15 pts), and semester proximity (+10 pts).
3. **Event Management System:**
   - Full lifecycle management for university hackathons, workshops, and seminars with live RSVP tracking, capacity bounds, and event creation modal.
4. **Academic Verification & Moderation Center:**
   - Administrative portal for faculty administrators to review student identity cards, approve club charters, and triage community content reports.
5. **Real-User Authentication & Route Authorization:**
   - Immediate route guards preventing unauthorized guest access to protected pages.
   - Zero mock/demo shortcuts; authentication strictly enforces registered university credentials.
6. **Relational MySQL Database Architecture:**
   - Fully normalized 3NF database schema (`database/schema.sql` and `DATABASE.md`) with 14 tables, foreign key constraints with cascade rules, performance indexes, and university seed data.
7. **Unified Brand Design System & Mobile Responsiveness:**
   - East Delta University brand palette (Crimson `#8B1E2D`, Navy `#1B365D`, Gold `#D4AF37`).
   - Standardized typography with Plus Jakarta Sans and DM Serif Display.
   - Consistent responsive navbar with hamburger drawer across mobile (375px), tablet (768px), and desktop viewports.

---

## 2. Default Real User Accounts

> **Note:** Demo 1-click logins and demo role switchers have been completely removed. Only registered real users and faculty administrators can log in.

| Name | Role | Email | Password | Identification |
| :--- | :--- | :--- | :--- | :--- |
| **Asst. Prof. Saraf Anika** | Faculty Admin | `saraf.anika@faculty.edu` | `admin123` | `FACULTY-CSE-242` |
| **Raida Salsabil Sarwar** | Student Lead | `raida.sarwar@student.edu` | `student123` | `243011912` |
| **Pritam Barua** | Student Lead | `pritam.barua@student.edu` | `student123` | `243007712` |
| **Fardin Tajwar Chowdhury** | Student Lead | `fardin.tajwar@student.edu` | `student123` | `243009912` |
| **Md. Omar Mahabub** | Student Lead | `omar.mahabub@student.edu` | `student123` | `243007512` |
| **Anika Thashen Autshe** | Student Lead | `anika.thashen@student.edu` | `student123` | `243015112` |

---

## 3. Project File Structure

```
EDU_Connect/
├── assets/
│   ├── css/
│   │   └── style.css          # Unified EDU design system, CSS variables, responsive typography
│   └── js/
│       ├── app.js             # Route guards, navigation state, toast system, global utilities
│       ├── auth.js            # Real university authentication, registration validation
│       ├── data.js            # Real EDU students, clubs, events, posts, recommendation algorithm
│       ├── dashboard.js       # 2-section algorithmic feed, post modal, likes/comments handlers
│       ├── events.js          # Event filtering, calendar RSVPs, host event modal & submission
│       ├── students.js        # Student directory with algorithmic compatibility badges
│       ├── clubs.js           # Club directory, member joining, tab filtering
│       ├── notifications.js   # Notification feed, mark-as-read, filter tabs
│       └── admin.js           # Admin metrics, verification queue, user management, moderation
├── database/
│   ├── schema.sql             # MySQL 8.0+ DDL schema with 14 tables & real seed records
│   └── README note:           # schema is the single source of truth (no root mirror)
├── api/                       # PHP REST API bridging the frontend to MySQL
│   ├── config.php             # PDO connection (XAMPP defaults) + shared helpers
│   ├── data.php               # GET  full platform sync (all collections from MySQL)
│   ├── auth.php               # POST login / student registration / club charter
│   └── actions.php            # POST write-through mutations (likes, follows, admin decisions)
├── DATABASE.md                # Full database documentation, ER diagram, and setup instructions
├── index.html                 # Public landing page with features & club spotlight
├── login.html                 # Secure login page (real credentials only)
├── register.html              # University registration portal
├── dashboard.html             # Campus newsfeed & recommended peers dashboard
├── students.html              # Student peer directory & collaboration finder
├── clubs.html                 # Student clubs directory
├── club-profile.html          # Dynamic club profile page
├── events.html                # Campus events calendar & hosting center
├── profile.html               # User profile & portfolio showcase
├── notifications.html         # University notification center
├── admin.html                 # Faculty administration & moderation center
└── README.md                  # Project documentation
```

---

## 4. Running the Platform Locally

### Recommended Run with XAMPP (full MySQL integration):
1. Install XAMPP and start **Apache** + **MySQL**.
2. Copy this project folder into the XAMPP web root:
   - Windows: `C:\xampp\htdocs\edu_connect`
   - Linux: `/opt/lampp/htdocs/edu_connect`
3. Import the database (phpMyAdmin → Import → `database/schema.sql`, or CLI):
   ```bash
   mysql -u root -p < database/schema.sql
   ```
4. Open `http://localhost/edu_connect/` — the site now reads and writes **live MySQL data**
   through the PHP API in `api/`. Registrations, event sign-ups, likes, follows,
   connections, notifications and admin verifications are all persisted in the database.

### Fallback Run (static preview without PHP/MySQL):
```bash
# From the project root:
python3 -m http.server 8080
```
Open `http://localhost:8080/index.html` in your browser. When the PHP API is
unreachable the platform automatically falls back to the bundled LocalStorage
seed dataset, so every page still works.

### Database Setup (MySQL):
```bash
# Import schema into MySQL:
mysql -u root -p < database/schema.sql
```
For detailed setup instructions via phpMyAdmin or MySQL Workbench, see [DATABASE.md](DATABASE.md).
