import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { Toaster } from "sonner";
import MarketingLayout from "./components/layouts/MarketingLayout";
import AdminLayout from "./components/layouts/AdminLayout";
import LandingPage from "./components/marketing/LandingPage";
import FeaturesPage from "./components/marketing/FeaturesPage";
import PricingPage from "./components/marketing/PricingPage";
import HowItWorksPage from "./components/marketing/HowItWorksPage";
import ContactPage from "./components/marketing/ContactPage";
import AboutPage from "./components/marketing/AboutPage";
import AuthPage from "./components/marketing/AuthPage";
import Dashboard from "./components/admin/Dashboard";
import Programs from "./components/admin/Programs";
import TeacherManagement from "./components/admin/TeacherManagement";
import SubjectRoomManagement from "./components/admin/SubjectRoomManagement";
import DailyTimetable from "./components/admin/DailyTimetable";
import ConflictChecker from "./components/admin/ConflictChecker";
import GapFinder from "./components/admin/GapFinder";
import Reports from "./components/admin/Reports";
import Settings from "./components/admin/Settings";
import TeacherProfile from "./components/admin/TeacherProfile";
import UsersManagement from "./components/admin/UsersManagement";
import AcademicCalendar from "./components/admin/AcademicCalendar";
import RoomBookings from "./components/admin/RoomBookings";
import { ScrollToTop } from "./components/ScrollToTop";
import Trimesters from "./components/admin/Trimesters";

function AppContent() {
  const navigate = useNavigate();

  const handleAdminAccess = () => {
    navigate("/admin");
  };

  const handleExitAdmin = () => {
    navigate("/");
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
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/trimesters" element={<Trimesters />} />
        <Route path="/admin/academic-calendar" element={<AcademicCalendar />} />
        <Route path="/admin/programs" element={<Programs />} />
        <Route path="/admin/teachers" element={<TeacherManagement />} />
        <Route
          path="/admin/subjects-rooms"
          element={<SubjectRoomManagement />}
        />
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
      <ScrollToTop />
      <Toaster position="top-right" richColors />
      <AppContent />
    </Router>
  );
}

export default App;
