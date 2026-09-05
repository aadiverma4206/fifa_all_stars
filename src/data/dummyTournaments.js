export const dummyTournaments = [
  {
    id: "trn_101",
    title: "All-India Grassroots 11v11 Football Cup 2026",
    tagline: "Knockout Championship Trophy & ₹1,00,000 Prize Pool",
    format: "Knockout",
    type: "Knockout",
    city: "Raipur",
    clubId: "clb_raipur_1",
    clubName: "Bernabeu Arena Turf",
    banner: "/assets/images/hero/hero-1.jpg",
    startDate: "2026-09-15",
    endDate: "2026-09-17",
    entryFee: 2500, // ₹2,500 per team
    prizePool: "₹1,00,000 + Trophy & Medals",
    maxTeams: 8,
    registeredTeamsCount: 8,
    status: "CONFIRMED",
    champion: "Raipur Strikers FC",
    description: "Annual premier 11v11 knockout cup in Raipur featuring certified referees and live streaming.",
    teams: [
      { id: "tm_1", name: "Raipur Strikers FC", captain: "Arjun Mehta", status: "CONFIRMED", logo: "⚡" },
      { id: "tm_2", name: "Bangalore Dynamos", captain: "Siddharth Rao", status: "CONFIRMED", logo: "🔥" },
      { id: "tm_3", name: "Mumbai Warriors", captain: "Devendra Singh", status: "CONFIRMED", logo: "🛡️" },
      { id: "tm_4", name: "Delhi Iron Wall", captain: "Karan Patel", status: "CONFIRMED", logo: "🧱" }
    ],
    brackets: {
      quarterFinals: [
        { matchId: "qf_1", teamA: "Raipur Strikers FC", teamB: "Delhi Iron Wall", score: "4 - 2", winner: "Raipur Strikers FC" },
        { matchId: "qf_2", teamA: "Bangalore Dynamos", teamB: "Mumbai Warriors", score: "3 - 1", winner: "Bangalore Dynamos" }
      ],
      semiFinals: [
        { matchId: "sf_1", teamA: "Raipur Strikers FC", teamB: "Bangalore Dynamos", score: "2 - 1", winner: "Raipur Strikers FC" }
      ],
      finals: [
        { matchId: "fn_1", teamA: "Raipur Strikers FC", teamB: "Bangalore Dynamos", score: "3 - 2", winner: "Raipur Strikers FC" }
      ]
    },
    rules: [
      "90 minutes standard match duration (2 x 45 min halves)",
      "Official IFAB / FIFA rules with certified referees",
      "Corner kicks, offside rule, and throw-ins apply"
    ]
  },

  {
    id: "trn_102",
    title: "Silicon City 11v11 Football League 2026",
    tagline: "8-Team Round-Robin League & ₹75,000 Cash Pool",
    format: "Round-Robin",
    type: "Round-Robin",
    city: "Bangalore",
    clubId: "clb_blr_1",
    clubName: "Silicon Turf Hub",
    banner: "/assets/images/hero/hero-2.jpg",
    startDate: "2026-10-01",
    endDate: "2026-10-05",
    entryFee: 3000,
    prizePool: "₹75,000 Cash Prize",
    maxTeams: 8,
    registeredTeamsCount: 6,
    status: "TEAM_PENDING",
    champion: null,
    description: "Round-robin 11v11 league format where every team plays 5 matches guaranteed before top 4 playoff.",
    teams: [
      { id: "tm_5", name: "Indiranagar Falcons", captain: "Tanya Sharma", status: "CONFIRMED", logo: "🦅" },
      { id: "tm_6", name: "Deccan Chargers", captain: "Neha Gupta", status: "TEAM_PENDING", logo: "⚡" }
    ],
    brackets: {
      roundRobinMatches: [
        { matchId: "rr_1", teamA: "Indiranagar Falcons", teamB: "Deccan Chargers", score: "TBD", winner: null }
      ]
    },
    rules: [
      "Official FIFA standard size 5 match ball",
      "FIFA substitution guidelines (up to 5 substitutions)"
    ]
  },

  {
    id: "trn_103",
    title: "Pune Champions Cup 2026",
    tagline: "Super 16 Knockout Tournament",
    format: "Knockout",
    type: "Knockout",
    city: "Pune",
    clubId: "clb_pune_1",
    clubName: "Champions Turf Arena",
    banner: "/assets/images/hero/hero-3.jpg",
    startDate: "2026-11-10",
    endDate: "2026-11-12",
    entryFee: 2000,
    prizePool: "₹50,000 + Trophy",
    maxTeams: 16,
    registeredTeamsCount: 4,
    status: "TEAM_PENDING",
    champion: null,
    description: "High stakes 11v11 knockout cup in Deccan Pune.",
    teams: [],
    brackets: {},
    rules: ["Official 11v11 rules with certified referee panel."]
  }
];
