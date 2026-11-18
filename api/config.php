<?php
/**
 * EDUConnect API - Shared Configuration & Helpers (api/config.php)
 * Created for CSE 242: Web Development - East Delta University (Fall 2026)
 *
 * Central PDO connection to the MySQL database (XAMPP defaults) plus
 * JSON response helpers shared by every endpoint in /api.
 */

declare(strict_types=1);

// ---------------------------------------------------------------------------
// Database credentials — XAMPP defaults, overridable via environment variables
// (EDU_DB_HOST, EDU_DB_PORT, EDU_DB_NAME, EDU_DB_USER, EDU_DB_PASS)
// ---------------------------------------------------------------------------
define('EDU_DB_HOST', getenv('EDU_DB_HOST') ?: '127.0.0.1');
define('EDU_DB_PORT', getenv('EDU_DB_PORT') ?: '3306');
define('EDU_DB_NAME', getenv('EDU_DB_NAME') ?: 'edu_connect');
define('EDU_DB_USER', getenv('EDU_DB_USER') ?: 'root');
define('EDU_DB_PASS', getenv('EDU_DB_PASS') !== false ? getenv('EDU_DB_PASS') : ''); // XAMPP ships MySQL with an empty root password

/**
 * Returns a shared PDO connection to the edu_connect database.
 * Uses the same connection instance for the lifetime of the request.
 *
 * @return PDO
 * @throws PDOException When the MySQL server is unreachable.
 */
function edu_db(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', EDU_DB_HOST, EDU_DB_PORT, EDU_DB_NAME);
        $pdo = new PDO($dsn, EDU_DB_USER, EDU_DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }

    return $pdo;
}

/**
 * Sends a JSON payload with the correct headers and terminates the request.
 *
 * @param array $payload  Associative array to encode as JSON.
 * @param int   $status   HTTP response status code (default 200).
 */
function edu_json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Decodes the JSON request body of the current request.
 *
 * @return array Decoded associative array (empty array when the body is not valid JSON).
 */
