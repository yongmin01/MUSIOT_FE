'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { Song } from '@/components/SongCard';
import { mockTopSongs } from '@/mocks/songData';
import { mockGroups } from '@/mocks/groupData';
import { mockGroupData } from '@/mocks/groupDetailData';

export interface GroupSummary {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isOwner: boolean;
  lastActivity: string;
  code: string;
  hasPassword?: boolean;
}

export interface GroupSong {
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

export interface GroupHistoryEntry {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  votes: number;
  date: string;
}

export interface GroupDetail {
  id: string;
  name: string;
  memberCount: number;
  votingEnds: string;
  hasVotingEnded: boolean;
  todaySongs: GroupSong[];
  songOfTheDay?: {
    id: string;
    title: string;
    artist: string;
    coverUrl: string;
    votes: number;
    date?: string;
  };
  history: GroupHistoryEntry[];
}

export interface CreateGroupInput {
  name: string;
  description: string;
  hasPassword: boolean;
  password?: string;
}

interface AppStateContextValue {
  topSongs: Song[];
  groups: GroupSummary[];
  getGroupDetail: (groupId: string) => GroupDetail | null;
  createGroup: (data: CreateGroupInput) => string;
  joinGroup: (code: string, password?: string) => string;
  addSongToGroup: (groupId: string, songId: string) => void;
  addSongToGroups: (songId: string, groupIds: string[]) => void;
  voteForSong: (groupId: string, songId: string) => void;
  searchSongs: (query: string) => Song[];
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

const cloneDetail = (): GroupDetail => ({
  id: mockGroupData.id,
  name: mockGroupData.name,
  memberCount: mockGroupData.memberCount,
  votingEnds: mockGroupData.votingEnds,
  hasVotingEnded: mockGroupData.hasVotingEnded,
  todaySongs: mockGroupData.todaySongs.map((song) => ({ ...song })),
  songOfTheDay: mockGroupData.songOfTheDay ? { ...mockGroupData.songOfTheDay } : undefined,
  history: mockGroupData.history.map((item) => ({ ...item })),
});

const createEmptyDetail = (group: GroupSummary): GroupDetail => ({
  id: group.id,
  name: group.name,
  memberCount: group.memberCount,
  votingEnds: '10:00 PM',
  hasVotingEnded: false,
  todaySongs: [],
  history: [],
});

const buildInitialDetails = (groups: GroupSummary[]): Record<string, GroupDetail> => {
  return groups.reduce<Record<string, GroupDetail>>((acc, group) => {
    acc[group.id] = group.id === mockGroupData.id ? cloneDetail() : createEmptyDetail(group);
    return acc;
  }, {});
};

const initialGroups: GroupSummary[] = mockGroups.map((group) => ({ ...group }));

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [topSongs] = useState<Song[]>(() => [...mockTopSongs]);
  const [groups, setGroups] = useState<GroupSummary[]>(() => initialGroups);
  const [groupDetails, setGroupDetails] = useState<Record<string, GroupDetail>>(() => buildInitialDetails(initialGroups));

  const getGroupDetail = useCallback(
    (groupId: string) => {
      const detail = groupDetails[groupId];
      if (!detail) {
        return null;
      }

      return {
        ...detail,
        todaySongs: detail.todaySongs.map((song) => ({ ...song })),
        history: detail.history.map((entry) => ({ ...entry })),
        songOfTheDay: detail.songOfTheDay ? { ...detail.songOfTheDay } : undefined,
      };
    },
    [groupDetails],
  );

  const createGroup = useCallback(
    (data: CreateGroupInput) => {
      const id = Date.now().toString();
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const newGroup: GroupSummary = {
        id,
        name: data.name,
        description: data.description,
        memberCount: 1,
        isOwner: true,
        lastActivity: 'Just now',
        code,
        hasPassword: data.hasPassword,
      };

      setGroups((prev) => [...prev, newGroup]);
      setGroupDetails((prev) => ({
        ...prev,
        [id]: {
          id,
          name: data.name,
          memberCount: 1,
          votingEnds: '10:00 PM',
          hasVotingEnded: false,
          todaySongs: [],
          history: [],
        },
      }));

      return id;
    },
    [],
  );

