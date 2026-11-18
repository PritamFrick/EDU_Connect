/**
 * EDUConnect - Central Data Model & Storage Management (data.js)
 * Created for CSE 242: Web Development - East Delta University (Fall 26)
 * Instructor: Saraf Anika, Asst. Professor, CSE, SoSET, EDU
 *
 * Team Members:
 * - Raida Salsabil Sarwar (243011912)
 * - Pritam Barua (243007712)
 * - Fardin Tajwar Chowdhury (243009912)
 * - Md. Omar Mahabub (243007512)
 * - Anika Thashen Autshe (243015112)
 */

/* ==========================================================================
   1. LocalStorage Keys Configuration
   ========================================================================== */

const STORAGE_KEYS = {
  CURRENT_USER: 'edu_current_user',
  STUDENTS: 'edu_students',
  CLUBS: 'edu_clubs',
  EVENTS: 'edu_events',
  POSTS: 'edu_posts',
  NOTIFICATIONS: 'edu_notifications',
  VERIFICATIONS: 'edu_verifications',
  REPORTS: 'edu_reports'
};

/* ==========================================================================
   2. Real University Students Seed Dataset
   ========================================================================== */

const INITIAL_STUDENTS = [
  {
    id: 'std_01',
    studentId: '243011912',
    name: 'Raida Salsabil Sarwar',
    email: 'raida.sarwar@student.edu',
    password: 'student123',
    role: 'student',
    department: 'Computer Science & Engineering',
    semester: '6th Semester',
    cgpa: '3.92',
    bio: 'CSE undergraduate student at East Delta University. Full-stack developer and UI/UX designer. Passionate about human-computer interaction, responsive web apps, and database engineering.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    skills: ['JavaScript', 'HTML5', 'CSS3', 'Bootstrap', 'PHP', 'MySQL', 'React', 'Figma'],
    interests: ['Web Architecture', 'Accessibility', 'Cloud Databases', 'UI Design'],
    achievements: [
      'CSE 242 Web Development Lead - EDUConnect Platform',
      'Vice President - EDU Computer Club (EDUCC)',
      'Dean\'s Honor List (Spring 2024, Fall 2024)'
    ],
    clubs: [
      { id: 'club_01', name: 'EDU Computer Club', role: 'Vice President' }
    ],
    status: 'Verified',
    connectionsCount: 142,
    followingClubs: ['club_01', 'club_02', 'club_03'],
    connectedStudents: ['std_02', 'std_03', 'std_04', 'std_05']
  },
  {
    id: 'std_02',
    studentId: '243007712',
    name: 'Pritam Barua',
    email: 'pritam.barua@student.edu',
    password: 'student123',
    role: 'student',
    department: 'Computer Science & Engineering',
    semester: '6th Semester',
    cgpa: '3.88',
    bio: 'CSE undergrad focusing on frontend systems, responsive web apps, and autonomous robotics hardware. President of the EDU Robotics Club.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    skills: ['JavaScript', 'Bootstrap', 'Node.js', 'MySQL', 'Embedded C', 'Arduino', 'Git'],
    interests: ['Frontend Engineering', 'Robotics', 'Web Performance', 'Hardware Automation'],
    achievements: [
      'President - EDU Robotics Club (EDURC)',
      'Champion - Inter-University Roborace 2024',
      'Co-creator of EDUConnect Platform'
    ],
    clubs: [
      { id: 'club_02', name: 'EDU Robotics Club', role: 'President' }
    ],
    status: 'Verified',
    connectionsCount: 128,
    followingClubs: ['club_01', 'club_02'],
    connectedStudents: ['std_01', 'std_03']
  },
  {
    id: 'std_03',
    studentId: '243009912',
    name: 'Fardin Tajwar Chowdhury',
    email: 'fardin.chowdhury@student.edu',
    password: 'student123',
    role: 'student',
    department: 'Computer Science & Engineering',
    semester: '6th Semester',
    cgpa: '3.85',
    bio: 'Backend developer and competitive programmer. Interested in RESTful web services, algorithmic problem solving, and relational database normalization.',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    skills: ['C++', 'Python', 'PHP', 'MySQL', 'Algorithms', 'Data Structures', 'Linux'],
    interests: ['Competitive Programming', 'Database Systems', 'Backend APIs', 'System Security'],
    achievements: [
      'General Secretary - EDU Programming Club (EDUPC)',
      'Solved 500+ problems on Codeforces & LeetCode',
      'Co-creator of EDUConnect Platform'
    ],
    clubs: [
      { id: 'club_03', name: 'EDU Programming Club', role: 'General Secretary' }
    ],
    status: 'Verified',
    connectionsCount: 115,
    followingClubs: ['club_01', 'club_03'],
    connectedStudents: ['std_01', 'std_02', 'std_04']
  },
  {
    id: 'std_04',
    studentId: '243007512',
    name: 'Md. Omar Mahabub',
    email: 'omar.mahabub@student.edu',
    password: 'student123',
    role: 'student',
    department: 'Computer Science & Engineering',
    semester: '6th Semester',
    cgpa: '3.82',
    bio: 'Passionate full-stack developer and IoT enthusiast. Focused on building real-time campus applications and collaborative platforms.',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    skills: ['HTML5', 'CSS3', 'JavaScript', 'Python', 'MySQL', 'Embedded Systems', 'Git'],
    interests: ['IoT Solutions', 'Full-Stack Web', 'Automation', 'DevOps'],
    achievements: [
      'Technical Associate - EDU Robotics Club',
      'Co-creator of EDUConnect Platform',
      'Dean\'s Merit Award'
    ],
    clubs: [
      { id: 'club_02', name: 'EDU Robotics Club', role: 'Technical Associate' }
    ],
    status: 'Verified',
    connectionsCount: 96,
    followingClubs: ['club_02', 'club_06'],
    connectedStudents: ['std_01', 'std_03']
  },
  {
    id: 'std_05',
    studentId: '243015112',
    name: 'Anika Thashen Autshe',
    email: 'anika.autshe@student.edu',
    password: 'student123',
    role: 'student',
    department: 'Computer Science & Engineering',
    semester: '6th Semester',
    cgpa: '3.86',
    bio: 'Computer Science undergrad with passion for user-centered web accessibility, digital design, and software verification.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    skills: ['UI/UX Design', 'JavaScript', 'HTML5', 'CSS3', 'Accessibility (a11y)', 'MySQL', 'Figma'],
    interests: ['Digital Accessibility', 'UI Design', 'Cultural Events', 'Tech Communities'],
    achievements: [
      'Executive Member - EDU Cultural Club',
      'Accessibility Lead - EDUConnect Platform',
      'Dean\'s Honor List'
    ],
    clubs: [
      { id: 'club_05', name: 'EDU Cultural Club', role: 'Executive Member' }
    ],
    status: 'Verified',
    connectionsCount: 110,
    followingClubs: ['club_01', 'club_05'],
    connectedStudents: ['std_01', 'std_04']
  },
  {
    id: 'std_06',
    studentId: '242003412',
    name: 'Tanvir Ahmed',
    email: 'tanvir.ahmed@student.edu',
    password: 'student123',
    role: 'student',
    department: 'Electrical & Electronic Engineering',
    semester: '6th Semester',
    cgpa: '3.78',
    bio: 'EEE student specializing in smart grid sensors, circuit simulation, and microcontroller firmware. Active robotics builder.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    skills: ['Embedded C', 'MATLAB', 'Circuit Design', 'Arduino', 'IoT'],
    interests: ['Robotics', 'Hardware Automation', 'Clean Energy'],
    achievements: [
      'Runner-Up - Intra-EDU Hardware Showcase 2024'
    ],
    clubs: [
      { id: 'club_02', name: 'EDU Robotics Club', role: 'Hardware Member' }
    ],
    status: 'Verified',
    connectionsCount: 82,
    followingClubs: ['club_02'],
    connectedStudents: ['std_02', 'std_04']
  },
  {
    id: 'std_07',
    studentId: '241009112',
    name: 'Sadia Chowdhury',
    email: 'sadia.chowdhury@student.edu',
    password: 'student123',
    role: 'student',
    department: 'Business Administration (BBA)',
    semester: '8th Semester',
    cgpa: '3.84',
    bio: 'BBA major with concentrations in Corporate Finance and Brand Strategy. President of EDU Business Club.',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    skills: ['Brand Strategy', 'Financial Modeling', 'Public Speaking', 'Marketing'],
    interests: ['FinTech', 'Startup Strategy', 'Public Relations'],
    achievements: [
      'Finalist - National Business Case Battle 2024',
      'President - EDU Business Club'
    ],
    clubs: [
      { id: 'club_04', name: 'EDU Business Club', role: 'President' }
    ],
    status: 'Verified',
    connectionsCount: 165,
    followingClubs: ['club_04', 'club_06'],
    connectedStudents: ['std_01', 'std_05']
  }
];

