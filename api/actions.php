<?php
/**
 * EDUConnect API - Write Actions Endpoint (api/actions.php)
 * Created for CSE 242: Web Development - East Delta University (Fall 2026)
 *
 * POST api/actions.php with a JSON body { "action": "...", ...payload }.
 * Every user mutation performed in the UI is mirrored to MySQL here so the
 * database stays in sync with the client session (write-through persistence):
 *
 *   event_register / event_cancel   -> event_registrations + registered_count
 *   post_create                     -> posts
 *   post_like_toggle                -> post_likes + likes_count
 *   comment_add                     -> post_comments + comments_count
 *   club_follow_toggle              -> club_followers
 *   connection_toggle               -> student_connections
 *   profile_update                  -> users + student_profiles
 *   notification_read / read_all    -> notifications.is_read
 *   verify_decision                 -> academic_verifications + users.status
 *   report_resolve                  -> moderation_reports.status
 *
 * All actions are fire-and-forget from the client: when the API is unreachable
 * the UI keeps working with LocalStorage persistence only.
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
    case 'event_register':
        edu_set_event_registration($pdo, (string)($input['eventId'] ?? ''), (string)($input['userId'] ?? ''), true);
        break;

    case 'event_cancel':
        edu_set_event_registration($pdo, (string)($input['eventId'] ?? ''), (string)($input['userId'] ?? ''), false);
        break;

    case 'post_create':
        edu_create_post($pdo, $input);
        break;

    case 'post_like_toggle':
        edu_toggle_post_like($pdo, (string)($input['postId'] ?? ''), (string)($input['userId'] ?? ''), (bool)($input['liked'] ?? false));
        break;

    case 'comment_add':
        edu_add_comment($pdo, $input);
        break;

    case 'club_follow_toggle':
        edu_toggle_club_follow($pdo, (string)($input['clubId'] ?? ''), (string)($input['userId'] ?? ''), (bool)($input['following'] ?? false));
        break;

    case 'connection_toggle':
        edu_toggle_connection($pdo, (string)($input['userId'] ?? ''), (string)($input['targetId'] ?? ''), (bool)($input['connected'] ?? false));
        break;

    case 'profile_update':
        edu_update_profile($pdo, $input);
        break;

    case 'notification_read':
        edu_mark_notification_read($pdo, $input);
        break;

    case 'read_all':
        edu_mark_all_notifications_read($pdo, (string)($input['userId'] ?? ''));
        break;

    case 'verify_decision':
        edu_apply_verification_decision($pdo, $input);
        break;

    case 'student_status_toggle':
        edu_toggle_student_status($pdo, (string)($input['studentId'] ?? ''));
        break;

    case 'report_resolve':
        edu_resolve_report($pdo, (string)($input['reportId'] ?? ''));
        break;

    default:
        edu_fail('Unknown action.', 422);
}

/* ---------------------------------------------------------------------------
 * Handlers
 * ------------------------------------------------------------------------- */

/**
 * Registers or unregisters a user for an event, keeping the registered
 * counter consistent with the registrations table.
 */
function edu_set_event_registration(PDO $pdo, string $eventId, string $userId, bool $register): void
{
    if ($eventId === '' || $userId === '') {
        edu_fail('eventId and userId are required.', 422);
    }

    if ($register) {
        // Ignore duplicate registrations (unique key event_id + user_id)
        $stmt = $pdo->prepare('INSERT IGNORE INTO event_registrations (event_id, user_id, status) VALUES (?, ?, "registered")');
        $stmt->execute([$eventId, $userId]);
        if ($stmt->rowCount() > 0) {
            $pdo->prepare('UPDATE events SET registered_count = registered_count + 1 WHERE id = ?')->execute([$eventId]);
        }
    } else {
        $stmt = $pdo->prepare('DELETE FROM event_registrations WHERE event_id = ? AND user_id = ?');
        $stmt->execute([$eventId, $userId]);
        if ($stmt->rowCount() > 0) {
            $pdo->prepare('UPDATE events SET registered_count = GREATEST(registered_count - 1, 0) WHERE id = ?')->execute([$eventId]);
        }
    }

    edu_json_response(['ok' => true]);
}

/**
 * Publishes a new feed post. Club announcements carry the club identity;
 * personal posts are tied to the authoring user.
 */
