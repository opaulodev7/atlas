import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { AreasPage } from './pages/AreasPage';
import { GoalsPage } from './pages/GoalsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { TasksPage } from './pages/TasksPage';
import { HabitsPage } from './pages/HabitsPage';
import { CheckinPage } from './pages/CheckinPage';
import { JournalPage } from './pages/JournalPage';
import { TimelinePage } from './pages/TimelinePage';
import { DecisionsPage } from './pages/DecisionsPage';
import { PlansPage } from './pages/PlansPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Protected App Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/areas" element={<AreasPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/habits" element={<HabitsPage />} />
            <Route path="/checkin" element={<CheckinPage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/decisions" element={<DecisionsPage />} />
            <Route path="/plans" element={<PlansPage />} />
            <Route path="/ai" element={<AIAssistantPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