/* ==========================================================================
   3. Faculty & Administrative Personnel
   ========================================================================== */

const FACULTY_ADMIN = {
  id: 'admin_01',
  studentId: 'FACULTY-CSE-242',
  name: 'Saraf Anika (Asst. Professor & Faculty Admin)',
  email: 'saraf.anika@faculty.edu',
  password: 'admin123',
  role: 'admin',
  department: 'CSE, SoSET, East Delta University',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  status: 'Verified',
  followingClubs: ['club_01', 'club_02', 'club_03', 'club_04', 'club_05', 'club_06'],
  connectedStudents: []
};

const CLUB_REPRESENTATIVES = [
  {
    id: 'club_rep_01',
    studentId: '243007712',
    name: 'Pritam Barua (EDURC President)',
    email: 'robotics.lead@student.edu',
    password: 'clubrep123',
    role: 'club_rep',
    clubId: 'club_02',
    department: 'Computer Science & Engineering',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    status: 'Verified',
    followingClubs: ['club_02'],
    connectedStudents: ['std_01', 'std_03']
  }
];

/* ==========================================================================
   4. East Delta University Registered Clubs Dataset
   ========================================================================== */

const INITIAL_CLUBS = [
  {
    id: 'club_01',
    name: 'EDU Computer Club',
    tagline: 'Code, workshops, and innovative software for student developers.',
    category: 'Technology & Engineering',
    established: '2015',
    membersCount: 420,
    advisor: 'Dr. Mohammad Karim, Professor, Dept. of CSE',
    logo: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    about: 'EDU Computer Club is the university\'s flagship computing organization. We organize yearly hackathons, tech talks with software industry leaders, open-source sprints, and developer bootcamps.',
    socials: {
      website: 'https://educomputerclub.org',
      facebook: 'https://facebook.com/educomputerclub',
      github: 'https://github.com/edu-computer-club',
      linkedin: 'https://linkedin.com/company/edu-computer-club'
    },
    followersCount: 890,
    isRecruiting: true,
    recruitmentDetails: 'Fall 2026 Executive Member Recruitment is now open! Positions: Web Developer, UI Designer, and Content Lead.',
    achievements: [
      'Best Co-Curricular University Club Award 2024',
      'Hosted National Hackathon 2023 with 60 university teams'
    ]
  },
  {
    id: 'club_02',
    name: 'EDU Robotics Club',
    tagline: 'Autonomous robotics, embedded systems, and artificial intelligence.',
    category: 'Robotics & Hardware',
    established: '2017',
    membersCount: 260,
    advisor: 'Dr. Shahriar Alam, Dept. of EEE',
    logo: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=1200&q=80',
    about: 'EDU Robotics Club brings together engineers from CSE, EEE, and Mechanical backgrounds. We build autonomous ground rovers, IoT sensors, aerial drones, and AI-driven automation systems.',
    socials: {
      website: 'https://edurobotics.org',
      facebook: 'https://facebook.com/edurobotics',
      github: 'https://github.com/edu-robotics',
      linkedin: 'https://linkedin.com/company/edu-robotics'
    },
    followersCount: 650,
    isRecruiting: true,
    recruitmentDetails: 'Intake open for Hardware Workshop and Roborace Team members.',
    achievements: [
      'National Champions in Line Follower Robot Challenge 2024',
      'Developed Smart Campus Environmental Monitor'
    ]
  },
  {
    id: 'club_03',
    name: 'EDU Programming Club',
    tagline: 'Algorithms, competitive programming, and problem solving excellence.',
    category: 'Competitive Coding',
    established: '2014',
    membersCount: 380,
    advisor: 'Asst. Prof. Sabrina Haque, Dept. of CSE',
    logo: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    about: 'We train university programmers for the ICPC, National Collegiate Programming Contests (NCPC), and software engineering interviews through weekly contests and masterclasses.',
    socials: {
      facebook: 'https://facebook.com/eduprogramming',
      github: 'https://github.com/edu-cpc',
      linkedin: 'https://linkedin.com/company/edu-cpc'
    },
    followersCount: 780,
    isRecruiting: true,
    recruitmentDetails: 'Registration is open for the Freshers Problem Solving Bootcamp.',
    achievements: [
      'Qualified for ICPC Asia Regional Finals 4 consecutive years',
      'Top 10 standing in National Collegiate Programming Contest 2023'
    ]
  },
  {
    id: 'club_04',
    name: 'EDU Business Club',
    tagline: 'Empowering future entrepreneurs, analysts, and corporate leaders.',
    category: 'Business & Leadership',
    established: '2016',
    membersCount: 310,
    advisor: 'Dr. Rafiqul Islam, Dept. of Business Administration',
    logo: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    about: 'EDU Business Club covers strategy, finance, startup pitching, and case analysis. We host inter-university business battles and connect students with multinational executives.',
    socials: {
      facebook: 'https://facebook.com/edubusinessclub',
      linkedin: 'https://linkedin.com/company/edubusinessclub'
    },
    followersCount: 520,
    isRecruiting: true,
    recruitmentDetails: 'Seeking student ambassadors for upcoming Brandfest 2026.',
    achievements: [
      'Organized EDU Intra-University Business Case Competition 2024',
      'Mentored 3 student startups to seed grant funding'
    ]
  },
  {
    id: 'club_05',
    name: 'EDU Cultural Club',
    tagline: 'Celebrating music, performing arts, drama, and campus tradition.',
    category: 'Art & Culture',
    established: '2013',
    membersCount: 450,
    advisor: 'Prof. Anwara Begum, Dept. of English',
    logo: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    about: 'The heart of campus musical and cultural celebrations. We produce acoustic open-mic sessions, spring festivals, theatre plays, and seasonal concerts.',
    socials: {
      facebook: 'https://facebook.com/educulturalclub',
      instagram: 'https://instagram.com/educultural'
    },
    followersCount: 910,
    isRecruiting: false,
    recruitmentDetails: 'Auditions for Spring Festival musical performance will open soon.',
    achievements: [
      'Best Cultural Performance in Inter-University Youth Fest 2023',
      'Annual campus concert with 3,000+ attendee turnout'
    ]
  },
  {
    id: 'club_06',
    name: 'EDU Debate Society',
    tagline: 'Critical thinking, rhetoric, and British Parliamentary debate.',
    category: 'Debate & Public Speaking',
    established: '2016',
    membersCount: 290,
    advisor: 'Dr. Shahana Akhter, Dept. of English & Humanities',
    logo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
    about: 'EDU Debate Society trains students in British Parliamentary, Asian Parliamentary, and Bangla debate formats. We foster critical reasoning and public rhetoric.',
    socials: {
      facebook: 'https://facebook.com/edudebatesociety',
      linkedin: 'https://linkedin.com/company/edudebatesociety'
    },
    followersCount: 640,
    isRecruiting: true,
    recruitmentDetails: 'Intra-University Freshers Debate Championship registration open!',
    achievements: [
      'Champions - National Youth Parliamentary Debate 2024',
      'Best Speaker Award at Inter-University Championship 2023'
    ]
  }
];

