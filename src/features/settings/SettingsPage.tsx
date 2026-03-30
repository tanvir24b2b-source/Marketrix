import { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { DeviceRequest, PermissionKey, Role, User } from '@/types/domain';
import { useAuth } from '@/features/auth/AuthContext';

const ALL_PERMISSIONS: PermissionKey[] = [
  'dashboard_access','products_access','content_access','ads_access','settings_access','manage_users','manage_roles','approve_devices','view_buying_price',
];

export function SettingsPage() {
  const qc = useQueryClient();
  const { user, hasPermission } = useAuth();
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: () => api<User[]>('/settings/users'), enabled: hasPermission('manage_users') });
  const { data: roles } = useQuery({ queryKey: ['roles'], queryFn: () => api<Role[]>('/settings/roles'), enabled: hasPermission('manage_roles') });
  const { data: devices } = useQuery({ queryKey: ['devices'], queryFn: () => api<DeviceRequest[]>('/settings/devices'), enabled: hasPermission('approve_devices') });

  const updateProfile = useMutation({ mutationFn: (payload: any) => api('/settings/profile', { method: 'PATCH', body: JSON.stringify(payload) }), onSuccess: () => qc.invalidateQueries() });
  const createUser = useMutation({ mutationFn: (payload: any) => api('/settings/users', { method: 'POST', body: JSON.stringify(payload) }), onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }) });
  const createRole = useMutation({ mutationFn: (payload: any) => api('/settings/roles', { method: 'POST', body: JSON.stringify(payload) }), onSuccess: () => qc.invalidateQueries({ queryKey: ['roles'] }) });
  const updateRole = useMutation({ mutationFn: (payload: any) => api(`/settings/roles/${payload.id}`, { method: 'PATCH', body: JSON.stringify(payload) }), onSuccess: () => qc.invalidateQueries({ queryKey: ['roles'] }) });
  const decideDevice = useMutation({ mutationFn: (payload: any) => api(`/settings/devices/${payload.id}`, { method: 'PATCH', body: JSON.stringify(payload) }), onSuccess: () => qc.invalidateQueries({ queryKey: ['devices'] }) });

  const onCreateUser = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createUser.mutate({ name: fd.get('name'), email: fd.get('email'), password: fd.get('password'), roleId: Number(fd.get('roleId')) });
  };

  return (
    <div>
      <h1>Settings</h1>

      <div className="card form">
        <h3>Profile</h3>
        <input defaultValue={user?.name} id="profile-name" />
        <input defaultValue={user?.imageUrl ?? ''} id="profile-image" placeholder="Image URL" />
        <button onClick={() => updateProfile.mutate({ name: (document.getElementById('profile-name') as HTMLInputElement).value, imageUrl: (document.getElementById('profile-image') as HTMLInputElement).value })}>Update Profile</button>
      </div>

      {hasPermission('manage_users') && (
        <div className="card">
          <h3>User Management</h3>
          <form className="split" onSubmit={onCreateUser}>
            <input name="name" placeholder="Name" required />
            <input name="email" type="email" placeholder="Email" required />
            <input name="password" type="password" placeholder="Password" required />
            <select name="roleId" required>
              <option value="">Role</option>
              {(roles ?? []).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <button type="submit">Create user</button>
          </form>
          <table className="table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead><tbody>
            {(users ?? []).map((u) => <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.roleName}</td><td>{u.active ? 'Active' : 'Inactive'}</td></tr>)}
          </tbody></table>
        </div>
      )}

      {hasPermission('manage_roles') && (
        <div className="card">
          <h3>Role Management</h3>
          <form className="split" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); createRole.mutate({ name: fd.get('name'), permissions: ALL_PERMISSIONS.filter((p) => fd.get(p) === 'on') }); }}>
            <input name="name" placeholder="Role name" required />
            {ALL_PERMISSIONS.map((p) => <label key={p}><input type="checkbox" name={p} /> {p}</label>)}
            <button type="submit">Create role</button>
          </form>
          {(roles ?? []).map((r) => (
            <div key={r.id} className="modal">
              <input defaultValue={r.name} id={`role-name-${r.id}`} />
              <button onClick={() => {
                const selected = ALL_PERMISSIONS.filter((p) => (document.getElementById(`role-${r.id}-${p}`) as HTMLInputElement)?.checked);
                updateRole.mutate({ id: r.id, name: (document.getElementById(`role-name-${r.id}`) as HTMLInputElement).value, permissions: selected });
              }}>Save</button>
              <div className="split">
                {ALL_PERMISSIONS.map((p) => <label key={p}><input id={`role-${r.id}-${p}`} type="checkbox" defaultChecked={r.permissions.includes(p)} />{p}</label>)}
              </div>
            </div>
          ))}
        </div>
      )}

      {hasPermission('approve_devices') && (
        <div className="card">
          <h3>Device Approvals</h3>
          <table className="table"><thead><tr><th>User</th><th>Device</th><th>Status</th><th>Action</th></tr></thead><tbody>
            {(devices ?? []).map((d) => (
              <tr key={d.id}><td>{d.userEmail}</td><td>{d.deviceName}</td><td>{d.status}</td><td>
                <button onClick={() => decideDevice.mutate({ id: d.id, status: 'approved' })}>Approve</button>{' '}
                <button className="danger" onClick={() => decideDevice.mutate({ id: d.id, status: 'rejected' })}>Reject</button>
              </td></tr>
            ))}
          </tbody></table>
        </div>
      )}
    </div>
  );
}