function edu_create_post(PDO $pdo, array $input): void
{
    $authorId = (string)($input['authorId'] ?? '');
    $title    = trim((string)($input['title'] ?? ''));
    $content  = trim((string)($input['content'] ?? ''));
    $image    = ($input['image'] ?? null) ?: null;

    if ($authorId === '' || $title === '' || $content === '') {
        edu_fail('authorId, title and content are required.', 422);
    }

    // Resolve the club identity when the author is a club representative or admin posting officially
    $clubId = null;
    $stmt = $pdo->prepare('SELECT club_id FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([$authorId]);
    $user = $stmt->fetch();
    if ($user && !empty($user['club_id'])) {
        $clubId = $user['club_id'];
    }

    $stmt = $pdo->prepare(
        'INSERT INTO posts (id, author_id, club_id, title, content, category, media_url, priority_score)
         VALUES (?, ?, ?, ?, ?, ?, ?, 50)'
    );
    $stmt->execute([
        edu_new_id('post'),
        $authorId,
        $clubId,
        $title,
        $content,
        $clubId ? 'announcement' : 'discussion',
        $image,
    ]);

    edu_json_response(['ok' => true], 201);
}

/**
 * Adds or removes a like on a post, keeping likes_count in sync.
 */
function edu_toggle_post_like(PDO $pdo, string $postId, string $userId, bool $liked): void
{
    if ($postId === '' || $userId === '') {
        edu_fail('postId and userId are required.', 422);
    }

    if ($liked) {
        $stmt = $pdo->prepare('INSERT IGNORE INTO post_likes (post_id, user_id) VALUES (?, ?)');
        $stmt->execute([$postId, $userId]);
        if ($stmt->rowCount() > 0) {
            $pdo->prepare('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?')->execute([$postId]);
        }
    } else {
        $stmt = $pdo->prepare('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?');
        $stmt->execute([$postId, $userId]);
        if ($stmt->rowCount() > 0) {
            $pdo->prepare('UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = ?')->execute([$postId]);
        }
    }

    edu_json_response(['ok' => true]);
}

/**
 * Appends a comment to a post and increments the comment counter.
 */
function edu_add_comment(PDO $pdo, array $input): void
{
    $postId  = (string)($input['postId'] ?? '');
    $userId  = (string)($input['userId'] ?? '');
    $comment = trim((string)($input['comment'] ?? ''));

    if ($postId === '' || $userId === '' || $comment === '') {
        edu_fail('postId, userId and comment are required.', 422);
    }

    $stmt = $pdo->prepare('INSERT INTO post_comments (post_id, user_id, comment_text) VALUES (?, ?, ?)');
    $stmt->execute([$postId, $userId, $comment]);
    $pdo->prepare('UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?')->execute([$postId]);

    edu_json_response(['ok' => true], 201);
}

/**
 * Follows or unfollows a club for the active user.
 */
function edu_toggle_club_follow(PDO $pdo, string $clubId, string $userId, bool $following): void
{
    if ($clubId === '' || $userId === '') {
        edu_fail('clubId and userId are required.', 422);
    }

    if ($following) {
        $stmt = $pdo->prepare('INSERT IGNORE INTO club_followers (club_id, user_id) VALUES (?, ?)');
        $stmt->execute([$clubId, $userId]);
    } else {
        $stmt = $pdo->prepare('DELETE FROM club_followers WHERE club_id = ? AND user_id = ?');
        $stmt->execute([$clubId, $userId]);
    }

    edu_json_response(['ok' => true]);
}

/**
 * Establishes or removes a peer connection between two students.
 */
function edu_toggle_connection(PDO $pdo, string $userId, string $targetId, bool $connected): void
{
    if ($userId === '' || $targetId === '') {
        edu_fail('userId and targetId are required.', 422);
    }

    if ($connected) {
        // Store the pair in canonical order so both directions stay unique
        [$a, $b] = [$userId, $targetId];
        if (strcmp($a, $b) > 0) {
            [$a, $b] = [$b, $a];
        }
        $stmt = $pdo->prepare('INSERT IGNORE INTO student_connections (user_id, connected_id) VALUES (?, ?)');
        $stmt->execute([$a, $b]);
    } else {
        $stmt = $pdo->prepare(
            'DELETE FROM student_connections WHERE (user_id = ? AND connected_id = ?) OR (user_id = ? AND connected_id = ?)'
        );
        $stmt->execute([$userId, $targetId, $targetId, $userId]);
    }

    edu_json_response(['ok' => true]);
}

/**
 * Updates editable profile fields across users and student_profiles.
 */
function edu_update_profile(PDO $pdo, array $input): void
{
    $userId = (string)($input['userId'] ?? '');
    if ($userId === '') {
        edu_fail('userId is required.', 422);
    }

    $fields = [
        'name'       => trim((string)($input['name'] ?? '')),
        'department' => trim((string)($input['department'] ?? '')),
        'semester'   => trim((string)($input['semester'] ?? '')),
        'bio'        => trim((string)($input['bio'] ?? '')),
        'avatar'     => trim((string)($input['avatar'] ?? '')),
    ];

    $updates = [];
    $params = [];
    foreach (['name' => 'name', 'department' => 'department', 'semester' => 'semester', 'bio' => 'bio', 'avatar' => 'avatar_url'] as $key => $column) {
        if ($fields[$key] !== '') {
            $updates[] = "{$column} = ?";
            $params[] = $fields[$key];
        }
    }

    if ($updates) {
        $params[] = $userId;
        $pdo->prepare('UPDATE users SET ' . implode(', ', $updates) . ' WHERE id = ?')->execute($params);
    }

    $profileUpdates = [];
    $profileParams = [];

    if (!empty($input['skills']) && is_array($input['skills'])) {
        $profileUpdates[] = 'skills = ?';
        $profileParams[] = json_encode(array_values(array_filter(array_map('trim', $input['skills']))));
    }
    if (!empty($input['interests']) && is_array($input['interests'])) {
        $profileUpdates[] = 'interests = ?';
        $profileParams[] = json_encode(array_values(array_filter(array_map('trim', $input['interests']))));
    }

    if ($profileUpdates) {
        $profileParams[] = $userId;
        $pdo->prepare('UPDATE student_profiles SET ' . implode(', ', $profileUpdates) . ' WHERE user_id = ?')->execute($profileParams);
    }

    edu_json_response(['ok' => true]);
}

/**
 * Marks a single notification (by id) as read.
 */
function edu_mark_notification_read(PDO $pdo, array $input): void
{
    $notificationId = (string)($input['notificationId'] ?? '');
    if ($notificationId === '') {
        edu_fail('notificationId is required.', 422);
    }

    $pdo->prepare('UPDATE notifications SET is_read = TRUE WHERE id = ?')->execute([$notificationId]);
    edu_json_response(['ok' => true]);
}

/**
 * Marks every notification of a user as read.
 */
function edu_mark_all_notifications_read(PDO $pdo, string $userId): void
{
    if ($userId === '') {
        edu_fail('userId is required.', 422);
    }

    $pdo->prepare('UPDATE notifications SET is_read = TRUE WHERE user_id = ?')->execute([$userId]);
    edu_json_response(['ok' => true]);
}

/**
 * Applies an admin decision to a verification record. Approving a student
 * verification also flips the student's account status to Verified.
 */
function edu_apply_verification_decision(PDO $pdo, array $input): void
{
    $verificationId = (string)($input['verificationId'] ?? '');
    $decision       = (string)($input['decision'] ?? '');
    $reviewerId     = ($input['reviewerId'] ?? null) ?: null;
    $notes          = ($input['notes'] ?? null) ?: null;

    if ($verificationId === '' || !in_array($decision, ['Approved', 'Rejected'], true)) {
        edu_fail('verificationId and a decision of Approved or Rejected are required.', 422);
    }

    $stmt = $pdo->prepare('SELECT * FROM academic_verifications WHERE id = ? LIMIT 1');
    $stmt->execute([$verificationId]);
    $verification = $stmt->fetch();

    if (!$verification) {
        edu_fail('Verification record not found.', 404);
    }

    $update = $pdo->prepare(
        'UPDATE academic_verifications SET status = ?, reviewer_id = ?, review_notes = ?, reviewed_at = NOW() WHERE id = ?'
    );
    $update->execute([$decision, $reviewerId, $notes, $verificationId]);

    // Propagate the decision to the student's account status
    if ($verification['entity_type'] === 'student' && !empty($verification['user_id'])) {
        $accountStatus = $decision === 'Approved' ? 'Verified' : 'Verification Rejected';
        $pdo->prepare('UPDATE users SET status = ? WHERE id = ?')->execute([$accountStatus, $verification['user_id']]);
    }

    edu_json_response(['ok' => true]);
}

/**
 * Toggles a student account between Verified and Pending Verification
 * directly from the admin user directory table.
 */
function edu_toggle_student_status(PDO $pdo, string $studentUserId): void
{
    if ($studentUserId === '') {
        edu_fail('studentId is required.', 422);
    }

    $stmt = $pdo->prepare("UPDATE users SET status = IF(status = 'Verified', 'Pending Verification', 'Verified') WHERE id = ?");
    $stmt->execute([$studentUserId]);

    edu_json_response(['ok' => true]);
}

/**
 * Marks a moderation report as Resolved with the action that was taken.
 */
function edu_resolve_report(PDO $pdo, string $reportId): void
{
    if ($reportId === '') {
        edu_fail('reportId is required.', 422);
    }

    $pdo->prepare("UPDATE moderation_reports SET status = 'Resolved', action_taken = 'Reviewed by administrator', resolved_at = NOW() WHERE id = ?")
        ->execute([$reportId]);

    edu_json_response(['ok' => true]);
}
