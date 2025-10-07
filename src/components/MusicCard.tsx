'use client';

import { useState } from 'react';
import { Play, Pause, Heart, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  genre: string;
  votes: number;
  userVote: 'up' | 'down' | null;
  coverUrl: string;
  rank: number;
}

interface MusicCardProps {
  track: Track;
  isPlaying: boolean;
  onPlay: (trackId: string) => void;
  onVote: (trackId: string, voteType: 'up' | 'down') => void;
}

export function MusicCard({ track, isPlaying, onPlay, onVote }: MusicCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const handleVote = (voteType: 'up' | 'down') => {
    onVote(track.id, voteType);
  };

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative">
              <img src={track.coverUrl} alt={`${track.title} cover`} className="w-12 h-12 rounded object-cover" />
              <Button
                size="sm"
                variant="secondary"
                className="absolute inset-0 m-auto w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onPlay(track.id)}
              >
                {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 ml-0.5" />}
              </Button>
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-medium truncate">{track.title}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {track.artist} • {track.album}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {track.genre}
            </Badge>
            <span className="text-sm text-muted-foreground min-w-[3rem] text-right">{track.duration}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setIsLiked(!isLiked)} className="h-8 w-8 p-0">
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>

            <div className="flex flex-col items-center gap-1">
              <Button
                size="sm"
                variant={track.userVote === 'up' ? 'default' : 'ghost'}
                className="h-8 w-8 p-0"
                onClick={() => handleVote('up')}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[2rem] text-center">{track.votes}</span>
              <Button
                size="sm"
                variant={track.userVote === 'down' ? 'destructive' : 'ghost'}
                className="h-8 w-8 p-0"
                onClick={() => handleVote('down')}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center w-8">
            <span className="text-lg font-semibold text-muted-foreground">#{track.rank}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
