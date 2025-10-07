'use client';

import { useRouter } from 'next/navigation';
import { JoinGroup } from '@/components/JoinGroup';
import { useAppState } from '../providers/app-state-provider';

export default function JoinGroupRoute() {
  const router = useRouter();
  const { joinGroup } = useAppState();

  const handleJoinGroup = (code: string, password?: string) => {
    joinGroup(code, password);
    router.push('/my-groups');
  };

  return <JoinGroup onJoinGroup={handleJoinGroup} />;
}
