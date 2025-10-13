'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GroupPage } from '@/components/GroupPage';
import { Button } from '@/components/ui/button';
import { useAppState } from '../../providers/app-state-provider';
import { Loader2 } from 'lucide-react';

export default function GroupDetailRoute() {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const groupId = params.groupId;
  const {
    getGroupDetail,
    refreshGroupDetail,
    isGroupLoading,
    voteForSong,
    addSongToGroup,
    searchSongs,
  } = useAppState();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) return;
    setError(null);
    void refreshGroupDetail(groupId).catch((err) => {
      console.error(err);
      setError(err instanceof Error ? err.message : '그룹 정보를 불러오지 못했습니다.');
    });
  }, [groupId, refreshGroupDetail]);

  const group = getGroupDetail(groupId);
  const isLoading = isGroupLoading(groupId);

  const handleVote = async (roundTrackId: string) => {
    try {
      await voteForSong(groupId, roundTrackId);
    } catch (err) {
      console.error(err);
      window.alert(err instanceof Error ? err.message : '투표에 실패했습니다.');
    }
  };

  const handleAddSong = async (songId: string) => {
    try {
      await addSongToGroup(groupId, songId);
      window.alert('곡이 후보 목록에 추가되었습니다.');
    } catch (err) {
      console.error(err);
      window.alert(err instanceof Error ? err.message : '곡을 추가하지 못했습니다.');
    }
  };

  if (isLoading && !group) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center gap-4 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p>그룹 정보를 불러오는 중입니다.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-destructive">{error}</p>
        <Button variant="link" className="mt-4 px-0" onClick={() => router.push('/my-groups')}>
          Back to My Groups
        </Button>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-muted-foreground">We could not find the requested group.</p>
        <Button variant="link" className="mt-4 px-0" onClick={() => router.push('/my-groups')}>
          Back to My Groups
        </Button>
      </div>
    );
  }

  return (
    <GroupPage
      group={group}
      onVote={handleVote}
      onAddSong={handleAddSong}
      onSearchSongs={searchSongs}
      onGoBack={() => router.push('/my-groups')}
    />
  );
}
