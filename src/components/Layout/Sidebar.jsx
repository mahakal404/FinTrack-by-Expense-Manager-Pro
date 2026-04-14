import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, BarChart3, Target } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Overview' },
  { to: '/transactions', icon: Receipt, label: 'Transactions' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/goals', icon: Target, label: 'Goals' },
];

export default function Sidebar() {
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
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
            U
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Demo User</p>
            <p className="text-xs text-slate-400">Pro Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