/* ==========================================================================
   5. Campus Events & Workshops Dataset
   ========================================================================== */

const INITIAL_EVENTS = [
  {
    id: 'evt_01',
    title: 'CSE 242 Web Development Final Defense & Project Showcase',
    clubId: 'club_01',
    clubName: 'EDU Computer Club',
    category: 'Hackathon',
    date: '2026-12-10',
    time: '10:00 AM - 04:00 PM',
    location: 'Lab Room 401, SoSET Academic Building',
    description: 'Final evaluation and project defense for CSE 242: Web Development. Student groups will present their production web systems before course instructor Asst. Professor Saraf Anika.',
    banner: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80',
    seatsTotal: 120,
    seatsRegistered: 95,
    registeredUserIds: ['std_01', 'std_02', 'std_03', 'std_04', 'std_05'],
    isRegistrationOpen: true
  },
  {
    id: 'evt_02',
    title: 'Intra-EDU Autonomous Roborace & Hardware Exhibition 2026',
    clubId: 'club_02',
    clubName: 'EDU Robotics Club',
    category: 'Workshop',
    date: '2026-11-25',
    time: '02:00 PM - 06:00 PM',
    location: 'Open Amphitheatre & Robotics Arena',
    description: 'Compete in autonomous line following, obstacle navigation, and IoT innovations. Certificates, trophies, and cash prizes for top three hardware teams.',
    banner: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80',
    seatsTotal: 80,
    seatsRegistered: 68,
    registeredUserIds: ['std_01', 'std_02', 'std_06'],
    isRegistrationOpen: true
  },
  {
    id: 'evt_03',
    title: 'ICPC Regional Preparation Contest & Mock Round',
    clubId: 'club_03',
    clubName: 'EDU Programming Club',
    category: 'Coding',
    date: '2026-11-28',
    time: '02:00 PM - 07:00 PM',
    location: 'CSE Department Main Lab (3rd Floor)',
    description: 'A 5-hour mock contest following international ACM-ICPC standards. Teams of 3 members will solve 10 algorithmic challenges.',
    banner: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80',
    seatsTotal: 90,
    seatsRegistered: 74,
    registeredUserIds: ['std_03', 'std_04'],
    isRegistrationOpen: true
  },
  {
    id: 'evt_04',
    title: 'EDU Intra-University Business Case Competition 2026',
    clubId: 'club_04',
    clubName: 'EDU Business Club',
    category: 'Business',
    date: '2026-12-05',
    time: '10:00 AM - 04:00 PM',
    location: 'Business School Seminar Hall',
    description: 'Develop actionable corporate turnaround strategies judged by corporate leaders from multinational FMCG and telecom brands.',
    banner: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1000&q=80',
    seatsTotal: 100,
    seatsRegistered: 52,
    registeredUserIds: ['std_07'],
    isRegistrationOpen: true
  },
  {
    id: 'evt_05',
    title: 'Acoustic Musical Evening & Open Mic Night',
    clubId: 'club_05',
    clubName: 'EDU Cultural Club',
    category: 'Cultural',
    date: '2026-12-12',
    time: '05:30 PM - 09:00 PM',
    location: 'Campus Open Air Amphitheatre',
    description: 'An open-air evening of student bands, solo singing, and spoken word poetry. Free admission for all verified East Delta University students.',
    banner: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1000&q=80',
    seatsTotal: 300,
    seatsRegistered: 215,
    registeredUserIds: ['std_01', 'std_05'],
    isRegistrationOpen: true
  }
];

