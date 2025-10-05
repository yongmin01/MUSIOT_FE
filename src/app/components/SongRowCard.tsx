import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Play } from 'lucide-react';
import { Song } from './SongCard';

interface SongRowCardProps {
  song: Song;
  onAddToGroup: (songId: string) => void;
  showAddButton?: boolean;
}

export function SongRowCard({ song, onAddToGroup, showAddButton = true }: SongRowCardProps) {
  const getRankDisplay = (rank: number) => {
    if (rank <= 3) {
      const colors = {
        1: 'bg-yellow-500 text-white',
        2: 'bg-gray-400 text-white',
        3: 'bg-amber-600 text-white',
      };
      return colors[rank as keyof typeof colors] || 'bg-primary text-primary-foreground';
    }
    return 'bg-muted text-muted-foreground';
  };

  const getRankSize = (rank: number) => {
    return rank <= 3 ? 'w-10 h-10' : 'w-8 h-8';
  };

  return (
    <div className="group flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-all duration-200 hover:shadow-md">
      {/* Rank */}
      <div
        className={`flex items-center justify-center rounded-full shrink-0 ${getRankSize(song.rank)} ${getRankDisplay(song.rank)}`}
      >
        <span className={`font-medium ${song.rank <= 3 ? 'text-sm' : 'text-xs'}`}>{song.rank}</span>
      </div>

      {/* Album Cover */}
      <div className="relative shrink-0">
        <img src={song.coverUrl} alt={`${song.title} cover`} className="w-16 h-16 rounded-lg object-cover" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
          <Play className="h-5 w-5 text-white" />
        </div>
      </div>

      {/* Song Information */}
      <div className="flex-1 min-w-0 space-y-1">
        <h3 className="font-medium truncate" title={song.title}>
          {song.title}
        </h3>
        <p className="text-sm text-muted-foreground truncate" title={song.artist}>
          {song.artist}
        </p>
        <p className="text-xs text-muted-foreground truncate" title={song.album}>
          {song.album}
        </p>
      </div>

      {/* Trending Indicator for Top 10 */}
      {song.rank <= 10 && (
        <div className="hidden sm:flex items-center">
          <Badge variant="secondary" className="text-xs">
            Trending
          </Badge>
        </div>
      )}

      {/* Action Button */}
      {showAddButton && (
        <div className="shrink-0">
          <Button
            onClick={() => onAddToGroup(song.id)}
            size="sm"
            className="opacity-60 group-hover:opacity-100 transition-opacity"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      )}
    </div>
  );
}
