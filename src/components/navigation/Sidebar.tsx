import { BriefcaseBusiness, Inbox, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { routes } from '../../config/routes';

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand-lockup">
        <div className="brand-monogram">jp</div>
        <div><strong>jobpilot</strong><span>CAREER OS</span></div>
      </div>
      <div className="nav-section-label">PERSONAL WORKSPACE</div>
      <nav className="side-nav">
        <NavLink aria-label="Applications" to={routes.applications} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><BriefcaseBusiness size={18} /><span>Pipeline</span></NavLink>
        <NavLink aria-label="Review inbox" to={routes.review} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Inbox size={18} /><span>Review inbox</span></NavLink>
      </nav>
      <div className="sidebar-bottom">
        <NavLink aria-label="Account" to={routes.account} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Settings size={18} /><span>Account</span></NavLink>
      </div>
      <p className="sidebar-caption">Built around your next move.</p>
    </aside>
  );
}
