/**
 * EDUConnect - Seed Data & LocalStorage Management
 * Created for CSE 242 University Project
 * Provides mock data for Students, Clubs, Events, Posts, Notifications, Verifications, and Reports.
 */

// Key constants for LocalStorage
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

// Initial Seed Data
const INITIAL_STUDENTS = [
  {
    id: 'std_01',
    studentId: '2023-1-60-045',
    name: 'Farhan Ahmed',
    email: 'farhan.ahmed@student.edu',
    role: 'student',
    department: 'Computer Science & Engineering',
    semester: '6th Semester',
    cgpa: '3.86',
    bio: 'Passionate CSE undergrad interested in Full-Stack Web Development, Cloud Computing, and open-source software. Vice President at EDU Computer Club.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
    skills: ['JavaScript', 'PHP', 'MySQL', 'React', 'Git', 'Bootstrap', 'Python'],
    interests: ['Web Architecture', 'Machine Learning', 'Competitive Programming', 'System Design'],
    achievements: [
      'Champion - Inter-University Hackathon 2024',
      'Dean\'s Honor List (Fall 2023, Spring 2024)',
      'Organized EDU TechFest with 500+ participants'
    ],
    clubs: [
      { id: 'club_01', name: 'EDU Computer Club', role: 'Executive Member' },
      { id: 'club_03', name: 'EDU Programming Club', role: 'Active Member' }
    ],
    status: 'Verified',
    connectionsCount: 142,
    followingClubs: ['club_01', 'club_02', 'club_03'],
    connectedStudents: ['std_02', 'std_04']
  },
  {
    id: 'std_02',
    studentId: '2023-1-60-112',
    name: 'Nusrat Jahan',
    email: 'nusrat.jahan@student.edu',
    role: 'student',
    department: 'Computer Science & Engineering',
    semester: '7th Semester',
    cgpa: '3.92',
    bio: 'AI/ML Enthusiast and Data Science researcher. Always curious about Neural Networks, NLP, and developing human-centric artificial intelligence.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Data Analysis', 'SQL', 'C++'],
    interests: ['Deep Learning', 'Computer Vision', 'Robotics', 'Ethical AI'],
    achievements: [
      'Co-authored research paper on Bangla OCR presented at ICET 2024',
      'Vice President of EDU Robotics Club',
      'Grace Hopper Celebration Student Scholar'
    ],
    clubs: [
      { id: 'club_02', name: 'EDU Robotics Club', role: 'President' }
    ],
    status: 'Verified',
    connectionsCount: 210,
    followingClubs: ['club_02', 'club_01'],
    connectedStudents: ['std_01', 'std_03']
  },
  {
    id: 'std_03',
    studentId: '2023-2-60-204',
    name: 'Tanvir Hossain',
    email: 'tanvir.hossain@student.edu',
    role: 'student',
    department: 'Electrical & Electronic Engineering',
    semester: '5th Semester',
    cgpa: '3.75',
    bio: 'Hardware engineer with a passion for embedded systems, IoT automation, and PCB design. Working on smart agriculture prototypes.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    skills: ['Embedded C', 'Arduino', 'Raspberry Pi', 'MATLAB', 'Circuit Design'],
    interests: ['Robotics', 'IoT', 'Renewable Energy', 'Automation'],
    achievements: [
      '1st Runner Up - National Roborace Competition 2024',
      'Designed University Smart Campus Energy Monitor'
    ],
    clubs: [
      { id: 'club_02', name: 'EDU Robotics Club', role: 'Hardware Lead' }
    ],
    status: 'Verified',
    connectionsCount: 88,
    followingClubs: ['club_02'],
    connectedStudents: ['std_02']
  },
  {
    id: 'std_04',
    studentId: '2022-3-10-089',
    name: 'Sadia Rahman',
    email: 'sadia.rahman@student.edu',
    role: 'student',
    department: 'Business Administration (BBA)',
    semester: '8th Semester',
    cgpa: '3.88',
    bio: 'Marketing strategist and event organizer. Passionate about startup ecosystems, product branding, and sustainable business models.',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    skills: ['Brand Strategy', 'Public Relations', 'Financial Analysis', 'Content Marketing', 'Negotiation'],
    interests: ['FinTech', 'Social Entrepreneurship', 'Corporate Leadership', 'Public Speaking'],
    achievements: [
      'National Finalist - Battle of Minds 2024',
      'President - EDU Business Club (2024-2025)'
    ],
    clubs: [
      { id: 'club_04', name: 'EDU Business Club', role: 'President' }
    ],
    status: 'Verified',
    connectionsCount: 312,
    followingClubs: ['club_04', 'club_05'],
    connectedStudents: ['std_01', 'std_05']
  },
  {
    id: 'std_05',
    studentId: '2024-1-60-311',
    name: 'Arib Zaid',
    email: 'arib.zaid@student.edu',
    role: 'student',
    department: 'Computer Science & Engineering',
    semester: '3rd Semester',
    cgpa: '3.65',
    bio: 'Competitive programmer solving problems on Codeforces & LeetCode. Aspiring software engineer focusing on algorithms and discrete math.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
    skills: ['C++', 'Algorithms', 'Data Structures', 'Python', 'Git'],
    interests: ['ICPC', 'Number Theory', 'Game Dev', 'Cybersecurity'],
    achievements: [
      'Solved 600+ algorithmic problems across LeetCode & Codeforces',
      'Ranked 14th in University Freshers Contest'
    ],
    clubs: [
      { id: 'club_03', name: 'EDU Programming Club', role: 'Problem Setter' }
    ],
    status: 'Pending Verification',
    connectionsCount: 45,
    followingClubs: ['club_03'],
    connectedStudents: []
  }
];

