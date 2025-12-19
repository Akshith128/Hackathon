import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, Briefcase, Shield, Lock, ArrowRight, Users } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import bgImage from '@assets/generated_images/abstract_executive_dark_background_with_glassmorphism_elements.png';
import logo from '@assets/generated_images/minimalist_academic_university_logo_emblem.png';

export default function Login() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const roles = [
    { id: 'student', label: 'Student', icon: GraduationCap, path: '/student/dashboard', color: 'from-blue-500 to-cyan-500' },
    { id: 'faculty', label: 'Faculty', icon: Briefcase, path: '/faculty/dashboard', color: 'from-emerald-500 to-teal-500' },
    { id: 'admin', label: 'Admin', icon: Shield, path: '/admin/dashboard', color: 'from-purple-500 to-pink-500' },
  ];

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setShowForm(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier || !password || !selectedRole) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // 📍 Step 1: Log login attempt
      console.log('🔐 [LOGIN] Attempting login for:', { identifier, role: selectedRole });
      
      const res = await apiRequest('POST', '/api/login', {
        id: identifier,
        password,
        role: selectedRole
      });

      const user = await res.json();
      
      // 📍 Step 2: Log API response
      console.log('✅ [LOGIN] API Response received:', { 
        id: user.id, 
        role: user.role, 
        name: user.name,
        additional_roles: user.additional_roles,
        fullUser: user 
      });
      
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // 📍 Step 3: Verify localStorage
      const storedUser = localStorage.getItem('currentUser');
      console.log('💾 [LOGIN] Stored in localStorage:', JSON.parse(storedUser || '{}'));

      toast({
        title: "Success",
        description: `Logged in as ${user.id}`,
      });

      try {
        const roleMap: Record<string, string> = {
          'student': '/student/dashboard',
          'admin': '/admin/dashboard',
          'faculty': '/faculty/dashboard',
        };
        const targetPath = roleMap[user.role] || '/';
        console.log('🔐 [LOGIN] Role mapping result:', { userRole: user.role, targetPath });
        console.log('🔐 [LOGIN] Redirecting to:', targetPath);
        setLocation(targetPath);
      } catch (navError) {
        console.error('❌ [LOGIN] Navigation error:', navError);
        toast({
          title: "Navigation Error",
          description: "Failed to redirect. Please refresh the page.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ [LOGIN] Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Login failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (showForm && selectedRole) {
    const role = roles.find(r => r.id === selectedRole);
    
    const identifierLabels: Record<string, { label: string; placeholder: string }> = {
      'admin': { label: 'Admin ID', placeholder: 'Enter your admin ID' },
      'student': { label: 'Roll Number', placeholder: 'e.g., R101' },
      'faculty': { label: 'Faculty ID', placeholder: 'e.g., FAC001' },
    };

    const roleInfo = identifierLabels[selectedRole] || identifierLabels['student'];

    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <Card className="w-full max-w-md p-8 space-y-6">
          <div className="space-y-2 text-center">
            <Button
              variant="ghost"
              onClick={() => { setShowForm(false); setSelectedRole(null); setIdentifier(''); setPassword(''); }}
              className="mb-4"
              data-testid="button-back-to-roles"
            >
              ← Back to Roles
            </Button>
            <div className="flex justify-center mb-4">
              {role && <role.icon className="w-8 h-8 text-blue-400" />}
            </div>
            <h1 className="text-2xl font-bold">{role?.label}</h1>
            <p className="text-sm text-muted-foreground">
              {selectedRole === 'admin' ? 'Admin login' : 'Your credentials are created by admin'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">{roleInfo.label}</Label>
              <Input
                id="identifier"
                type="text"
                placeholder={roleInfo.placeholder}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={loading}
                required
                data-testid="input-identifier"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder={selectedRole === 'admin' ? 'Enter your password' : 'Password is DDMMYYYY format of your DOB'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="input-password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              data-testid="button-login-submit"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          {selectedRole === 'admin' ? (
            <div className="text-xs text-center text-muted-foreground bg-blue-500/10 border border-blue-500/30 rounded-md p-3">
              <p className="font-semibold mb-1">Admin Demo Credentials:</p>
              <p>ID: <code className="bg-muted px-1 rounded">admin</code></p>
              <p>Password: <code className="bg-muted px-1 rounded">admin</code></p>
            </div>
          ) : (
            <div className="text-xs text-center text-muted-foreground bg-amber-500/10 border border-amber-500/30 rounded-md p-3">
              <p className="font-semibold mb-1">Don't have credentials?</p>
              <p>Ask your administrator to create your account first.</p>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background">
      <div 
        className="absolute inset-0 z-0 opacity-40"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-background via-background/80 to-transparent" />

      <div className="relative z-10 w-full max-w-5xl px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        <div className="space-y-6 text-center md:text-left">
          <div className="inline-flex items-center justify-center md:justify-start gap-4 mb-4">
             <img src={logo} alt="Logo" className="w-16 h-16 border-2 border-white/20 rounded-full p-2 bg-black/40 backdrop-blur-xl" />
             <h1 className="text-5xl md:text-7xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-white/50 tracking-tighter">
               Nexus
             </h1>
          </div>
          <p className="text-xl text-muted-foreground font-light max-w-md mx-auto md:mx-0">
            The next generation Integrated Academic & Examination Management System.
          </p>
          <div className="flex gap-4 justify-center md:justify-start text-sm text-muted-foreground/60">
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Secure</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Scalable</span>
            <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Enterprise</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => handleRoleSelect(role.id)}
              className="group relative overflow-hidden rounded-2xl border border-purple-500/30 bg-white/10 backdrop-blur-md p-6 transition-all hover:bg-white/20 hover:border-purple-400/60 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]"
              disabled={loading}
              data-testid={`button-login-role-${role.id}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-3">
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 text-purple-400 shadow-inner group-hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-shadow">
                  <role.icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 transition-all">
                    {role.label}
                  </h3>
                  <p className="text-xs text-gray-400 group-hover:text-cyan-300 transition-colors mt-1">
                    Login portal
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
