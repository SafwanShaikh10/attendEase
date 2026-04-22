import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { 
  LayoutDashboard, 
  FilePlus, 
  ClipboardList, 
  UserCog, 
  LogOut, 
  User,
  ShieldAlert
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinks = () => {
    switch (user?.role) {
      case 'STUDENT':
        return [
          { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
          { name: 'Submit Request', path: '/student/submit', icon: FilePlus },
        ];
      case 'CLASS_COORD':
        return [{ name: 'Pending Requests', path: '/classcoord/pending', icon: ClipboardList }];
      case 'YEAR_COORD':
        return [{ name: 'Pending Requests', path: '/yearcoord/pending', icon: ClipboardList }];
      case 'CHAIRPERSON':
        return [{ name: 'Special ODs', path: '/chairperson/pending', icon: ClipboardList }];
      case 'ADMIN':
        return [
          { name: 'Reports Overview', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Substitute Management', path: '/admin/substitutes', icon: UserCog },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-primary/10 flex flex-col">
        <div className="p-6 border-b border-primary/10">
          <h1 className="text-xl font-headline font-black text-primary tracking-tight">AttendEase</h1>
          <p className="text-[10px] text-secondary uppercase tracking-[0.25em] mt-1">Management Portal</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all rounded-none border-l-2 ${
                  isActive
                    ? 'border-primary bg-primary/5 text-primary font-bold'
                    : 'border-transparent text-secondary hover:bg-primary/5 hover:text-primary'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-secondary'}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-primary/10">
          {/* User info */}
          <div className="flex items-center gap-3 px-2 py-3 mb-2">
            <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center border border-accent/20 flex-shrink-0">
              <User className="w-4 h-4 text-accent" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-primary truncate leading-none">{user?.name}</p>
              <p className="text-[10px] text-secondary uppercase tracking-wider mt-1">{user?.role?.replace(/_/g, ' ')}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-secondary hover:text-primary hover:bg-primary/5 transition-all border-l-2 border-transparent hover:border-primary"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-background border-b border-primary/10 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            {user?.actingAs && (
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-700 text-xs font-semibold">
                <ShieldAlert className="w-3.5 h-3.5" />
                Acting as Substitute
              </div>
            )}
            <h2 className="text-[10px] font-bold text-secondary uppercase tracking-[0.25em]">
              {location.pathname.split('/').pop().replace(/-/g, ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <NotificationBell />
            <div className="h-6 w-px bg-primary/10"></div>
            <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">
              {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
