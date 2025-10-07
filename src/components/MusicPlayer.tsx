'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Shuffle, Repeat } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Card } from './ui/card';

interface CurrentTrack {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  duration: string;
}

interface MusicPlayerProps {
  currentTrack: CurrentTrack | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function MusicPlayer({ currentTrack, isPlaying, onPlayPause, onNext, onPrevious }: MusicPlayerProps) {
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(75);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [isLiked, setIsLiked] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeated, setIsRepeated] = useState(false);

  // Simulate progress updates
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentTrack) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 1;
          if (newProgress >= 100) {
            onNext();
            return 0;
          }
          return newProgress;
        });

        // Update current time display
        const totalSeconds = Math.floor((progress / 100) * 180); // Assuming 3 minute songs
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        setCurrentTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack, progress, onNext]);

  if (!currentTrack) {
    return null;
  }

  return (
    <Card className="fixed bottom-0 left-0 right-0 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <img
            src={currentTrack.coverUrl}
            alt={`${currentTrack.title} cover`}
            className="w-14 h-14 rounded object-cover"
          />
          <div className="min-w-0">
            <h4 className="font-medium truncate">{currentTrack.title}</h4>
            <p className="text-sm text-muted-foreground truncate">{currentTrack.artist}</p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setIsLiked(!isLiked)} className="h-8 w-8 p-0">
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>

        <div className="flex flex-col items-center gap-2 flex-1 max-w-md">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsShuffled(!isShuffled)}
              className={`h-8 w-8 p-0 ${isShuffled ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <Shuffle className="h-4 w-4" />
            </Button>

            <Button size="sm" variant="ghost" onClick={onPrevious} className="h-8 w-8 p-0">
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button size="sm" onClick={onPlayPause} className="h-10 w-10">
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
            </Button>

            <Button size="sm" variant="ghost" onClick={onNext} className="h-8 w-8 p-0">
              <SkipForward className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsRepeated(!isRepeated)}
              className={`h-8 w-8 p-0 ${isRepeated ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <Repeat className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full">
            <span className="text-xs text-muted-foreground min-w-[3rem] text-right">{currentTime}</span>
            <Slider
              value={[progress]}
              onValueChange={(value) => setProgress(value[0])}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground min-w-[3rem]">{currentTrack.duration}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <Slider value={[volume]} onValueChange={(value) => setVolume(value[0])} max={100} step={1} className="w-24" />
        </div>
      </div>
    </Card>
  );
}
