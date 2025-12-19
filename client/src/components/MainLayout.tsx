import React from 'react';
import CardNav, { CardNavItem } from '@/components/CardNav';

interface CurrentUser {
  id: string;
  role: 'student' | 'faculty' | 'admin';
  name?: string;
  additional_roles?: string[];
}

interface MainLayoutProps {
  children: React.ReactNode;
  user: CurrentUser;
  navItems?: CardNavItem[];
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, user, navItems = [] }) => {
  if (!user) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold">Loading...</div>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  // Display nav items or empty array if none provided
  const itemsToDisplay = navItems && navItems.length > 0 ? navItems : [];

  return (
    <div className="w-full min-h-screen bg-black">
      {/* Floating Navigation Cards */}
      {itemsToDisplay.length > 0 && (
        <CardNav 
          items={itemsToDisplay}
          logo="Nexus"
          baseColor="rgba(0, 0, 0, 0.9)"
          menuColor="#fff"
          buttonBgColor="rgba(255, 255, 255, 0.1)"
          buttonTextColor="#fff"
          onLogout={handleLogout}
        />
      )}
      
      {/* Content Container - Padded so Nav doesn't overlap */}
      <div className="pt-32 px-6 pb-12 max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
};
