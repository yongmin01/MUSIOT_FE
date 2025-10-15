'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music, Users, UserPlus, FolderOpen, LogIn, User } from 'lucide-react';
import { Button } from './ui/button';
import { useEffect, useMemo, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { useSessionContext, useSupabaseClient } from '@supabase/auth-helpers-react';

export function Navigation() {
  const { session, isLoading } = useSessionContext();
  const supabase = useSupabaseClient();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const token = session?.provider_token;

    if (!token) {
      setProfileImage(null);
      return;
    }

    fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data?.images) && data.images.length > 0) {
          setProfileImage(data.images[0]?.url ?? null);
        } else {
          setProfileImage(null);
        }
      })
      .catch((err) => console.error('Error fetching Spotify profile:', err));
  }, [session?.provider_token]);

  const pathname = usePathname();
  const navItems = [
    { href: '/create-group', label: 'Create Group', icon: UserPlus },
    { href: '/join-group', label: 'Join Group', icon: Users },
    { href: '/my-groups', label: 'My Groups', icon: FolderOpen },
  ];

  const displayNameInitial = useMemo(() => {
    const fallback = session?.user?.user_metadata?.full_name ?? session?.user?.email ?? '';
    return fallback ? (fallback[0]?.toUpperCase() ?? '') : '';
  }, [session?.user?.email, session?.user?.user_metadata?.full_name]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'spotify',
      options: {
        scopes: 'user-top-read',
      },
    });
  };

  return (
    <header className="border-b bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <Link href={'/'}>
          <div className="flex items-center gap-2">
            <Music className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-semibold">MUSIOT</h1>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === '/my-groups'
                ? pathname === href || pathname.startsWith('/groups')
                : pathname === href || (href !== '/' && pathname.startsWith(href));

            return (
              <Button key={href} variant={isActive ? 'default' : 'ghost'} asChild className="flex items-center gap-2">
                <Link href={href}>
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              </Button>
            );
          })}
          {session ? (
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={async () => {
                await supabase.auth.signOut();
                setProfileImage(null);
              }}
            >
              <Avatar>
                {profileImage && (
                  <AvatarImage
                    src={profileImage}
                    className="inline-flex h-8 w-8 select-none items-center justify-center overflow-hidden rounded-full align-middle"
                  />
                )}
                <AvatarFallback className="inline-flex h-8 w-8 select-none items-center justify-center overflow-hidden rounded-full align-middle bg-zinc-100">
                  {displayNameInitial || <User />}
                </AvatarFallback>
              </Avatar>
            </Button>
          ) : (
            <Button variant="ghost" className="flex items-center gap-2" disabled={isLoading} onClick={handleLogin}>
              <LogIn className="h-4 w-4" />
              Login
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
