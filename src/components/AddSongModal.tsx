'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { SongCard } from './SongCard';
import { ScrollArea } from './ui/scroll-area';
import type { Track } from '@/types/track';
import { useAppState } from '@/app/providers/app-state-provider';

interface AddSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSong: (songId: string) => void;
  onSearchSongs: (query: string) => Track[];
}

export function AddSongModal({ isOpen, onClose, onAddSong, onSearchSongs }: AddSongModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const { topSongs } = useAppState();
  const handleSearch = () => {
    if (searchQuery.trim()) {
      const results = onSearchSongs(searchQuery);
      setSearchResults(results);
    }
  };

  const handleAddSong = (songId: string) => {
    onAddSong(songId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Add Song to Group</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Browse Top Songs</TabsTrigger>
            <TabsTrigger value="search">Search Songs</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="mt-4">
            <ScrollArea className="h-[500px]">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-1">
                {topSongs.map((song) => (
                  <SongCard key={song.id} song={song} onAddToGroup={handleAddSong} showAddButton={true} />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="search" className="mt-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search for songs, artists, or albums..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              <ScrollArea className="h-[450px]">
                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-1">
                    {searchResults.map((song) => (
                      <SongCard key={song.id} song={song} onAddToGroup={handleAddSong} showAddButton={true} />
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No results found for &quot;{searchQuery}&quot;</p>
                    <p className="text-sm">Try searching with different keywords</p>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Enter a search term to find songs</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
