import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SignIn, useUser } from "@clerk/clerk-react";
import { Toaster } from "sonner";
import AdminDashboard from "./layouts/AdminDashboard";
import UserDashboard from "./layouts/UserDashboard";
//user
import Home from "./pages/Home";
import EventsPage from "./pages/EventsPage";
import DonationPage from "./pages/DonationPage";
import ContactPage from "./pages/ContactPage"; 
import GalleryPage from "./pages/Carousel";
import AboutPage from "./pages/AboutPage"; 
//admin pages
import {Settings} from "./pages/Settings";
import {Dashboard} from "./pages/Dashboard";
import { VisitationPlanner } from "./pages/VisitationPlanner";  
import { DonationList } from "./pages/DonationList";
import { VisitationManagementList } from "./pages/VisitManagement";
import {GalleryUpload} from "./pages/GalleryUpload";
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!isSignedIn) return <Navigate to="/sign-in" replace />;

  const role = user?.publicMetadata?.role || "user";
  
  if (!allowedRoles.includes(role)) {
    return <Navigate to={role === "admin" ? "/admin" : "/user"} replace />;
  }

  return children;
}

function DashboardRedirect() {
  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!isSignedIn) return <Navigate to="/sign-in" replace />;

  const role = user?.publicMetadata?.role || "user";
  return <Navigate to={role === "admin" ? "/admin" : "/user"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sign-in" element={<SignIn redirectUrl="/dashboard" />} />
        <Route path="/dashboard" element={<DashboardRedirect />} />
        
        <Route
          path="/user/*"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="donate" element={<DonationPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="gallery" element={<GalleryPage />} />
        </Route>

        <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
            </ProtectedRoute>
        }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="settings" element={<Settings />} />
          <Route path="visitation-planner" element={<VisitationPlanner />} />
          <Route path="visitation-mgt" element={<VisitationManagementList />} />
          <Route path="donations" element={<DonationList />} />
          <Route path="gallery-upload" element={<GalleryUpload />} />

        </Route>

        

        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}