<?php
/**
 * EDUConnect API - Data Sync Endpoint (api/data.php)
 * Created for CSE 242: Web Development - East Delta University (Fall 2026)
 *
 * GET api/data.php
 * Returns every platform collection (students, clubs, events, posts,
 * notifications, verifications, reports, admins, club reps) mapped into the
 * exact object shapes the frontend expects, straight from MySQL.
 *
 * When this endpoint responds successfully, assets/js/data.js replaces its
 * local seed datasets with this payload, making MySQL the source of truth.
 */

declare(strict_types=1);

require_once __DIR__ . '/config.php';

try {
    $pdo = edu_db();
} catch (PDOException $e) {
    edu_fail('Database connection failed: ' . $e->getMessage(), 503);
}

/* ---------------------------------------------------------------------------
 * Load all collections (mapping helpers live in api/config.php)
 * ------------------------------------------------------------------------- */

[$membershipsByUser, $followsByUser, $connectionsByUser, $profilesByUser] = edu_load_user_meta($pdo);

// Attach club names to membership rows for label rendering
$clubNames = [];
foreach ($pdo->query('SELECT id, name FROM clubs') as $row) {
    $clubNames[$row['id']] = $row['name'];
}
foreach ($membershipsByUser as $uid => $rows) {
    foreach ($rows as $i => $m) {
        $membershipsByUser[$uid][$i]['club_name'] = $clubNames[$m['club_id']] ?? '';
    }
}

// --- Students (role = student) --------------------------------------------
$students = [];
$stmt = $pdo->query("SELECT * FROM users WHERE role = 'student' ORDER BY id");
foreach ($stmt as $u) {
    $students[] = edu_map_student(
        $u,
        $profilesByUser[$u['id']] ?? null,
        $membershipsByUser[$u['id']] ?? [],
        $followsByUser[$u['id']] ?? [],
        $connectionsByUser[$u['id']] ?? []
    );
}

// --- Faculty administrators -----------------------------------------------
$admins = [];
$stmt = $pdo->query("SELECT * FROM users WHERE role = 'admin'");
foreach ($stmt as $u) {
    $admin = edu_map_student(
        $u,
        null,
        [],
        $followsByUser[$u['id']] ?? [],
        []
    );
    $admin['coverImage'] = null;
    $admins[] = $admin;
}

// --- Club representatives ---------------------------------------------------
$clubReps = [];
$stmt = $pdo->query("SELECT * FROM users WHERE role = 'club_rep'");
foreach ($stmt as $u) {
    $rep = edu_map_student(
        $u,
        null,
        $membershipsByUser[$u['id']] ?? [],
        $followsByUser[$u['id']] ?? [],
        $connectionsByUser[$u['id']] ?? []
    );
    $rep['clubId'] = $u['club_id'];
    $clubReps[] = $rep;
}

// --- Clubs ------------------------------------------------------------------
$clubs = [];
$stmt = $pdo->query('SELECT * FROM clubs ORDER BY id');
foreach ($stmt as $c) {
    $socials = edu_decode_json($c['socials']);
    $clubs[] = [
        'id'                 => $c['id'],
        'name'               => $c['name'],
        'shortName'          => $c['short_name'],
        'tagline'            => $c['tagline'],
        'category'           => $c['category'],
        'established'        => $c['established'],
        'membersCount'       => (int)$c['members_count'],
        'advisor'            => $c['advisor'],
        'logo'               => $c['logo_url'],
        'coverImage'         => $c['cover_url'],
        'about'              => $c['description'],
        'socials'            => $socials,
        'followersCount'     => (int)$c['followers_count'],
        'isRecruiting'       => (bool)$c['is_recruiting'],
        'recruitmentDetails' => $c['recruitment_details'],
        'achievements'       => edu_decode_json($c['achievements']),
    ];
}

// --- Events (with registration state) ---------------------------------------
$registrationsByEvent = [];
foreach ($pdo->query("SELECT event_id, user_id FROM event_registrations WHERE status = 'registered'") as $row) {
    $registrationsByEvent[$row['event_id']][] = $row['user_id'];
}

$events = [];
$stmt = $pdo->query('SELECT e.*, c.name AS club_name FROM events e LEFT JOIN clubs c ON c.id = e.club_id ORDER BY e.date_time');
foreach ($stmt as $e) {
    $events[] = [
        'id'                  => $e['id'],
        'title'               => $e['title'],
        'clubId'              => $e['club_id'],
        'clubName'            => $e['club_name'] ?? 'University',
        'category'            => $e['category'],
        'date'                => $e['date_time'] ? date('Y-m-d', strtotime($e['date_time'])) : '',
        'time'                => $e['time_text'] ?? '',
        'location'            => $e['location'],
        'description'         => $e['description'],
        'banner'              => $e['image_url'],
        'seatsTotal'          => (int)$e['capacity'],
        'seatsRegistered'     => (int)$e['registered_count'],
        'registeredUserIds'   => $registrationsByEvent[$e['id']] ?? [],
        'isRegistrationOpen'  => (bool)$e['is_registration_open'],
        'status'              => $e['status'],
    ];
}

