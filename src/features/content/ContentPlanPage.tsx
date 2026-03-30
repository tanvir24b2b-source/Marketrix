import { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ContentEntry, Product } from '@/types/domain';

export function ContentPlanPage() {
  const qc = useQueryClient();
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: () => api<Product[]>('/products') });
  const { data: entries } = useQuery({ queryKey: ['content'], queryFn: () => api<ContentEntry[]>('/content') });
  const create = useMutation({ mutationFn: (payload: Partial<ContentEntry>) => api('/content', { method: 'POST', body: JSON.stringify(payload) }), onSuccess: () => qc.invalidateQueries({ queryKey: ['content'] }) });

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    create.mutate({
      productId: Number(fd.get('productId')),
      title: String(fd.get('title')),
      platform: String(fd.get('platform')),
      publishDate: String(fd.get('publishDate')),
      status: String(fd.get('status')),
      notes: String(fd.get('notes') ?? ''),
    });
    e.currentTarget.reset();
  };

  return (
    <div>
      <h1>Content Plan</h1>
      <form className="card form" onSubmit={onSubmit}>
        <select name="productId" required>
          <option value="">Select Product</option>
          {(products ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input name="title" placeholder="Content title" required />
        <input name="platform" placeholder="Platform" required />
        <input name="publishDate" type="date" required />
        <input name="status" defaultValue="planned" required />
        <textarea name="notes" placeholder="Notes" />
        <button type="submit">Add Entry</button>
      </form>
      <div className="card">
        <table className="table"><thead><tr><th>Product</th><th>Title</th><th>Platform</th><th>Date</th><th>Status</th></tr></thead><tbody>
          {(entries ?? []).map((e) => <tr key={e.id}><td>{e.productId}</td><td>{e.title}</td><td>{e.platform}</td><td>{e.publishDate}</td><td>{e.status}</td></tr>)}
        </tbody></table>
      </div>
    </div>
  );
}
