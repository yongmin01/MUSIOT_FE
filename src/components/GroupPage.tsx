'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Calendar, Trophy, Plus, Clock, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { GroupSongCard } from './GroupSongCard';
import { AddSongModal } from './AddSongModal';
import type { Track } from '@/types/track';

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

interface WinnerSong {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  votes: number;
  date: string;
}

interface GroupData {
  id: string;
  name: string;
  memberCount: number;
  votingEnds: string;
  hasVotingEnded: boolean;
  todaySongs: GroupSong[];
  songOfTheDay?: WinnerSong;
  history: WinnerSong[];
}

interface GroupPageProps {
  group: GroupData;
  topSongs: Track[];
  onVote: (songId: string) => void;
  onAddSong: (songId: string) => void;
  onSearchSongs: (query: string) => Track[];
  onGoBack: () => void;
}

export function GroupPage({ group, onVote, onAddSong, onSearchSongs, onGoBack }: GroupPageProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  const totalVotes = group.todaySongs.reduce((sum, song) => sum + song.votes, 0);
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Button variant="ghost" onClick={onGoBack} className="mb-2">
              ← Back to My Groups
            </Button>
            <h1>{group.name}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {currentDate}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {group.memberCount} members
              </div>
            </div>
          </div>

          <div className="text-right">
            <Badge variant={group.hasVotingEnded ? 'secondary' : 'default'} className="mb-2">
              {group.hasVotingEnded ? 'Voting Ended' : 'Voting Active'}
            </Badge>
            {!group.hasVotingEnded && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Ends at {group.votingEnds}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Song of the Day */}
      {group.songOfTheDay && (
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Song of the Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Image
                src={group.songOfTheDay.coverUrl}
                width={80}
                height={80}
                alt={`${group.songOfTheDay.title} cover`}
                className="w-20 h-20 rounded object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{group.songOfTheDay.title}</h3>
                <p className="text-muted-foreground">{group.songOfTheDay.artist}</p>
                <Badge className="mt-2">{group.songOfTheDay.votes} votes</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Songs */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2>Today&apos;s Songs</h2>
            <p className="text-muted-foreground">
              {totalVotes} total votes • {group.todaySongs.length} songs
            </p>
          </div>

          {!group.hasVotingEnded && (
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Song
            </Button>
          )}
        </div>

        {group.todaySongs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
              <h3>No Songs Added Yet</h3>
              <p className="text-muted-foreground text-center mb-6">
                Be the first to add a song for today&apos;s vote!
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Song
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {group.todaySongs
              .sort((a, b) => b.votes - a.votes)
              .map((song) => (
                <GroupSongCard
                  key={song.id}
                  song={song}
                  onVote={onVote}
                  canVote={!group.hasVotingEnded && !song.hasUserVoted}
                  totalVotes={totalVotes}
                />
              ))}
          </div>
        )}
      </div>

      {/* History */}
      {group.history.length > 0 && (
        <>
          <Separator className="mb-8" />
          <div>
            <h2 className="mb-6">History</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.history.map((winner) => (
                <Card key={winner.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Image
                        src={winner.coverUrl}
                        width={48}
                        height={48}
                        alt={`${winner.title} cover`}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{winner.title}</h4>
                        <p className="text-sm text-muted-foreground truncate">{winner.artist}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">{winner.date}</span>
                          <Badge variant="outline" className="text-xs">
                            {winner.votes} votes
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Add Song Modal */}
      <AddSongModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddSong={onAddSong}
        onSearchSongs={onSearchSongs}
      />

      {/* Floating Add Button */}
      {!group.hasVotingEnded && (
        <Button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-8 right-8 rounded-full w-14 h-14 shadow-lg"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
