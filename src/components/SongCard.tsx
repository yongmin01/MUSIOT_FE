import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  rank: number;
}

interface SongCardProps {
  song: Song;
  onAddToGroup: (songId: string) => void;
  showAddButton?: boolean;
}

export function SongCard({ song, onAddToGroup, showAddButton = true }: SongCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="relative">
            <img
              src={song.coverUrl}
              alt={`${song.title} cover`}
              className="w-full aspect-square rounded-lg object-cover"
            />
            <Badge className="absolute top-2 left-2 bg-primary/90">#{song.rank}</Badge>
          </div>

          <div className="space-y-1">
            <h3 className="font-medium line-clamp-1" title={song.title}>
              {song.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-1" title={song.artist}>
              {song.artist}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-1" title={song.album}>
              {song.album}
            </p>
          </div>

          {showAddButton && (
            <Button onClick={() => onAddToGroup(song.id)} className="w-full" size="sm">
              Add to Group
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
