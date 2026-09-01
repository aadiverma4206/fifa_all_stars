/**
 * FIFA ALL STARS - Central Security, Role-Based Access Control (RBAC) & Ownership Engine
 * 
 * STRICT ROLE SEPARATION:
 * 1. PLAYER -> Base: /player/*
 * 2. CLUB_MANAGER -> Base: /club/*
 * 3. SUPER_ADMIN (including OPS_ADMIN, FINANCE_ADMIN) -> Base: /admin/*
 */

export const ROLE_OPERATIONS = {
  PLAYER: {
    roleName: "PLAYER",
    baseRoute: "/player/home",
    allowedOperations: [
      "VIEW_OWN_DASHBOARD",
      "SEARCH_PUBLIC_GAMES",
      "JOIN_LEAVE_GAME",
      "AUTO_WAITLIST_PROMOTION",
      "HOST_NEW_GAME",
      "ENTER_MATCH_SCORE_OWN",
      "BROWSE_CLUBS_READONLY",
      "BOOK_COURT_SLOT",
      "VIEW_OWN_BOOKINGS",
      "CANCEL_OWN_BOOKING_REQUEST",
      "REGISTER_TOURNAMENT",
      "VIEW_TOURNAMENT_BRACKETS_READONLY",
      "EDIT_OWN_PROFILE",
      "VIEW_OWN_ELO_STATS",
      "VIEW_GLOBAL_LEADERBOARD_READONLY",
      "COMMUNITY_POST_LIKE_POLL",
      "CREATE_SUPPORT_TICKET"
    ],
    navItems: [
      { label: "Home", path: "/player/home", icon: "Flame" },
      { label: "Find Games", path: "/player/find-games", icon: "Search" },
      { label: "Match History", path: "/history", icon: "Trophy" },
      { label: "Turfs & Courts", path: "/player/courts", icon: "MapPin" },
      { label: "Tournaments", path: "/player/tournaments", icon: "Trophy" },
      { label: "My Profile", path: "/player/profile", icon: "User" }
    ]
  },

  CLUB_MANAGER: {
    roleName: "CLUB_MANAGER",
    baseRoute: "/club/dashboard",
    allowedOperations: [
      "VIEW_OWN_CLUB_DASHBOARD",
      "EDIT_OWN_CLUB_PROFILE",
      "MANAGE_OWN_COURTS",
      "SET_OWN_PEAK_PRICING",
      "TOGGLE_OWN_COURT_STATUS",
      "VIEW_OWN_CLUB_BOOKINGS",
      "VIEW_OWN_REFUND_REQUESTS_READONLY",
      "HOST_VENUE_EVENT",
      "HOST_MANAGE_VENUE_GAMES"
    ],
    navItems: [
      { label: "Dashboard", path: "/club/dashboard", icon: "LayoutDashboard" },
      { label: "Game Sessions", path: "/club/games", icon: "Flame" },
      { label: "Manage Venue", path: "/club/manage", icon: "Building2" },
      { label: "Courts & Pitches", path: "/club/courts", icon: "MapPin" },
      { label: "Peak Pricing", path: "/club/pricing", icon: "DollarSign" },
      { label: "Reservations", path: "/club/bookings", icon: "Calendar" }
    ]
  },

  SUPER_ADMIN: {
    roleName: "SUPER_ADMIN",
    baseRoute: "/admin/dashboard",
    allowedOperations: [
      "VIEW_PLATFORM_DASHBOARD",
      "SEARCH_FILTER_ALL_USERS",
      "SUSPEND_BAN_USER",
      "CHANGE_USER_ROLE",
      "APPROVE_REJECT_CLUBS",
      "ASSIGN_CLUB_MANAGER",
      "APPROVE_REJECT_REFUNDS",
      "OVERRIDE_DISPUTE_SCORE_ELO",
      "ASSIGN_SUPPORT_TICKET_STAFF",
      "VIEW_SESSION_AUDIT_LOGS",
      "CONFIGURE_PLATFORM_SETTINGS"
    ],
    navItems: [
      { label: "Admin Dashboard", path: "/admin/dashboard", icon: "LayoutDashboard" },
      { label: "User Roster", path: "/admin/users", icon: "Users" },
      { label: "Club Approvals", path: "/admin/clubs", icon: "Building2" },
      { label: "Refund Processing", path: "/admin/refunds", icon: "RotateCcw" },
      { label: "Match Disputes", path: "/admin/disputes", icon: "AlertTriangle" },
      { label: "Audit Logs", path: "/admin/audit-logs", icon: "FileText" },
      { label: "Support Tickets", path: "/admin/tickets", icon: "Ticket" }
    ]
  }
};

