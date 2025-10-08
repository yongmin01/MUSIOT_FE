'use client';

import { useMemo, useState } from 'react';
import { Search, TrendingUp, Trophy } from 'lucide-react';
import { SongCard } from './SongCard';
import { SongRowCard } from './SongRowCard';
import { GroupDashboard } from './GroupDashboard';
import { GroupSelectionModal } from './GroupSelectionModal';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { useTopTracks } from '@/hooks/useTopTracks';
import type { Track } from '@/types/track';
import { mockTopSongs } from '@/mocks/songData';
interface GroupDashboardData {
  id: string;
  name: string;
  memberCount: number;
  votingEnds: string;
  hasVotingEnded: boolean;
  leadingSong?: {
    id: string;
    title: string;
    artist: string;
    coverUrl: string;
    votes: number;
  };
  songOfTheDay?: {
    id: string;
    title: string;
    artist: string;
    coverUrl: string;
    votes: number;
  };
  totalVotes: number;
  songsCount: number;
}

interface HomePageProps {
  userGroups: Array<{ id: string; name: string; memberCount?: number }>;
  groupDashboardData: GroupDashboardData[];
  onAddToGroups: (songId: string, groupIds: string[]) => void;
  onViewGroup: (groupId: string) => void;
}

export function HomePage({ userGroups, groupDashboardData, onAddToGroups, onViewGroup }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedSong, setSelectedSong] = useState<Track | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { tracks, loading, error } = useTopTracks();

  const userTopTracks: Track[] = useMemo(() => tracks, [tracks]);

  const useFallbackSongs = error !== null || (!loading && userTopTracks.length === 0);
  const baseSongs = useFallbackSongs ? mockTopSongs : userTopTracks;
  const isLoadingSpotify = loading && !useFallbackSongs;

  const handleOpenGroupSelection = (songId: string) => {
    const song = baseSongs.find((s) => s.id === songId);
    if (song) {
      setSelectedSong(song);
      setIsModalOpen(true);
    }
  };

  const handleAddToGroups = (songId: string, groupIds: string[]) => {
    onAddToGroups(songId, groupIds);
  };

  // Filter songs based on search query
  const filteredSongs = baseSongs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.albumName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Split songs into top 10 and remaining
  const top10Songs = filteredSongs.slice(0, 10);
  const remaining10Songs = filteredSongs.slice(10, 20);

  return (
    <div className="container mx-auto p-6">
      {/* Group Dashboard */}
      {groupDashboardData.length > 0 && <GroupDashboard groups={groupDashboardData} onViewGroup={onViewGroup} />}

      {/* Search Bar Section */}
      <div className="mb-8">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for songs, artists, or albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-base"
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              {filteredSongs.length} result{filteredSongs.length !== 1 ? 's' : ''} found for &quot;{searchQuery}&quot;
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1>{searchQuery ? 'Search Results' : 'Top 20 Weekly Songs'}</h1>
            <p className="text-muted-foreground">
              {searchQuery ? `Results for "${searchQuery}"` : 'Current Spotify weekly ranking'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'grid')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="list">List</TabsTrigger>
                <TabsTrigger value="grid">Grid</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {filteredSongs.length === 0 ? (
          <div className="text-center py-12">
            {isLoadingSpotify ? (
              <>
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
                <h3>Spotify Top Tracks 불러오는 중</h3>
                <p className="text-muted-foreground">잠시만 기다려 주세요.</p>
              </>
            ) : (
              <>
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3>No songs found</h3>
                <p className="text-muted-foreground">Try searching with different keywords</p>
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery('')} className="mt-4">
                    Clear search
                  </Button>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {viewMode === 'list' ? (
              // List View with Sections
              <>
                {/* Top 10 Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <h2>Top 10</h2>
                    <span className="text-sm text-muted-foreground">Most popular tracks</span>
                  </div>
                  <div className="space-y-2">
                    {top10Songs.map((song) => (
                      <SongRowCard key={song.id} song={song} onAddToGroup={handleOpenGroupSelection} />
                    ))}
                  </div>
                </div>

                {/* Remaining 10 Section */}
                {remaining10Songs.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      <h2>Rising Tracks</h2>
                      <span className="text-sm text-muted-foreground">Climbing the charts</span>
                    </div>
                    <div className="space-y-2">
                      {remaining10Songs.map((song) => (
                        <SongRowCard key={song.id} song={song} onAddToGroup={handleOpenGroupSelection} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Grid View (Original)
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredSongs.map((song) => (
                  <SongCard key={song.id} song={song} onAddToGroup={handleOpenGroupSelection} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Group Selection Modal */}
      <GroupSelectionModal
        song={selectedSong}
        groups={userGroups}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSong(null);
        }}
        onAddToGroups={handleAddToGroups}
      />
    </div>
  );
}
