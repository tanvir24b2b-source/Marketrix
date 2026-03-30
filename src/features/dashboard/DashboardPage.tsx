import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function DashboardPage() {
  const { data } = useQuery({ queryKey: ['dashboard'], queryFn: () => api<{ products: number; contents: number; ads: number; users: number }>('/dashboard/stats') });
  return (
    <div>
      <h1>Dashboard</h1>
      <div className="grid">
        <div className="card"><h3>Products</h3><p>{data?.products ?? 0}</p></div>
        <div className="card"><h3>Content Plans</h3><p>{data?.contents ?? 0}</p></div>
        <div className="card"><h3>Ad Entries</h3><p>{data?.ads ?? 0}</p></div>
        <div className="card"><h3>Users</h3><p>{data?.users ?? 0}</p></div>
      </div>
    </div>
  );
}
