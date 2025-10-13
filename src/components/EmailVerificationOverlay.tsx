'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const PROVIDER_EMAIL_ERROR = 'provider_email_needs_verification';

const hasErrorInHash = (hash: string | null) => {
  if (!hash) return false;
  const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
  return (
    params.get('error') === PROVIDER_EMAIL_ERROR || params.get('error_code') === PROVIDER_EMAIL_ERROR
  );
};

export function EmailVerificationOverlay() {
  const searchParams = useSearchParams();
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const queryHasError =
      searchParams.get('error') === PROVIDER_EMAIL_ERROR ||
      searchParams.get('error_code') === PROVIDER_EMAIL_ERROR;
    const hashHasError = hasErrorInHash(
      typeof window !== 'undefined' ? window.location.hash : null
    );

    setShowOverlay(queryHasError || hashHasError);
  }, [searchParams]);

  if (!showOverlay) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur">
      <div className="flex max-w-sm flex-col items-center gap-4 rounded-lg border bg-card p-6 text-center shadow-lg">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/60">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
        <div>
          <p className="text-lg font-semibold">이메일 확인 중입니다</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Spotify 계정 이메일로 전송된 확인 링크를 열어 주세요. 인증이 끝나면 창을 닫고 다시 로그인할 수 있습니다.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          이메일을 찾기 어려우면 스팸함을 확인하거나 조금 뒤에 다시 시도해 주세요.
        </p>
      </div>
    </div>
  );
}