const INITIAL_CLUBS = [
  {
    id: 'club_01',
    name: 'EDU Computer Club',
    tagline: 'Empowering future technologists through code, workshops, and innovation.',
    category: 'Technology & Engineering',
    established: '2015',
    membersCount: 420,
    advisor: 'Dr. Mohammad Karim, Professor, Dept. of CSE',
    logo: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    about: 'EDU Computer Club is the premier technology organization of the university. We organize yearly hackathons, tech talks with industry leaders, open-source sprints, and hands-on developer bootcamps. Our goal is to bridge the gap between academic curriculum and industrial requirements.',
    socials: {
      website: 'https://educomputerclub.org',
      facebook: 'https://facebook.com/educomputerclub',
      github: 'https://github.com/edu-computer-club',
      linkedin: 'https://linkedin.com/company/edu-computer-club'
    },
    followersCount: 890,
    isRecruiting: true,
    recruitmentDetails: 'Fall 2026 Executive Member Recruitment is now open! Positions: Web Developer, Graphics Designer, Content Writer, and Logistics.',
    achievements: [
      'Best Co-Curricular University Club Award 2024',
      'Hosted National Hackathon 2023 with 60 universities participating'
    ]
  },
  {
    id: 'club_02',
    name: 'EDU Robotics Club',
    tagline: 'Building the robots of tomorrow through automation and AI.',
    category: 'Robotics & Hardware',
    established: '2017',
    membersCount: 260,
    advisor: 'Dr. Shahriar Alam, Dept. of EEE',
    logo: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=1200&q=80',
    about: 'EDU Robotics Club brings together enthusiasts from CSE, EEE, and Mechanical backgrounds. We focus on autonomous rovers, drones, combat bots, and AI-driven automation.',
    socials: {
      website: 'https://edurobotics.org',
      facebook: 'https://facebook.com/edurobotics',
      github: 'https://github.com/edu-robotics',
      linkedin: 'https://linkedin.com/company/edu-robotics'
    },
    followersCount: 650,
    isRecruiting: false,
    recruitmentDetails: 'Recruitment closed for current term. Next intake begins in Spring 2027.',
    achievements: [
      'National Champions in Line Follower Robot Challenge 2024',
      'Developed campus delivery drone prototype'
    ]
  },
  {
    id: 'club_03',
    name: 'EDU Programming Club',
    tagline: 'Mastering algorithms, competitive programming, and problem solving.',
    category: 'Competitive Coding',
    established: '2014',
    membersCount: 380,
    advisor: 'Asst. Prof. Sabrina Haque, Dept. of CSE',
    logo: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    about: 'Dedicated to training university students for ICPC, National Collegiate Programming Contests (NCPC), and tech interviews. We organize weekly mock contests, algorithm masterclasses, and freshers camp.',
    socials: {
      facebook: 'https://facebook.com/eduprogramming',
      github: 'https://github.com/edu-cpc',
      linkedin: 'https://linkedin.com/company/edu-cpc'
    },
    followersCount: 780,
    isRecruiting: true,
    recruitmentDetails: 'Registration open for Freshers Problem Solving Bootcamp. Beginners are strongly welcomed!',
    achievements: [
      'Qualified for ICPC Asia Regional Finals 4 consecutive years',
      'Top 10 standing in National Collegiate Programming Contest 2023'
    ]
  },
  {
    id: 'club_04',
    name: 'EDU Business Club',
    tagline: 'Fostering future business leaders, entrepreneurs, and innovators.',
    category: 'Business & Leadership',
    established: '2016',
    membersCount: 310,
    advisor: 'Dr. Rafiqul Islam, Dept. of Business Administration',
    logo: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    about: 'EDU Business Club equips students with practical knowledge of marketing, finance, brand design, and business pitching. We host inter-university case competitions and startup mentorship programs.',
    socials: {
      facebook: 'https://facebook.com/edubusinessclub',
      linkedin: 'https://linkedin.com/company/edubusinessclub'
    },
    followersCount: 520,
    isRecruiting: true,
    recruitmentDetails: 'Seeking student ambassadors and corporate liaison associates for upcoming Brandfest 2026.',
    achievements: [
      'Organized EDU Intra-University Business Case Competition 2024',
      'Mentored 3 student startups to seed grant funding'
    ]
  },
  {
    id: 'club_05',
    name: 'EDU Cultural Club',
    tagline: 'Celebrating music, drama, art, and university heritage.',
    category: 'Art & Culture',
    established: '2013',
    membersCount: 450,
    advisor: 'Prof. Anwara Begum, Dept. of English',
    logo: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    about: 'The vibrant heart of university cultural life. From Rabindra-Nazrul Jayanti to university spring festival and acoustic musical nights, we celebrate creativity, music, and performing arts.',
    socials: {
      facebook: 'https://facebook.com/educulturalclub',
      instagram: 'https://instagram.com/educultural'
    },
    followersCount: 910,
    isRecruiting: false,
    recruitmentDetails: 'Auditions for Spring Festival musical performance will be announced soon.',
    achievements: [
      'Best Cultural Performance in Inter-University Youth Fest 2023',
      'Annual campus concert with 3,000+ attendee turnout'
    ]
  },
  {
    id: 'club_06',
    name: 'EDU Debate Society',
    tagline: 'Sharpen your voice in meaningful discussions and logical arguments.',
    category: 'Debate & Public Speaking',
    established: '2016',
    membersCount: 290,
    advisor: 'Dr. Shahana Akhter, Dept. of English & Humanities',
    logo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
    about: 'EDU Debate Society trains students in British Parliamentary, Asian Parliamentary, and Bangla traditional debate formats. We promote critical thinking, public speaking, and intellectual dialogue on global affairs.',
    socials: {
      facebook: 'https://facebook.com/edudebatesociety',
      linkedin: 'https://linkedin.com/company/edudebatesociety'
    },
    followersCount: 640,
    isRecruiting: true,
    recruitmentDetails: 'Intra-University Freshers Debate Championship and Adjudicator Workshop registration open!',
    achievements: [
      'Champions - National Youth Parliamentary Debate 2024',
      'Best Speaker Award at Inter-University Championship 2023'
    ]
  }
];

