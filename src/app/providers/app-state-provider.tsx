'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
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
  id: string; // group_round_track_id
  trackId: string;
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
  trackId: string;
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
  votingEnds: string | null;
  hasVotingEnded: boolean;
  isVotingOpen: boolean;
  roundId?: string | null;
  status?: 'submission' | 'waiting_final' | 'closed' | null;
  todaySongs: GroupSong[];
  songOfTheDay?: {
    id: string;
    trackId: string;
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
  refreshGroupDetail: (groupId: string) => Promise<GroupDetail | null>;
  isGroupLoading: (groupId: string) => boolean;
  createGroup: (data: CreateGroupInput) => Promise<string>;
  joinGroup: (code: string, password?: string) => Promise<string>;
  addSongToGroup: (groupId: string, songId: string) => Promise<void>;
  addSongToGroups: (songId: string, groupIds: string[]) => Promise<void>;
  voteForSong: (groupId: string, roundTrackId: string) => Promise<void>;
  searchSongs: (query: string) => Track[];
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

const createEmptyDetail = (group: GroupSummary): GroupDetail => ({
  id: group.id,
  name: group.name,
  memberCount: group.memberCount,
  votingEnds: null,
  hasVotingEnded: false,
  isVotingOpen: false,
  roundId: null,
  status: null,
  todaySongs: [],
  history: [],
});

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const { tracks: fetchedTopTracks, loading: topTracksLoading, error: topTracksError } = useTopTracks();
  const [topSongs, setTopSongs] = useState<Track[]>([]);
  const [groups, setGroups] = useState<GroupSummary[]>(() => []);
  const [groupDetails, setGroupDetails] = useState<Record<string, GroupDetail>>(() => ({}));
  const [groupLoading, setGroupLoading] = useState<Record<string, boolean>>(() => ({}));
  const supabase = useSupabaseClient();
  const { session } = useSessionContext();
  const groupsRef = useRef<GroupSummary[]>(groups);

  useEffect(() => {
    groupsRef.current = groups;
  }, [groups]);

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

  const isGroupLoading = useCallback((groupId: string) => Boolean(groupLoading[groupId]), [groupLoading]);

  const refreshGroupDetail = useCallback(
    async (groupId: string) => {
      const userId = session?.user?.id;
      if (!userId) {
        return null;
      }

      setGroupLoading((prev) => ({ ...prev, [groupId]: true }));

      try {
        // Ensure there is a round for the current day; ignore errors so refresh continues
        const { error: ensureRoundError } = await supabase.rpc('ensure_group_round', { p_group_id: groupId });
        if (ensureRoundError) {
          console.warn('ensure_group_round failed', ensureRoundError);
        }

        const currentGroups = groupsRef.current;
        let groupSummary = currentGroups.find((group) => group.id === groupId) ?? null;

        if (!groupSummary) {
          const { data: groupRow, error: groupFetchError } = await supabase
            .from('groups')
            .select('id, name, description, owner_id, join_code, requires_password, created_at, updated_at')
            .eq('id', groupId)
            .maybeSingle();

          if (groupFetchError) {
            throw groupFetchError;
          }

          if (groupRow) {
            groupSummary = {
              id: groupRow.id,
              name: groupRow.name ?? '',
              description: groupRow.description ?? '',
              memberCount: 0,
              isOwner: groupRow.owner_id === userId,
              lastActivity: new Date(groupRow.updated_at ?? groupRow.created_at ?? new Date()).toISOString(),
              code: groupRow.join_code,
              hasPassword: groupRow.requires_password ?? false,
            };

            setGroups((prev) => {
              if (prev.some((group) => group.id === groupId)) {
                groupsRef.current = prev;
                return prev;
              }
              const next = [...prev, groupSummary!];
              groupsRef.current = next;
              return next;
            });
          }
        }

        const { data: memberCountData, error: memberCountError } = await supabase.rpc('get_group_member_count', {
          p_group_id: groupId,
        });

        if (memberCountError) {
          throw memberCountError;
        }

        const memberCount =
          typeof memberCountData === 'number' && Number.isFinite(memberCountData) ? memberCountData : null;

        const { data: roundData, error: roundError } = await supabase
          .from('group_vote_rounds')
          .select(
            'id, group_id, round_date, status, submission_start_at, submission_end_at, winner_group_track_id, winner_finalized_at'
          )
          .eq('group_id', groupId)
          .order('round_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (roundError && roundError.code !== 'PGRST116') {
          throw roundError;
        }

        const round = roundData ?? null;

        let roundTracksData: Array<{
          id: string;
          round_id: string;
          track_id: string;
          status: string;
          added_by: string;
          added_at: string;
          tracks: {
            id: string;
            title: string;
            artist_name: string;
            album_name: string | null;
            artwork_url: string | null;
          } | null;
        }> = [];

        if (round?.id) {
          const { data: tracksData, error: tracksError } = await supabase
            .from('group_round_tracks')
            .select(
              `
                id,
                round_id,
                track_id,
                status,
                added_by,
                added_at,
                tracks (
                  id,
                  title,
                  artist_name,
                  album_name,
                  artwork_url
                )
              `
            )
            .eq('round_id', round.id)
            .order('added_at', { ascending: true });

          if (tracksError) {
            throw tracksError;
          }

          roundTracksData = (tracksData ?? []).map((track) => {
            const rawTrackInfo = Array.isArray(track.tracks) ? track.tracks[0] : track.tracks;
            const trackInfo = rawTrackInfo
              ? {
                  id: String(rawTrackInfo.id ?? ''),
                  title: String(rawTrackInfo.title ?? ''),
                  artist_name: String(rawTrackInfo.artist_name ?? ''),
                  album_name: rawTrackInfo.album_name ?? null,
                  artwork_url: rawTrackInfo.artwork_url ?? null,
                }
              : null;

            return {
              id: String(track.id ?? ''),
              round_id: String(track.round_id ?? ''),
              track_id: String(track.track_id ?? ''),
              status: String(track.status ?? ''),
              added_by: String(track.added_by ?? ''),
              added_at: String(track.added_at ?? ''),
              tracks: trackInfo,
            };
          });
        }

        let votesRows: { group_round_track_id: string; voter_id: string }[] = [];
        if (round?.id) {
          const { data: votesData, error: votesError } = await supabase
            .from('group_votes')
            .select('group_round_track_id, voter_id')
            .eq('round_id', round.id);

          if (votesError) {
            throw votesError;
          }

          votesRows = votesData ?? [];
        }

        const { data: historyData, error: historyError } = await supabase
          .from('group_recent_winners')
          .select(
            'group_id, round_id, group_round_track_id, track_id, title, artist_name, album_name, artwork_url, vote_count, finalized_at'
          )
          .eq('group_id', groupId)
          .order('finalized_at', { ascending: false })
          .limit(3);

        if (historyError) {
          throw historyError;
        }

        const voteCounts = new Map<string, number>();
        const userVotes = new Set<string>();

        votesRows.forEach((vote) => {
          voteCounts.set(vote.group_round_track_id, (voteCounts.get(vote.group_round_track_id) ?? 0) + 1);
          if (vote.voter_id === userId) {
            userVotes.add(vote.group_round_track_id);
          }
        });

        const songs: GroupSong[] = roundTracksData.map((item) => {
          const trackInfo = Array.isArray(item.tracks) ? item.tracks[0] : item.tracks;

          return {
            id: item.id,
            trackId: item.track_id,
            title: trackInfo?.title ?? '',
            artist: trackInfo?.artist_name ?? '',
            album: trackInfo?.album_name ?? '',
            coverUrl: trackInfo?.artwork_url ?? '',
            addedBy: item.added_by === userId ? 'You' : '멤버',
            votes: voteCounts.get(item.id) ?? 0,
            hasUserVoted: userVotes.has(item.id),
            addedAt: item.added_at
              ? new Date(item.added_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
              : '',
          };
        });

        const history: GroupHistoryEntry[] = (historyData ?? []).map((entry) => ({
          id: entry.group_round_track_id,
          trackId: entry.track_id,
          title: entry.title ?? '',
          artist: entry.artist_name ?? '',
          coverUrl: entry.artwork_url ?? '',
          votes: entry.vote_count ?? 0,
          date: entry.finalized_at
            ? new Date(entry.finalized_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
            : '',
        }));

        const winnerFromRound = songs.find((song) => song.id === round?.winner_group_track_id);
        let songOfTheDay =
          winnerFromRound ??
          (history.length > 0
            ? {
                id: history[0].id,
                trackId: history[0].trackId,
                title: history[0].title,
                artist: history[0].artist,
                coverUrl: history[0].coverUrl,
                votes: history[0].votes,
                date: history[0].date,
              }
            : undefined);

        if (winnerFromRound && round?.winner_finalized_at) {
          songOfTheDay = {
            id: winnerFromRound.id,
            trackId: winnerFromRound.trackId,
            title: winnerFromRound.title,
            artist: winnerFromRound.artist,
            coverUrl: winnerFromRound.coverUrl,
            votes: winnerFromRound.votes,
            date: new Date(round.winner_finalized_at).toLocaleDateString('ko-KR', {
              month: 'short',
              day: 'numeric',
            }),
          };
        }

        const votingEnds = round?.submission_end_at
          ? new Date(round.submission_end_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
          : null;

        const computedMemberCount = memberCount ?? groupSummary?.memberCount ?? 0;

        const detail: GroupDetail = {
          id: groupId,
          name: groupSummary?.name ?? '',
          memberCount: computedMemberCount,
          votingEnds,
          hasVotingEnded: round ? round.status !== 'submission' : true,
          isVotingOpen: round ? round.status === 'submission' : false,
          roundId: round?.id ?? null,
          status: (round?.status as GroupDetail['status']) ?? null,
          todaySongs: songs,
          songOfTheDay,
          history,
        };

        setGroupDetails((prev) => ({
          ...prev,
          [groupId]: detail,
        }));

        setGroups((prev) => {
          let changed = false;
          const next = prev.map((group) => {
            if (group.id !== groupId) {
              return group;
            }

            if (group.memberCount === computedMemberCount) {
              return group;
            }

            changed = true;
            return { ...group, memberCount: computedMemberCount };
          });

          const result = changed ? next : prev;
          groupsRef.current = result;
          return result;
        });

        return detail;
      } catch (error) {
        console.error('Failed to refresh group detail', error);
        throw error;
      } finally {
        setGroupLoading((prev) => ({ ...prev, [groupId]: false }));
      }
    },
    [session?.user?.id, supabase]
  );

  useEffect(() => {
    const userId = session?.user?.id;

    if (!userId) {
      setGroups([]);
      groupsRef.current = [];
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
          const rawGroup = Array.isArray(membership.groups) ? membership.groups[0] : membership.groups;
          if (!rawGroup) {
            return null;
          }

          const group = {
            id: String(rawGroup.id ?? ''),
            name: String(rawGroup.name ?? ''),
            description: rawGroup.description ?? '',
            join_code: String(rawGroup.join_code ?? ''),
            requires_password: Boolean(rawGroup.requires_password ?? false),
            owner_id: String(rawGroup.owner_id ?? ''),
            created_at: rawGroup.created_at ?? null,
            updated_at: rawGroup.updated_at ?? null,
          };

          const membershipRole = String(membership.role ?? '');
          const isOwner = group.owner_id === userId || membershipRole === 'owner';

          const summary: GroupSummary = {
            id: group.id,
            name: group.name,
            description: group.description,
            memberCount: 1,
            isOwner,
            lastActivity: new Date(group.updated_at ?? group.created_at ?? Date.now()).toISOString(),
            code: group.join_code,
            hasPassword: group.requires_password,
          };

          return summary;
        })
        .filter((value): value is GroupSummary => Boolean(value));

      const groupsWithCounts = await Promise.all(
        summaries.map(async (group) => {
          try {
            const { data: memberCountData, error: memberCountError } = await supabase.rpc(
              'get_group_member_count',
              {
                p_group_id: group.id,
              }
            );

            if (memberCountError) {
              throw memberCountError;
            }

            const memberCount =
              typeof memberCountData === 'number' && Number.isFinite(memberCountData)
                ? memberCountData
                : group.memberCount;

            return { ...group, memberCount };
          } catch (countError) {
            console.warn('Failed to load member count for group', group.id, countError);
            return group;
          }
        })
      );

      setGroups(groupsWithCounts);
      groupsRef.current = groupsWithCounts;
      setGroupDetails((prev) => {
        const next: Record<string, GroupDetail> = {};
        groupsWithCounts.forEach((group) => {
          next[group.id] = prev[group.id] ?? createEmptyDetail(group);
        });
        return next;
      });

      groupsWithCounts.forEach((group) => {
        void refreshGroupDetail(group.id);
      });
    };

    void loadGroups();
  }, [refreshGroupDetail, session?.user?.id, supabase]);

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
          const next = prev.map((item) => (item.id === newGroup.id ? newGroup : item));
          groupsRef.current = next;
          return next;
        }
        const next = [...prev, newGroup];
        groupsRef.current = next;
        return next;
      });

      setGroupDetails((prev) => ({
        ...prev,
        [newGroup.id]: createEmptyDetail(newGroup),
      }));

      await refreshGroupDetail(newGroup.id);

      return newGroup.id;
    },
    [refreshGroupDetail, session?.user?.id, supabase]
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
          const next = prev.map((group) => (group.id === joinedGroup.id ? joinedGroup : group));
          groupsRef.current = next;
          return next;
        }
        const next = [...prev, joinedGroup];
        groupsRef.current = next;
        return next;
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

      await refreshGroupDetail(joinedGroup.id);

      return joinedGroup.id;
    },
    [groups, refreshGroupDetail, session?.user?.id, supabase]
  );

  const addSongToGroup = useCallback(
    async (groupId: string, songId: string) => {
      const track = topSongs.find((item) => item.id === songId);
      if (!track) {
        throw new Error('선택한 곡 정보를 찾을 수 없습니다.');
      }

      const { error } = await supabase.rpc('add_track_to_group', {
        p_group_id: groupId,
        p_spotify_track_id: track.id,
        p_title: track.title,
        p_artist_name: track.artistName,
        p_album_name: track.albumName ?? null,
        p_duration_ms: null,
        p_artwork_url: track.albumCoverUrl ?? null,
        p_release_year: track.releaseYear ?? null,
      });

      if (error) {
        const message = error.message ?? '곡을 추가할 수 없습니다.';
        if (message.includes('TRACK_ALREADY_SUBMITTED')) {
          throw new Error('이미 후보 목록에 있는 곡입니다.');
        }
        if (message.includes('SUBMISSION_CLOSED')) {
          throw new Error('오늘은 곡 추가 시간이 마감되었습니다.');
        }
        if (message.includes('SUBMISSION_NOT_OPEN_YET')) {
          throw new Error('아직 곡 제출 시간이 열리지 않았습니다.');
        }
        if (message.includes('NOT_GROUP_MEMBER')) {
          throw new Error('그룹 멤버만 곡을 추가할 수 있습니다.');
        }
        if (message.includes('NOT_AUTHENTICATED')) {
          throw new Error('로그인이 필요합니다.');
        }
        throw new Error(message);
      }

      await refreshGroupDetail(groupId);
    },
    [refreshGroupDetail, supabase, topSongs]
  );

  const addSongToGroups = useCallback(
    async (songId: string, groupIds: string[]) => {
      for (const groupId of groupIds) {
        await addSongToGroup(groupId, songId);
      }
    },
    [addSongToGroup]
  );

  const voteForSong = useCallback(
    async (groupId: string, roundTrackId: string) => {
      const { error } = await supabase.rpc('vote_for_group_track', {
        p_group_round_track_id: roundTrackId,
      });

      if (error) {
        const message = error.message ?? '투표할 수 없습니다.';
        if (message.includes('ROUND_NOT_OPEN_FOR_VOTING')) {
          throw new Error('지금은 투표 시간이 아닙니다.');
        }
        if (message.includes('NOT_GROUP_MEMBER')) {
          throw new Error('그룹 멤버만 투표할 수 있습니다.');
        }
        if (message.includes('ROUND_TRACK_NOT_FOUND')) {
          throw new Error('투표할 곡 정보를 찾을 수 없습니다.');
        }
        if (message.includes('NOT_AUTHENTICATED')) {
          throw new Error('로그인이 필요합니다.');
        }
        throw new Error(message);
      }

      await refreshGroupDetail(groupId);
    },
    [refreshGroupDetail, supabase]
  );

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
      refreshGroupDetail,
      isGroupLoading,
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
      refreshGroupDetail,
      isGroupLoading,
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
