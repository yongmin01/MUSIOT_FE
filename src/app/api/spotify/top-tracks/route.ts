import { NextResponse } from 'next/server';
import type { Track } from '@/types/track';
import type { SpotifyApiTrackItem, SpotifyTopTracksResponse } from '@/types/spotify';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

const SPOTIFY_TOP_TRACKS_ENDPOINT =
  'https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=20';

const mapToTrack = (track: SpotifyApiTrackItem | null | undefined, index: number): Track | null => {
  if (!track?.id) {
    return null;
  }

  const album = track.album;
  const releaseDate = album?.release_date;
  const releaseYear = releaseDate ? Number.parseInt(releaseDate.slice(0, 4), 10) : undefined;
  const primaryArtist =
    Array.isArray(track.artists) && track.artists.length > 0 ? track.artists[0]?.name ?? '' : '';
  const albumCoverUrl =
    Array.isArray(album?.images) && album.images.length > 0 ? album.images[0]?.url ?? '' : '';
  const normalisedReleaseYear = releaseYear && Number.isFinite(releaseYear) ? releaseYear : undefined;

  return {
    id: track.id,
    title: track.name ?? '',
    artistName: primaryArtist,
    albumName: album?.name ?? '',
    albumCoverUrl,
    releaseYear: normalisedReleaseYear,
    rank: index + 1,
  };
};

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const accessToken = session?.provider_token;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const res = await fetch(SPOTIFY_TOP_TRACKS_ENDPOINT, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    return NextResponse.json({ error }, { status: res.status });
  }

  const payload = (await res.json()) as SpotifyTopTracksResponse;
  const items: Track[] = Array.isArray(payload?.items)
    ? payload.items
        .map((track: SpotifyApiTrackItem | undefined, index: number) => mapToTrack(track, index))
        .filter((value): value is Track => Boolean(value))
    : [];

  return NextResponse.json({ items });
}
