import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { SeasonProvider } from "./context/SeasonContext";
import AppLayout from "./components/AppLayout";
import HomePage from "./pages/HomePage";
import HistoryPage from "./pages/HistoryPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import MyTeamPage from "./pages/MyTeamPage";
import TeamPublicPage from "./pages/TeamPublicPage";
import ProfileHubPage from "./pages/ProfileHubPage";
import CalendarPage from "./pages/CalendarPage";
import RulesPage from "./pages/RulesPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  return (
    <SeasonProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="my-team" element={<MyTeamPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="profile" element={<ProfileHubPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="rules" element={<RulesPage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="team/:teamId" element={<TeamPublicPage />} />
          </Route>
        </Routes>
      </Router>
    </SeasonProvider>
  );
}
