import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import Image from 'next/image';
import { Track } from '@/types/track';

interface SongCardProps {
  song: Track;
  onAddToGroup: (songId: string) => void;
  showAddButton?: boolean;
}

export function SongCard({ song, onAddToGroup, showAddButton = true }: SongCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="relative">
            <Image
              src={song.albumCoverUrl}
              alt={`${song.title} cover`}
              width={320}
              height={320}
              className="w-full aspect-square rounded-lg object-cover"
            />
            <Badge className="absolute top-2 left-2 bg-primary/90">#{song.rank}</Badge>
          </div>

          <div className="space-y-1">
            <h3 className="font-medium line-clamp-1" title={song.title}>
              {song.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-1" title={song.artistName}>
              {song.artistName}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-1" title={song.albumName}>
              {song.albumName}
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
