export const dummyCommunityPosts = [
  // --- City-wise Posts ---
  {
    id: "post_101",
    city: "Raipur",
    authorId: "usr_player_demo",
    authorName: "Arjun Mehta",
    authorAvatar: "/assets/images/avatars/avatar-1.jpg",
    authorElo: 1840,
    timestamp: "2 hours ago",
    content: "What a crazy 5v5 match tonight at Bernabeu Arena Raipur! Thanks to Ananya for saving 3 penalties in a row. MVP performance! 🧤🔥",
    image: "",
    likes: 24,
    comments: [
      { id: "c_1", author: "Ananya Iyer", avatar: "/assets/images/avatars/avatar-3.jpg", text: "Appreciate it Arjun! That volley goal from outside the box was top class! 🚀", timestamp: "1 hour ago" }
    ],
    tags: ["RaipurMatch", "BernabeuTurf", "MVP"]
  },
  {
    id: "post_102",
    city: "Bangalore",
    authorId: "usr_p2",
    authorName: "Siddharth Rao",
    authorAvatar: "/assets/images/avatars/avatar-6.jpg",
    authorElo: 1960,
    timestamp: "4 hours ago",
    content: "🚨 NEED 2 DEFENDERS: Tonight 8 PM at Silicon Turf Hub Indiranagar. Split fee ₹250. Hit join on Find Games page!",
    image: "",
    likes: 12,
    comments: [
      { id: "c_2", author: "Tanya Sharma", avatar: "/assets/images/avatars/avatar-10.jpg", text: "I can join for midfield/defence! Just confirmed.", timestamp: "3 hours ago" }
    ],
    tags: ["BangaloreFutsal", "NeedPlayers"]
  }
];

export const dummyCommunity = dummyCommunityPosts;

export const dummyPolls = [
  {
    id: "poll_1",
    city: "Raipur",
    question: "Which pitch surface do you prefer for 5v5 matches?",
    options: [
      { id: "opt_1", text: "3G Artificial Turf", votes: 42 },
      { id: "opt_2", text: "Synthetic Rubber Futsal", votes: 18 },
      { id: "opt_3", text: "Natural Grass", votes: 25 }
    ],
    votedUserIds: ["usr_player_demo"]
  }
];

export const dummyChallenges = [
  {
    id: "ch_1",
    title: "Monthly Match Master",
    description: "Play 5 pick-up matches in any Indian city this month",
    target: 5,
    rewardBadge: "MatchMaster2026",
    rewardWalletBonus: 200, // ₹200 wallet reward
    userProgress: {
      "usr_player_demo": 4,
      "usr_p2": 5,
      "usr_p3": 3
    }
  },
  {
    id: "ch_2",
    title: "Victory Streak Challenge",
    description: "Win 3 matches in a row to boost your Elo rating",
    target: 3,
    rewardBadge: "WinnerStreak",
    rewardWalletBonus: 350, // ₹350 wallet reward
    userProgress: {
      "usr_player_demo": 2,
      "usr_p2": 3
    }
  }
];
