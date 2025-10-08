export interface SpotifyApiImage {
  url?: string;
}

export interface SpotifyApiAlbum {
  name?: string;
  images?: SpotifyApiImage[];
  release_date?: string;
}

export interface SpotifyApiArtist {
  name?: string;
}

export interface SpotifyApiTrackItem {
  id: string;
  name?: string;
  artists?: SpotifyApiArtist[];
  album?: SpotifyApiAlbum;
}

export interface SpotifyTopTracksResponse {
  items?: SpotifyApiTrackItem[];
}