/**
 * Checks if a given user role has permission to execute an operation.
 * 
 * @param {string} userRole - Current logged in role ('PLAYER', 'CLUB_MANAGER', 'SUPER_ADMIN', 'OPS_ADMIN', 'FINANCE_ADMIN')
 * @param {string} operationKey - Constant operation key string
 * @returns {boolean}
 */
export function hasPermission(userRole, operationKey) {
  if (!userRole) return false;
  const roleUpper = userRole.toUpperCase();

  // Sub-roles mapping
  if (roleUpper === 'OPS_ADMIN' || roleUpper === 'FINANCE_ADMIN') {
    return ROLE_OPERATIONS.SUPER_ADMIN.allowedOperations.includes(operationKey);
  }

  const roleConfig = ROLE_OPERATIONS[roleUpper];
  if (!roleConfig) return false;

  return roleConfig.allowedOperations.includes(operationKey);
}

/**
 * Returns dynamic navigation menu items for the specified user role.
 * 
 * @param {string} userRole
 * @returns {Array} List of navigation items with label, path, and icon string
 */
export function getRoleNavItems(userRole) {
  if (!userRole) return [];
  const roleUpper = userRole.toUpperCase();

  if (roleUpper === 'OPS_ADMIN' || roleUpper === 'FINANCE_ADMIN' || roleUpper === 'SUPER_ADMIN') {
    return ROLE_OPERATIONS.SUPER_ADMIN.navItems;
  }

  return ROLE_OPERATIONS[roleUpper]?.navItems || [];
}

/**
 * Returns the default home/dashboard route for a role.
 * 
 * @param {string} userRole
 * @returns {string} Default redirect path
 */
export function getDefaultRoleRoute(userRole) {
  if (!userRole) return '/login';
  const roleUpper = userRole.toUpperCase();

  if (roleUpper === 'SUPER_ADMIN' || roleUpper === 'OPS_ADMIN' || roleUpper === 'FINANCE_ADMIN') {
    return '/admin/dashboard';
  }
  if (roleUpper === 'CLUB_MANAGER') {
    return '/club/dashboard';
  }
  return '/player/home';
}

/**
 * Scoping Helper: Verifies if the manager owns the target club.
 * Super Admins bypass ownership checks.
 */
export function canManageClub(user, clubOrClubId, clubsList = []) {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  if (user.role !== 'CLUB_MANAGER') return false;

  const clubId = typeof clubOrClubId === 'string' ? clubOrClubId : clubOrClubId?.id;
  const club = typeof clubOrClubId === 'object' ? clubOrClubId : clubsList.find(c => c.id === clubId);

  if (!club) return false;
  return Array.isArray(club.managerIds) && club.managerIds.includes(user.id);
}

/**
 * Scoping Helper: Filters clubs list to only those owned by the manager.
 */
export function getManagedClubs(user, clubsList = []) {
  if (!user) return [];
  if (user.role === 'SUPER_ADMIN') return clubsList;
  if (user.role !== 'CLUB_MANAGER') return [];

  return clubsList.filter(c => Array.isArray(c.managerIds) && c.managerIds.includes(user.id));
}

/**
 * Scoping Helper: Filters courts list to only those belonging to owned clubs.
 */
export function getManagedCourts(user, courtsList = [], clubsList = []) {
  const managedClubs = getManagedClubs(user, clubsList);
  const managedClubIds = new Set(managedClubs.map(c => c.id));
  return courtsList.filter(court => managedClubIds.has(court.clubId));
}

/**
 * Scoping Helper: Checks if user can join games as a player.
 * CLUB_MANAGER accounts are explicitly restricted from playing or occupying player slots.
 */
export function canJoinGame(user) {
  if (!user) return false;
  if (user.status === 'SUSPENDED') return false;
  if (user.role === 'CLUB_MANAGER') return false;
  return true;
}

