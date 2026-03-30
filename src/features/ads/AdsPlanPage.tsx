import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AdEntry, Product } from '@/types/domain';
import { detectPlatform, toDriveEmbed } from './videoUtils';
import { AIGeneratorCard } from '@/features/ai/AIGeneratorCard';

function VideoPreview({ url }: { url: string }) {
  const platform = detectPlatform(url);
  if (platform === 'google_drive') {
    const embed = toDriveEmbed(url);
    if (!embed) return <p className="error">Invalid Google Drive URL</p>;
    return <iframe title="drive-preview" src={embed} width="100%" height="220" />;
  }
  if (platform === 'facebook' || platform === 'instagram') {
    return <div className="modal"><span className="badge">{platform}</span><p>External preview only</p><a href={url} target="_blank" rel="noreferrer"><button type="button">Open Video ↗</button></a></div>;
  }
  if (platform === 'youtube') return <a href={url} target="_blank" rel="noreferrer">Open YouTube</a>;
  if (platform === 'direct') return <video src={url} controls width="100%" />;
  return <p>Unsupported URL</p>;
}

export function AdsPlanPage() {
  const qc = useQueryClient();
  const [videoUrl, setVideoUrl] = useState('');
  const [entryId, setEntryId] = useState<number | null>(null);
  const [localError, setLocalError] = useState('');
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: () => api<Product[]>('/products') });
  const { data: entries } = useQuery({ queryKey: ['ads'], queryFn: () => api<AdEntry[]>('/ads') });
  const createEntry = useMutation({ mutationFn: (payload: any) => api('/ads', { method: 'POST', body: JSON.stringify(payload) }), onSuccess: () => qc.invalidateQueries({ queryKey: ['ads'] }) });
  const addVideo = useMutation({ mutationFn: (payload: any) => api('/ads/videos', { method: 'POST', body: JSON.stringify(payload) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['ads'] }); setVideoUrl(''); setLocalError(''); } });

  const onCreate = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createEntry.mutate({ productId: Number(fd.get('productId')), status: fd.get('status'), notes: fd.get('notes') });
    e.currentTarget.reset();
  };

  const onAddVideo = () => {
    if (!entryId) return;
    const existing = entries?.find((e) => e.id === entryId)?.videos.some((v) => v.url === videoUrl);
    if (existing) {
      setLocalError('Duplicate video URL not allowed.');
      return;
    }
    addVideo.mutate({ adEntryId: entryId, url: videoUrl, status: 'new', notes: '' });
  };

  return (
    <div>
      <h1>Ads Plan</h1>
      <div className="grid">
        <form className="card form" onSubmit={onCreate}>
          <h3>Create Ad Entry</h3>
          <select name="productId" required><option value="">Product</option>{(products ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
          <input name="status" defaultValue="draft" required />
          <textarea name="notes" placeholder="Notes" />
          <button type="submit">Create</button>
        </form>
        <AIGeneratorCard />
      </div>

      <div className="card form">
        <h3>Add Video to Entry</h3>
        <select value={entryId ?? ''} onChange={(e) => setEntryId(Number(e.target.value))}><option value="">Select Ad Entry</option>{(entries ?? []).map((e) => <option key={e.id} value={e.id}>Entry #{e.id}</option>)}</select>
        <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Video URL" />
        <button type="button" onClick={onAddVideo}>Add Video</button>
        {videoUrl && <VideoPreview url={videoUrl} />}
        {localError && <p className="error">{localError}</p>}
      </div>

      {(entries ?? []).map((entry) => (
        <div key={entry.id} className="card">
          <h3>Entry #{entry.id} <span className="badge">{entry.status}</span></h3>
          <p>{entry.notes}</p>
          <div className="grid">
            {entry.videos.map((v) => <div key={v.id}><VideoPreview url={v.url} /><p>{v.status}</p></div>)}
          </div>
        </div>
      ))}
    </div>
  );
}