const INITIAL_EVENTS = [
  {
    id: 'evt_05',
    title: 'Tech Connect Meetup',
    clubId: 'club_01',
    clubName: 'EDU Computer Club',
    category: 'Networking & Tech',
    date: '2026-11-12',
    time: '04:00 PM - 06:30 PM',
    location: 'Seminar Hall, Academic Block A',
    description: 'An informal meetup for tech enthusiasts, developers, and club alumni. Lightning talks on web technologies, career paths, and project demos.',
    banner: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1000&q=80',
    seatsTotal: 100,
    seatsRegistered: 78,
    registeredUserIds: ['std_01'],
    isRegistrationOpen: true
  },
  {
    id: 'evt_06',
    title: 'Campus Cultural Night',
    clubId: 'club_05',
    clubName: 'EDU Cultural Club',
    category: 'Art & Culture',
    date: '2026-11-15',
    time: '05:00 PM - 09:30 PM',
    location: 'Central Field, Campus Green',
    description: 'A magical evening of live student bands, acoustic sets, drama performances, and university celebration under the open sky.',
    banner: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80',
    seatsTotal: 500,
    seatsRegistered: 340,
    registeredUserIds: ['std_01', 'std_04'],
    isRegistrationOpen: true
  },
  {
    id: 'evt_07',
    title: 'Inter-University Debate',
    clubId: 'club_06',
    clubName: 'EDU Debate Society',
    category: 'Debate & Public Speaking',
    date: '2026-11-20',
    time: '10:00 AM - 05:00 PM',
    location: 'Main Auditorium',
    description: 'Premier national debate tournament featuring 32 university teams competing in parliamentary debate rounds.',
    banner: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1000&q=80',
    seatsTotal: 200,
    seatsRegistered: 165,
    registeredUserIds: ['std_01'],
    isRegistrationOpen: true
  },
  {
    id: 'evt_01',
    title: 'EDU TechFest 2026: Annual University Hackathon',
    clubId: 'club_01',
    clubName: 'EDU Computer Club',
    category: 'Hackathon & Tech',
    date: '2026-11-20',
    time: '09:00 AM - 08:00 PM',
    location: 'Central Auditorium & CSE Lab Complex',
    description: 'A 24-hour hackathon where university teams will build solutions for Smart Campus, Climate Tech, and Healthcare. Prizes worth $1,500! Food, swag, and mentorship provided.',
    banner: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80',
    seatsTotal: 150,
    seatsRegistered: 114,
    registeredUserIds: ['std_01', 'std_02'],
    isRegistrationOpen: true
  },
  {
    id: 'evt_02',
    title: 'Hands-on Workshop: Building Generative AI Apps with Python',
    clubId: 'club_02',
    clubName: 'EDU Robotics Club',
    category: 'Workshop',
    date: '2026-11-15',
    time: '03:00 PM - 06:00 PM',
    location: 'Lab Room 402, Academic Block B',
    description: 'Learn how to integrate Large Language Models (LLMs), prompt engineering, and build functional intelligent web agents with Python and modern APIs. Laptop required.',
    banner: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80',
    seatsTotal: 60,
    seatsRegistered: 54,
    registeredUserIds: ['std_01', 'std_03'],
    isRegistrationOpen: true
  },
  {
    id: 'evt_03',
    title: 'ICPC Regional Preparation Contest & Mock Round',
    clubId: 'club_03',
    clubName: 'EDU Programming Club',
    category: 'Competitive Coding',
    date: '2026-11-28',
    time: '02:00 PM - 07:00 PM',
    location: 'CSE Department Main Lab (3rd Floor)',
    description: '5-hour official mock contest adhering to international ACM-ICPC standards. Teams of 3 members will solve 10 challenging algorithmic problems.',
    banner: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80',
    seatsTotal: 80,
    seatsRegistered: 65,
    registeredUserIds: ['std_05'],
    isRegistrationOpen: true
  },
  {
    id: 'evt_04',
    title: 'EDU Intra-University Case Competition 2026',
    clubId: 'club_04',
    clubName: 'EDU Business Club',
    category: 'Business & Case Study',
    date: '2026-12-05',
    time: '10:00 AM - 04:00 PM',
    location: 'Business School Seminar Hall',
    description: 'Tackle real-world corporate turnaround strategies. Judged by senior executives from multinational FMCG and telecom companies. Certificates for all finalists.',
    banner: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1000&q=80',
    seatsTotal: 100,
    seatsRegistered: 42,
    registeredUserIds: ['std_04'],
    isRegistrationOpen: true
  },
  {
    id: 'evt_05',
    title: 'Acoustic Musical Evening & Open Mic Night',
    clubId: 'club_05',
    clubName: 'EDU Cultural Club',
    category: 'Cultural & Music',
    date: '2026-12-12',
    time: '05:30 PM - 09:00 PM',
    location: 'Campus Open Air Amphitheatre',
    description: 'An open-air evening celebrating student musical bands, solo vocal performances, and spoken word poetry under the stars. Free admission for all students!',
    banner: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1000&q=80',
    seatsTotal: 300,
    seatsRegistered: 210,
    registeredUserIds: [],
    isRegistrationOpen: true
  }
];

