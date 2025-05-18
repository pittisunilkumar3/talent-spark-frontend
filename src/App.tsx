
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import MainLayout from "@/components/layout/MainLayout";
import AuthProtection from "@/components/auth/AuthProtection";
import NotFound from "./pages/NotFound";

// HR Pages
import EmployeeAddPage from "./pages/hr/employees/add";
import EmployeeEditPage from "./pages/hr/employees/edit";
import EmployeeAttendancePage from "./pages/hr/attendance";
import PayrollPage from "./pages/hr/payroll";
import DepartmentsPage from "./pages/hr/departments";
import DesignationsPage from "./pages/hr/designations";
import ApplyLeavePage from "./pages/hr/leave/apply";
import LeaveTypesPage from "./pages/hr/leave/types";
import LeaveRequestsPage from "./pages/hr/leave/requests";
import DisabledEmployeesPage from "./pages/hr/employees/disabled";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Dashboard Pages
import DashboardRouter from "./pages/dashboard/DashboardRouter";

// Admin Pages
import AdminPanelPage from "./pages/admin/AdminPanelPage";

// Roles Pages
import { RolesPage, AddRolePage, RoleDetailsPage, RoleEditPage, RolePermissionsPage, PermissionGroupsPage } from "./pages/roles";

// Branches Pages
import { BranchesPage, AddBranchPage, BranchDetailsPage, EditBranchPage } from "./pages/branches";

// Resume Pages
import ResumeUploadPage from "./pages/resume/ResumeUploadPage";

// Screening Pages
import ScreeningsPage from "./pages/screening/ScreeningsPage";

// Candidates Pages
import CandidatesPage from "./pages/candidates/CandidatesPage";
import CandidateDetailsPage from "./pages/candidates/CandidateDetailsPage";

// Interview Pages
import InterviewsPage from "./pages/interviews/InterviewsPage";
import FeedbackPage from "./pages/interviews/FeedbackPage";

// Application Pages
import ApplicationPage from "./pages/application/ApplicationPage";

// Settings Pages
import SettingsPage from "./pages/settings/SettingsPage";

// Teams Pages
import TeamsPage from "./pages/teams/TeamsPage";
import TeamDetailsPage from "./pages/teams/TeamDetailsPage";
import ProfileDetailsPage from "./pages/teams/ProfileDetailsPage";

// Profiles Pages
import ProfilesPage from "./pages/profiles/ProfilesPage";
import EmployeeProfilePage from "./pages/profiles/EmployeeProfilePage";

// Reports Page
import ReportsPage from "./pages/reports/ReportsPage";

// Job Pages
import JobDetailsPage from "./pages/jobs/JobDetailsPage";
import JobCreatePage from "./pages/jobs/JobCreatePage";
import UnifiedJobsPage from "./pages/jobs/UnifiedJobsPage";

// Profit Pages
import ProfitCalculatorPage from "./pages/profit/ProfitCalculatorPage";

// Feedback Page has been removed and integrated into ProfileDetailsPage

// Landing Page
import LandingPage from "./pages/LandingPage";

