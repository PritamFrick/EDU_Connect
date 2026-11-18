-- =============================================================================
-- EDUConnect: University Campus Social & Academic Collaboration Platform
-- Database Definition & Seed Data Script (MySQL 8.0+)
-- Created for CSE 242: Web Development (Fall 2026), East Delta University
-- Course Instructor: Asst. Prof. Saraf Anika, Dept. of CSE, SoSET
-- Project Team:
--   - Raida Salsabil Sarwar  (ID: 243011912)
--   - Pritam Barua           (ID: 243007712)
--   - Fardin Tajwar Chowdhury (ID: 243009912)
--   - Md. Omar Mahabub       (ID: 243007512)
--   - Anika Thashen Autshe   (ID: 243015112)
--
-- This schema is the live data source for the PHP REST API in /api.
-- Seed rows are aligned 1:1 with the frontend dataset (assets/js/data.js)
-- so the platform UI and the MySQL database stay consistent.
--
-- NOTE ON PASSWORDS: seed accounts ship with plain-text demo credentials so
-- graders can sign in easily (documented in README.md). The PHP API accepts
-- both plain-text demo passwords and bcrypt hashes produced by
-- password_hash(); newly registered accounts are always stored hashed.
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. Database Creation & Selection
-- -----------------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS `edu_connect`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `edu_connect`;

-- -----------------------------------------------------------------------------
-- 2. Drop existing tables in dependency order
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `moderation_reports`;
DROP TABLE IF EXISTS `academic_verifications`;
DROP TABLE IF EXISTS `student_connections`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `post_comments`;
DROP TABLE IF EXISTS `post_likes`;
DROP TABLE IF EXISTS `posts`;
DROP TABLE IF EXISTS `event_registrations`;
DROP TABLE IF EXISTS `events`;
DROP TABLE IF EXISTS `club_followers`;
DROP TABLE IF EXISTS `club_members`;
DROP TABLE IF EXISTS `clubs`;
DROP TABLE IF EXISTS `student_profiles`;
DROP TABLE IF EXISTS `users`;

-- -----------------------------------------------------------------------------
-- 3. Schema Definitions
-- -----------------------------------------------------------------------------

