'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Track } from '@/types/track';
import { useSupabaseClient, useSessionContext } from '@supabase/auth-helpers-react';
import { useTopTracks } from '@/hooks/useTopTracks';

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
  topSongs: Track[];
  topSongsLoading: boolean;
  topSongsError: Error | null;
  groups: GroupSummary[];
  getGroupDetail: (groupId: string) => GroupDetail | null;
  createGroup: (data: CreateGroupInput) => Promise<string>;
  joinGroup: (code: string, password?: string) => Promise<string>;
  addSongToGroup: (groupId: string, songId: string) => void;
  addSongToGroups: (songId: string, groupIds: string[]) => void;
  voteForSong: (groupId: string, songId: string) => void;
  searchSongs: (query: string) => Track[];
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

const createEmptyDetail = (group: GroupSummary): GroupDetail => ({
  id: group.id,
  name: group.name,
  memberCount: group.memberCount,
  votingEnds: '10:00 PM',
  hasVotingEnded: false,
  todaySongs: [],
  history: [],
});

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const { tracks: fetchedTopTracks, loading: topTracksLoading, error: topTracksError } = useTopTracks();
  const [topSongs, setTopSongs] = useState<Track[]>([]);
  const [groups, setGroups] = useState<GroupSummary[]>(() => []);
  const [groupDetails, setGroupDetails] = useState<Record<string, GroupDetail>>(() => ({}));
  const supabase = useSupabaseClient();
  const { session } = useSessionContext();

  useEffect(() => {
    if (topTracksError) {
      console.error('Failed to load Spotify top tracks', topTracksError);
      return;
    }

    if (topTracksLoading) {
      return;
    }

    if (fetchedTopTracks.length > 0) {
      setTopSongs(fetchedTopTracks);
    } else {
      console.log('No Top Tracks found');
    }
  }, [fetchedTopTracks, topTracksError, topTracksLoading]);

  useEffect(() => {
    const userId = session?.user?.id;

    if (!userId) {
      setGroups([]);
      setGroupDetails({});
      return;
    }

    const loadGroups = async () => {
      const { data, error } = await supabase
        .from('group_members')
        .select(
          `
            group_id,
            role,
            groups (
              id,
              name,
              description,
              join_code,
              requires_password,
              owner_id,
              created_at,
              updated_at
            )
          `
        )
        .eq('user_id', userId);

      if (error) {
        console.error('Failed to load groups', error);
        return;
      }

      const summaries = (data ?? [])
        .map((membership) => {
          const group = membership.groups;
          if (!group) {
            return null;
          }

          const isOwner = group.owner_id === userId || membership.role === 'owner';

          const summary: GroupSummary = {
            id: group.id,
            name: group.name ?? '',
            description: group.description ?? '',
            memberCount: 1,
            isOwner,
            lastActivity: new Date(group.updated_at ?? group.created_at ?? Date.now()).toISOString(),
            code: group.join_code,
            hasPassword: group.requires_password ?? false,
          };

          return summary;
        })
        .filter((value): value is GroupSummary => Boolean(value));

      setGroups(summaries);
      setGroupDetails((prev) => {
        const next: Record<string, GroupDetail> = {};
        summaries.forEach((group) => {
          next[group.id] = prev[group.id] ?? createEmptyDetail(group);
        });
        return next;
      });
    };

    void loadGroups();
  }, [session?.user?.id, supabase]);

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
    [groupDetails]
  );

  const createGroup = useCallback(
    async (data: CreateGroupInput) => {
      const description = data.description?.trim();

      const { data: result, error } = await supabase.rpc('create_group', {
        p_name: data.name,
        p_description: description ? description : null,
        p_requires_password: data.hasPassword,
        p_password: data.hasPassword ? (data.password ?? null) : null,
      });

      if (error) {
        const message = error.message ?? 'Failed to create group';
        throw new Error(message.includes('duplicate key value') ? '이미 사용 중인 그룹 코드입니다.' : message);
      }

      const groupRow = Array.isArray(result) ? result[0] : result;

      if (!groupRow) {
        throw new Error('Group creation returned no data');
      }

      const newGroup: GroupSummary = {
        id: groupRow.id,
        name: groupRow.name,
        description: groupRow.description ?? '',
        memberCount: 1,
        isOwner: groupRow.owner_id === session?.user?.id,
        lastActivity: new Date(groupRow.created_at ?? Date.now()).toISOString(),
        code: groupRow.join_code,
        hasPassword: groupRow.requires_password ?? false,
      };

      setGroups((prev) => {
        if (prev.some((item) => item.id === newGroup.id)) {
          return prev.map((item) => (item.id === newGroup.id ? newGroup : item));
        }
        return [...prev, newGroup];
      });

      setGroupDetails((prev) => ({
        ...prev,
        [newGroup.id]: createEmptyDetail(newGroup),
      }));

      return newGroup.id;
    },
    [session?.user?.id, supabase]
  );

  const joinGroup = useCallback(
    async (code: string, password?: string) => {
      const trimmedCode = code.trim();
      if (!trimmedCode) {
        throw new Error('사용할 수 없는 그룹 코드입니다.');
      }

      const isAlreadyMember = groups.some((group) => group.code?.toUpperCase() === trimmedCode.toUpperCase());
      if (isAlreadyMember) {
        throw new Error('이미 가입한 그룹입니다.');
      }

      const { data: result, error } = await supabase.rpc('join_group', {
        p_join_code: trimmedCode,
        p_password: password ?? null,
      });

      if (error) {
        const message = error.message ?? 'Failed to join group';
        if (message.includes('GROUP_NOT_FOUND')) {
          throw new Error('존재하지 않는 그룹 코드입니다.');
        }
        if (message.includes('INVALID_PASSWORD')) {
          throw new Error('그룹 비밀번호가 일치하지 않습니다.');
        }
        throw new Error(message);
      }

      const groupRow = Array.isArray(result) ? result[0] : result;

      if (!groupRow) {
        throw new Error('그룹 정보를 찾을 수 없습니다.');
      }

      const joinedGroup: GroupSummary = {
        id: groupRow.id,
        name: groupRow.name,
        description: groupRow.description ?? '',
        memberCount: 1,
        isOwner: groupRow.owner_id === session?.user?.id,
        lastActivity: new Date(groupRow.updated_at ?? groupRow.created_at ?? Date.now()).toISOString(),
        code: groupRow.join_code,
        hasPassword: groupRow.requires_password ?? false,
      };

      setGroups((prev) => {
        if (prev.some((group) => group.id === joinedGroup.id)) {
          return prev.map((group) => (group.id === joinedGroup.id ? joinedGroup : group));
        }
        return [...prev, joinedGroup];
      });

      setGroupDetails((prev) => {
        if (prev[joinedGroup.id]) {
          return prev;
        }
        return {
          ...prev,
          [joinedGroup.id]: createEmptyDetail(joinedGroup),
        };
      });

      return joinedGroup.id;
    },
    [groups, session?.user?.id, supabase]
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
              artist: song.artistName,
              album: song.albumName,
              coverUrl: song.albumCoverUrl,
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
    [topSongs]
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
                artist: song.artistName,
                album: song.albumName,
                coverUrl: song.albumCoverUrl,
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
    [groups, topSongs]
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
          song.id === songId ? { ...song, votes: song.votes + 1, hasUserVoted: true } : song
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
          song.artistName.toLowerCase().includes(normalized) ||
          song.albumName.toLowerCase().includes(normalized)
      );
    },
    [topSongs]
  );

  const value = useMemo<AppStateContextValue>(
    () => ({
      topSongs,
      topSongsLoading: topTracksLoading,
      topSongsError: topTracksError,
      groups,
      getGroupDetail,
      createGroup,
      joinGroup,
      addSongToGroup,
      addSongToGroups,
      voteForSong,
      searchSongs,
    }),
    [
      topSongs,
      topTracksLoading,
      topTracksError,
      groups,
      getGroupDetail,
      createGroup,
      joinGroup,
      addSongToGroup,
      addSongToGroups,
      voteForSong,
      searchSongs,
    ]
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
