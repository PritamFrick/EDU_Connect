# EDUConnect – University-Based Professional Networking and Club Management Platform

Welcome to **EDUConnect**, a modern, LinkedIn-inspired university web application designed as the foundation prototype for the **CSE 242 Web Development** course project.

This project was built using standard **HTML5, CSS3, Vanilla JavaScript, and Bootstrap 5**, using **LocalStorage** for full state persistence. It runs completely locally in any modern browser without requiring Node.js, npm, or paid APIs, making it ideal for beginner CSE students to study, demonstrate, and subsequently migrate to **PHP & MySQL**.

---

## 1. Demo Login Credentials

You can log in manually or use the **1-Click Autofill Demo Buttons** on the [Login Page](file:///c:/xampp/htdocs/EDU_Connect/login.html) and in the top-right navbar menu:

| Role | Name | Email | Password | Access / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Farhan Ahmed | `farhan.ahmed@student.edu` | `student123` | Full student profile, feeds, event registration, connect with peers |
| **Club Rep** | Robotics Lead | `robotics.lead@student.edu` | `clubrep123` | Club representative persona, event hosting, announcement posting |
| **Administrator** | Prof. Anisur Rahman | `admin.connect@edu.ac.bd` | `admin123` | Admin dashboard, approvals, rejections, user directory, moderation |

---

## 2. Project File Structure

```text
EDUConnect/
├── index.html              # University landing & welcome showcase
├── login.html              # Demo sign-in with 1-click preset credentials
├── register.html           # Student registration & Club charter application
├── dashboard.html          # Main Home Feed (Club Posts & Recommended Students)
├── students.html           # Explore students directory with search & filters
├── profile.html            # LinkedIn-style student profile (view & edit modal)
├── clubs.html              # Explore university clubs directory & follow system
├── club-profile.html       # Official club page, announcements & recruitment
├── events.html             # Campus hackathons & workshops with registration
├── notifications.html      # Notifications center (read/unread filters)
├── admin.html              # Administrative portal (approvals, reports, metrics)
├── assets/
│   ├── css/
│   │   └── style.css       # Academic Maroon & Gold design theme (DM Serif Display & Plus Jakarta Sans)
│   └── js/
│       ├── data.js         # Seed database (Students, Clubs, Events, Posts)
│       ├── app.js          # Shared UI utilities, notifications badge, toasts
│       ├── auth.js         # Form validations, demo switcher, sessions
│       ├── dashboard.js    # Feed tabs switching, post creation, sidebar
│       ├── students.js     # Student search, filters, follow, profile editing
│       ├── clubs.js        # Club directory, follow toggle, recruitment
│       ├── events.js       # Event discovery, capacity tracking, registration
│       ├── notifications.js# Notification center & read state handling
│       └── admin.js        # Admin metrics, verification approvals, moderation
└── README.md               # Beginner CSE project guide & PHP migration plan
```

---

## 3. How to Run Locally

You have **two straightforward ways** to run this website locally:

### Option A: Direct Browser Execution (No server needed)
1. Navigate to the project folder: `c:\xampp\htdocs\EDU_Connect\`
2. Double-click [index.html](file:///c:/xampp/htdocs/EDU_Connect/index.html) or [dashboard.html](file:///c:/xampp/htdocs/EDU_Connect/dashboard.html).
3. The website will open and run in Google Chrome, Microsoft Edge, Firefox, or Safari with full functionality!

### Option B: Running via XAMPP Apache
1. Since the project is already located in `c:\xampp\htdocs\EDU_Connect\`:
2. Open the **XAMPP Control Panel**.
3. Click **Start** next to the **Apache** module.
4. Open your browser and navigate to:
   ```text
   http://localhost/EDU_Connect/
   ```

---

## 4. Key Functional Features Implemented

1. **Dual-Tab Feed in Dashboard**:
   - Easily toggle between **"Club Events & Posts"** (campus announcements, likes, comments, and post creation) and **"Recommended Students"** (peer recommendation cards filtered by skills).
2. **Explore Students Directory**:
   - Real-time search by student name or student ID.
   - Filter dropdowns by academic department (CSE, EEE, BBA) and skills.
   - Instant **Connect / Disconnect** toggle that persists in LocalStorage and updates the student's network counter.
3. **Student Profile & Edit System**:
   - Displays academic standing, semester, CGPA, department, biography, skills tags, co-curricular club memberships, and achievements.
   - Includes a fully functional **"Edit Profile"** modal that allows updating personal data and instantly saves changes to `LocalStorage`.
4. **Campus Clubs Directory & Profile**:
   - Follow / Unfollow clubs with follower count updates.
   - Club profile features faculty advisor details, announcements feed, upcoming club events, and an interactive **"Apply for Recruitment"** modal.
5. **University Events & Hackathon Registrations**:
   - Capacity progress indicator (e.g., *114 / 150 enrolled*).
   - Dynamic **Register / Cancel Registration** buttons that track whether the logged-in student has booked a seat.
   - Detailed event popup modal with venue, agenda, and guidelines.
6. **Administrator Portal**:
   - Metrics counters: Total Students, Total Clubs, Pending Verifications, Flagged Reports.
   - Interactive **Approve** and **Reject** buttons for pending student IDs and club charter petitions.
   - Moderation moderation table to dismiss or take down reported content.
7. **Demo Data Management**:
   - If you ever want to reset the mock database back to default state, click **"Reset Demo Data"** from the Demo Roles menu or Admin panel.

---

## 5. How the JavaScript and LocalStorage Work

In beginner web applications before connecting a backend database:
- `assets/js/data.js` runs first on every page load. It checks `localStorage.getItem('edu_students')`. If empty, it populates realistic university mock data.
- Whenever an action happens (e.g., connecting with a student, registering for an event, editing a profile, approving a club charter), the respective JavaScript file updates the object in memory and writes it back using `setStorage(key, value)`.
- Helper functions like `showToast(message, type)` provide instant visual feedback without page reloading.

---

## 6. Suggested Roadmap: Migrating to PHP & MySQL

When your team is ready to add the backend in CSE 242, follow this systematic transition plan:

### Step 1: Design the MySQL Database
Create a database named `edu_connect_db` in `phpMyAdmin` (`http://localhost/phpmyadmin`) with the following tables:
- `users`: `id`, `student_id`, `name`, `email`, `password_hash`, `role`, `department`, `semester`, `cgpa`, `bio`, `avatar`, `status`
- `clubs`: `id`, `name`, `tagline`, `category`, `established`, `advisor`, `logo`, `about`, `is_recruiting`
- `events`: `id`, `club_id`, `title`, `category`, `event_date`, `time`, `location`, `description`, `seats_total`
- `event_registrations`: `id`, `event_id`, `user_id`, `registered_at`
- `connections`: `id`, `user_id_1`, `user_id_2`, `status`, `created_at`
- `posts`: `id`, `author_id`, `author_type`, `title`, `content`, `image_url`, `created_at`
- `verifications`: `id`, `type`, `target_id`, `proof_document`, `status`

### Step 2: Establish Database Connection (`config/db.php`)
```php
<?php
$host = "localhost";
$dbname = "edu_connect_db";
$username = "root";
$password = "";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    die("Database Connection Failed: " . $e->getMessage());
}
?>
```

### Step 3: Replace JavaScript Mock Auth with PHP Sessions
1. Convert `login.html` and `register.html` to `login.php` and `register.php`.
2. In `auth/login_process.php`:
   - Use `password_verify($password, $user['password_hash'])`.
   - On success, store session data: `$_SESSION['user_id'] = $user['id'];` and `$_SESSION['role'] = $user['role'];`.
3. In `auth/check_auth.php`:
   - Check `isset($_SESSION['user_id'])`. If not authenticated, redirect to `login.php`.

### Step 4: Replace LocalStorage Fetch with REST API / PHP Includes
- Change `students.html` to `students.php` to fetch student rows directly with `SELECT * FROM users WHERE role = 'student'`.
- Or create simple REST endpoints like `api/get_students.php` and `api/toggle_connection.php` that return JSON using `json_encode($data)` and consume them with `fetch()`.

---

## 7. Team Presentation Tips for CSE 242 Viva

- **Show the Live Demo**: Start at `index.html` -> sign in using the **Student Preset** -> explore the **Dual Feed** on `dashboard.html`.
- **Demonstrate Interactivity**: Register for an event on `events.html` (show the seat count decrease!), then open `notifications.html` to show the real-time confirmation.
- **Show Admin Verification**: Switch to **Prof. Rahman (Admin)** using the top dropdown, click **Approve** on a pending student verification, and observe the status update across the system.
- **Explain the Code**: Open `assets/js/data.js` and `assets/js/students.js` to explain how functions are organized cleanly into distinct modules rather than one cluttered file.
