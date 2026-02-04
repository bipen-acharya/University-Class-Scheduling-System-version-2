import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner@2.0.3';
import MarketingLayout from './components/layouts/MarketingLayout';
import AdminLayout from './components/layouts/AdminLayout';
import LandingPage from './components/marketing/LandingPage';
import FeaturesPage from './components/marketing/FeaturesPage';
import PricingPage from './components/marketing/PricingPage';
import HowItWorksPage from './components/marketing/HowItWorksPage';
import ContactPage from './components/marketing/ContactPage';
import AboutPage from './components/marketing/AboutPage';
import AuthPage from './components/marketing/AuthPage';
import Dashboard from './components/admin/Dashboard';
import Programs from './components/admin/Programs';
import TeacherManagement from './components/admin/TeacherManagement';
import SubjectRoomManagement from './components/admin/SubjectRoomManagement';
import DailyTimetable from './components/admin/DailyTimetable';
import ConflictChecker from './components/admin/ConflictChecker';
import GapFinder from './components/admin/GapFinder';
import Reports from './components/admin/Reports';
import Settings from './components/admin/Settings';
import TeacherProfile from './components/admin/TeacherProfile';
import UsersManagement from './components/admin/UsersManagement';
import AcademicCalendar from './components/admin/AcademicCalendar';
import RoomBookings from './components/admin/RoomBookings';

function AppContent() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const navigate = useNavigate();

  const handleAdminAccess = () => {
    setIsAdminMode(true);
    navigate('/admin');
  };

  const handleExitAdmin = () => {
    setIsAdminMode(false);
    navigate('/');
  };

  return (
    <Routes>
      {/* Marketing Website Routes */}
      <Route element={<MarketingLayout onAdminAccess={handleAdminAccess} />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/auth" element={<AuthPage />} />
      </Route>

      {/* Admin System Routes */}
      <Route element={<AdminLayout isAdminMode={isAdminMode} onExitAdmin={handleExitAdmin} />}>
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/academic-calendar" element={<AcademicCalendar />} />
        <Route path="/admin/programs" element={<Programs />} />
        <Route path="/admin/teachers" element={<TeacherManagement />} />
        <Route path="/admin/subjects-rooms" element={<SubjectRoomManagement />} />
        <Route path="/admin/room-bookings" element={<RoomBookings />} />
        <Route path="/admin/timetable" element={<DailyTimetable />} />
        <Route path="/admin/gap-finder" element={<GapFinder />} />
        <Route path="/admin/conflicts" element={<ConflictChecker />} />
        <Route path="/admin/reports" element={<Reports />} />
        <Route path="/admin/settings" element={<Settings />} />
        <Route path="/admin/teacher/:id" element={<TeacherProfile />} />
        <Route path="/admin/users" element={<UsersManagement />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <Toaster position="top-right" richColors />
      <AppContent />
    </Router>
  );
}

export default App;