const INITIAL_POSTS = [
  {
    id: 'post_01',
    authorType: 'club',
    authorId: 'club_01',
    authorName: 'EDU Computer Club',
    authorAvatar: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=300&q=80',
    timestamp: '2 hours ago',
    title: 'Registration is LIVE for EDU TechFest Hackathon 2026!',
    content: 'We are thrilled to announce that registration for EDU TechFest 2026 is officially open! Over 40 university teams have already signed up. Head over to the Events tab to register your team before slots run out! #EDUTechFest #Hackathon #Coding',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80',
    likesCount: 54,
    commentsCount: 12,
    likedByCurrentUser: false
  },
  {
    id: 'post_02',
    authorType: 'student',
    authorId: 'std_02',
    authorName: 'Nusrat Jahan',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    timestamp: '5 hours ago',
    title: 'Excited to publish our latest research on Deep Learning!',
    content: 'Extremely grateful to my advisor and co-authors for helping me present our work on Bangla OCR using Vision Transformers at ICET 2024. Hard work pays off! Open to connecting with anyone working on Computer Vision.',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80',
    likesCount: 88,
    commentsCount: 23,
    likedByCurrentUser: true
  },
  {
    id: 'post_03',
    authorType: 'club',
    authorId: 'club_02',
    authorName: 'EDU Robotics Club',
    authorAvatar: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=300&q=80',
    timestamp: 'Yesterday at 4:15 PM',
    title: 'Workshop Alert: AI & Robotics Hands-on Session this November',
    content: 'Ready to build with Python and autonomous hardware? Join us on November 15 for an intensive 3-hour workshop. Spots are strictly limited to 60 students due to hardware workstation capacity. Sign up via the Events tab.',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80',
    likesCount: 41,
    commentsCount: 7,
    likedByCurrentUser: false
  },
  {
    id: 'post_04',
    authorType: 'student',
    authorId: 'std_01',
    authorName: 'Farhan Ahmed',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    timestamp: '2 days ago',
    title: 'Looking for a teammate for the upcoming Web Dev Challenge',
    content: 'Hey everyone! I am forming a team for the inter-departmental full stack web application sprint. Looking for someone skilled with UI/UX design or CSS animations. Feel free to connect or drop a message!',
    image: null,
    likesCount: 19,
    commentsCount: 5,
    likedByCurrentUser: false
  }
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif_01',
    type: 'event',
    title: 'Event Reminder',
    message: 'EDU TechFest Hackathon begins in 18 days. Prepare your laptops!',
    timestamp: '10 minutes ago',
    read: false,
    link: 'events.html'
  },
  {
    id: 'notif_02',
    type: 'club',
    title: 'Club Announcement',
    message: 'EDU Computer Club opened Fall Executive Recruitment.',
    timestamp: '2 hours ago',
    read: false,
    link: 'club-profile.html?id=club_01'
  },
  {
    id: 'notif_03',
    type: 'connection',
    title: 'New Connection',
    message: 'Nusrat Jahan accepted your connection request.',
    timestamp: '1 day ago',
    read: true,
    link: 'profile.html?id=std_02'
  },
  {
    id: 'notif_04',
    type: 'event',
    title: 'Registration Confirmed',
    message: 'You are registered for "Building Generative AI Apps with Python".',
    timestamp: '2 days ago',
    read: true,
    link: 'events.html'
  }
];

