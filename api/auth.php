<?php
/**
 * EDUConnect API - Authentication Endpoint (api/auth.php)
 * Created for CSE 242: Web Development - East Delta University (Fall 2026)
 *
 * POST api/auth.php   with a JSON body:
 *   { "action": "login",               "email": "...", "password": "..." }
 *   { "action": "register_student",    "studentId": "...", "name": "...",
 *     "email": "...", "password": "...", "department": "..." }
 *   { "action": "register_club_charter", "clubName": "...", "category": "...",
 *     "leadName": "...", "leadEmail": "...", "advisor": "...", "description": "..." }
 *
 * Login validates credentials against the MySQL users table and returns the
 * authenticated user in the frontend session shape. Registration inserts a
 * new user (with a bcrypt hashed password), a matching student profile and a
 * pending academic verification record for the admin queue.
 */

declare(strict_types=1);

require_once __DIR__ . '/config.php';

$input = edu_json_input();
$action = $input['action'] ?? '';

try {
    $pdo = edu_db();
} catch (PDOException $e) {
    edu_fail('Database connection failed: ' . $e->getMessage(), 503);
}

switch ($action) {
    case 'login':
        edu_handle_login($pdo, $input);
        break;

    case 'register_student':
        edu_handle_register_student($pdo, $input);
        break;

    case 'register_club_charter':
        edu_handle_register_club_charter($pdo, $input);
        break;

    case 'logout':
        edu_json_response(['ok' => true, 'message' => 'Session cleared client-side.']);
        break;

    default:
        edu_fail('Unknown auth action. Expected login, register_student or register_club_charter.', 422);
}

/* ---------------------------------------------------------------------------
 * Handlers
 * ------------------------------------------------------------------------- */

/**
 * Authenticates a university account (student, club rep or admin) by email.
 *
 * @param PDO   $pdo   Active database connection.
 * @param array $input Request payload containing email + password.
 */
function edu_handle_login(PDO $pdo, array $input): void
{
    $email = strtolower(trim((string)($input['email'] ?? '')));
    $password = (string)($input['password'] ?? '');

    if ($email === '' || $password === '') {
        edu_fail('Email and password are required.', 422);
    }

    $stmt = $pdo->prepare('SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !edu_verify_password($password, (string)$user['password_hash'])) {
        edu_fail('Invalid email or password.', 401);
    }

    $mapped = edu_load_user($pdo, (string)$user['id']);

    edu_json_response([
        'ok'   => true,
        'user' => $mapped,
    ]);
}

/**
 * Registers a new student account: inserts the user row (bcrypt hashed
 * password), a starter student profile, and a pending academic verification
 * record that appears in the admin dashboard queue.
 *
 * @param PDO   $pdo   Active database connection.
 * @param array $input Request payload with studentId, name, email, password, department.
 */
function edu_handle_register_student(PDO $pdo, array $input): void
{
    $studentId  = trim((string)($input['studentId'] ?? ''));
    $name       = trim((string)($input['name'] ?? ''));
    $email      = trim((string)($input['email'] ?? ''));
    $password   = (string)($input['password'] ?? '');
    $department = trim((string)($input['department'] ?? ''));

    if ($studentId === '' || $name === '' || $email === '' || $password === '' || $department === '') {
        edu_fail('studentId, name, email, password and department are required.', 422);
    }

    if (strlen($password) < 6) {
        edu_fail('Password must be at least 6 characters long.', 422);
    }

    // Duplicate identity check (email or student ID)
    $stmt = $pdo->prepare('SELECT id FROM users WHERE LOWER(email) = ? OR student_id = ? LIMIT 1');
    $stmt->execute([strtolower($email), $studentId]);
    if ($stmt->fetch()) {
        edu_fail('A student with this Student ID or Email is already registered.', 409);
    }

    $newId = edu_new_id('std');

    $insertUser = $pdo->prepare(
        'INSERT INTO users (id, student_id, name, email, password_hash, role, department, semester, avatar_url, cover_url, bio, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $insertUser->execute([
        $newId,
        $studentId,
        $name,
        $email,
        password_hash($password, PASSWORD_BCRYPT),
        'student',
        $department,
        '1st Semester',
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
        "Undergraduate student at Department of {$department}. Interested in learning and expanding professional network.",
        'Pending Verification',
    ]);

    $insertProfile = $pdo->prepare(
        'INSERT INTO student_profiles
            (user_id, cgpa, skills, interests, achievements, connections_count, connected_students)
         VALUES (?, NULL, ?, ?, ?, 0, ?)'
    );
    $insertProfile->execute([
        $newId,
        json_encode(['Communication', 'Teamwork', 'Problem Solving']),
        json_encode(['Campus Clubs', 'Skill Development']),
        json_encode(['New Member of EDUConnect Community']),
        json_encode([]),
    ]);

    $insertVerification = $pdo->prepare(
        'INSERT INTO academic_verifications
            (id, user_id, entity_type, entity_name, identifier, department, proof_document_path, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $insertVerification->execute([
        edu_new_id('verif'),
        $newId,
        'student',
        $name,
        'Student ID: ' . $studentId,
        $department,
        'Student_ID_Scan_' . $studentId . '.pdf',
        'Pending',
    ]);

    edu_json_response([
        'ok'   => true,
        'user' => edu_load_user($pdo, $newId),
    ], 201);
}

/**
 * Records a club charter application in the academic verification queue for
 * review by the Student Affairs Council.
 *
 * @param PDO   $pdo   Active database connection.
 * @param array $input Request payload with clubName, category, leadName, leadEmail, advisor.
 */
function edu_handle_register_club_charter(PDO $pdo, array $input): void
{
    $clubName = trim((string)($input['clubName'] ?? ''));
    $category = trim((string)($input['category'] ?? ''));
    $leadName = trim((string)($input['leadName'] ?? ''));
    $advisor  = trim((string)($input['advisor'] ?? ''));

    if ($clubName === '' || $category === '' || $leadName === '' || $advisor === '') {
        edu_fail('clubName, category, leadName and advisor are required.', 422);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO academic_verifications
            (id, entity_type, entity_name, identifier, department, proof_document_path, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        edu_new_id('verif'),
        'club',
        $clubName,
        "Advisor: {$advisor} | Lead: {$leadName}",
        $category,
        str_replace(' ', '_', $clubName) . '_Charter_Document.pdf',
        'Pending',
    ]);

    edu_json_response(['ok' => true, 'message' => 'Club charter application submitted.'], 201);
}
