import { Switch, Route, Redirect, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AppProvider } from "@/context/AppContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { MainLayout } from "@/components/MainLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Login from "@/pages/Login";
import ChangePassword from "@/pages/ChangePassword";
import NotFound from "@/pages/not-found";
import { CardNavItem } from "@/components/CardNav";
import { supabase } from "@/supabaseClient";

// Placeholder Pages
import StudentDashboard from "@/pages/student/Dashboard";
import AdminDashboard from "@/pages/admin/Dashboard";
import SeatingDashboard from "@/pages/seating/Dashboard";
import ClubDashboard from "@/pages/club/Dashboard";
import BulkUpload from "@/pages/admin/BulkUpload";
import SeatingAlgorithm from "@/pages/faculty/SeatingAlgorithm";

interface CurrentUser {
  id: string;
  role: 'student' | 'faculty' | 'admin';
  name?: string;
  additional_roles?: string[];
}

// Role-based navigation configuration
const getNavItemsForRole = (role: 'student' | 'faculty' | 'admin'): CardNavItem[] => {
  if (role === 'student') {
    return [
      {
        label: 'Academics',
        bgColor: '#1a1a2e',
        textColor: '#fff',
        links: [
          { label: 'Smart Syllabus', href: '/student/mindmap', ariaLabel: 'Mind Map Generator' },
          { label: 'My Results', href: '/student/results', ariaLabel: 'View Grades and Credits' }
        ]
      },
      {
        label: 'Examination',
        bgColor: '#16213e',
        textColor: '#fff',
        links: [
          { label: 'Hall Ticket', href: '/student/ticket', ariaLabel: 'Download QR Code Ticket' },
          { label: 'Seating Plan', href: '/student/seating', ariaLabel: 'Check Seat Assignment' }
        ]
      },
      {
        label: 'Campus Life',
        bgColor: '#0f3460',
        textColor: '#fff',
        links: [
          { label: 'Upcoming Events', href: '/student/events', ariaLabel: 'Event Calendar' },
          { label: 'Club Admin', href: '/student/club-admin', ariaLabel: 'Manage Club Events' }
        ]
      }
    ];
  }
  
  if (role === 'faculty') {
    return [
      {
        label: 'Classroom',
        bgColor: '#2d3436',
        textColor: '#fff',
        links: [
          { label: 'Attendance', href: '/faculty/attendance', ariaLabel: 'Mark Attendance' },
          { label: 'Syllabus Manager', href: '/faculty/syllabus', ariaLabel: 'Upload Course Materials' }
        ]
      },
      {
        label: 'Exam Duty',
        bgColor: '#3d4d5c',
        textColor: '#fff',
        links: [
          { label: 'My Schedule', href: '/faculty/invigilation', ariaLabel: 'View Duty Schedule' },
          { label: 'Seating Algorithm', href: '/faculty/seating-algo', ariaLabel: 'Generate Seating' }
        ]
      },
      {
        label: 'Student Affairs',
        bgColor: '#4a5568',
        textColor: '#fff',
        links: [
          { label: 'Mentorship', href: '/faculty/mentorship', ariaLabel: 'View Assigned Students' },
          { label: 'Club Approvals', href: '/faculty/club-approvals', ariaLabel: 'Approve Events' }
        ]
      }
    ];
  }
  
  if (role === 'admin') {
    return [
      {
        label: 'User Command',
        bgColor: '#1e1e1e',
        textColor: '#fff',
        links: [
          { label: 'Manage Users', href: '/admin/users', ariaLabel: 'User Management' },
          { label: 'Role Assignment', href: '/admin/roles', ariaLabel: 'Assign Duties' }
        ]
      },
      {
        label: 'Exam Logistics',
        bgColor: '#2a2a2a',
        textColor: '#fff',
        links: [
          { label: 'Bulk Upload', href: '/admin/bulk-upload', ariaLabel: 'Upload Hall Tickets' },
          { label: 'Exam Schedule', href: '/admin/schedule', ariaLabel: 'Set Exam Dates' }
        ]
      },
      {
        label: 'System Intelligence',
        bgColor: '#333333',
        textColor: '#fff',
        links: [
          { label: 'Delivery Reports', href: '/admin/reports', ariaLabel: 'View Reports' },
          { label: 'System Logs', href: '/admin/logs', ariaLabel: 'Activity Logs' }
        ]
      }
    ];
  }
  
  return [];
};