/* ==========================================================================
   6. Campus Feed Posts Dataset
   ========================================================================== */

const INITIAL_POSTS = [
  {
    id: 'post_01',
    authorType: 'club',
    authorId: 'club_01',
    authorName: 'EDU Computer Club',
    authorAvatar: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=300&q=80',
    timestamp: '1 hour ago',
    title: 'CSE 242 Web Development Showcase Schedule Released!',
    content: 'The official presentation schedule for CSE 242 project defenses is now published. All project groups should arrive at Lab 401 by 09:45 AM on December 10 with working prototypes and documentation.',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80',
    likesCount: 62,
    commentsCount: 14,
    likedByCurrentUser: false,
    isEvent: true
  },
  {
    id: 'post_02',
    authorType: 'club',
    authorId: 'club_02',
    authorName: 'EDU Robotics Club',
    authorAvatar: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=300&q=80',
    timestamp: '3 hours ago',
    title: 'Intra-EDU Roborace 2026 Track Layout Revealed!',
    content: 'Get your bots calibrated! The track layout for our upcoming line follower challenge features dual hairpin turns and an elevated bridge section. Check the Events page to register your team.',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80',
    likesCount: 48,
    commentsCount: 9,
    likedByCurrentUser: false,
    isEvent: true
  },
  {
    id: 'post_03',
    authorType: 'student',
    authorId: 'std_01',
    authorName: 'Raida Salsabil Sarwar',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    timestamp: '5 hours ago',
    title: 'EDUConnect is ready for peer review across East Delta University!',
    content: 'We have updated EDUConnect with responsive layouts, accessible navigation, real student profiles, and algorithmic recommendations. Please explore the platform and connect with peers across departments!',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
    likesCount: 94,
    commentsCount: 21,
    likedByCurrentUser: true,
    isEvent: false
  },
  {
    id: 'post_04',
    authorType: 'student',
    authorId: 'std_02',
    authorName: 'Pritam Barua',
    authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    timestamp: 'Yesterday at 4:30 PM',
    title: 'Autonomous Rover Sensor Telemetry Complete',
    content: 'Successfully tested our ultrasonic & LiDAR sensor array on the EDURC rover platform. Ready for demonstration at the upcoming hardware fest!',
    image: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=1000&q=80',
    likesCount: 51,
    commentsCount: 8,
    likedByCurrentUser: false,
    isEvent: false
  },
  {
    id: 'post_05',
    authorType: 'student',
    authorId: 'std_03',
    authorName: 'Fardin Tajwar Chowdhury',
    authorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    timestamp: '2 days ago',
    title: 'ICPC Mock Round Problem Set Available',
    content: 'The problem set from our weekend mock contest has been uploaded to the programming club portal. Topics include Graph BFS/DFS, Segment Trees, and Dynamic Programming.',
    image: null,
    likesCount: 38,
    commentsCount: 6,
    likedByCurrentUser: false,
    isEvent: false
  }
];

