'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Clock, Trophy, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

interface GroupSong {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  votes: number;
}

interface GroupDashboardData {
  id: string;
  name: string;
  memberCount: number;
  votingEnds: string;
  hasVotingEnded: boolean;
  leadingSong?: GroupSong;
  songOfTheDay?: GroupSong;
  totalVotes: number;
  songsCount: number;
}

interface GroupDashboardProps {
  groups: GroupDashboardData[];
  onViewGroup: (groupId: string) => void;
}

export function GroupDashboard({ groups, onViewGroup }: GroupDashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const isAfter10PM = currentTime.getHours() >= 22;
  const dashboardTitle = isAfter10PM ? "Today's Songs of the Day" : 'Current Vote Leaders';
  const dashboardSubtitle = isAfter10PM
    ? "Voting has ended - here are today's winners"
    : `Voting closes at 10:00 PM (${Math.max(0, 22 - currentTime.getHours())}h ${Math.max(0, 60 - currentTime.getMinutes())}m remaining)`;

  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2">
              {isAfter10PM ? (
                <Trophy className="h-5 w-5 text-yellow-500" />
              ) : (
                <TrendingUp className="h-5 w-5 text-blue-500" />
              )}
              {dashboardTitle}
            </h2>
            <p className="text-muted-foreground">{dashboardSubtitle}</p>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {currentTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <Card key={group.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{group.name}</CardTitle>
                <Badge variant={isAfter10PM ? 'default' : 'secondary'}>{isAfter10PM ? 'Closed' : 'Active'}</Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {group.memberCount} members
                </div>
                <div>
                  {group.songsCount} songs • {group.totalVotes} votes
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {(isAfter10PM ? group.songOfTheDay : group.leadingSong) ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src={(isAfter10PM ? group.songOfTheDay : group.leadingSong)!.coverUrl}
                      width={48}
                      height={48}
                      alt="Song cover"
                      className="w-12 h-12 rounded object-cover"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">
                        {(isAfter10PM ? group.songOfTheDay : group.leadingSong)!.title}
                      </h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {(isAfter10PM ? group.songOfTheDay : group.leadingSong)!.artist}
                      </p>

                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {(isAfter10PM ? group.songOfTheDay : group.leadingSong)!.votes} votes
                        </Badge>
                        {!isAfter10PM && group.totalVotes > 0 && (
                          <div className="flex-1">
                            <Progress value={(group.leadingSong!.votes / group.totalVotes) * 100} className="h-1" />
                          </div>
                        )}
                        {!isAfter10PM && (
                          <span className="text-xs text-muted-foreground">
                            {Math.round((group.leadingSong!.votes / group.totalVotes) * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full" onClick={() => onViewGroup(group.id)}>
                    View Group
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-muted-foreground mb-3">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No songs added yet</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => onViewGroup(group.id)}>
                    Add First Song
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
