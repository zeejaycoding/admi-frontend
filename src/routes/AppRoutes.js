import React, { Suspense, lazy, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import NonCoordinatorRoute from '../components/auth/NonCoordinatorRoute';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import MainLayout from '../components/layout/MainLayout';
import AdminLayout from '../components/layout/AdminLayout';
import BookManagement from '../components/dashboard/admin/BookManagement';
import CourseManagement from '../components/dashboard/admin/CourseManagement';
import EventManagement from '../components/dashboard/admin/EventManagement';
import EventDetail from '../components/events/admin/EventDetail';

import OrderManagement from '../components/dashboard/admin/OrderManagement';
import PaymentManagement from '../components/dashboard/admin/PaymentManagement';
import FormManagement from '../components/dashboard/admin/FormManagement';
import FormBuilder from '../components/dashboard/admin/FormBuilder';
import FormSubmissions from '../components/dashboard/admin/FormSubmissions';
import FormPayments from '../components/dashboard/admin/FormPayments';
import PowerPortalManagement from '../components/dashboard/admin/powerPortalManagement';
import ReportManagement from '../components/dashboard/admin/ReportManagement';
import TravellingFormCreate from "../components/power-portal/admin/TravellingFormCreate";
import TravellingForm from "../components/dashboard/admin/TravellingForm";
import TravelDetailForm from "../components/power-portal/admin/TravelDetailForm";
import ChildForm from "../components/dashboard/admin/ChildForm";
import ChildFormCreate from "../components/power-portal/admin/ChildFormCreate";
import ChildDetailForm from "../components/power-portal/admin/ChildDetailForm";
import ChildCertificate from "../components/dashboard/admin/ChildCertificate";
import MarriageForm from "../components/dashboard/admin/MarriageForm";
import MarriageFormCreate from "../components/power-portal/admin/MarriageFormCreate";
import PowerBibleSchoolRegistrations from "../components/dashboard/admin/PowerBibleSchoolRegistrations";
import DiscipleshipProgramRegistrations from "../components/dashboard/admin/DiscipleshipProgramRegistrations";
import OtherProgrammeRegistrations from "../components/dashboard/admin/OtherProgrammeRegistrations";
import ReportCreate from '../components/reports/admin/reportCreate';
import ReportDetail from '../components/reports/admin/reportDetail';
import SubmissionsOverview from '../components/dashboard/admin/SubmissionsOverview';
import RolesPermissions from '../components/dashboard/admin/RolesPermissions';
import CoordinatorChat from '../components/dashboard/admin/CoordinatorChat';
import NationalLeaderDashboard from '../components/dashboard/admin/NationalLeaderDashboard';
import PersonnelAndLeaderManagement from '../components/dashboard/admin/PersonnelAndLeaderManagement';
import NationalLeaderReportAnalytics from '../components/dashboard/admin/NationalLeaderReportAnalytics';
import CampusManagementDashboard from '../components/dashboard/admin/CampusManagementDashboard';
import CampusDetailPage from '../components/dashboard/admin/CampusDetailPage';
import { useRegion } from '../context/RegionContext';

const USAHomePage = lazy(() => import('../pages/regions/usa/USAHomePage'));
const UKHomePage = lazy(() => import('../pages/regions/uk/UKHomePage'));
const SouthAfricaHomePage = lazy(() => import('../pages/regions/south-africa/SouthAfricaHomePage'));
const NigeriaHomePage = lazy(() => import('../pages/regions/nigeria/NigeriaHomePage'));
const GhanaHomePage = lazy(() => import('../pages/regions/ghana/GhanaHomePage'));
const AboutPage = lazy(() => import('../pages/AboutPage'));
const DonatePage = lazy(() => import('../pages/DonatePage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const VerifyEmailPage = lazy(() => import('../pages/VerifyEmailPage'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'));
const WelcomeVerifyPage = lazy(() => import('../pages/WelcomeVerifyPage'));
const UserDashboard = lazy(() => import('../components/dashboard/user/UserDashboard'));
const AdminDashboard = lazy(() => import('../components/dashboard/admin/AdminDashboard'));
const UserManagement = lazy(() => import('../components/dashboard/admin/UserManagement'));
const CampusManagement = lazy(() => import('../components/dashboard/admin/CampusManagement'));
const CampusList = lazy(() => import('../components/campus/public/CampusList'));
const CampusDetail = lazy(() => import('../components/campus/public/CampusDetail'));
const EStorePage = lazy(() => import('../pages/EStorePage'));
const CartPage = lazy(() => import('../pages/CartPage'));
const PaymentSuccessPage = lazy(() => import('../pages/PaymentSuccessPage'));
const PaymentCancelPage = lazy(() => import('../pages/PaymentCancelPage'));
const CoursePlayer = lazy(() => import('../components/courses/CoursePlayer'));
const ProgramsPage = lazy(() => import('../pages/ProgramsPage'));
const ProgramDetailPage = lazy(() => import('../pages/ProgramDetailPage'));
const Partnership = lazy(() => import('../pages/Partnership'));
const FormPaymentSuccessPage = lazy(() => import('../pages/FormPaymentSuccessPage'));
const PublicFormPage = lazy(() => import('../pages/PublicFormPage'));
const NewCoordinatorsRegistrationForm = lazy(() => import('../components/ministry-forms/NewCoordinatorsRegistrationForm'));
const DiscipleshipForm    = lazy(() => import('../components/ministry-forms/DiscipleshipForm'));
const PowerBibleSchool              = lazy(() => import('../components/ministry-forms/PowerBibleSchool'));
const AbelDaminaMentoringAcademyForm = lazy(() => import('../components/ministry-forms/AbelDaminaMentoringAcademyForm'));
const AdomaHonorOfferingPage = lazy(() => import('../pages/AdomaHonorOfferingPage'));
const PbsHonorOfferingPage          = lazy(() => import('../pages/PbsHonorOfferingPage'));
const DiscipleshipHonorOfferingPage = lazy(() => import('../pages/DiscipleshipHonorOfferingPage'));

const AppRoutes = () => {
  const { selectedRegion } = useRegion();
  const { user } = useSelector((state) => state.auth);
  const isNL = Array.isArray(user?.roles) && user.roles.includes('NATIONAL_LEADER');

  // Memoized home component based on current region from context
  const HomeComponent = useMemo(() => {
    if (!selectedRegion) return NigeriaHomePage;

    switch (selectedRegion.code) {
      case 'US':
        return USAHomePage;
      case 'UK':
        return UKHomePage;
      case 'ZA':
        return SouthAfricaHomePage;
      case 'GH':
        return GhanaHomePage;
      case 'NG':
      default:
        return NigeriaHomePage;
    }
  }, [selectedRegion]);

  return (
    <Suspense fallback={<LoadingSpinner fullScreen text="Loading page..." />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomeComponent />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/donate" element={<DonatePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/welcome-verify" element={<WelcomeVerifyPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/campuses" element={<CampusList />} />
          <Route path="/campuses/:id" element={<CampusDetail />} />
          <Route path="/programs" element={<ProgramsPage />} />
          <Route path="/programs/:programId" element={<ProgramDetailPage />} />
          <Route path="/partnership" element={<Partnership />} />
          <Route path="/estore" element={<EStorePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/cancel" element={<PaymentCancelPage />} />
          <Route path="/form-payment-success" element={<FormPaymentSuccessPage />} />
          <Route path="/form-payment-cancelled" element={<Navigate to="/" replace />} />
          <Route path="/forms/:formCode" element={<PublicFormPage />} />
          <Route path="/become-coordinator" element={<NewCoordinatorsRegistrationForm />} />
          <Route path="/become-coordinator/:lang" element={<NewCoordinatorsRegistrationForm />} />
          <Route path="/discipleship" element={<DiscipleshipForm />} />
          <Route path="/discipleship/honor-offering" element={<DiscipleshipHonorOfferingPage />} />
          <Route path="/discipleship/:lang" element={<DiscipleshipForm />} />
          <Route path="/power-bible-school" element={<PowerBibleSchool />} />
          <Route path="/power-bible-school/honor-offering" element={<PbsHonorOfferingPage />} />
          <Route path="/power-bible-school/:lang" element={<PowerBibleSchool />} />
          <Route path="/mentoring-academy" element={<AbelDaminaMentoringAcademyForm />} />
          <Route path="/mentoring-academy/honor-offering" element={<AdomaHonorOfferingPage />} />
          <Route path="/mentoring-academy/:lang" element={<AbelDaminaMentoringAcademyForm />} />

          <Route
            path="/course-player/:courseId"
            element={
              <ProtectedRoute>
                <CoursePlayer />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'COORDINATOR', 'NATIONAL_LEADER']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              isNL
                ? <Navigate to="/admin/national-leader" replace />
                : (
                  <NonCoordinatorRoute>
                    <AdminDashboard />
                  </NonCoordinatorRoute>
                )
            }
          />
          <Route
            path="national-leader"
            element={
              <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'NATIONAL_LEADER']}>
                <NationalLeaderDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="personnel-leaders"
            element={
              <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'NATIONAL_LEADER']}>
                <PersonnelAndLeaderManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="national-reports-analytics"
            element={
              <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'NATIONAL_LEADER']}>
                <NationalLeaderReportAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="users"
            element={
              <NonCoordinatorRoute>
                <UserManagement />
              </NonCoordinatorRoute>
            }
          />
          <Route
            path="campuses"
            element={
              <NonCoordinatorRoute>
                <CampusManagement />
              </NonCoordinatorRoute>
            }
          />
          <Route
            path="campus-management"
            element={
              <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'NATIONAL_LEADER']}>
                <CampusManagementDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="campus-management/:id"
            element={
              <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'NATIONAL_LEADER']}>
                <CampusDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="books"
            element={
              <NonCoordinatorRoute>
                <BookManagement />
              </NonCoordinatorRoute>
            }
          />
          <Route
            path="courses"
            element={
              <NonCoordinatorRoute>
                <CourseManagement />
              </NonCoordinatorRoute>
            }
          />
          <Route
            path="events"
            element={
              <NonCoordinatorRoute>
                <EventManagement />
              </NonCoordinatorRoute>
            }
          />
          <Route
            path="events/:id"
            element={
              <NonCoordinatorRoute>
                <EventDetail />
              </NonCoordinatorRoute>
            }
          />

          <Route
            path="orders"
            element={
              <NonCoordinatorRoute>
                <OrderManagement />
              </NonCoordinatorRoute>
            }
          />
          <Route
            path="payments"
            element={
              <NonCoordinatorRoute>
                <PaymentManagement />
              </NonCoordinatorRoute>
            }
          />
          <Route
            path="forms"
            element={
              <NonCoordinatorRoute>
                <FormManagement />
              </NonCoordinatorRoute>
            }
          />
          <Route
            path="forms/builder"
            element={
              <NonCoordinatorRoute>
                <FormBuilder />
              </NonCoordinatorRoute>
            }
          />
          <Route
            path="forms/builder/:formId"
            element={
              <NonCoordinatorRoute>
                <FormBuilder />
              </NonCoordinatorRoute>
            }
          />
          <Route
            path="forms/:formId/submissions"
            element={
              <NonCoordinatorRoute>
                <FormSubmissions />
              </NonCoordinatorRoute>
            }
          />
          <Route
            path="forms/:formId/payments"
            element={
              <NonCoordinatorRoute>
                <FormPayments />
              </NonCoordinatorRoute>
            }
          />
          <Route
            path="submissions"
            element={
              <NonCoordinatorRoute>
                <SubmissionsOverview />
              </NonCoordinatorRoute>
            }
          />
          <Route path="powerportal" element={<PowerPortalManagement />} />
           <Route path="travel" element={<TravellingForm />} />
          <Route path="power-portal/travelling/createForm"element={<TravellingFormCreate />}/>
          <Route path="travel/:id" element={<TravelDetailForm />} />
          <Route path="child" element={<ChildForm />} />
          <Route path="child/:id" element={<ChildDetailForm />} />
          <Route path="power-portal/child/createForm"element={<ChildFormCreate />}/>
          <Route path="child/certificate" element={<ChildCertificate />} />
           <Route path="marriage" element={<MarriageForm />} />
            <Route path="power-portal/marriage/createForm"element={<MarriageFormCreate />}/>
           <Route
             path="power-bible-school"
             element={
               <NonCoordinatorRoute>
                 <PowerBibleSchoolRegistrations />
               </NonCoordinatorRoute>
             }
           />
           <Route
             path="discipleship-program"
             element={
               <NonCoordinatorRoute>
                 <DiscipleshipProgramRegistrations />
               </NonCoordinatorRoute>
             }
           />
           <Route
             path="other-programmes"
             element={
               <NonCoordinatorRoute>
                 <OtherProgrammeRegistrations />
               </NonCoordinatorRoute>
             }
           />
          <Route path="reports" element={<ReportManagement />} />
          <Route path="reports/create" element={<ReportCreate />} />
          <Route path="reports/:id" element={<ReportDetail />} />
           <Route
             path="menu-management"
             element={
               <NonCoordinatorRoute>
                 <RolesPermissions />
               </NonCoordinatorRoute>
             }
           />
            <Route
              path="coordinator-chat"
              element={
                <ProtectedRoute roles={['COORDINATOR']}>
                  <CoordinatorChat />
                </ProtectedRoute>
              }
            />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;