const INITIAL_VERIFICATIONS = [
  {
    id: 'verif_01',
    type: 'student',
    targetId: 'std_05',
    name: 'Arib Zaid',
    identifier: 'Student ID: 2024-1-60-311',
    department: 'Computer Science & Engineering',
    submittedAt: '2026-10-31 11:20 AM',
    proofDocument: 'Student_ID_Scan_2024-1-60-311.pdf',
    status: 'Pending'
  },
  {
    id: 'verif_02',
    type: 'club',
    targetId: 'club_temp_01',
    name: 'EDU Debating Society',
    identifier: 'Faculty Advisor: Dr. Munir Chowdhury',
    department: 'Student Affairs Council',
    submittedAt: '2026-10-30 03:45 PM',
    proofDocument: 'Club_Constitution_Approval_Form.pdf',
    status: 'Pending'
  },
  {
    id: 'verif_03',
    type: 'student',
    targetId: 'std_temp_02',
    name: 'Mehedi Hasan',
    identifier: 'Student ID: 2024-2-80-019',
    department: 'Civil Engineering',
    submittedAt: '2026-10-29 09:15 AM',
    proofDocument: 'Admission_Pay_Slip_2024.pdf',
    status: 'Approved'
  }
];

const INITIAL_REPORTS = [
  {
    id: 'rep_01',
    type: 'post',
    targetTitle: 'Commercial Advertisement in General Feed',
    reportedBy: 'Nusrat Jahan (std_02)',
    reason: 'Spam / Commercial advertising prohibited under campus conduct guidelines.',
    status: 'Pending Review',
    timestamp: '2026-10-31 04:30 PM'
  },
  {
    id: 'rep_02',
    type: 'user',
    targetTitle: 'Suspicious Profile Impersonation',
    reportedBy: 'Farhan Ahmed (std_01)',
    reason: 'Profile using duplicate student ID and unauthorized campus logo.',
    status: 'Pending Review',
    timestamp: '2026-10-30 01:10 PM'
  }
];

