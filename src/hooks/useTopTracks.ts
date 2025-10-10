import { useEffect, useState } from 'react';
import type { Track } from '@/types/track';
import { useSessionContext } from '@supabase/auth-helpers-react';

interface UseTopTracksResult {
  tracks: Track[];
  loading: boolean;
  error: Error | null;
}

export function useTopTracks(): UseTopTracksResult {
  const { session, isLoading } = useSessionContext();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!session?.provider_token) {
      setTracks([]);
      setLoading(false);
      return;
    }

    let isCancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch('/api/spotify/top-tracks', { cache: 'no-store' });
        if (!res.ok) {
          const message = `Spotify API 요청 실패: ${res.status}`;
          throw new Error(message);
        }

        const json = await res.json();
        if (!isCancelled) {
          setTracks(Array.isArray(json.items) ? json.items : []);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다.'));
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [isLoading, session?.provider_token]);

  return { tracks, loading, error };
}
