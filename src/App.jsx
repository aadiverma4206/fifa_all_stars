import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import { useThemeStore } from './store/useThemeStore';
import { useAuthStore } from './store/useAuthStore';

// Public Landing & Auth Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import NotFoundPage from './pages/common/NotFoundPage';

// Player Pages
import PlayerHomePage from './pages/player/PlayerHomePage';
import FindGamesPage from './pages/player/FindGamesPage';
import GameDetailsPage from './pages/player/GameDetailsPage';
import CourtsPage from './pages/player/CourtsPage';
import BookCourtPage from './pages/player/BookCourtPage';
import TournamentsPage from './pages/player/TournamentsPage';
import TournamentDetailsPage from './pages/player/TournamentDetailsPage';
import ProfilePage from './pages/player/ProfilePage';
import LeaderboardPage from './pages/player/LeaderboardPage';
import CommunityPage from './pages/player/CommunityPage';

// Manager Pages
import ClubDashboardPage from './pages/club/ClubDashboardPage';
import ManageClubPage from './pages/club/ManageClubPage';
import ManageCourtsPage from './pages/club/ManageCourtsPage';
import PricingSettingsPage from './pages/club/PricingSettingsPage';
import BookingsPage from './pages/club/BookingsPage';

// Super Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import ClubApprovalsPage from './pages/admin/ClubApprovalsPage';
import RefundsPage from './pages/admin/RefundsPage';
import DisputesPage from './pages/admin/DisputesPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import SupportTicketsPage from './pages/admin/SupportTicketsPage';

function App() {
  const { applyTheme, listenToSystemChanges } = useThemeStore();
  const { currentUser } = useAuthStore();

  useEffect(() => {
    applyTheme();
    const cleanup = listenToSystemChanges();
    return () => {
      if (cleanup) cleanup();
    };
  }, [applyTheme, listenToSystemChanges]);

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        
        {/* Auth Layout for Login (Centered card, no layout wrappers) */}
        <Route path="/login" element={<LoginPage />} />

        {/* Main Layout Wrapping All Public, Player, Manager, and Admin Routes */}
        <Route element={<Layout />}>
          
          {/* Public Landing Page at "/" */}
          <Route
            path="/"
            element={
              currentUser ? (
                currentUser.role === 'SUPER_ADMIN' ? (
                  <Navigate to="/admin/dashboard" replace />
                ) : currentUser.role === 'CLUB_MANAGER' ? (
                  <Navigate to="/manager/dashboard" replace />
                ) : (
                  <Navigate to="/player/home" replace />
                )
              ) : (
                <LandingPage />
              )
            }
          />

          {/* Player Routes (Protected) */}
          <Route path="/player/home" element={<ProtectedRoute><PlayerHomePage /></ProtectedRoute>} />
          <Route path="/player/find-games" element={<ProtectedRoute><FindGamesPage /></ProtectedRoute>} />
          <Route path="/games" element={<ProtectedRoute><FindGamesPage /></ProtectedRoute>} />
          <Route path="/player/games/:id" element={<ProtectedRoute><GameDetailsPage /></ProtectedRoute>} />
          <Route path="/games/:id" element={<ProtectedRoute><GameDetailsPage /></ProtectedRoute>} />

          <Route path="/player/courts" element={<ProtectedRoute><CourtsPage /></ProtectedRoute>} />
          <Route path="/courts" element={<ProtectedRoute><CourtsPage /></ProtectedRoute>} />
          <Route path="/player/courts/book/:courtId" element={<ProtectedRoute><BookCourtPage /></ProtectedRoute>} />
          <Route path="/courts/book" element={<ProtectedRoute><BookCourtPage /></ProtectedRoute>} />

          <Route path="/player/tournaments" element={<ProtectedRoute><TournamentsPage /></ProtectedRoute>} />
          <Route path="/tournaments" element={<ProtectedRoute><TournamentsPage /></ProtectedRoute>} />
          <Route path="/player/tournaments/:id" element={<ProtectedRoute><TournamentDetailsPage /></ProtectedRoute>} />
          <Route path="/tournaments/:id" element={<ProtectedRoute><TournamentDetailsPage /></ProtectedRoute>} />

          <Route path="/player/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/player/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
          <Route path="/player/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />

          {/* Club Manager Routes (Protected) */}
          <Route path="/club/dashboard" element={<ProtectedRoute allowedRoles={['CLUB_MANAGER', 'SUPER_ADMIN']}><ClubDashboardPage /></ProtectedRoute>} />
          <Route path="/manager/dashboard" element={<ProtectedRoute allowedRoles={['CLUB_MANAGER', 'SUPER_ADMIN']}><ClubDashboardPage /></ProtectedRoute>} />

          <Route path="/club/manage" element={<ProtectedRoute allowedRoles={['CLUB_MANAGER', 'SUPER_ADMIN']}><ManageClubPage /></ProtectedRoute>} />
          <Route path="/manager/club" element={<ProtectedRoute allowedRoles={['CLUB_MANAGER', 'SUPER_ADMIN']}><ManageClubPage /></ProtectedRoute>} />

          <Route path="/club/courts" element={<ProtectedRoute allowedRoles={['CLUB_MANAGER', 'SUPER_ADMIN']}><ManageCourtsPage /></ProtectedRoute>} />
          <Route path="/manager/courts" element={<ProtectedRoute allowedRoles={['CLUB_MANAGER', 'SUPER_ADMIN']}><ManageCourtsPage /></ProtectedRoute>} />

          <Route path="/club/pricing" element={<ProtectedRoute allowedRoles={['CLUB_MANAGER', 'SUPER_ADMIN']}><PricingSettingsPage /></ProtectedRoute>} />
          <Route path="/manager/pricing" element={<ProtectedRoute allowedRoles={['CLUB_MANAGER', 'SUPER_ADMIN']}><PricingSettingsPage /></ProtectedRoute>} />

          <Route path="/club/bookings" element={<ProtectedRoute allowedRoles={['CLUB_MANAGER', 'SUPER_ADMIN']}><BookingsPage /></ProtectedRoute>} />
          <Route path="/manager/bookings" element={<ProtectedRoute allowedRoles={['CLUB_MANAGER', 'SUPER_ADMIN']}><BookingsPage /></ProtectedRoute>} />

          {/* Super Admin Routes (Protected) */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><UserManagementPage /></ProtectedRoute>} />
          <Route path="/admin/clubs" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><ClubApprovalsPage /></ProtectedRoute>} />
          <Route path="/admin/refunds" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><RefundsPage /></ProtectedRoute>} />
          <Route path="/admin/disputes" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><DisputesPage /></ProtectedRoute>} />
          <Route path="/admin/audit-logs" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AuditLogsPage /></ProtectedRoute>} />
          <Route path="/admin/tickets" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><SupportTicketsPage /></ProtectedRoute>} />

          {/* 404 Not Found Route */}
          <Route path="*" element={<NotFoundPage />} />

        </Route>

      </Routes>
    </>
  );
}

export default App;
