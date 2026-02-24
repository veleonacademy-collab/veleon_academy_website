import React from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import DashboardPage from "./pages/DashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import TutorDashboardPage from "./pages/TutorDashboardPage";
import StudentDashboardPage from "./pages/StudentDashboardPage";
import UserDashboardPage from "./pages/UserDashboardPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import TrendingPage from "./pages/TrendingPage";
import ItemDetailsPage from "./pages/ItemDetailsPage";
import PricingPage from "./pages/PricingPage";
import { StripeProvider } from "./components/Payment/StripeProvider";
import AdminLoginPage from "./pages/admin/auth/AdminLoginPage";
import AdminRegisterPage from "./pages/admin/auth/AdminRegisterPage";
import AdminProfilePage from "./pages/admin/profile/AdminProfilePage";
import StaffLoginPage from "./pages/staff/auth/StaffLoginPage";
import StaffRegisterPage from "./pages/staff/auth/StaffRegisterPage";
import StaffProfilePage from "./pages/staff/profile/StaffProfilePage";
import UserLoginPage from "./pages/user/auth/UserLoginPage";
import UserRegisterPage from "./pages/user/auth/UserRegisterPage";
import UserProfilePage from "./pages/user/profile/UserProfilePage";
import AdminListItemsPage from "./pages/admin/list/AdminListItemsPage";
import AdminAddItemPage from "./pages/admin/add/AdminAddItemPage";
import AdminViewItemPage from "./pages/admin/view/AdminViewItemPage";
import AdminEditItemPage from "./pages/admin/edit/AdminEditItemPage";
import StaffListItemsPage from "./pages/staff/list/StaffListItemsPage";
import StaffAddItemPage from "./pages/staff/add/StaffAddItemPage";
import StaffViewItemPage from "./pages/staff/view/StaffViewItemPage";
import StaffEditItemPage from "./pages/staff/edit/StaffEditItemPage";
import UserListItemsPage from "./pages/user/list/UserListItemsPage";
import UserAddItemPage from "./pages/user/add/UserAddItemPage";
import UserViewItemPage from "./pages/user/view/UserViewItemPage";
import UserEditItemPage from "./pages/user/edit/UserEditItemPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ChatPage } from "./pages/ChatPage";
import StyleMePage from "./pages/StyleMePage";
import CategoriesPage from "./pages/CategoriesPage";
import AdminCustomersPage from "./pages/admin/AdminCustomersPage";
import AdminTasksPage from "./pages/admin/AdminTasksPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import StaffPortalPage from "./pages/staff/StaffPortalPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentCancelPage from "./pages/PaymentCancelPage";
import AdminSupportPage from "./pages/admin/AdminSupportPage";
import StaffSupportPage from "./pages/staff/StaffSupportPage";

import AdminFinancePage from "./pages/admin/AdminFinancePage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminAdsPage from "./pages/admin/AdminAdsPage";

import AdminCoursesPage from "./pages/admin/courses/AdminCoursesPage";
import AdminCurriculumPage from "./pages/admin/courses/AdminCurriculumPage";
import AdminEnrollmentsPage from "./pages/admin/enrollments/AdminEnrollmentsPage";
import AdminTutorsPage from "./pages/admin/tutors/AdminTutorsPage";
import AdminTutorDetailsPage from "./pages/admin/tutors/AdminTutorDetailsPage";
import AdminAcademySupportPage from "./pages/admin/AdminAcademySupportPage";
import TutorCurriculumPage from "./pages/tutor/TutorCurriculumPage";

import EnrollPage from "./pages/EnrollPage";

const App: React.FC = () => {
  return (
    <StripeProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/trending" element={<TrendingPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/item/:id" element={<ItemDetailsPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/style-me" element={<StyleMePage />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/cancel" element={<PaymentCancelPage />} />
          <Route path="/enroll/:courseId" element={<EnrollPage />} />
        {/* Global auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Public pages */}
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />

        {/* Generic protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Route>

        {/* Admin-specific auth & profile */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/register" element={<AdminRegisterPage />} />
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/profile" element={<AdminProfilePage />} />
        </Route>

        {/* Tutor-specific auth & profile */}
        <Route path="/tutor/login" element={<StaffLoginPage />} />
        <Route path="/tutor/register" element={<StaffRegisterPage />} />
        <Route element={<ProtectedRoute allowedRoles={["tutor"]} />}>
          <Route path="/tutor/profile" element={<StaffProfilePage />} />
        </Route>
 
        {/* Student-specific auth & profile */}
        <Route path="/student/login" element={<UserLoginPage />} />
        <Route path="/student/register" element={<UserRegisterPage />} />
        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route path="/student/profile" element={<UserProfilePage />} />
        </Route>

        {/* Role-specific dashboards */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/items" element={<AdminListItemsPage />} />
          <Route path="/admin/items/new" element={<AdminAddItemPage />} />
          <Route path="/admin/items/:id" element={<AdminViewItemPage />} />
          <Route path="/admin/items/:id/edit" element={<AdminEditItemPage />} />
          <Route path="/admin/customers" element={<AdminCustomersPage />} />
          <Route path="/admin/tasks" element={<AdminTasksPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          <Route path="/admin/support" element={<AdminSupportPage />} />
          <Route path="/admin/finance" element={<AdminFinancePage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          <Route path="/admin/ads" element={<AdminAdsPage />} />
          <Route path="/admin/courses" element={<AdminCoursesPage />} />
          <Route path="/admin/courses/:courseId/curriculum" element={<AdminCurriculumPage />} />
          <Route path="/admin/enrollments" element={<AdminEnrollmentsPage />} />
          <Route path="/admin/tutors" element={<AdminTutorsPage />} />
          <Route path="/admin/tutor/:tutorId" element={<AdminTutorDetailsPage />} />
          <Route path="/admin/academy-support" element={<AdminAcademySupportPage />} />

        </Route>

        <Route element={<ProtectedRoute allowedRoles={["tutor"]} />}>
          <Route path="/tutor/dashboard" element={<TutorDashboardPage />} />
          <Route path="/tutor/portal" element={<StaffPortalPage />} />
          <Route path="/tutor/support" element={<StaffSupportPage />} />
          <Route path="/tutor/course/:courseId/curriculum" element={<TutorCurriculumPage />} />
        </Route>
 
        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route path="/student/dashboard" element={<StudentDashboardPage />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
          <Route path="/user/dashboard" element={<UserDashboardPage />} />
        </Route>

        {/* Course detail — accessible to both students and tutors */}
        <Route element={<ProtectedRoute allowedRoles={["student", "tutor"]} />}>
          <Route path="/academy/course/:courseId" element={<CourseDetailPage />} />
        </Route>
        </Routes>
      </Layout>
    </StripeProvider>
  );
};

export default App;