/* ==========================================================================
   7. Notifications Dataset
   ========================================================================== */

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif_01',
    type: 'event',
    title: 'Event Reminder',
    message: 'CSE 242 Web Development Final Defense is scheduled for Dec 10, 10:00 AM in Lab 401.',
    timestamp: '30 mins ago',
    read: false,
    link: 'events.html'
  },
  {
    id: 'notif_02',
    type: 'club',
    title: 'Club Announcement',
    message: 'EDU Computer Club announced Fall Executive Member Recruitment.',
    timestamp: '2 hours ago',
    read: false,
    link: 'club-profile.html?id=club_01'
  },
  {
    id: 'notif_03',
    type: 'connection',
    title: 'New Connection',
    message: 'Raida Salsabil Sarwar connected with your profile.',
    timestamp: '1 day ago',
    read: true,
    link: 'profile.html?id=std_01'
  },
  {
    id: 'notif_04',
    type: 'event',
    title: 'Registration Confirmed',
    message: 'Your seat for Intra-EDU Roborace 2026 is confirmed.',
    timestamp: '2 days ago',
    read: true,
    link: 'events.html'
  }
];

/* ==========================================================================
   8. Academic Verifications & Moderation Reports
   ========================================================================== */

const INITIAL_VERIFICATIONS = [
  {
    id: 'verif_01',
    type: 'student',
    targetId: 'std_temp_01',
    name: 'Tahmid Hasan',
    identifier: 'Student ID: 243019812',
    department: 'Computer Science & Engineering',
    submittedAt: '2026-11-17 11:30 AM',
    proofDocument: 'EDU_Student_ID_Scan_243019812.pdf',
    status: 'Pending'
  },
  {
    id: 'verif_02',
    type: 'club',
    targetId: 'club_temp_01',
    name: 'EDU Environmental & Green Society',
    identifier: 'Faculty Advisor: Dr. Munir Chowdhury',
    department: 'Student Affairs Council',
    submittedAt: '2026-11-16 02:15 PM',
    proofDocument: 'Club_Charter_Application_Form.pdf',
    status: 'Pending'
  },
  {
    id: 'verif_03',
    type: 'student',
    targetId: 'std_01',
    name: 'Raida Salsabil Sarwar',
    identifier: 'Student ID: 243011912',
    department: 'Computer Science & Engineering',
    submittedAt: '2026-11-01 09:00 AM',
    proofDocument: 'Official_Admission_Verification.pdf',
    status: 'Approved'
  }
];

