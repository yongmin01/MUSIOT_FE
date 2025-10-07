'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { HomePage } from '../components/HomePage';
import { CreateGroup } from '../components/CreateGrouop';
import { JoinGroup } from '../components/JoinGroup';
import { MyGroups } from '../components/MyGroups';
import { GroupPage } from '../components/GroupPage';
import { Song } from '../components/SongCard';
import { mockTopSongs } from '@/mocks/songData';
import { mockGroups } from '@/mocks/groupData';
import { mockGroupData } from '@/mocks/groupDetailData';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groups, setGroups] = useState(mockGroups);
  const [groupData, setGroupData] = useState(mockGroupData);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute for dashboard
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const isAfter10PM = currentTime.getHours() >= 22;

  // Generate dashboard data for groups
  const generateGroupDashboardData = () => {
    return groups.map((group) => {
      // Mock voting data for each group
      const mockVotingData = {
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
      };

      const data = mockVotingData[group.id as keyof typeof mockVotingData] || {
        totalVotes: 0,
        songsCount: 0,
      };

      return {
        id: group.id,
        name: group.name,
        memberCount: group.memberCount,
        votingEnds: '10:00 PM',
        hasVotingEnded: isAfter10PM,
        leadingSong: data.leadingSong,
        songOfTheDay: data.songOfTheDay,
        totalVotes: data.totalVotes,
        songsCount: data.songsCount,
      };
    });
  };

  const handleCreateGroup = (newGroupData: {
    name: string;
    description: string;
    hasPassword: boolean;
    password?: string;
  }) => {
    const newGroup = {
      id: Date.now().toString(),
      ...newGroupData,
      memberCount: 1,
      isOwner: true,
      lastActivity: 'Just now',
      code: Math.random().toString(36).substring(2, 8).toUpperCase(),
    };

    setGroups((prev) => [...prev, newGroup]);
    setCurrentPage('my-groups');
  };

  const handleJoinGroup = (code: string, password?: string) => {
    // Mock joining logic
    const newGroup = {
      id: Date.now().toString(),
      name: `Group ${code}`,
      description: 'Joined group',
      memberCount: 5,
      isOwner: false,
      lastActivity: 'Just now',
      code: code,
    };

    setGroups((prev) => [...prev, newGroup]);
    setCurrentPage('my-groups');
  };

  const handleAddToGroups = (songId: string, groupIds: string[]) => {
    // Mock add to groups logic - show a confirmation message
    const song = mockTopSongs.find((s) => s.id === songId);
    const selectedGroups = groups.filter((g) => groupIds.includes(g.id));

    if (song && selectedGroups.length > 0) {
      const groupNames = selectedGroups.map((g) => g.name).join(', ');
      alert(`"${song.title}" by ${song.artist} has been added to: ${groupNames}!`);
    }
  };

  const handleViewGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setCurrentPage('group');
  };

  const handleVote = (songId: string) => {
    setGroupData((prev) => ({
      ...prev,
      todaySongs: prev.todaySongs.map((song) =>
        song.id === songId
          ? {
              ...song,
              votes: song.votes + 1,
              hasUserVoted: true,
            }
          : song
      ),
    }));
  };

  const handleAddSongToGroup = (songId: string) => {
    const song = mockTopSongs.find((s) => s.id === songId);
    if (song && groupData) {
      const newSong = {
        ...song,
        addedBy: 'You',
        votes: 0,
        hasUserVoted: false,
        addedAt: 'Just now',
      };

      setGroupData((prev) => ({
        ...prev,
        todaySongs: [...prev.todaySongs, newSong],
      }));
    }
  };

  const handleSearchSongs = (query: string): Song[] => {
    return mockTopSongs.filter(
      (song) =>
        song.title.toLowerCase().includes(query.toLowerCase()) ||
        song.artist.toLowerCase().includes(query.toLowerCase()) ||
        song.album.toLowerCase().includes(query.toLowerCase())
    );
  };

  const renderCurrentPage = () => {
    if (selectedGroupId && currentPage === 'group') {
      return (
        <GroupPage
          group={groupData}
          topSongs={mockTopSongs}
          onVote={handleVote}
          onAddSong={handleAddSongToGroup}
          onSearchSongs={handleSearchSongs}
          onGoBack={() => {
            setSelectedGroupId(null);
            setCurrentPage('my-groups');
          }}
        />
      );
    }

    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            songs={mockTopSongs}
            userGroups={groups}
            groupDashboardData={generateGroupDashboardData()}
            onAddToGroups={handleAddToGroups}
            onViewGroup={handleViewGroup}
          />
        );
      case 'create-group':
        return <CreateGroup onCreateGroup={handleCreateGroup} />;
      case 'join-group':
        return <JoinGroup onJoinGroup={handleJoinGroup} />;
      case 'my-groups':
        return (
          <MyGroups
            groups={groups}
            onSelectGroup={handleViewGroup}
            onCreateGroup={() => setCurrentPage('create-group')}
          />
        );
      default:
        return (
          <HomePage
            songs={mockTopSongs}
            userGroups={groups}
            groupDashboardData={generateGroupDashboardData()}
            onAddToGroups={handleAddToGroups}
            onViewGroup={handleViewGroup}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      {renderCurrentPage()}
    </div>
  );
}
