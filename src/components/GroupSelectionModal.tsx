'use client';

import { useState } from 'react';
import { Song } from './SongCard';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Users } from 'lucide-react';

interface Group {
  id: string;
  name: string;
  memberCount?: number;
}

interface GroupSelectionModalProps {
  song: Song | null;
  groups: Group[];
  isOpen: boolean;
  onClose: () => void;
  onAddToGroups: (songId: string, groupIds: string[]) => void;
}

export function GroupSelectionModal({ song, groups, isOpen, onClose, onAddToGroups }: GroupSelectionModalProps) {
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  const handleGroupToggle = (groupId: string) => {
    setSelectedGroupIds((prev) => (prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]));
  };

  const handleAddToGroups = () => {
    if (song && selectedGroupIds.length > 0) {
      onAddToGroups(song.id, selectedGroupIds);
      setSelectedGroupIds([]);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedGroupIds([]);
    onClose();
  };

  if (!song) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Song to Groups</DialogTitle>
          <DialogDescription>
            Select the groups where you want to add "{song.title}" by {song.artist}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Song Preview */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <img src={song.coverUrl} alt={`${song.title} cover`} className="w-12 h-12 rounded-md object-cover" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{song.title}</p>
              <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
            </div>
            <Badge variant="outline">#{song.rank}</Badge>
          </div>

          {/* Group Selection */}
          <div className="space-y-2">
            <h4 className="font-medium">Select Groups:</h4>
            {groups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No groups available</p>
                <p className="text-sm">Create or join a group first!</p>
              </div>
            ) : (
              <ScrollArea className="max-h-48">
                <div className="space-y-2">
                  {groups.map((group) => (
                    <div key={group.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
                      <Checkbox
                        id={group.id}
                        checked={selectedGroupIds.includes(group.id)}
                        onCheckedChange={() => handleGroupToggle(group.id)}
                      />
                      <label htmlFor={group.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{group.name}</span>
                          {group.memberCount && (
                            <Badge variant="secondary" className="ml-2">
                              {group.memberCount} members
                            </Badge>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleAddToGroups} disabled={selectedGroupIds.length === 0 || groups.length === 0}>
              Add to {selectedGroupIds.length} Group{selectedGroupIds.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
