'use client';

import { useRouter } from 'next/navigation';
import { CreateGroup } from '@/components/CreateGroup';
import { useAppState } from '../providers/app-state-provider';

export default function CreateGroupRoute() {
  const router = useRouter();
  const { createGroup } = useAppState();

  const handleCreateGroup = async (data: Parameters<typeof createGroup>[0]) => {
    await createGroup(data);
    router.push('/my-groups');
  };

  return <CreateGroup onCreateGroup={handleCreateGroup} />;
}
