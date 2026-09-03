import { getTodayDate } from '../utils/dateUtils';

export const dummyGames = [
  {
    id: "gam_101",
    title: "Raipur Friday Night 5v5 Super Match",
    organizer: {
      id: "usr_player_demo",
      name: "Arjun Mehta",
      avatar: "/assets/images/avatars/avatar-1.jpg"
    },
    format: "5v5",
    maxPlayers: 10,
    entryFee: 150, // ₹150 per player
    confirmedPlayers: [
      { id: "usr_player_demo", name: "Arjun Mehta", avatar: "/assets/images/avatars/avatar-1.jpg", position: "ST" },
      { id: "usr_p6", name: "Aarav Joshi", avatar: "/assets/images/avatars/avatar-8.jpg", position: "MID" },
      { id: "usr_p10", name: "Ishan Verma", avatar: "/assets/images/avatars/avatar-8.jpg", position: "DEF" }
    ],
    waitlist: [],
    skill: "Intermediate",
    privacy: "PUBLIC",
    venueReference: {
      clubId: "clb_raipur_1",
      clubName: "Bernabeu Arena Turf",
      courtId: "crt_rp_101",
      courtName: "Raipur Pitch Alpha (5v5)",
      city: "Raipur"
    },
    dateTime: {
      date: getTodayDate(0),
      startTime: "19:00",
      endTime: "20:30"
    },
    status: "OPEN_FOR_JOINING",
    score: null,
    description: "High-paced competitive 5v5 session under floodlights at Bernabeu Arena Raipur."
  },

  {
    id: "gam_102",
    title: "Weekend 7v7 Champions Battle",
    organizer: {
      id: "usr_player_demo",
      name: "Arjun Mehta",
      avatar: "/assets/images/avatars/avatar-1.jpg"
    },
    format: "7v7",
    maxPlayers: 14,
    entryFee: 200, // ₹200 per player
    confirmedPlayers: [
      { id: "usr_player_demo", name: "Arjun Mehta", avatar: "/assets/images/avatars/avatar-1.jpg", position: "ST" },
      { id: "usr_p2", name: "Siddharth Rao", avatar: "/assets/images/avatars/avatar-6.jpg", position: "MID" },
      { id: "usr_p3", name: "Ananya Iyer", avatar: "/assets/images/avatars/avatar-3.jpg", position: "GK" },
      { id: "usr_p4", name: "Karan Patel", avatar: "/assets/images/avatars/avatar-4.jpg", position: "DEF" },
      { id: "usr_p5", name: "Neha Gupta", avatar: "/assets/images/avatars/avatar-7.jpg", position: "WING" },
      { id: "usr_p7", name: "Rohan Kapoor", avatar: "/assets/images/avatars/avatar-9.jpg", position: "ST" },
      { id: "usr_p8", name: "Tanya Sharma", avatar: "/assets/images/avatars/avatar-10.jpg", position: "MID" },
      { id: "usr_p9", name: "Devendra Singh", avatar: "/assets/images/avatars/avatar-2.jpg", position: "ST" },
      { id: "usr_p6", name: "Aarav Joshi", avatar: "/assets/images/avatars/avatar-8.jpg", position: "MID" },
      { id: "usr_p10", name: "Ishan Verma", avatar: "/assets/images/avatars/avatar-8.jpg", position: "DEF" },
      { id: "usr_admin_demo", name: "Aaditya Verma", avatar: "/assets/images/avatars/avatar-1.jpg", position: "MID" },
      { id: "usr_admin_2", name: "Rohan Deshmukh", avatar: "/assets/images/avatars/avatar-2.jpg", position: "DEF" },
      { id: "usr_manager_demo", name: "Rajesh Sharma", avatar: "/assets/images/avatars/avatar-3.jpg", position: "MID" },
      { id: "usr_manager_2", name: "Vikram Malhotra", avatar: "/assets/images/avatars/avatar-4.jpg", position: "WING" }
    ],
    waitlist: [
      { id: "usr_manager_3", name: "Priya Nair", avatar: "/assets/images/avatars/avatar-5.jpg" }
    ],
    skill: "Advanced",
    privacy: "PUBLIC",
    venueReference: {
      clubId: "clb_raipur_1",
      clubName: "Bernabeu Arena Turf",
      courtId: "crt_rp_102",
      courtName: "Raipur Pitch Bravo (7v7)",
      city: "Raipur"
    },
    dateTime: {
      date: getTodayDate(1),
      startTime: "18:00",
      endTime: "20:00"
    },
    status: "FULL",
    score: null,
    description: "Full capacity 7v7 showdown on artificial grass turf."
  },

  {
    id: "gam_103",
    title: "Bangalore Techie Fastbreak 5v5",
    organizer: {
      id: "usr_p2",
      name: "Siddharth Rao",
      avatar: "/assets/images/avatars/avatar-6.jpg"
    },
    format: "5v5",
    maxPlayers: 10,
    entryFee: 250,
    confirmedPlayers: [
      { id: "usr_p2", name: "Siddharth Rao", avatar: "/assets/images/avatars/avatar-6.jpg", position: "MID" },
      { id: "usr_p8", name: "Tanya Sharma", avatar: "/assets/images/avatars/avatar-10.jpg", position: "MID" }
    ],
    waitlist: [],
    skill: "All Levels",
    privacy: "PUBLIC",
    venueReference: {
      clubId: "clb_blr_1",
      clubName: "Silicon Turf Hub",
      courtId: "crt_blr_201",
      courtName: "Silicon Pitch 1 (5v5)",
      city: "Bangalore"
    },
    dateTime: {
      date: getTodayDate(0),
      startTime: "20:00",
      endTime: "21:30"
    },
    status: "ONGOING",
    score: { teamA: 3, teamB: 2 },
    description: "Live ongoing evening match at Silicon Turf Hub."
  },

  {
    id: "gam_104",
    title: "Pune Indoor Futsal Showcase",
    organizer: {
      id: "usr_p5",
      name: "Neha Gupta",
      avatar: "/assets/images/avatars/avatar-7.jpg"
    },
    format: "5v5",
    maxPlayers: 10,
    entryFee: 180,
    confirmedPlayers: [
      { id: "usr_p5", name: "Neha Gupta", avatar: "/assets/images/avatars/avatar-7.jpg", position: "WING" },
      { id: "usr_manager_3", name: "Priya Nair", avatar: "/assets/images/avatars/avatar-5.jpg", position: "GK" }
    ],
    waitlist: [],
    skill: "Intermediate",
    privacy: "PUBLIC",
    venueReference: {
      clubId: "clb_pune_1",
      clubName: "Champions Turf Arena",
      courtId: "crt_pune_301",
      courtName: "Deccan Pitch Red (5v5)",
      city: "Pune"
    },
    dateTime: {
      date: getTodayDate(-1),
      startTime: "19:00",
      endTime: "20:00"
    },
    status: "COMPLETED",
    score: { teamA: 5, teamB: 4 },
    description: "Completed indoor futsal session with thrill finish."
  }
];
