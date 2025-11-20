import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FormsPage from './pages/FormsPage';
import FormBuilder from './pages/FormBuilder';
import FormView from './pages/FormView';
import Analytics from './pages/Analytics';
import AnalyticsPage from './pages/AnalyticsPage';
import FormSettings from './pages/FormSettings';
import Layout from './components/Layout';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/form/:shareableUrl" element={<FormView />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="forms" element={<FormsPage />} />
          <Route path="forms/new" element={<FormBuilder />} />
          <Route path="forms/:id/edit" element={<FormBuilder />} />
          <Route path="forms/:id/settings" element={<FormSettings />} />
          <Route path="forms/:id/analytics" element={<Analytics />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