// --- Posts (feed) -------------------------------------------------------------
$likesByPost = [];
foreach ($pdo->query('SELECT post_id, user_id FROM post_likes') as $row) {
    $likesByPost[$row['post_id']][] = $row['user_id'];
}

$posts = [];
$stmt = $pdo->query(
    'SELECT p.*, u.name AS author_name, u.avatar_url AS author_avatar, u.role AS author_role,
            c.name AS club_name, c.logo_url AS club_logo
     FROM posts p
     LEFT JOIN users u ON u.id = p.author_id
     LEFT JOIN clubs c ON c.id = p.club_id
     ORDER BY p.priority_score DESC, p.created_at DESC'
);
foreach ($stmt as $p) {
    // Club posts are rendered with the club identity; others with the author profile
    $isClubPost = $p['club_id'] !== null && ($p['category'] === 'announcement' || $p['category'] === 'event_recap');
    $posts[] = [
        'id'                => $p['id'],
        'authorType'        => $isClubPost ? 'club' : 'student',
        'authorId'          => $isClubPost ? $p['club_id'] : $p['author_id'],
        'authorName'        => $isClubPost ? ($p['club_name'] ?? 'University Club') : ($p['author_name'] ?? 'Student'),
        'authorAvatar'      => $isClubPost ? ($p['club_logo'] ?? '') : ($p['author_avatar'] ?? ''),
        'timestamp'         => edu_relative_time($p['created_at']),
        'title'             => $p['title'],
        'content'           => $p['content'],
        'image'             => $p['media_url'],
        'likesCount'        => (int)$p['likes_count'],
        'commentsCount'     => (int)$p['comments_count'],
        'likedBy'           => $likesByPost[$p['id']] ?? [],
        'likedByCurrentUser'=> false, // resolved client-side against the active session
        'isEvent'           => $p['category'] === 'announcement' || $p['category'] === 'event_recap',
        'createdAt'         => $p['created_at'],
    ];
}

// --- Notifications (scoped to the active session user when provided) -------
$notifications = [];
$sessionUserId = isset($_GET['user']) ? trim((string)$_GET['user']) : '';

if ($sessionUserId !== '') {
    $stmt = $pdo->prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC');
    $stmt->execute([$sessionUserId]);
} else {
    $stmt = $pdo->query('SELECT * FROM notifications ORDER BY created_at DESC');
}
foreach ($stmt as $n) {
    $notifications[] = [
        'id'        => $n['id'],
        'type'      => $n['type'],
        'title'     => $n['title'],
        'message'   => $n['message'],
        'timestamp' => edu_relative_time($n['created_at']),
        'read'      => (bool)$n['is_read'],
        'link'      => $n['link_url'],
    ];
}

// --- Academic verification queue ---------------------------------------------
$verifications = [];
$stmt = $pdo->query('SELECT * FROM academic_verifications ORDER BY submitted_at DESC');
foreach ($stmt as $v) {
    $verifications[] = [
        'id'            => $v['id'],
        'type'          => $v['entity_type'],
        'targetId'      => $v['user_id'] ?? ($v['club_id'] ?? ''),
        'name'          => $v['entity_name'],
        'identifier'    => $v['identifier'],
        'department'    => $v['department'],
        'submittedAt'   => edu_format_timestamp($v['submitted_at']),
        'proofDocument' => $v['proof_document_path'],
        'status'        => $v['status'],
    ];
}

// --- Moderation reports --------------------------------------------------------
$reports = [];
$stmt = $pdo->query(
    'SELECT r.*, u.name AS reporter_name FROM moderation_reports r
     LEFT JOIN users u ON u.id = r.reported_by
     ORDER BY r.created_at DESC'
);
foreach ($stmt as $r) {
    $reports[] = [
        'id'          => $r['id'],
        'type'        => $r['target_type'],
        'targetTitle' => $r['target_title'],
        'reportedBy'  => trim(($r['reporter_name'] ?? 'Unknown') . ' (' . $r['reported_by'] . ')'),
        'reason'      => $r['reason'],
        'status'      => $r['status'],
        'timestamp'   => edu_format_timestamp($r['created_at']),
    ];
}

edu_json_response([
    'ok'            => true,
    'students'      => $students,
    'admins'        => $admins,
    'clubReps'      => $clubReps,
    'clubs'         => $clubs,
    'events'        => $events,
    'posts'         => $posts,
    'notifications' => $notifications,
    'verifications' => $verifications,
    'reports'       => $reports,
]);
