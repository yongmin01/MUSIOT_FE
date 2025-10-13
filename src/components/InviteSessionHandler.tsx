'use client';

import { useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const InviteSessionHandler = () => {
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const hash = window.location.hash.substring(1);
    if (!hash) return;

    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (accessToken && refreshToken) {
      void supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(({ error }) => {
        if (!error) {
          window.location.hash = '';
          // 필요하면 router.push('/groups') 등으로 이동
        } else {
          console.error('Failed to set session from invite link', error);
        }
      });
    }
  }, [supabase]);

  return null;
};

export default InviteSessionHandler;
