'use client';

import { useRouter } from 'next/navigation';
import { MyGroups } from '@/components/MyGroups';
import { useAppState } from '../providers/app-state-provider';

export default function MyGroupsRoute() {
  const router = useRouter();
  const { groups } = useAppState();

  const handleSelectGroup = (groupId: string) => {
    router.push(`/groups/${groupId}`);
  };

  const handleCreateGroup = () => {
    router.push('/create-group');
  };

  return <MyGroups groups={groups} onSelectGroup={handleSelectGroup} onCreateGroup={handleCreateGroup} />;
}
