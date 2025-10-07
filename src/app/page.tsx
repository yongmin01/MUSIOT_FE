'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HomePage } from '@/components/HomePage';
import { useAppState } from './providers/app-state-provider';

const MOCK_VOTING_DATA = {
  '1': {
    leadingSong: {
      id: '1',
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop',
      votes: 8,
    },
    songOfTheDay: {
      id: '1',
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop',
      votes: 8,
    },
    totalVotes: 16,
    songsCount: 3,
  },
  '2': {
    leadingSong: {
      id: '4',
      title: 'Levitating',
      artist: 'Dua Lipa',
      coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop',
      votes: 12,
    },
    songOfTheDay: {
      id: '4',
      title: 'Levitating',
      artist: 'Dua Lipa',
      coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop',
      votes: 12,
    },
    totalVotes: 20,
    songsCount: 4,
  },
  '3': {
    leadingSong: {
      id: '9',
      title: 'Anti-Hero',
      artist: 'Taylor Swift',
      coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop',
      votes: 15,
    },
    songOfTheDay: {
      id: '9',
      title: 'Anti-Hero',
      artist: 'Taylor Swift',
      coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop',
      votes: 15,
    },
    totalVotes: 25,
    songsCount: 5,
  },
} as const;

export default function HomeRoute() {
  const router = useRouter();
  const { topSongs, groups, addSongToGroups } = useAppState();
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const isAfter10PM = currentTime.getHours() >= 22;

  const groupDashboardData = useMemo(
    () =>
      groups.map((group) => {
        const mockData = MOCK_VOTING_DATA[group.id as keyof typeof MOCK_VOTING_DATA];
        return {
          id: group.id,
          name: group.name,
          memberCount: group.memberCount,
          votingEnds: '10:00 PM',
          hasVotingEnded: isAfter10PM,
          leadingSong: mockData?.leadingSong,
          songOfTheDay: mockData?.songOfTheDay,
          totalVotes: mockData?.totalVotes ?? 0,
          songsCount: mockData?.songsCount ?? 0,
        };
      }),
    [groups, isAfter10PM],
  );

  const handleAddToGroups = (songId: string, groupIds: string[]) => {
    addSongToGroups(songId, groupIds);
    const song = topSongs.find((entry) => entry.id === songId);
    const selectedGroups = groups.filter((group) => groupIds.includes(group.id));

    if (song && selectedGroups.length > 0) {
      const groupNames = selectedGroups.map((group) => group.name).join(', ');
      window.alert(`"${song.title}" by ${song.artist} has been added to: ${groupNames}!`);
    }
  };

  const handleViewGroup = (groupId: string) => {
    router.push(`/groups/${groupId}`);
  };

  return (
    <HomePage
      songs={topSongs}
      userGroups={groups}
      groupDashboardData={groupDashboardData}
      onAddToGroups={handleAddToGroups}
      onViewGroup={handleViewGroup}
    />
  );
}