// Predefined Demo Accounts
const DEMO_ACCOUNTS = {
  student: {
    id: 'std_01',
    studentId: '2023-1-60-045',
    name: 'Farhan Ahmed',
    email: 'farhan.ahmed@student.edu',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    department: 'Computer Science & Engineering'
  },
  club_rep: {
    id: 'club_rep_01',
    name: 'EDU Robotics Club Lead',
    email: 'robotics.lead@student.edu',
    role: 'club_rep',
    clubId: 'club_02',
    avatar: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=300&q=80',
    department: 'Club Representative'
  },
  admin: {
    id: 'admin_01',
    name: 'Prof. Anisur Rahman',
    email: 'admin.connect@edu.ac.bd',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    department: 'Office of Student Affairs (Admin)'
  }
};

// Storage Utilities
function getStorage(key, defaultValue) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from LocalStorage`, e);
    return defaultValue;
  }
}

function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to LocalStorage`, e);
  }
}

// Initialize seed data if not present
function initializeDemoData() {
  if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
    setStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CLUBS)) {
    setStorage(STORAGE_KEYS.CLUBS, INITIAL_CLUBS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
    setStorage(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
    setStorage(STORAGE_KEYS.POSTS, INITIAL_POSTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    setStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.VERIFICATIONS)) {
    setStorage(STORAGE_KEYS.VERIFICATIONS, INITIAL_VERIFICATIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
    setStorage(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
  }
  // Default to Farhan Ahmed (Student demo) if no session exists
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    setStorage(STORAGE_KEYS.CURRENT_USER, DEMO_ACCOUNTS.student);
  }
}

// Reset data to pristine demo state
function resetDemoData() {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
  localStorage.setItem(STORAGE_KEYS.CLUBS, JSON.stringify(INITIAL_CLUBS));
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(INITIAL_POSTS));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  localStorage.setItem(STORAGE_KEYS.VERIFICATIONS, JSON.stringify(INITIAL_VERIFICATIONS));
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_REPORTS));
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEMO_ACCOUNTS.student));
  console.log('EDUConnect: Demo data has been reset to defaults.');
}

// Run initialization immediately on script load
initializeDemoData();