  const joinGroup = useCallback(
    (code: string, _password?: string) => {
      const id = Date.now().toString();
      const name = `Group ${code.toUpperCase()}`;

      const newGroup: GroupSummary = {
        id,
        name,
        description: 'Joined group',
        memberCount: 5,
        isOwner: false,
        lastActivity: 'Just now',
        code,
      };

      setGroups((prev) => [...prev, newGroup]);
      setGroupDetails((prev) => ({
        ...prev,
        [id]: createEmptyDetail(newGroup),
      }));

      return id;
    },
    [],
  );

  const addSongToGroup = useCallback(
    (groupId: string, songId: string) => {
      setGroupDetails((prev) => {
        const detail = prev[groupId];
        if (!detail) {
          return prev;
        }

        const song = topSongs.find((item) => item.id === songId);
        if (!song) {
          return prev;
        }

        if (detail.todaySongs.some((entry) => entry.id === songId)) {
          return prev;
        }

        const updatedDetail: GroupDetail = {
          ...detail,
          todaySongs: [
            ...detail.todaySongs,
            {
              id: song.id,
              title: song.title,
              artist: song.artist,
              album: song.album,
              coverUrl: song.coverUrl,
              addedBy: 'You',
              votes: 0,
              hasUserVoted: false,
              addedAt: 'Just now',
            },
          ],
        };

        return { ...prev, [groupId]: updatedDetail };
      });
    },
    [topSongs],
  );

  const addSongToGroups = useCallback(
    (songId: string, groupIds: string[]) => {
      setGroupDetails((prev) => {
        let nextState = prev;

        groupIds.forEach((groupId) => {
          if (!nextState[groupId]) {
            const targetGroup = groups.find((group) => group.id === groupId);
            if (targetGroup) {
              nextState = {
                ...nextState,
                [groupId]: createEmptyDetail(targetGroup),
              };
            }
          }
        });

        groupIds.forEach((groupId) => {
          const detail = nextState[groupId];
          if (!detail) {
            return;
          }

          const song = topSongs.find((item) => item.id === songId);
          if (!song || detail.todaySongs.some((entry) => entry.id === songId)) {
            return;
          }

          const updatedDetail: GroupDetail = {
            ...detail,
            todaySongs: [
              ...detail.todaySongs,
              {
                id: song.id,
                title: song.title,
                artist: song.artist,
                album: song.album,
                coverUrl: song.coverUrl,
                addedBy: 'You',
                votes: 0,
                hasUserVoted: false,
                addedAt: 'Just now',
              },
            ],
          };

          nextState = { ...nextState, [groupId]: updatedDetail };
        });

        return nextState;
      });
    },
    [groups, topSongs],
  );

  const voteForSong = useCallback((groupId: string, songId: string) => {
    setGroupDetails((prev) => {
      const detail = prev[groupId];
      if (!detail) {
        return prev;
      }

      const updatedDetail: GroupDetail = {
        ...detail,
        todaySongs: detail.todaySongs.map((song) =>
          song.id === songId ? { ...song, votes: song.votes + 1, hasUserVoted: true } : song,
        ),
      };

      return { ...prev, [groupId]: updatedDetail };
    });
  }, []);

  const searchSongs = useCallback(
    (query: string) => {
      const normalized = query.trim().toLowerCase();
      if (!normalized) {
        return topSongs;
      }

      return topSongs.filter(
        (song) =>
          song.title.toLowerCase().includes(normalized) ||
          song.artist.toLowerCase().includes(normalized) ||
          song.album.toLowerCase().includes(normalized),
      );
    },
    [topSongs],
  );

  const value = useMemo<AppStateContextValue>(
    () => ({
      topSongs,
      groups,
      getGroupDetail,
      createGroup,
      joinGroup,
      addSongToGroup,
      addSongToGroups,
      voteForSong,
      searchSongs,
    }),
    [topSongs, groups, getGroupDetail, createGroup, joinGroup, addSongToGroup, addSongToGroups, voteForSong, searchSongs],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }

  return context;
}
