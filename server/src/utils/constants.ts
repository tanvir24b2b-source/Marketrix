export const PERMISSIONS = [
  'dashboard_access','products_access','content_access','ads_access','settings_access','manage_users','manage_roles','approve_devices','view_buying_price',
] as const;
export type Permission = (typeof PERMISSIONS)[number];
