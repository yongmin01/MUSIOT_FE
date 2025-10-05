'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { mockGroups as userGroups } from '@/mocks/groupData';
import { Song } from '@/app/components/SongCard';
import { mockTopSongs as songs } from '@/mocks/songData';
import { Trophy, TrendingUp } from 'lucide-react';
import { SongRowCard } from '@/app/components/SongRowCard';

interface HomePageProps {
  songs: Song[];
  userGroups: Array<{ id: string; name: string }>;
  // groupDashboardData: GroupDashboardData[];
  // onAddToGroup: (songId: string, groupId: string) => void;
  // onViewGroup: (groupId: string) => void;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const data = async () => {
    const response = await fetch('http://localhost:5000/api/playlists', {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => console.log(data));
    console.log('errorrrr', response);
    return response;
  };
  console.log(data);

  // Filter songs based on search query
  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.album.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Split songs into top 10 and remaining
  const top10Songs = filteredSongs.slice(0, 10);
  const remaining10Songs = filteredSongs.slice(10, 20);
  return (
    <>
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
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
            {/* {searchQuery && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                {filteredSongs.length} result{filteredSongs.length !== 1 ? 's' : ''} found for "{searchQuery}"
              </p>
            )} */}
          </div>
        </div>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1>{searchQuery ? 'Search Results' : 'Top 20 Weekly Songs'}</h1>
              <p className="text-muted-foreground">
                {searchQuery ? `Results for "${searchQuery}"` : 'Current Spotify weekly ranking'}
              </p>
            </div>

            {/* <div className="flex items-center gap-4">
              {userGroups.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Add songs to:</span>
                  <Select defaultValue={userGroups[0]?.id}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {userGroups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div> */}
          </div>

          {filteredSongs.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3>No songs found</h3>
              <p className="text-muted-foreground">Try searching with different keywords</p>
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery('')} className="mt-4">
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                {/* Top 10 Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <h2>Top 10</h2>
                    <span className="text-sm text-muted-foreground">Most popular tracks</span>
                  </div>
                  <div className="space-y-2">
                    {top10Songs.map((song) => (
                      <SongRowCard
                        key={song.id}
                        song={song}
                        // onAddToGroup={handleAddToGroup}
                        showAddButton={userGroups.length > 0}
                      />
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
                        <SongRowCard
                          key={song.id}
                          song={song}
                          // onAddToGroup={handleAddToGroup}
                          showAddButton={userGroups.length > 0}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