-- Table: users
-- Core authentication and identity table for all university stakeholders
CREATE TABLE `users` (
  `id` VARCHAR(36) NOT NULL,
  `student_id` VARCHAR(30) UNIQUE NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('student', 'club_rep', 'admin') NOT NULL DEFAULT 'student',
  `club_id` VARCHAR(36) DEFAULT NULL COMMENT 'Set only for club_rep accounts',
  `department` VARCHAR(150) NOT NULL DEFAULT 'Computer Science & Engineering',
  `semester` VARCHAR(50) DEFAULT '6th Semester',
  `avatar_url` TEXT,
  `cover_url` TEXT,
  `bio` TEXT,
  `status` ENUM('Verified', 'Pending Verification', 'Verification Rejected') NOT NULL DEFAULT 'Pending Verification',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_student_id` (`student_id`),
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: student_profiles
-- Rich portfolio details, technical skills, interests, and academic metadata
CREATE TABLE `student_profiles` (
  `user_id` VARCHAR(36) NOT NULL,
  `cgpa` DECIMAL(3,2) DEFAULT NULL,
  `skills` JSON NOT NULL,
  `interests` JSON NOT NULL,
  `achievements` JSON NOT NULL,
  `github_url` VARCHAR(255),
  `linkedin_url` VARCHAR(255),
  `portfolio_url` VARCHAR(255),
  `projects_count` INT NOT NULL DEFAULT 0,
  `experience_years` INT NOT NULL DEFAULT 1,
  `connections_count` INT NOT NULL DEFAULT 0,
  `connected_students` JSON NOT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_student_profile_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: clubs
-- University chartered student clubs and organizations
CREATE TABLE `clubs` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `short_name` VARCHAR(50) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `established` VARCHAR(20) DEFAULT NULL,
  `tagline` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `advisor` VARCHAR(150) NOT NULL,
  `president_name` VARCHAR(150) NOT NULL,
  `president_email` VARCHAR(150) NOT NULL,
  `logo_url` TEXT NOT NULL,
  `cover_url` TEXT NOT NULL,
  `socials` JSON DEFAULT NULL,
  `achievements` JSON DEFAULT NULL,
  `recruitment_details` TEXT,
  `is_recruiting` BOOLEAN NOT NULL DEFAULT FALSE,
  `members_count` INT NOT NULL DEFAULT 0,
  `followers_count` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_clubs_category` (`category`),
  INDEX `idx_clubs_recruiting` (`is_recruiting`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: club_members
-- Relational membership records connecting students with clubs
CREATE TABLE `club_members` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `club_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `member_role` ENUM('member', 'executive', 'lead', 'vice_president', 'president') NOT NULL DEFAULT 'member',
  `joined_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_club_member` (`club_id`, `user_id`),
  INDEX `idx_club_members_user` (`user_id`),
  CONSTRAINT `fk_club_members_club`
    FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_club_members_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: club_followers
-- Tracks clubs followed by students for feed personalization
CREATE TABLE `club_followers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `club_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `followed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_club_follower` (`club_id`, `user_id`),
  INDEX `idx_followers_user` (`user_id`),
  CONSTRAINT `fk_followers_club`
    FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_followers_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: student_connections
-- Peer-to-peer professional connections between students
CREATE TABLE `student_connections` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `connected_id` VARCHAR(36) NOT NULL,
  `connected_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_student_connection` (`user_id`, `connected_id`),
  INDEX `idx_connections_connected` (`connected_id`),
  CONSTRAINT `fk_connections_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_connections_connected`
    FOREIGN KEY (`connected_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: events
-- Campus events, workshops, hackathons, and seminars
CREATE TABLE `events` (
  `id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `club_id` VARCHAR(36) DEFAULT NULL,
  `creator_id` VARCHAR(36) NOT NULL,
  `date_time` DATETIME NOT NULL,
  `time_text` VARCHAR(60) DEFAULT NULL COMMENT 'Human readable slot, e.g. 10:00 AM - 04:00 PM',
  `location` VARCHAR(200) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `image_url` TEXT NOT NULL,
  `capacity` INT NOT NULL DEFAULT 100,
  `registered_count` INT NOT NULL DEFAULT 0,
  `is_official` BOOLEAN NOT NULL DEFAULT TRUE,
  `is_registration_open` BOOLEAN NOT NULL DEFAULT TRUE,
  `status` ENUM('upcoming', 'ongoing', 'completed', 'cancelled') NOT NULL DEFAULT 'upcoming',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_events_club` (`club_id`),
  INDEX `idx_events_datetime` (`date_time`),
  INDEX `idx_events_status` (`status`),
  CONSTRAINT `fk_events_club`
    FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_events_creator`
    FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: event_registrations
-- Student RSVPs and registrations for events
CREATE TABLE `event_registrations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `status` ENUM('registered', 'attended', 'cancelled') NOT NULL DEFAULT 'registered',
  `registered_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_event_user_reg` (`event_id`, `user_id`),
  INDEX `idx_event_reg_user` (`user_id`),
  CONSTRAINT `fk_event_reg_event`
    FOREIGN KEY (`event_id`) REFERENCES `events` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_event_reg_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: posts
-- Algorithmic campus newsfeed announcements and articles
CREATE TABLE `posts` (
  `id` VARCHAR(36) NOT NULL,
  `author_id` VARCHAR(36) NOT NULL,
  `club_id` VARCHAR(36) DEFAULT NULL COMMENT 'Set when the post is published on behalf of a club',
  `title` VARCHAR(255) DEFAULT NULL,
  `content` TEXT NOT NULL,
  `category` ENUM('announcement', 'event_recap', 'project_showcase', 'discussion', 'academic') NOT NULL DEFAULT 'discussion',
  `media_url` TEXT DEFAULT NULL,
  `likes_count` INT NOT NULL DEFAULT 0,
  `comments_count` INT NOT NULL DEFAULT 0,
  `priority_score` INT NOT NULL DEFAULT 0,
  `is_pinned` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_posts_author` (`author_id`),
  INDEX `idx_posts_club` (`club_id`),
  INDEX `idx_posts_priority` (`priority_score` DESC),
  INDEX `idx_posts_created` (`created_at` DESC),
  CONSTRAINT `fk_posts_author`
    FOREIGN KEY (`author_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_posts_club`
    FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: post_likes
-- Likes tracking for algorithmic feed priority
CREATE TABLE `post_likes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `post_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_post_like` (`post_id`, `user_id`),
  INDEX `idx_post_likes_user` (`user_id`),
  CONSTRAINT `fk_post_likes_post`
    FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_post_likes_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: post_comments
-- Comments on feed items
CREATE TABLE `post_comments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `post_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `comment_text` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_comments_post` (`post_id`),
  INDEX `idx_comments_user` (`user_id`),
  CONSTRAINT `fk_comments_post`
    FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_comments_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: notifications
-- Notification dispatch system for events, clubs, verifications
CREATE TABLE `notifications` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('event', 'club', 'social', 'connection', 'admin', 'system') NOT NULL DEFAULT 'system',
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `link_url` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_notif_user` (`user_id`, `is_read`),
  CONSTRAINT `fk_notif_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: academic_verifications
-- Verification queue for official student ID cards & club charters
CREATE TABLE `academic_verifications` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) DEFAULT NULL,
  `club_id` VARCHAR(36) DEFAULT NULL,
  `entity_type` ENUM('student', 'club') NOT NULL,
  `entity_name` VARCHAR(150) NOT NULL,
  `identifier` VARCHAR(100) NOT NULL,
  `department` VARCHAR(150) NOT NULL,
  `proof_document_path` VARCHAR(255) NOT NULL,
  `status` ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
  `reviewer_id` VARCHAR(36) DEFAULT NULL,
  `review_notes` TEXT DEFAULT NULL,
  `submitted_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewed_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_verif_status` (`status`),
  CONSTRAINT `fk_verif_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_verif_club`
    FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_verif_reviewer`
    FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: moderation_reports
-- Community content reports reviewed by administrators
CREATE TABLE `moderation_reports` (
  `id` VARCHAR(36) NOT NULL,
  `reported_by` VARCHAR(36) NOT NULL,
  `target_type` ENUM('post', 'user', 'event', 'club') NOT NULL,
  `target_id` VARCHAR(36) NOT NULL,
  `target_title` VARCHAR(255) NOT NULL,
  `reason` TEXT NOT NULL,
  `status` ENUM('Pending Review', 'Resolved', 'Dismissed') NOT NULL DEFAULT 'Pending Review',
  `action_taken` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_reports_status` (`status`),
  CONSTRAINT `fk_reports_reporter`
    FOREIGN KEY (`reported_by`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. Seed Data (aligned with assets/js/data.js — East Delta University, Fall 2026)
-- -----------------------------------------------------------------------------

-- Faculty Administrator, Club Representative & Students
INSERT INTO `users` (`id`, `student_id`, `name`, `email`, `password_hash`, `role`, `club_id`, `department`, `semester`, `avatar_url`, `cover_url`, `bio`, `status`) VALUES
('admin_01', 'FACULTY-CSE-242', 'Saraf Anika (Asst. Professor & Faculty Admin)', 'saraf.anika@faculty.edu', 'admin123', 'admin', NULL, 'CSE, SoSET, East Delta University', 'Faculty Advisor', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80', NULL, 'Assistant Professor at Department of Computer Science & Engineering, SoSET, East Delta University. Course Instructor for CSE 242: Web Development.', 'Verified'),
('club_rep_01', 'REP-243007712', 'Pritam Barua (EDURC President)', 'robotics.lead@student.edu', 'clubrep123', 'club_rep', 'club_02', 'Computer Science & Engineering', '6th Semester', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80', NULL, 'Club representative account for the EDU Robotics Club.', 'Verified'),
('std_01', '243011912', 'Raida Salsabil Sarwar', 'raida.sarwar@student.edu', 'student123', 'student', NULL, 'Computer Science & Engineering', '6th Semester', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80', 'CSE undergraduate student at East Delta University. Full-stack developer and UI/UX designer. Passionate about human-computer interaction, responsive web apps, and database engineering.', 'Verified'),
('std_02', '243007712', 'Pritam Barua', 'pritam.barua@student.edu', 'student123', 'student', NULL, 'Computer Science & Engineering', '6th Semester', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80', 'CSE undergrad focusing on frontend systems, responsive web apps, and autonomous robotics hardware. President of the EDU Robotics Club.', 'Verified'),
('std_03', '243009912', 'Fardin Tajwar Chowdhury', 'fardin.chowdhury@student.edu', 'student123', 'student', NULL, 'Computer Science & Engineering', '6th Semester', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80', 'Backend developer and competitive programmer. Interested in RESTful web services, algorithmic problem solving, and relational database normalization.', 'Verified'),
('std_04', '243007512', 'Md. Omar Mahabub', 'omar.mahabub@student.edu', 'student123', 'student', NULL, 'Computer Science & Engineering', '6th Semester', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', 'Passionate full-stack developer and IoT enthusiast. Focused on building real-time campus applications and collaborative platforms.', 'Verified'),
('std_05', '243015112', 'Anika Thashen Autshe', 'anika.autshe@student.edu', 'student123', 'student', NULL, 'Computer Science & Engineering', '6th Semester', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80', 'Computer Science undergrad with passion for user-centered web accessibility, digital design, and software verification.', 'Verified'),
('std_06', '242003412', 'Tanvir Ahmed', 'tanvir.ahmed@student.edu', 'student123', 'student', NULL, 'Electrical & Electronic Engineering', '6th Semester', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', 'EEE student specializing in smart grid sensors, circuit simulation, and microcontroller firmware. Active robotics builder.', 'Verified'),
('std_07', '241009112', 'Sadia Chowdhury', 'sadia.chowdhury@student.edu', 'student123', 'student', NULL, 'Business Administration (BBA)', '8th Semester', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80', 'BBA major with concentrations in Corporate Finance and Brand Strategy. President of EDU Business Club.', 'Verified');

-- Student Profiles (Skills, Interests, Achievements & Portfolios)
INSERT INTO `student_profiles` (`user_id`, `cgpa`, `skills`, `interests`, `achievements`, `github_url`, `linkedin_url`, `portfolio_url`, `projects_count`, `experience_years`, `connections_count`, `connected_students`) VALUES
('std_01', 3.92, '["JavaScript", "HTML5", "CSS3", "Bootstrap", "PHP", "MySQL", "React", "Figma"]', '["Web Architecture", "Accessibility", "Cloud Databases", "UI Design"]', '["CSE 242 Web Development Lead - EDUConnect Platform", "Vice President - EDU Computer Club (EDUCC)", "Dean''s Honor List (Spring 2024, Fall 2024)"]', 'https://github.com/raida-sarwar', 'https://linkedin.com/in/raida-sarwar', 'https://raida.dev', 6, 2, 142, '["std_02", "std_03", "std_04", "std_05"]'),
('std_02', 3.88, '["JavaScript", "Bootstrap", "Node.js", "MySQL", "Embedded C", "Arduino", "Git"]', '["Frontend Engineering", "Robotics", "Web Performance", "Hardware Automation"]', '["President - EDU Robotics Club (EDURC)", "Champion - Inter-University Roborace 2024", "Co-creator of EDUConnect Platform"]', 'https://github.com/pritam-barua', 'https://linkedin.com/in/pritam-barua', 'https://pritambarua.dev', 5, 2, 128, '["std_01", "std_03"]'),
('std_03', 3.85, '["C++", "Python", "PHP", "MySQL", "Algorithms", "Data Structures", "Linux"]', '["Competitive Programming", "Database Systems", "Backend APIs", "System Security"]', '["General Secretary - EDU Programming Club (EDUPC)", "Solved 500+ problems on Codeforces & LeetCode", "Co-creator of EDUConnect Platform"]', 'https://github.com/fardin-tajwar', 'https://linkedin.com/in/fardin-tajwar', 'https://fardintajwar.design', 7, 2, 115, '["std_01", "std_02", "std_04"]'),
('std_04', 3.82, '["HTML5", "CSS3", "JavaScript", "Python", "MySQL", "Embedded Systems", "Git"]', '["IoT Solutions", "Full-Stack Web", "Automation", "DevOps"]', '["Technical Associate - EDU Robotics Club", "Co-creator of EDUConnect Platform", "Dean''s Merit Award"]', 'https://github.com/omar-mahabub', 'https://linkedin.com/in/omar-mahabub', 'https://omarmahabub.ai', 4, 2, 96, '["std_01", "std_03"]'),
('std_05', 3.86, '["UI/UX Design", "JavaScript", "HTML5", "CSS3", "Accessibility (a11y)", "MySQL", "Figma"]', '["Digital Accessibility", "UI Design", "Cultural Events", "Tech Communities"]', '["Executive Member - EDU Cultural Club", "Accessibility Lead - EDUConnect Platform", "Dean''s Honor List"]', 'https://github.com/anika-autshe', 'https://linkedin.com/in/anika-autshe', 'https://anikaautshe.tech', 4, 2, 110, '["std_01", "std_04"]'),
('std_06', 3.78, '["Embedded C", "MATLAB", "Circuit Design", "Arduino", "IoT"]', '["Robotics", "Hardware Automation", "Clean Energy"]', '["Runner-Up - Intra-EDU Hardware Showcase 2024"]', 'https://github.com/tanvir-ahmed', 'https://linkedin.com/in/tanvir-ahmed', NULL, 3, 1, 82, '["std_02", "std_04"]'),
('std_07', 3.84, '["Brand Strategy", "Financial Modeling", "Public Speaking", "Marketing"]', '["FinTech", "Startup Strategy", "Public Relations"]', '["Finalist - National Business Case Battle 2024", "President - EDU Business Club"]', NULL, 'https://linkedin.com/in/sadia-afrin', NULL, 5, 2, 165, '["std_01", "std_05"]');

-- Real East Delta University Registered Clubs
INSERT INTO `clubs` (`id`, `name`, `short_name`, `category`, `established`, `tagline`, `description`, `advisor`, `president_name`, `president_email`, `logo_url`, `cover_url`, `socials`, `achievements`, `recruitment_details`, `is_recruiting`, `members_count`, `followers_count`) VALUES
('club_01', 'EDU Computer Club', 'EDUCC', 'Technology & Engineering', '2015', 'Code, workshops, and innovative software for student developers.', 'EDU Computer Club is the university''s flagship computing organization. We organize yearly hackathons, tech talks with software industry leaders, open-source sprints, and developer bootcamps.', 'Dr. Mohammad Karim, Professor, Dept. of CSE', 'Raida Salsabil Sarwar', 'raida.sarwar@student.edu', 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=300&q=80', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80', '{"website": "https://educomputerclub.org", "facebook": "https://facebook.com/educomputerclub", "github": "https://github.com/edu-computer-club", "linkedin": "https://linkedin.com/company/edu-computer-club"}', '["Best Co-Curricular University Club Award 2024", "Hosted National Hackathon 2023 with 60 university teams"]', 'Fall 2026 Executive Member Recruitment is now open! Positions: Web Developer, UI Designer, and Content Lead.', TRUE, 420, 890),
('club_02', 'EDU Robotics Club', 'EDURC', 'Robotics & Hardware', '2017', 'Autonomous robotics, embedded systems, and artificial intelligence.', 'EDU Robotics Club brings together engineers from CSE, EEE, and Mechanical backgrounds. We build autonomous ground rovers, IoT sensors, aerial drones, and AI-driven automation systems.', 'Dr. Shahriar Alam, Dept. of EEE', 'Pritam Barua', 'pritam.barua@student.edu', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=300&q=80', 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=1200&q=80', '{"website": "https://edurobotics.org", "facebook": "https://facebook.com/edurobotics", "github": "https://github.com/edu-robotics", "linkedin": "https://linkedin.com/company/edu-robotics"}', '["National Champions in Line Follower Robot Challenge 2024", "Developed Smart Campus Environmental Monitor"]', 'Intake open for Hardware Workshop and Roborace Team members.', TRUE, 260, 650),
('club_03', 'EDU Programming Club', 'EDUPC', 'Competitive Coding', '2014', 'Algorithms, competitive programming, and problem solving excellence.', 'We train university programmers for the ICPC, National Collegiate Programming Contests (NCPC), and software engineering interviews through weekly contests and masterclasses.', 'Asst. Prof. Sabrina Haque, Dept. of CSE', 'Fardin Tajwar Chowdhury', 'fardin.chowdhury@student.edu', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=300&q=80', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80', '{"facebook": "https://facebook.com/eduprogramming", "github": "https://github.com/edu-cpc", "linkedin": "https://linkedin.com/company/edu-cpc"}', '["Qualified for ICPC Asia Regional Finals 4 consecutive years", "Top 10 standing in National Collegiate Programming Contest 2023"]', 'Registration is open for the Freshers Problem Solving Bootcamp.', TRUE, 380, 780),
('club_04', 'EDU Business Club', 'EDUBC', 'Business & Leadership', '2016', 'Empowering future entrepreneurs, analysts, and corporate leaders.', 'EDU Business Club covers strategy, finance, startup pitching, and case analysis. We host inter-university business battles and connect students with multinational executives.', 'Dr. Rafiqul Islam, Dept. of Business Administration', 'Sadia Chowdhury', 'sadia.chowdhury@student.edu', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=300&q=80', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80', '{"facebook": "https://facebook.com/edubusinessclub", "linkedin": "https://linkedin.com/company/edubusinessclub"}', '["Organized EDU Intra-University Business Case Competition 2024", "Mentored 3 student startups to seed grant funding"]', 'Seeking student ambassadors for upcoming Brandfest 2026.', TRUE, 310, 520),
('club_05', 'EDU Cultural Club', 'EDU Cultural', 'Art & Culture', '2013', 'Celebrating music, performing arts, drama, and campus tradition.', 'The heart of campus musical and cultural celebrations. We produce acoustic open-mic sessions, spring festivals, theatre plays, and seasonal concerts.', 'Prof. Anwara Begum, Dept. of English', 'Fardin Tajwar Chowdhury', 'fardin.chowdhury@student.edu', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80', '{"facebook": "https://facebook.com/educulturalclub", "instagram": "https://instagram.com/educultural"}', '["Best Cultural Performance in Inter-University Youth Fest 2023", "Annual campus concert with 3,000+ attendee turnout"]', 'Auditions for Spring Festival musical performance will open soon.', FALSE, 450, 910),
('club_06', 'EDU Debate Society', 'EDUDC', 'Debate & Public Speaking', '2016', 'Critical thinking, rhetoric, and British Parliamentary debate.', 'EDU Debate Society trains students in British Parliamentary, Asian Parliamentary, and Bangla debate formats. We foster critical reasoning and public rhetoric.', 'Dr. Shahana Akhter, Dept. of English & Humanities', 'Anika Thashen Autshe', 'anika.autshe@student.edu', 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80', 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80', '{"facebook": "https://facebook.com/edudebatesociety", "linkedin": "https://linkedin.com/company/edudebatesociety"}', '["Champions - National Youth Parliamentary Debate 2024", "Best Speaker Award at Inter-University Championship 2023"]', 'Intra-University Freshers Debate Championship registration open!', TRUE, 290, 640);

-- Club Memberships (aligned with student club roles shown in profiles)
INSERT INTO `club_members` (`club_id`, `user_id`, `member_role`) VALUES
('club_01', 'std_01', 'vice_president'),
('club_01', 'std_02', 'executive'),
('club_01', 'std_03', 'executive'),
('club_02', 'std_02', 'president'),
('club_02', 'std_04', 'executive'),
('club_02', 'std_06', 'member'),
('club_03', 'std_03', 'lead'),
('club_04', 'std_07', 'president'),
('club_05', 'std_05', 'executive');

-- Club Followers (feed personalization; faculty admin follows all clubs)
INSERT INTO `club_followers` (`club_id`, `user_id`) VALUES
('club_01', 'std_01'),
('club_01', 'std_02'),
('club_01', 'std_03'),
('club_01', 'std_05'),
('club_01', 'admin_01'),
('club_02', 'std_01'),
('club_02', 'std_02'),
('club_02', 'std_04'),
('club_02', 'std_06'),
('club_02', 'admin_01'),
('club_03', 'std_01'),
('club_03', 'std_03'),
('club_03', 'admin_01'),
('club_04', 'std_07'),
('club_04', 'admin_01'),
('club_05', 'std_05'),
('club_05', 'admin_01'),
('club_06', 'std_04'),
('club_06', 'std_07'),
('club_06', 'admin_01');

-- Peer-to-peer student connections
INSERT INTO `student_connections` (`user_id`, `connected_id`) VALUES
('std_01', 'std_02'),
('std_01', 'std_03'),
('std_01', 'std_04'),
('std_01', 'std_05'),
('std_01', 'std_07'),
('std_02', 'std_03'),
('std_02', 'std_04'),
('std_02', 'std_06'),
('std_03', 'std_04'),
('std_04', 'std_05'),
('std_04', 'std_06'),
('std_05', 'std_07');

-- Campus Events & Workshops
INSERT INTO `events` (`id`, `title`, `club_id`, `creator_id`, `date_time`, `time_text`, `location`, `category`, `description`, `image_url`, `capacity`, `registered_count`, `is_official`, `is_registration_open`, `status`) VALUES
('evt_01', 'CSE 242 Web Development Final Defense & Project Showcase', 'club_01', 'std_01', '2026-12-10 10:00:00', '10:00 AM - 04:00 PM', 'Lab Room 401, SoSET Academic Building', 'Hackathon', 'Final evaluation and project defense for CSE 242: Web Development. Student groups will present their production web systems before course instructor Asst. Professor Saraf Anika.', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80', 120, 95, TRUE, TRUE, 'upcoming'),
('evt_02', 'Intra-EDU Autonomous Roborace & Hardware Exhibition 2026', 'club_02', 'std_02', '2026-11-25 14:00:00', '02:00 PM - 06:00 PM', 'Open Amphitheatre & Robotics Arena', 'Workshop', 'Compete in autonomous line following, obstacle navigation, and IoT innovations. Certificates, trophies, and cash prizes for top three hardware teams.', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80', 80, 68, TRUE, TRUE, 'upcoming'),
('evt_03', 'ICPC Regional Preparation Contest & Mock Round', 'club_03', 'std_03', '2026-11-28 14:00:00', '02:00 PM - 07:00 PM', 'CSE Department Main Lab (3rd Floor)', 'Coding', 'A 5-hour mock contest following international ACM-ICPC standards. Teams of 3 members will solve 10 algorithmic challenges.', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80', 90, 74, TRUE, TRUE, 'upcoming'),
('evt_04', 'EDU Intra-University Business Case Competition 2026', 'club_04', 'std_07', '2026-12-05 10:00:00', '10:00 AM - 04:00 PM', 'Business School Seminar Hall', 'Business', 'Develop actionable corporate turnaround strategies judged by corporate leaders from multinational FMCG and telecom brands.', 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1000&q=80', 100, 52, TRUE, TRUE, 'upcoming'),
('evt_05', 'Acoustic Musical Evening & Open Mic Night', 'club_05', 'std_05', '2026-12-12 17:30:00', '05:30 PM - 09:00 PM', 'Campus Open Air Amphitheatre', 'Cultural', 'An open-air evening of student bands, solo singing, and spoken word poetry. Free admission for all verified East Delta University students.', 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1000&q=80', 300, 215, TRUE, TRUE, 'upcoming');

-- Event Registrations (registeredUserIds from the frontend dataset)
INSERT INTO `event_registrations` (`event_id`, `user_id`, `status`) VALUES
('evt_01', 'std_01', 'registered'),
('evt_01', 'std_02', 'registered'),
('evt_01', 'std_03', 'registered'),
('evt_01', 'std_04', 'registered'),
('evt_01', 'std_05', 'registered'),
('evt_02', 'std_01', 'registered'),
('evt_02', 'std_02', 'registered'),
('evt_02', 'std_06', 'registered'),
('evt_03', 'std_03', 'registered'),
('evt_03', 'std_04', 'registered'),
('evt_04', 'std_07', 'registered'),
('evt_05', 'std_01', 'registered'),
('evt_05', 'std_05', 'registered');

-- Campus Feed Posts (club posts carry club_id; priority_score drives feed order)
INSERT INTO `posts` (`id`, `author_id`, `club_id`, `title`, `content`, `category`, `media_url`, `likes_count`, `comments_count`, `priority_score`, `is_pinned`, `created_at`) VALUES
('post_01', 'std_01', 'club_01', 'CSE 242 Web Development Showcase Schedule Released!', 'The official presentation schedule for CSE 242 project defenses is now published. All project groups should arrive at Lab 401 by 09:45 AM on December 10 with working prototypes and documentation.', 'announcement', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80', 62, 14, 100, TRUE, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
('post_02', 'std_02', 'club_02', 'Intra-EDU Roborace 2026 Track Layout Revealed!', 'Get your bots calibrated! The track layout for our upcoming line follower challenge features dual hairpin turns and an elevated bridge section. Check the Events page to register your team.', 'event_recap', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80', 48, 9, 95, FALSE, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
('post_03', 'std_01', NULL, 'EDUConnect is ready for peer review across East Delta University!', 'We have updated EDUConnect with responsive layouts, accessible navigation, real student profiles, and algorithmic recommendations. Please explore the platform and connect with peers across departments!', 'project_showcase', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80', 94, 21, 90, FALSE, DATE_SUB(NOW(), INTERVAL 5 HOUR)),
('post_04', 'std_02', NULL, 'Autonomous Rover Sensor Telemetry Complete', 'Successfully tested our ultrasonic & LiDAR sensor array on the EDURC rover platform. Ready for demonstration at the upcoming hardware fest!', 'discussion', 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=1000&q=80', 51, 8, 85, FALSE, DATE_SUB(NOW(), INTERVAL 26 HOUR)),
('post_05', 'std_03', NULL, 'ICPC Mock Round Problem Set Available', 'The problem set from our weekend mock contest has been uploaded to the programming club portal. Topics include Graph BFS/DFS, Segment Trees, and Dynamic Programming.', 'discussion', NULL, 38, 6, 80, FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY));

-- Post Likes
INSERT INTO `post_likes` (`post_id`, `user_id`) VALUES
('post_01', 'std_01'),
('post_01', 'std_02'),
('post_03', 'std_01'),
('post_03', 'std_04');

-- Post Comments
INSERT INTO `post_comments` (`post_id`, `user_id`, `comment_text`) VALUES
('post_01', 'std_02', 'Our team is ready with the MySQL schema and REST API demo!'),
('post_01', 'std_03', 'Responsive design checklist is complete for our project.'),
('post_02', 'std_06', 'Can we bring custom motor drivers for the roborace?'),
('post_03', 'std_05', 'Loved the new accessible navigation. Great work team!');

-- Notifications (scoped to the demo account std_01)
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `link_url`, `created_at`) VALUES
('notif_01', 'std_01', 'Event Reminder', 'CSE 242 Web Development Final Defense is scheduled for Dec 10, 10:00 AM in Lab 401.', 'event', FALSE, 'events.html', DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
('notif_02', 'std_01', 'Club Announcement', 'EDU Computer Club announced Fall Executive Member Recruitment.', 'club', FALSE, 'club-profile.html?id=club_01', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
('notif_03', 'std_01', 'New Connection', 'Raida Salsabil Sarwar connected with your profile.', 'connection', TRUE, 'profile.html?id=std_01', DATE_SUB(NOW(), INTERVAL 1 DAY)),
('notif_04', 'std_01', 'Registration Confirmed', 'Your seat for Intra-EDU Roborace 2026 is confirmed.', 'event', TRUE, 'events.html', DATE_SUB(NOW(), INTERVAL 2 DAY));

-- Academic Verifications Queue
INSERT INTO `academic_verifications` (`id`, `user_id`, `club_id`, `entity_type`, `entity_name`, `identifier`, `department`, `proof_document_path`, `status`, `reviewer_id`, `review_notes`, `submitted_at`, `reviewed_at`) VALUES
('verif_01', NULL, NULL, 'student', 'Tahmid Hasan', 'Student ID: 243019812', 'Computer Science & Engineering', 'EDU_Student_ID_Scan_243019812.pdf', 'Pending', NULL, NULL, '2026-11-17 11:30:00', NULL),
('verif_02', NULL, NULL, 'club', 'EDU Environmental & Green Society', 'Faculty Advisor: Dr. Munir Chowdhury', 'Student Affairs Council', 'Club_Charter_Application_Form.pdf', 'Pending', NULL, NULL, '2026-11-16 14:15:00', NULL),
('verif_03', 'std_01', 'club_01', 'student', 'Raida Salsabil Sarwar', 'Student ID: 243011912', 'Computer Science & Engineering', 'Official_Admission_Verification.pdf', 'Approved', 'admin_01', 'Official student credentials confirmed against registrar database.', '2026-11-01 09:00:00', '2026-11-01 10:30:00');

-- Moderation Reports
INSERT INTO `moderation_reports` (`id`, `reported_by`, `target_type`, `target_id`, `target_title`, `reason`, `status`, `action_taken`, `created_at`) VALUES
('rep_01', 'std_02', 'post', 'post_99', 'Commercial Advertisement in General Feed', 'Unapproved commercial solicitation violating university campus community guidelines.', 'Pending Review', NULL, '2026-11-17 16:30:00'),
('rep_02', 'std_03', 'user', 'std_temp_02', 'Duplicate Student ID Submission', 'Reported duplicate student ID number pending administrative cross-check.', 'Pending Review', NULL, '2026-11-16 13:10:00');

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- End of Database Definition Script
-- =============================================================================
