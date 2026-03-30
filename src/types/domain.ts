export type PermissionKey =
  | 'dashboard_access'
  | 'products_access'
  | 'content_access'
  | 'ads_access'
  | 'settings_access'
  | 'manage_users'
  | 'manage_roles'
  | 'approve_devices'
  | 'view_buying_price';

export type Role = { id: number; name: string; permissions: PermissionKey[] };
export type User = {
  id: number;
  name: string;
  email: string;
  roleId: number;
  roleName: string;
  active: number;
  imageUrl?: string | null;
};

export type SessionUser = User & { permissions: PermissionKey[]; isAdmin: boolean };

export type Product = { id: number; name: string; buyingPrice: number; sellingPrice: number; status: string; notes?: string | null };
export type ContentEntry = { id: number; productId: number; title: string; platform: string; publishDate: string; status: string; notes?: string | null };

export type VideoEntry = { id: number; url: string; status: string; notes?: string | null };
export type AdEntry = { id: number; productId: number; status: string; notes?: string | null; videos: VideoEntry[] };

export type DeviceRequest = {
  id: number;
  userId: number;
  userEmail: string;
  deviceId: string;
  deviceName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
};
