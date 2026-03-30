import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { LoginPage } from '@/features/auth/LoginPage';
import { DeviceApprovalPage } from '@/features/auth/DeviceApprovalPage';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { ProductsPage } from '@/features/products/ProductsPage';
import { ContentPlanPage } from '@/features/content/ContentPlanPage';
import { AdsPlanPage } from '@/features/ads/AdsPlanPage';
import { SettingsPage } from '@/features/settings/SettingsPage';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/device-approval" element={<DeviceApprovalPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<ProtectedRoute permission="dashboard_access"><DashboardPage /></ProtectedRoute>} />
        <Route path="products" element={<ProtectedRoute permission="products_access"><ProductsPage /></ProtectedRoute>} />
        <Route path="content-plan" element={<ProtectedRoute permission="content_access"><ContentPlanPage /></ProtectedRoute>} />
        <Route path="ads-plan" element={<ProtectedRoute permission="ads_access"><AdsPlanPage /></ProtectedRoute>} />
        <Route path="settings" element={<ProtectedRoute permission="settings_access"><SettingsPage /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
