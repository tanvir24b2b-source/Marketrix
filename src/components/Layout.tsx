import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';

export function Layout() {
  const { logout, user, hasPermission } = useAuth();

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>De Markt</h2>
        {hasPermission('dashboard_access') && <NavLink to="/">Dashboard</NavLink>}
        {hasPermission('products_access') && <NavLink to="/products">Products</NavLink>}
        {hasPermission('content_access') && <NavLink to="/content-plan">Content Plan</NavLink>}
        {hasPermission('ads_access') && <NavLink to="/ads-plan">Ads Plan</NavLink>}
        {hasPermission('settings_access') && <NavLink to="/settings">Settings</NavLink>}
        <p>{user?.name}</p>
        <button className="secondary" onClick={() => void logout()}>Logout</button>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
