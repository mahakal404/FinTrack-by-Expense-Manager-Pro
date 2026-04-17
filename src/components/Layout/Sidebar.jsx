import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, BarChart3, Target, LogOut, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Overview' },
  { to: '/transactions', icon: Receipt, label: 'Transactions' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/projects', icon: Briefcase, label: 'Projects' },
  { to: '/goals', icon: Target, label: 'Goals' },
];

export default function Sidebar() {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';
  const displayInitial = displayName.charAt(0).toUpperCase();

  return (
    <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-slate-100 h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <img
            src="/app-logo.webp"
            alt="FinTrack Logo"
            className="sidebar-app-logo"
          />
          <div>
            <h1 className="text-base font-bold text-slate-800">FinTrack</h1>
            <p className="text-[11px] text-slate-400 -mt-0.5">Expense Manager Pro</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
              ${isActive
                ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-slate-100 mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            {currentUser?.photoURL ? (
              <img src={currentUser?.photoURL} alt={displayName} className="w-9 h-9 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-full shrink-0 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
                {displayInitial}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-700 truncate">{displayName}</p>
              <p className="text-xs text-slate-400 truncate">{currentUser?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            title="Log out"
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