// Add Index page for routing decisions
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Index route for deciding where to redirect based on auth state */}
            <Route path="/index" element={<Index />} />

            {/* Protected Routes with MainLayout */}
            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={
                <AuthProtection>
                  <MainLayout>
                    <DashboardRouter />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Admin Panel - For CEO Only */}
            <Route
              path="/admin"
              element={
                <AuthProtection allowedRoles={['ceo']}>
                  <MainLayout>
                    <AdminPanelPage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Roles Management - For CEO Only */}
            {/* Note: Order matters! More specific routes must come before less specific ones */}

            {/* Add Role - For CEO Only */}
            <Route
              path="/roles/add"
              element={
                <AuthProtection allowedRoles={['ceo']}>
                  <MainLayout>
                    <AddRolePage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Edit Role - For CEO Only */}
            <Route
              path="/roles/edit/:roleId"
              element={
                <AuthProtection allowedRoles={['ceo']}>
                  <MainLayout>
                    <RoleEditPage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Role Permissions - For CEO Only */}
            <Route
              path="/roles/permissions/:roleId"
              element={
                <AuthProtection allowedRoles={['ceo']}>
                  <MainLayout>
                    <RolePermissionsPage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Permission Groups - For CEO Only */}
            <Route
              path="/roles/permission-groups"
              element={
                <AuthProtection allowedRoles={['ceo']}>
                  <MainLayout>
                    <PermissionGroupsPage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Role Details - For CEO Only */}
            <Route
              path="/roles/:roleId"
              element={
                <AuthProtection allowedRoles={['ceo']}>
                  <MainLayout>
                    <RoleDetailsPage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Roles List - For CEO Only */}
            <Route
              path="/roles"
              element={
                <AuthProtection allowedRoles={['ceo']}>
                  <MainLayout>
                    <RolesPage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Branches List - For CEO and Branch Manager */}
            <Route
              path="/branches"
              element={
                <AuthProtection allowedRoles={['ceo', 'branch-manager']}>
                  <MainLayout>
                    <BranchesPage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Add Branch - For CEO and Branch Manager */}
            <Route
              path="/branches/add"
              element={
                <AuthProtection allowedRoles={['ceo', 'branch-manager']}>
                  <MainLayout>
                    <AddBranchPage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Branch Details - For CEO and Branch Manager */}
            <Route
              path="/branches/:branchId"
              element={
                <AuthProtection allowedRoles={['ceo', 'branch-manager']}>
                  <MainLayout>
                    <BranchDetailsPage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Edit Branch - For CEO and Branch Manager */}
            <Route
              path="/branches/edit/:branchId"
              element={
                <AuthProtection allowedRoles={['ceo', 'branch-manager']}>
                  <MainLayout>
                    <EditBranchPage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Teams - For CEO, Branch Manager, Marketing Head, Marketing Supervisor */}
            <Route
              path="/teams"
              element={
                <AuthProtection allowedRoles={['ceo', 'branch-manager', 'marketing-head', 'marketing-supervisor']}>
                  <MainLayout>
                    <TeamsPage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Team Details - For CEO, Branch Manager, Marketing Head, Marketing Supervisor */}
            <Route
              path="/teams/:teamId"
              element={
                <AuthProtection allowedRoles={['ceo', 'branch-manager', 'marketing-head', 'marketing-supervisor']}>
                  <MainLayout>
                    <TeamDetailsPage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Profiles - For All Roles except Applicant */}
            <Route
              path="/profiles"
              element={
                <AuthProtection allowedRoles={['ceo', 'branch-manager', 'marketing-head', 'marketing-supervisor', 'marketing-recruiter', 'marketing-associate']}>
                  <MainLayout>
                    <ProfilesPage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Profile Details - For All Roles except Applicant */}
            <Route
              path="/profiles/:profileId"
              element={
                <AuthProtection allowedRoles={['ceo', 'branch-manager', 'marketing-head', 'marketing-supervisor', 'marketing-recruiter', 'marketing-associate']}>
                  <MainLayout>
                    <EmployeeProfilePage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Resume Management - For All Roles except Applicant */}
            <Route
              path="/resume-upload"
              element={
                <AuthProtection allowedRoles={['ceo', 'branch-manager', 'marketing-head', 'marketing-supervisor', 'marketing-recruiter', 'marketing-associate']}>
                  <MainLayout>
                    <ResumeUploadPage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Job Descriptions - Redirect to Unified Jobs Management */}
            <Route
              path="/job-descriptions"
              element={<Navigate to="/jobs-management" replace />}
            />

            {/* Job Matching Results - Redirect to Unified Jobs Management */}
            <Route
              path="/job-matching-results"
              element={<Navigate to="/jobs-management" replace />}
            />

            {/* Screenings - For CEO, Branch Manager, Marketing Recruiter */}
            <Route
              path="/screenings"
              element={
                <AuthProtection allowedRoles={['ceo', 'branch-manager', 'marketing-recruiter']}>
                  <MainLayout>
                    <ScreeningsPage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Candidates - For Everyone except Applicants */}
            <Route
              path="/candidates"
              element={
                <AuthProtection allowedRoles={['ceo', 'branch-manager', 'marketing-head', 'marketing-supervisor', 'marketing-recruiter', 'marketing-associate']}>
                  <MainLayout>
                    <CandidatesPage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Candidate Details - For Everyone except Applicants */}
            <Route
              path="/candidates/:candidateId"
              element={
                <AuthProtection allowedRoles={['ceo', 'branch-manager', 'marketing-head', 'marketing-supervisor', 'marketing-recruiter', 'marketing-associate']}>
                  <MainLayout>
                    <CandidateDetailsPage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Interviews - For CEO, Branch Manager, Marketing Associate */}
            <Route
              path="/interviews"
              element={
                <AuthProtection allowedRoles={['ceo', 'branch-manager', 'marketing-associate']}>
                  <MainLayout>
                    <InterviewsPage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Interview Feedback - For CEO, Branch Manager, Marketing Associate */}
            <Route
              path="/interviews/feedback"
              element={
                <AuthProtection allowedRoles={['ceo', 'branch-manager', 'marketing-associate']}>
                  <MainLayout>
                    <FeedbackPage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Application - For Applicants */}
            <Route
              path="/application"
              element={
                <AuthProtection allowedRoles={['applicant']}>
                  <MainLayout>
                    <ApplicationPage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Reports - For CEO, Branch Manager, Marketing Head, Marketing Supervisor */}
            <Route
              path="/reports"
              element={
                <AuthProtection allowedRoles={['ceo', 'branch-manager', 'marketing-head', 'marketing-supervisor']}>
                  <MainLayout>
                    <ReportsPage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Unified Jobs Management - For All Roles except Applicant */}
            <Route
              path="/jobs-management"
              element={
                <AuthProtection allowedRoles={['ceo', 'branch-manager', 'marketing-head', 'marketing-supervisor', 'marketing-recruiter', 'marketing-associate']}>
                  <MainLayout>
                    <UnifiedJobsPage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Legacy Job Listings - Redirect to Unified Jobs Management */}
            <Route
              path="/jobs"
              element={<Navigate to="/jobs-management" replace />}
            />

            {/* Job Details - For All Roles except Applicant */}
            <Route
              path="/jobs/:jobId"
              element={
                <AuthProtection allowedRoles={['ceo', 'branch-manager', 'marketing-head', 'marketing-supervisor', 'marketing-recruiter', 'marketing-associate']}>
                  <MainLayout>
                    <JobDetailsPage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Create Job - For CEO, Branch Manager, Marketing Head */}
            <Route
              path="/jobs/create"
              element={
                <AuthProtection allowedRoles={['ceo', 'branch-manager', 'marketing-head']}>
                  <MainLayout>
                    <JobCreatePage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Profit Calculator - For CEO, Branch Manager, Marketing Head, Marketing Supervisor */}
            <Route
              path="/profit-calculator"
              element={
                <AuthProtection allowedRoles={['ceo', 'branch-manager', 'marketing-head', 'marketing-supervisor']}>
                  <MainLayout>
                    <ProfitCalculatorPage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Settings - For All Users */}
            <Route
              path="/settings"
              element={
                <AuthProtection>
                  <MainLayout>
                    <SettingsPage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* HR Routes - For All Roles except Applicant */}
            {/* Employee Add */}
            <Route
              path="/hr/employees/add"
              element={
                <AuthProtection allowedRoles={['ceo', 'branch-manager', 'marketing-head', 'marketing-supervisor', 'marketing-recruiter', 'marketing-associate']}>
                  <MainLayout>
                    <EmployeeAddPage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Employee Edit */}
            <Route
              path="/hr/employees/edit/:employeeId"
              element={
                <AuthProtection allowedRoles={['ceo', 'branch-manager', 'marketing-head', 'marketing-supervisor', 'marketing-recruiter', 'marketing-associate']}>
                  <MainLayout>
                    <EmployeeEditPage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Employee Attendance */}
            <Route
              path="/hr/attendance"
              element={
                <AuthProtection allowedRoles={['ceo', 'branch-manager', 'marketing-head', 'marketing-supervisor', 'marketing-recruiter', 'marketing-associate']}>
                  <MainLayout>
                    <EmployeeAttendancePage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Payroll */}
            <Route
              path="/hr/payroll"
              element={
                <AuthProtection allowedRoles={['ceo', 'branch-manager', 'marketing-head', 'marketing-supervisor', 'marketing-recruiter', 'marketing-associate']}>
                  <MainLayout>
                    <PayrollPage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Department */}
            <Route
              path="/hr/departments"
              element={
                <AuthProtection allowedRoles={['ceo', 'branch-manager', 'marketing-head', 'marketing-supervisor', 'marketing-recruiter', 'marketing-associate']}>
                  <MainLayout>
                    <DepartmentsPage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Designation */}
            <Route
              path="/hr/designations"
              element={
                <AuthProtection allowedRoles={['ceo', 'branch-manager', 'marketing-head', 'marketing-supervisor', 'marketing-recruiter', 'marketing-associate']}>
                  <MainLayout>
                    <DesignationsPage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Apply Leave */}
            <Route
              path="/hr/leave/apply"
              element={
                <AuthProtection allowedRoles={['ceo', 'branch-manager', 'marketing-head', 'marketing-supervisor', 'marketing-recruiter', 'marketing-associate']}>
                  <MainLayout>
                    <ApplyLeavePage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Leave Type */}
            <Route
              path="/hr/leave/types"
              element={
                <AuthProtection allowedRoles={['ceo', 'branch-manager', 'marketing-head', 'marketing-supervisor', 'marketing-recruiter', 'marketing-associate']}>
                  <MainLayout>
                    <LeaveTypesPage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Leave Request */}
            <Route
              path="/hr/leave/requests"
              element={
                <AuthProtection allowedRoles={['ceo', 'branch-manager', 'marketing-head', 'marketing-supervisor', 'marketing-recruiter', 'marketing-associate']}>
                  <MainLayout>
                    <LeaveRequestsPage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Disable Employees */}
            <Route
              path="/hr/employees/disabled"
              element={
                <AuthProtection allowedRoles={['ceo', 'branch-manager', 'marketing-head', 'marketing-supervisor', 'marketing-recruiter', 'marketing-associate']}>
                  <MainLayout>
                    <DisabledEmployeesPage />
                  </MainLayout>
                </AuthProtection>
              }
            />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </NotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
