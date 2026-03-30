import { FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/AuthContext';
import type { Product } from '@/types/domain';

export function ProductsPage() {
  const qc = useQueryClient();
  const { hasPermission } = useAuth();
  const { data } = useQuery({ queryKey: ['products'], queryFn: () => api<Product[]>('/products') });
  const create = useMutation({ mutationFn: (payload: Partial<Product>) => api('/products', { method: 'POST', body: JSON.stringify(payload) }), onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }) });

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    create.mutate({ name: fd.get('name'), buyingPrice: Number(fd.get('buyingPrice')), sellingPrice: Number(fd.get('sellingPrice')), status: fd.get('status'), notes: fd.get('notes') });
    e.currentTarget.reset();
  };

  return (
    <div>
      <h1>Products</h1>
      <form className="card form" onSubmit={onSubmit}>
        <input name="name" placeholder="Product name" required />
        <input name="buyingPrice" type="number" step="0.01" placeholder="Buying price" required />
        <input name="sellingPrice" type="number" step="0.01" placeholder="Selling price" required />
        <input name="status" placeholder="Status" defaultValue="active" required />
        <textarea name="notes" placeholder="Notes" />
        <button type="submit">Add Product</button>
      </form>
      <div className="card">
        <table className="table"><thead><tr><th>Name</th><th>Buying</th><th>Selling</th><th>Status</th></tr></thead><tbody>
          {(data ?? []).map((p) => (
            <tr key={p.id}><td>{p.name}</td><td>{hasPermission('view_buying_price') ? p.buyingPrice : 'Restricted'}</td><td>{p.sellingPrice}</td><td>{p.status}</td></tr>
          ))}
        </tbody></table>
      </div>
    </div>
  );
}