function edu_json_input(): array
{
    $raw = file_get_contents('php://input');
    if (!is_string($raw) || $raw === '') {
        return [];
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

/**
 * Sends an error JSON payload and terminates the request.
 *
 * @param string $message Human readable error description.
 * @param int    $status  HTTP error status code (default 400).
 */
function edu_fail(string $message, int $status = 400): void
{
    edu_json_response(['ok' => false, 'error' => $message], $status);
}

/**
 * Verifies a submitted password against a stored credential.
 * Accepts bcrypt hashes created with password_hash() as well as the
 * plain-text demo credentials shipped in database/schema.sql.
 *
 * @param string $password Plain-text password submitted by the user.
 * @param string $stored   Stored credential (bcrypt hash or demo plain-text).
 * @return bool True when the password matches.
 */
function edu_verify_password(string $password, string $stored): bool
{
    $isBcrypt = str_starts_with($stored, '$2y$') || str_starts_with($stored, '$2b$');
    return $isBcrypt ? password_verify($password, $stored) : hash_equals($stored, $password);
}

/**
 * Generates a readable unique identifier with the given prefix
 * (e.g. std_6a2f..., matching the frontend id convention).
 *
 * @param string $prefix Identifier prefix such as 'std', 'post' or 'notif'.
 * @return string Generated identifier.
 */
function edu_new_id(string $prefix): string
{
    return $prefix . '_' . bin2hex(random_bytes(8));
}

/**
 * Safely decodes a JSON column value coming from MySQL.
 *
 * @param mixed $value Raw column value (JSON string or null).
 * @return array Decoded array, or an empty array when decoding fails.
 */
function edu_decode_json(mixed $value): array
{
    if (!is_string($value) || $value === '') {
        return [];
    }
    $decoded = json_decode($value, true);
    return is_array($decoded) ? $decoded : [];
}

/**
 * Formats a DATETIME value as the human readable "submitted" timestamps
 * used across the admin verification queue.
 *
 * @param string|null $dateTime MySQL DATETIME string (Y-m-d H:i:s).
 * @return string Formatted timestamp (e.g. "2026-11-17 11:30 AM") or a dash.
 */
function edu_format_timestamp(?string $dateTime): string
{
    if (!$dateTime) {
        return '—';
    }
    $ts = strtotime($dateTime);
    return $ts ? date('Y-m-d h:i A', $ts) : $dateTime;
}

/**
 * Fetches and indexes relational metadata for all users in one pass:
 * club memberships, followed clubs, connected students and profiles.
 *
 * @param PDO $pdo Active database connection.
 * @return array{0: array, 1: array, 2: array, 3: array} Memberships, follows, connections, profiles (indexed by user id).
 */
function edu_load_user_meta(PDO $pdo): array
{
    $memberships = [];
    foreach ($pdo->query('SELECT club_id, user_id, member_role FROM club_members') as $row) {
        $memberships[$row['user_id']][] = $row;
    }

    $follows = [];
    foreach ($pdo->query('SELECT club_id, user_id FROM club_followers') as $row) {
        $follows[$row['user_id']][] = $row['club_id'];
    }

    $connections = [];
    foreach ($pdo->query('SELECT user_id, connected_id FROM student_connections') as $row) {
        $connections[$row['user_id']][] = $row['connected_id'];
    }

    $profiles = [];
    foreach ($pdo->query('SELECT * FROM student_profiles') as $row) {
        $profiles[$row['user_id']] = $row;
    }

    return [$memberships, $follows, $connections, $profiles];
}

/**
 * Maps a users row (+ optional profile + relational metadata) to the
 * frontend student object shape used across dashboard, directory and profile pages.
 *
 * @param array      $u           users table row.
 * @param array|null $profile     student_profiles row or null.
 * @param array      $memberships Club membership rows for this user.
 * @param array      $follows     Followed club ids.
 * @param array      $connections Connected student ids.
 * @return array Frontend-shaped student object.
 */
function edu_map_student(array $u, ?array $profile, array $memberships, array $follows, array $connections): array
{
    $roleLabelMap = [
        'president'      => 'President',
        'vice_president' => 'Vice President',
        'lead'           => 'General Secretary',
        'executive'      => 'Executive Member',
        'member'         => 'Member',
    ];

    $clubs = array_map(static function (array $m) use ($roleLabelMap): array {
        return [
            'id'   => $m['club_id'],
            'name' => $m['club_name'] ?? '',
            'role' => $roleLabelMap[$m['member_role']] ?? 'Member',
        ];
    }, $memberships);

    return [
        'id'                => $u['id'],
        'studentId'         => $u['student_id'],
        'name'              => $u['name'],
        'email'             => $u['email'],
        'role'              => $u['role'],
        'department'        => $u['department'],
        'semester'          => $u['semester'] ?? '',
        'cgpa'              => $profile ? ($profile['cgpa'] !== null ? (string)$profile['cgpa'] : 'Pending') : 'Pending',
        'bio'               => $u['bio'] ?? '',
        'avatar'            => $u['avatar_url'] ?? '',
        'coverImage'        => $u['cover_url'] ?? 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
        'skills'            => $profile ? edu_decode_json($profile['skills']) : [],
        'interests'         => $profile ? edu_decode_json($profile['interests']) : [],
        'achievements'      => $profile ? edu_decode_json($profile['achievements']) : [],
        'clubs'             => $clubs,
        'status'            => $u['status'],
        'connectionsCount'  => $profile ? (int)$profile['connections_count'] : 0,
        'followingClubs'    => $follows,
        'connectedStudents' => $connections,
    ];
}

/**
 * Loads a single user (by id or email) together with relational metadata and
 * returns the mapped frontend object shape.
 *
 * @param PDO    $pdo      Active database connection.
 * @param string $lookupId User id or email address.
 * @return array|null Mapped user object, or null when not found.
 */
function edu_load_user(PDO $pdo, string $lookupId): ?array
{
    $stmt = $pdo->prepare('SELECT * FROM users WHERE id = ? OR email = ? LIMIT 1');
    $stmt->execute([$lookupId, $lookupId]);
    $u = $stmt->fetch();

    if (!$u) {
        return null;
    }

    [$memberships, $follows, $connections, $profiles] = edu_load_user_meta($pdo);

    if (isset($memberships[$u['id']])) {
        $clubStmt = $pdo->prepare('SELECT id, name FROM clubs WHERE id = ?');
        foreach ($memberships[$u['id']] as $i => $m) {
            $clubStmt->execute([$m['club_id']]);
            $club = $clubStmt->fetch();
            $memberships[$u['id']][$i]['club_name'] = $club ? $club['name'] : '';
        }
    }

    $user = edu_map_student(
        $u,
        $profiles[$u['id']] ?? null,
        $memberships[$u['id']] ?? [],
        $follows[$u['id']] ?? [],
        $connections[$u['id']] ?? []
    );

    if ($u['role'] === 'club_rep') {
        $user['clubId'] = $u['club_id'];
    }

    return $user;
}

/**
 * Renders a relative timestamp ("Just now", "3 hours ago", "Yesterday at 4:30 PM")
 * matching the style of the campus feed.
 *
 * @param string $dateTime MySQL DATETIME string.
 * @return string Relative timestamp label.
 */
function edu_relative_time(string $dateTime): string
{
    $ts = strtotime($dateTime);
    if ($ts === false) {
        return '';
    }

    $diff = time() - $ts;
    if ($diff < 120) {
        return 'Just now';
    }
    if ($diff < 3600) {
        return floor($diff / 60) . ' mins ago';
    }
    if ($diff < 7200) {
        return '1 hour ago';
    }
    if ($diff < 86400) {
        return floor($diff / 3600) . ' hours ago';
    }
    if ($diff < 172800) {
        return 'Yesterday at ' . date('g:i A', $ts);
    }
    return date('M j \a\t g:i A', $ts);
}
