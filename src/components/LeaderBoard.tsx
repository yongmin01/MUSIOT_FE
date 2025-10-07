import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface LeaderboardTrack {
  id: string;
  title: string;
  artist: string;
  votes: number;
  rank: number;
  rankChange: number; // positive for up, negative for down, 0 for no change
}

interface LeaderboardProps {
  tracks: LeaderboardTrack[];
}

export function Leaderboard({ tracks }: LeaderboardProps) {
  const topTracks = tracks.slice(0, 10);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-4 w-4 text-yellow-500" />;
    if (rank === 2) return <Trophy className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <Trophy className="h-4 w-4 text-amber-600" />;
    return null;
  };

  const getRankChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-3 w-3 text-red-500" />;
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Top Tracks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {topTracks.map((track) => (
          <div key={track.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2 w-8">
              {getRankIcon(track.rank) || (
                <span className="text-sm font-medium text-muted-foreground">{track.rank}</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-medium truncate text-sm">{track.title}</p>
              <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
            </div>

            <div className="flex items-center gap-2">
              {getRankChangeIcon(track.rankChange)}
              <Badge variant="outline" className="text-xs">
                {track.votes}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
