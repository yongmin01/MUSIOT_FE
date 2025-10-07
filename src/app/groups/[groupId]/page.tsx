'use client';

import { useParams, useRouter } from 'next/navigation';
import { GroupPage } from '@/components/GroupPage';
import { Button } from '@/components/ui/button';
import { useAppState } from '../../providers/app-state-provider';

export default function GroupDetailRoute() {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const groupId = params.groupId;
  const { getGroupDetail, topSongs, voteForSong, addSongToGroup, searchSongs } = useAppState();

  const group = getGroupDetail(groupId);

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

  const handleVote = (songId: string) => {
    voteForSong(groupId, songId);
  };

  const handleAddSong = (songId: string) => {
    addSongToGroup(groupId, songId);
  };

  return (
    <GroupPage
      group={group}
      topSongs={topSongs}
      onVote={handleVote}
      onAddSong={handleAddSong}
      onSearchSongs={searchSongs}
      onGoBack={() => router.push('/my-groups')}
    />
  );
}