function ProtectedRoute({ 
  requiredRole, 
  children 
}: { 
  requiredRole: 'student' | 'faculty' | 'admin',
  children: React.ReactNode
}) {
  const currentUserJson = localStorage.getItem('currentUser');
  
  // 📍 Step A: Check if user exists
  console.log('🛡️ [PROTECTED_ROUTE] Checking access for required role:', requiredRole);
  console.log('🛡️ [PROTECTED_ROUTE] localStorage content:', currentUserJson ? 'EXISTS' : 'MISSING');
  
  if (!currentUserJson) {
    console.warn('⚠️ [PROTECTED_ROUTE] No user found in localStorage, redirecting to login');
    return <Redirect to="/" />;
  }

  const currentUser: CurrentUser = JSON.parse(currentUserJson);
  
  // 📍 Step B: Log parsed user
  console.log('🛡️ [PROTECTED_ROUTE] Parsed user from localStorage:', {
    id: currentUser.id,
    role: currentUser.role,
    name: currentUser.name,
    additional_roles: currentUser.additional_roles
  });

  // If role doesn't match, redirect to their correct dashboard
  if (currentUser.role !== requiredRole) {
    const roleMap: Record<string, string> = {
      'student': '/student/dashboard',
      'faculty': '/faculty/dashboard',
      'admin': '/admin/dashboard',
    };
    console.warn(`⚠️ [PROTECTED_ROUTE] Role mismatch. User role: "${currentUser.role}", Required: "${requiredRole}". Redirecting...`);
    console.log('🛡️ [PROTECTED_ROUTE] Role comparison:', { 
      userRole: currentUser.role, 
      userRoleType: typeof currentUser.role,
      requiredRole, 
      requiredRoleType: typeof requiredRole,
      match: currentUser.role === requiredRole 
    });
    return <Redirect to={roleMap[currentUser.role] || '/'} />;
  }

  console.log(`✅ [PROTECTED_ROUTE] Access granted for role: ${requiredRole}. Rendering children.`);
  return <>{children}</>;
}

function Router() {
  const [location] = useLocation(); // ✅ This makes Router re-render on location changes
  const currentUserJson = localStorage.getItem('currentUser');
  const currentUser = currentUserJson ? JSON.parse(currentUserJson) as CurrentUser : null;

  // 📍 Debug: Log every time Router renders
  console.log('🔄 [ROUTER] Re-rendering. Location:', location, 'Current user:', {
    exists: !!currentUser,
    id: currentUser?.id,
    role: currentUser?.role,
    storageContent: currentUserJson ? 'EXISTS' : 'MISSING'
  });

  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/change-password" component={ChangePassword} />
      
      {/* Student Routes */}
      <Route path="/student/*">
        {currentUser ? (
          <ProtectedRoute requiredRole="student">
            <MainLayout user={currentUser} navItems={getNavItemsForRole('student')}>
              <StudentDashboard />
            </MainLayout>
          </ProtectedRoute>
        ) : (
          <Login />
        )}
      </Route>

      {/* Faculty Routes */}
      <Route path="/faculty/*">
        {currentUser ? (
          <ProtectedRoute requiredRole="faculty">
            <MainLayout user={currentUser} navItems={getNavItemsForRole('faculty')}>
              <Switch>
                <Route path="/seating-algo" component={SeatingAlgorithm} />
                <Route component={SeatingDashboard} />
              </Switch>
            </MainLayout>
          </ProtectedRoute>
        ) : (
          <Login />
        )}
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/*">
        {currentUser ? (
          <ProtectedRoute requiredRole="admin">
            <MainLayout user={currentUser} navItems={getNavItemsForRole('admin')}>
              <Switch>
                <Route path="/bulk-upload" component={BulkUpload} />
                <Route component={AdminDashboard} />
              </Switch>
            </MainLayout>
          </ProtectedRoute>
        ) : (
          <Login />
        )}
      </Route>

      {/* Redirect /seating-manager to /faculty/seating */}
      <Route path="/seating-manager/*">
        <Redirect to="/faculty/seating" />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const currentUserJson = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
  const currentUser = currentUserJson ? JSON.parse(currentUserJson) : null;

  // Test Supabase connection
  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('count')
          .single();
        
        if (error) {
          console.warn('⚠️ Supabase connection warning:', error.message);
        } else {
          console.log('✅ Connected to Supabase');
        }
      } catch (err) {
        console.warn('⚠️ Supabase connection test failed:', err);
      }
    };

    testConnection();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <ErrorBoundary>
          <AppLayout>
            <Router />
          </AppLayout>
        </ErrorBoundary>
        <Toaster />
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
