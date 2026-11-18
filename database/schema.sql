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
  `department` VARCHAR(150) NOT NULL DEFAULT 'Computer Science & Engineering',
  `semester` VARCHAR(50) DEFAULT '6th Semester',
  `avatar_url` TEXT,
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
  `cgpa` DECIMAL(3,2) DEFAULT 3.80,
  `skills` JSON NOT NULL,
  `interests` JSON NOT NULL,
  `github_url` VARCHAR(255),
  `linkedin_url` VARCHAR(255),
  `portfolio_url` VARCHAR(255),
  `projects_count` INT NOT NULL DEFAULT 0,
  `experience_years` INT NOT NULL DEFAULT 1,
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
  `tagline` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `advisor` VARCHAR(150) NOT NULL,
  `president_name` VARCHAR(150) NOT NULL,
  `president_email` VARCHAR(150) NOT NULL,
  `logo_url` TEXT NOT NULL,
  `cover_url` TEXT NOT NULL,
  `is_recruiting` BOOLEAN NOT NULL DEFAULT FALSE,
  `members_count` INT NOT NULL DEFAULT 0,
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

-- Table: events
-- Campus events, workshops, hackathons, and seminars
CREATE TABLE `events` (
  `id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `club_id` VARCHAR(36) DEFAULT NULL,
  `creator_id` VARCHAR(36) NOT NULL,
  `date_time` DATETIME NOT NULL,
  `location` VARCHAR(200) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `image_url` TEXT NOT NULL,
  `capacity` INT NOT NULL DEFAULT 100,
  `registered_count` INT NOT NULL DEFAULT 0,
  `is_official` BOOLEAN NOT NULL DEFAULT TRUE,
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
  `club_id` VARCHAR(36) DEFAULT NULL,
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
  `type` ENUM('event', 'club', 'social', 'admin', 'system') NOT NULL DEFAULT 'system',
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
-- 4. Seed Data Insertion (Real East Delta University Profiles)
-- -----------------------------------------------------------------------------

-- Real Faculty Administrator & CSE 242 Students
INSERT INTO `users` (`id`, `student_id`, `name`, `email`, `password_hash`, `role`, `department`, `semester`, `avatar_url`, `bio`, `status`) VALUES
('admin_01', 'FACULTY-CSE-242', 'Saraf Anika (Asst. Professor & Faculty Admin)', 'saraf.anika@faculty.edu', 'admin123', 'admin', 'CSE, SoSET, East Delta University', 'Faculty Advisor', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80', 'Assistant Professor at Department of Computer Science & Engineering, SoSET, East Delta University. Course Instructor for CSE 242: Web Development.', 'Verified'),
('std_01', '243011912', 'Raida Salsabil Sarwar', 'raida.sarwar@student.edu', 'student123', 'student', 'Computer Science & Engineering', '6th Semester', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80', 'CSE Undergraduate at East Delta University. Full-Stack Web Enthusiast, Competitive Programmer & EDU Computer Club Executive Member.', 'Verified'),
('std_02', '243007712', 'Pritam Barua', 'pritam.barua@student.edu', 'student123', 'student', 'Computer Science & Engineering', '6th Semester', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', 'CSE Student at East Delta University. Backend Developer, Cloud & Distributed Systems Explorer, Python & Node.js Developer.', 'Verified'),
('std_03', '243009912', 'Fardin Tajwar Chowdhury', 'fardin.tajwar@student.edu', 'student123', 'student', 'Computer Science & Engineering', '6th Semester', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', 'Undergraduate at East Delta University. UI/UX Specialist & Frontend Engineer. Passionate about design systems and responsive architecture.', 'Verified'),
('std_04', '243007512', 'Md. Omar Mahabub', 'omar.mahabub@student.edu', 'student123', 'student', 'Computer Science & Engineering', '6th Semester', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80', 'CSE Undergrad at East Delta University. Data Science Enthusiast, Machine Learning Researcher & Robotics Hobbyist at EDURC.', 'Verified'),
('std_05', '243015112', 'Anika Thashen Autshe', 'anika.thashen@student.edu', 'student123', 'student', 'Computer Science & Engineering', '6th Semester', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 'Computer Science & Engineering student at East Delta University. Cyber Security Analyst & Quality Assurance Engineer.', 'Verified'),
('std_06', '243019812', 'Tanvir Ahmed', 'tanvir.ahmed@student.edu', 'student123', 'student', 'Electrical & Electronic Engineering', '5th Semester', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80', 'EEE student passionate about embedded IoT systems, robotics and hardware-software integration.', 'Pending Verification'),
('std_07', '243018412', 'Sadia Afrin', 'sadia.afrin@student.edu', 'student123', 'student', 'Business Administration', '7th Semester', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80', 'BBA Major in Marketing. Event coordinator at EDU Business Club and debate enthusiast.', 'Verified');

-- Student Profiles (Skills, Interests, and Portfolios)
INSERT INTO `student_profiles` (`user_id`, `cgpa`, `skills`, `interests`, `github_url`, `linkedin_url`, `portfolio_url`, `projects_count`, `experience_years`) VALUES
('std_01', 3.88, '["React", "Node.js", "Python", "MySQL", "Bootstrap", "Git"]', '["Web Development", "Artificial Intelligence", "Competitive Programming", "Campus Hackathons"]', 'https://github.com/raida-sarwar', 'https://linkedin.com/in/raida-sarwar', 'https://raida.dev', 6, 2),
('std_02', 3.85, '["Python", "Node.js", "Docker", "MySQL", "REST APIs", "AWS"]', '["Cloud Computing", "Distributed Systems", "Backend Architecture", "Open Source"]', 'https://github.com/pritam-barua', 'https://linkedin.com/in/pritam-barua', 'https://pritambarua.dev', 5, 2),
('std_03', 3.82, '["UI/UX Design", "Figma", "HTML5", "CSS3", "JavaScript", "React"]', '["Design Systems", "Accessible UX", "Frontend Frameworks", "Mobile-First Design"]', 'https://github.com/fardin-tajwar', 'https://linkedin.com/in/fardin-tajwar', 'https://fardintajwar.design', 7, 2),
('std_04', 3.79, '["Python", "TensorFlow", "Pandas", "Scikit-Learn", "Computer Vision", "SQL"]', '["Machine Learning", "Robotics", "Data Visualization", "IoT Sensors"]', 'https://github.com/omar-mahabub', 'https://linkedin.com/in/omar-mahabub', 'https://omarmahabub.ai', 4, 2),
('std_05', 3.84, '["Cybersecurity", "Network Security", "Python", "Linux", "Ethical Hacking", "QA Testing"]', '["Network Defense", "Penetration Testing", "Security Auditing", "Cryptography"]', 'https://github.com/anika-autshe', 'https://linkedin.com/in/anika-autshe', 'https://anikaautshe.tech', 4, 2),
('std_06', 3.65, '["C++", "Arduino", "Circuit Design", "MATLAB", "IoT", "Embedded C"]', '["Robotics", "IoT Automation", "Renewable Energy", "Hardware Prototyping"]', 'https://github.com/tanvir-ahmed', 'https://linkedin.com/in/tanvir-ahmed', NULL, 3, 1),
('std_07', 3.75, '["Digital Marketing", "Content Strategy", "Public Relations", "Project Management"]', '["Club Leadership", "Campus Outreach", "Debate & Public Speaking", "Case Competitions"]', NULL, 'https://linkedin.com/in/sadia-afrin', NULL, 5, 2);

-- Real East Delta University Student Clubs
INSERT INTO `clubs` (`id`, `name`, `short_name`, `category`, `tagline`, `description`, `advisor`, `president_name`, `president_email`, `logo_url`, `cover_url`, `is_recruiting`, `members_count`) VALUES
('club_01', 'EDU Computer Club', 'EDUCC', 'Technology & Computing', 'Empowering Tomorrow\'s Technologists Today', 'The premier technology and computer science hub at East Delta University. EDUCC organizes competitive programming contests, web development bootcamps, technical workshops, and the flagship annual HackEDU hackathon.', 'Asst. Prof. Saraf Anika, Dept. of CSE', 'Raida Salsabil Sarwar', 'raida.sarwar@student.edu', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80', TRUE, 142),
('club_02', 'EDU Robotics Club', 'EDURC', 'Robotics & Automation', 'Innovating Through Mechanics, Electronics & AI', 'EDURC is the hardware and embedded innovation core of East Delta University. Members collaborate on Autonomous Line Followers, BattleBots, Drone technologies, and IoT automation platforms.', 'Dr. Md. Nazmul Haque, Associate Professor, EEE', 'Md. Omar Mahabub', 'omar.mahabub@student.edu', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', TRUE, 88),
('club_03', 'EDU Programming Club', 'EDUPC', 'Competitive Programming', 'Code, Optimize, Compete & Conquer', 'Dedicated to competitive programming, algorithmic mastery, and ICPC preparatory bootcamps. Weekly problem-solving contests on Codeforces, AtCoder, and LeetCode platforms.', 'Engr. Mohammad Farhan, Senior Lecturer, CSE', 'Pritam Barua', 'pritam.barua@student.edu', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80', TRUE, 115),
('club_04', 'EDU Business Club', 'EDUBC', 'Business & Leadership', 'Cultivating the Next Generation of Industry Leaders', 'EDU Business Club bridges academia with corporate leadership. We host national business case competitions, startup pitch challenges, and corporate executive seminars.', 'Prof. Dr. Jamal Hossain, Dean, School of Business', 'Sadia Afrin', 'sadia.afrin@student.edu', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80', FALSE, 96),
('club_05', 'EDU Cultural Club', 'EDU Cultural', 'Arts & Culture', 'Celebrating Heritage, Music, Drama & Campus Creativity', 'The creative pulse of East Delta University. Hosting annual cultural galas, Pohela Boishakh celebrations, dramatic productions, and campus musical concerts.', 'Ms. Farhana Yasmin, Lecturer, English Dept.', 'Fardin Tajwar Chowdhury', 'fardin.tajwar@student.edu', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80', TRUE, 130),
('club_06', 'EDU Debate Society', 'EDUDC', 'Debate & Public Speaking', 'Articulating Ideas, Challenging Perspections', 'Fostering parliamentary debate, critical discourse, public speaking proficiency, and analytical reasoning across international and national circuits.', 'Dr. Shamima Nasrin, Dept. of General Education', 'Anika Thashen Autshe', 'anika.thashen@student.edu', 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80', FALSE, 65);

-- Club Memberships
INSERT INTO `club_members` (`club_id`, `user_id`, `member_role`) VALUES
('club_01', 'std_01', 'president'),
('club_01', 'std_02', 'lead'),
('club_01', 'std_03', 'executive'),
('club_02', 'std_04', 'president'),
('club_02', 'std_06', 'executive'),
('club_03', 'std_02', 'president'),
('club_03', 'std_01', 'executive'),
('club_04', 'std_07', 'president'),
('club_05', 'std_03', 'president'),
('club_06', 'std_05', 'president');

-- Club Followers
INSERT INTO `club_followers` (`club_id`, `user_id`) VALUES
('club_01', 'std_01'),
('club_01', 'std_02'),
('club_01', 'std_03'),
('club_02', 'std_01'),
('club_02', 'std_04'),
('club_03', 'std_01'),
('club_03', 'std_02'),
('club_05', 'std_03'),
('club_06', 'std_05');

-- University Events
INSERT INTO `events` (`id`, `title`, `club_id`, `creator_id`, `date_time`, `location`, `category`, `description`, `image_url`, `capacity`, `registered_count`, `is_official`, `status`) VALUES
('evt_01', 'HackEDU 2026: 36-Hour National Campus Hackathon', 'club_01', 'std_01', '2026-12-05 09:00:00', 'EDU Main Auditorium & Lab 401-404', 'Hackathon & Tech', 'East Delta University\'s flagship 36-hour non-stop collegiate hackathon organized by EDUCC. Solve real-world civic, education, and health problems. Free food, mentor guidance, and 100,000 BDT in prizes!', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80', 250, 184, TRUE, 'upcoming'),
('evt_02', 'Autonomous Line Follower & Maze Solver Workshop', 'club_02', 'std_04', '2026-11-28 14:00:00', 'Robotics & Hardware Lab, Room 302', 'Robotics & Hardware', 'Hands-on practical hardware workshop hosted by EDURC. Learn sensor calibration, PID algorithm tuning, and motor driver integration using Arduino and ESP32.', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80', 45, 39, TRUE, 'upcoming'),
('evt_03', 'CSE 242 Web Development Final Project Defense', 'club_01', 'admin_01', '2026-11-24 10:00:00', 'SoSET Conference Hall, Academic Building 2', 'Academic Defense', 'Final project demonstration, live code review, and interactive defense for CSE 242 Web Development (Fall 2026). Evaluated by Asst. Prof. Saraf Anika.', 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80', 80, 52, TRUE, 'upcoming'),
('evt_04', 'Inter-University Competitive Programming Contest', 'club_03', 'std_02', '2026-12-12 09:30:00', 'Central Computing Center, Labs 1 & 2', 'Competitive Programming', 'ICPC-preliminary formatted 5-hour competitive programming competition featuring challenging algorithmic problems in dynamic programming, graphs, and number theory.', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80', 120, 85, TRUE, 'upcoming'),
('evt_05', 'EDU Winter Cultural Gala 2026', 'club_05', 'std_03', '2026-12-20 18:00:00', 'EDU Amphitheater & Green Lawn', 'Cultural & Arts', 'Annual university musical extravaganza, drama performance, and acoustic concert showcasing student musicians and performing artists across all departments.', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80', 500, 310, TRUE, 'upcoming');

-- Event Registrations
INSERT INTO `event_registrations` (`event_id`, `user_id`, `status`) VALUES
('evt_01', 'std_01', 'registered'),
('evt_01', 'std_02', 'registered'),
('evt_01', 'std_03', 'registered'),
('evt_02', 'std_04', 'registered'),
('evt_02', 'std_06', 'registered'),
('evt_03', 'std_01', 'registered'),
('evt_03', 'std_02', 'registered'),
('evt_03', 'std_03', 'registered'),
('evt_03', 'std_04', 'registered'),
('evt_03', 'std_05', 'registered');

-- Algorithmic Newsfeed Posts
INSERT INTO `posts` (`id`, `author_id`, `club_id`, `title`, `content`, `category`, `media_url`, `likes_count`, `comments_count`, `priority_score`, `is_pinned`) VALUES
('post_01', 'std_01', 'club_01', 'HackEDU 2026 Registration is Officially Live!', 'Registration for East Delta University\'s biggest hackathon of the year is now officially open! Join us for 36 hours of coding, rapid prototyping, and industry mentoring. 100K BDT cash prize pool + internship opportunities.', 'announcement', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80', 64, 18, 98, TRUE),
('post_02', 'admin_01', NULL, 'CSE 242 Project Defense Schedule & Presentation Guidelines', 'All student teams enrolled in CSE 242 Web Development: Please note that the final project defense takes place on Tuesday, Nov 24 at 10:00 AM in the SoSET Conference Hall. Ensure your live demo, MySQL schema DDL, and responsive designs are verified.', 'academic', 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80', 45, 12, 92, TRUE),
('post_03', 'std_04', 'club_02', 'EDURC Autonomous Line Follower Championship Kit Revealed', 'Get ready for next week\'s hands-on robotics workshop! Our team has assembled 30 high-speed chassis kits with IR sensor arrays and ESP32 microcontrollers. Seats are filling fast!', 'event_recap', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80', 38, 9, 78, FALSE),
('post_04', 'std_02', 'club_03', 'EDUPC Weekly Competitive Contest #48 Editorial Published', 'Congratulations to all 58 participants in yesterday\'s algorithmic contest! The problem editorial and C++/Python reference solutions for problems A through F are now uploaded to our club repository.', 'discussion', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80', 29, 7, 71, FALSE);

-- Post Likes
INSERT INTO `post_likes` (`post_id`, `user_id`) VALUES
('post_01', 'std_01'),
('post_01', 'std_02'),
('post_01', 'std_03'),
('post_01', 'std_04'),
('post_02', 'std_01'),
('post_02', 'std_02'),
('post_03', 'std_04'),
('post_04', 'std_02');

-- Post Comments
INSERT INTO `post_comments` (`post_id`, `user_id`, `comment_text`) VALUES
('post_01', 'std_02', 'Looking forward to building our team solution! Backend infrastructure is ready.'),
('post_01', 'std_03', 'Frontend UI kit and responsive design system ready to deploy!'),
('post_02', 'std_01', 'Thank you Ma\'am! Our team has finished the MySQL schema and recommendation engine.'),
('post_03', 'std_06', 'Can students from EEE bring their custom motor drivers? Excited for this!');

-- Notifications
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `link_url`) VALUES
('notif_01', 'std_01', 'CSE 242 Defense Scheduled', 'Asst. Prof. Saraf Anika scheduled the CSE 242 Final Defense for Nov 24, 10:00 AM.', 'academic', FALSE, 'events.html'),
('notif_02', 'std_01', 'New Event: HackEDU 2026', 'EDU Computer Club published registration for the 36-hour National Hackathon.', 'event', FALSE, 'events.html'),
('notif_03', 'std_01', 'Identity Verified', 'Your official student profile has been verified by the university administration.', 'admin', TRUE, 'profile.html');

-- Academic Verifications Queue
INSERT INTO `academic_verifications` (`id`, `user_id`, `club_id`, `entity_type`, `entity_name`, `identifier`, `department`, `proof_document_path`, `status`, `reviewer_id`, `review_notes`, `submitted_at`, `reviewed_at`) VALUES
('verif_01', 'std_06', NULL, 'student', 'Tanvir Ahmed', 'Student ID: 243019812', 'Electrical & Electronic Engineering', 'EDU_Student_ID_Scan_243019812.pdf', 'Pending', NULL, NULL, '2026-11-17 11:30:00', NULL),
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
