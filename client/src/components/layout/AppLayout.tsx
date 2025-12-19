import React from 'react';
import { Link, useLocation } from 'wouter';
import { useApp } from '@/context/AppContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  Users, 
  Settings, 
  LogOut, 
  GraduationCap,
  Armchair,
  PartyPopper,
  ShieldCheck,
  Bell,
  Sun,
  Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import logo from '@assets/generated_images/minimalist_academic_university_logo_emblem.png';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { userRole, logout, examMode, isDarkMode, toggleDarkMode } = useApp();
  const [location] = useLocation();

  if (!userRole) return <>{children}</>;

  const navItems: Record<string, Array<{ label: string; icon: any; path: string }>> = {
    Student: [
      { label: 'Schedule', icon: Calendar, path: '/student' },
      { label: 'Study Support', icon: BookOpen, path: '/student/study' },
      { label: 'Hall Ticket', icon: ShieldCheck, path: '/student/hall-ticket' },
    ],
    Admin: [
      { label: 'Overview', icon: LayoutDashboard, path: '/admin' },
      { label: 'Exam Control', icon: Settings, path: '/admin/exams' },
    ],
    SeatingManager: [
      { label: 'Room Map', icon: LayoutDashboard, path: '/seating' },
      { label: 'Allocation', icon: Armchair, path: '/seating/allocate' },
    ],
    ClubCoordinator: [
      { label: 'Events Board', icon: LayoutDashboard, path: '/club' },
      { label: 'Approvals', icon: PartyPopper, path: '/club/approvals' },
    ]
  };

  const currentNav = navItems[userRole] || [];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="w-64 border-r border-border bg-sidebar hidden md:flex flex-col">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <img src={logo} alt="Logo" className="w-8 h-8 opacity-90" />
          <span className="font-display font-bold text-xl tracking-tight">Nexus</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {currentNav.map((item: any) => (
            <Link key={item.path} href={item.path}>
              <div 
                data-testid={`nav-item-${item.label.toLowerCase().replace(' ', '-')}`}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                  location === item.path 
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-4">
          {examMode && (
             <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 animate-pulse">
               <ShieldCheck className="w-4 h-4" />
               <span>EXAM MODE ACTIVE</span>
             </div>
          )}

          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                  {userRole?.[0].toUpperCase()}
               </div>
               <div className="min-w-0">
                  <p className="text-sm font-medium truncate capitalize leading-tight">{userRole}</p>
                  <p className="text-[10px] text-muted-foreground truncate">Online</p>
               </div>
             </div>
             <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full" 
                onClick={toggleDarkMode}
                data-testid="toggle-theme"
             >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
             </Button>
          </div>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 text-xs"
            onClick={logout}
            data-testid="button-logout"
          >
            <LogOut className="w-3 h-3 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative pb-20 md:pb-0">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-border flex items-center px-4 justify-between bg-background/80 backdrop-blur-md sticky top-0 z-50">
           <div className="flex items-center gap-2">
             <img src={logo} alt="Logo" className="w-6 h-6" />
             <span className="font-display font-bold">Nexus</span>
           </div>
           <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
             </Button>
             <Button size="icon" variant="ghost" onClick={logout}>
               <LogOut className="w-5 h-5" />
             </Button>
           </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-xl border-t border-border flex items-center justify-around px-2 z-50">
         {currentNav.map((item: any) => (
            <Link key={item.path} href={item.path}>
              <div 
                className={cn(
                  "flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-all duration-200 cursor-pointer w-16",
                  location === item.path 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", location === item.path && "fill-primary/20")} />
                <span className="text-[10px] font-medium truncate w-full text-center">{item.label}</span>
              </div>
            </Link>
          ))}
      </nav>
    </div>
  );
}
