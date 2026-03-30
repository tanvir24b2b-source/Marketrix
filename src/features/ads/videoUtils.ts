export type VideoPlatform = 'google_drive' | 'facebook' | 'instagram' | 'youtube' | 'direct' | 'unknown';

export function detectPlatform(url: string): VideoPlatform {
  const u = url.toLowerCase();
  if (u.includes('drive.google.com')) return 'google_drive';
  if (u.includes('facebook.com') || u.includes('fb.watch')) return 'facebook';
  if (u.includes('instagram.com')) return 'instagram';
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
  if (u.match(/\.(mp4|webm|mov)(\?|$)/)) return 'direct';
  return 'unknown';
}

export function toDriveEmbed(url: string) {
  const match = url.match(/\/d\/([^/]+)/);
  return match ? `https://drive.google.com/file/d/${match[1]}/preview` : '';
}
