import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import AuthGuard from './components/auth/AuthGuard/AuthGuard';
import SessionManager from './components/auth/SessionManager/SessionManager';
import LoginPage from './pages/LoginPage/LoginPage';
import { ChatPage } from './pages/ChatPage';
import './styles/globals.css';
import './styles/responsive.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SessionManager>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <AuthGuard>
                  <ChatPage />
                </AuthGuard>
              }
            />
            <Route
              path="/chat"
              element={
                <AuthGuard>
                  <ChatPage />
                </AuthGuard>
              }
            />

            {/* Catch-all redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </SessionManager>
    </AuthProvider>
  );
};

export default App;