const INITIAL_REPORTS = [
  {
    id: 'rep_01',
    type: 'post',
    targetTitle: 'Commercial Advertisement in General Feed',
    reportedBy: 'Pritam Barua (std_02)',
    reason: 'Unapproved commercial solicitation violating university campus community guidelines.',
    status: 'Pending Review',
    timestamp: '2026-11-17 04:30 PM'
  },
  {
    id: 'rep_02',
    type: 'user',
    targetTitle: 'Duplicate Student ID Submission',
    reportedBy: 'Fardin Tajwar Chowdhury (std_03)',
    reason: 'Reported duplicate student ID number pending administrative cross-check.',
    status: 'Pending Review',
    timestamp: '2026-11-16 01:10 PM'
  }
];

/* ==========================================================================
   9. LocalStorage Persistence Utilities
   ========================================================================== */

/**
 * Safely parses and retrieves JSON data from LocalStorage.
 *
 * @template T
 * @param {string} key - The LocalStorage key identifier.
 * @param {T} defaultValue - Fallback value returned if the key is missing or parsing fails.
 * @returns {T} Parsed JavaScript value or the specified default.
 */
function getStorage(key, defaultValue) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error(`[EDUConnect] Failed to read key "${key}" from LocalStorage:`, e);
    return defaultValue;
  }
}

