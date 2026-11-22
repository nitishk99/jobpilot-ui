import { Outlet } from 'react-router-dom';
import { Sidebar } from '../navigation/Sidebar';
import { Topbar } from '../navigation/Topbar';

export function AppLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Topbar />
        <main className="main-content">
          <div className="workspace-frame"><Outlet /></div>
        </main>
      </div>
    </div>
  );
}
