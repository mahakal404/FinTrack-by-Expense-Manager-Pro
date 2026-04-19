import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';

export default function MobileHeader() {
  return (
    <header className="mobile-header">
      <Link to="/" className="mobile-header__brand">
        <img
          src="/app-logo.webp"
          alt="FinTrack Logo"
          className="mobile-header__logo"
        />
        <div className="mobile-header__text">
          <span className="mobile-header__title">FinTrack</span>
          <span className="mobile-header__subtitle">Expense Manager Pro</span>
        </div>
      </Link>

      <Link
        to="/settings"
        className="mobile-header__action"
        aria-label="Settings"
      >
        <Settings size={20} />
      </Link>
    </header>
  );
}
