import { Vote, Clock, User } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface GroupSong {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  addedBy: string;
  votes: number;
  hasUserVoted: boolean;
  addedAt: string;
}

interface GroupSongCardProps {
  song: GroupSong;
  onVote: (songId: string) => void;
  canVote: boolean;
  totalVotes: number;
}

export function GroupSongCard({ song, onVote, canVote, totalVotes }: GroupSongCardProps) {
  const votePercentage = totalVotes > 0 ? (song.votes / totalVotes) * 100 : 0;

  return (
    <Card className={`transition-all ${song.hasUserVoted ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <img src={song.coverUrl} alt={`${song.title} cover`} className="w-16 h-16 rounded object-cover" />

          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{song.title}</h3>
            <p className="text-sm text-muted-foreground truncate">
              {song.artist} • {song.album}
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                Added by {song.addedBy}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {song.addedAt}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 min-w-[120px]">
            <div className="flex items-center gap-2">
              <Badge variant={song.hasUserVoted ? 'default' : 'outline'}>{song.votes} votes</Badge>
              <Button
                size="sm"
                onClick={() => onVote(song.id)}
                disabled={!canVote}
                variant={song.hasUserVoted ? 'default' : 'outline'}
              >
                <Vote className="h-4 w-4 mr-1" />
                {song.hasUserVoted ? 'Voted' : 'Vote'}
              </Button>
            </div>

            {totalVotes > 0 && (
              <div className="w-full">
                <Progress value={votePercentage} className="h-2" />
                <p className="text-xs text-muted-foreground text-right mt-1">{votePercentage.toFixed(1)}%</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
