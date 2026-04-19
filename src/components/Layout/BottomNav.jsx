import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, BarChart3, Target, Briefcase } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/transactions', icon: Receipt, label: 'Txns' },
  { to: '/ledger', icon: Briefcase, label: 'Ledger' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/goals', icon: Target, label: 'Goals' },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav lg:hidden">
      <div className="bottom-nav__inner">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`bottom-nav__icon ${isActive ? 'bottom-nav__icon--active' : ''}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                <span className={`bottom-nav__label ${isActive ? 'bottom-nav__label--active' : ''}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