/**
 * Safely serializes and persists a JavaScript value into LocalStorage as JSON.
 *
 * @param {string} key - The LocalStorage key identifier.
 * @param {*} value - The JavaScript object, array, or primitive to store.
 */
function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`[EDUConnect] Failed to persist key "${key}" to LocalStorage:`, e);
  }
}

const DATA_SCHEMA_VERSION = '2026_FALL_CSE242_REAL_V2';

/**
 * Bootstraps the application's LocalStorage state with initial university records
 * on first launch or when the schema/seed version updates.
 * Automatically clears stale legacy mock caches to ensure real student accounts are active.
 * NOTE: Does NOT log in any user. Unauthenticated visitors must sign in.
 */
function initializeSeedData() {
  const currentVersion = localStorage.getItem('edu_data_version');
  const needsMigration = currentVersion !== DATA_SCHEMA_VERSION;

  if (needsMigration || !localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
    setStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    setStorage(STORAGE_KEYS.CLUBS, INITIAL_CLUBS);
    setStorage(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    setStorage(STORAGE_KEYS.POSTS, INITIAL_POSTS);
    setStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    setStorage(STORAGE_KEYS.VERIFICATIONS, INITIAL_VERIFICATIONS);
    setStorage(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    localStorage.setItem('edu_data_version', DATA_SCHEMA_VERSION);

    // If an old legacy mock session was active, reset session to require authentic login
    const session = getStorage(STORAGE_KEYS.CURRENT_USER, null);
    if (session && !INITIAL_STUDENTS.some(s => s.email === session.email) && session.email !== FACULTY_ADMIN.email) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }
}

// Automatically bootstrap seed data upon script execution
initializeSeedData();
const initializeDemoData = initializeSeedData;

/* ==========================================================================
   10. Recommendation Algorithm Engine
   ========================================================================== */

/**
 * Calculates a quantitative compatibility score between two students based on:
 * - Overlapping technical skills (25 points per match, up to 50 max)
 * - Shared extracurricular & research interests (20 points per match, up to 40 max)
 * - Academic department alignment (+15 points if same department)
 * - Experience / semester proximity (+10 points if within 1 semester)
 *
 * @param {Object} currentStudent - Active user student profile
 * @param {Object} candidate - Candidate student profile
 * @returns {Object} Compatibility report with percentage, sharedSkills, sharedInterests, and summary
 */
function calculateStudentRecommendation(currentStudent, candidate) {
  if (!currentStudent || !candidate) {
    return { percentage: 70, sharedSkills: [], sharedInterests: [], summary: 'Suggested Peer' };
  }

  const currentSkills = (currentStudent.skills || []).map(s => s.toLowerCase().trim());
  const candidateSkills = (candidate.skills || []).map(s => s.toLowerCase().trim());
  const sharedSkills = candidateSkills.filter(s => currentSkills.includes(s));

  const currentInterests = (currentStudent.interests || []).map(i => i.toLowerCase().trim());
  const candidateInterests = (candidate.interests || []).map(i => i.toLowerCase().trim());
  const sharedInterests = candidateInterests.filter(i => currentInterests.includes(i));

  let score = 25; // Base baseline score
  score += Math.min(sharedSkills.length * 25, 45);
  score += Math.min(sharedInterests.length * 20, 30);

  if (currentStudent.department && candidate.department && currentStudent.department === candidate.department) {
    score += 15;
  }

  // Cap normalized match percentage between 65% and 98%
  const percentage = Math.min(Math.max(score, 65), 98);

  const reasons = [];
  if (sharedSkills.length > 0) reasons.push(`${sharedSkills.length} Shared Skill${sharedSkills.length > 1 ? 's' : ''}`);
  if (sharedInterests.length > 0) reasons.push(`${sharedInterests.length} Mutual Interest${sharedInterests.length > 1 ? 's' : ''}`);
  if (currentStudent.department === candidate.department) reasons.push('Same Department');

  const summary = reasons.length > 0 ? reasons.join(' • ') : 'East Delta University Student';

  return {
    percentage,
    sharedSkills,
    sharedInterests,
    summary
  };
}
