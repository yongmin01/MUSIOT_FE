'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music, Users, UserPlus, FolderOpen, LogIn, User } from 'lucide-react';
import { Button } from './ui/button';
import { signIn } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';

export function Navigation() {
  const { data: session, status } = useSession();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  useEffect(() => {
    if (session?.accessToken) {
      fetch('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.images && data.images.length > 0) {
            console.log('Spotify profile image URL:', data.images[0].url);
            setProfileImage(data.images[0].url);
          }
        })
        .catch((err) => console.error('Error fetching Spotify profile:', err));
    } else {
      console.log('No access token available');
    }
  }, [session?.accessToken]);

  const pathname = usePathname();
  const navItems = [
    { href: '/create-group', label: 'Create Group', icon: UserPlus },
    { href: '/join-group', label: 'Join Group', icon: Users },
    { href: '/my-groups', label: 'My Groups', icon: FolderOpen },
  ];

  return (
    <header className="border-b bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <Link href={'/'}>
          <div className="flex items-center gap-2">
            <Music className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-semibold">MusicVote</h1>
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
          {session && status === 'authenticated' ? (
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar>
                {profileImage && (
                  <AvatarImage
                    src={profileImage}
                    className="inline-flex h-8 w-8 select-none items-center justify-center overflow-hidden rounded-full align-middle"
                  />
                )}
                <AvatarFallback className="inline-flex h-8 w-8 select-none items-center justify-center overflow-hidden rounded-full align-middle bg-zinc-100">
                  {session.user?.name ? session.user.name[0] : <User />}
                </AvatarFallback>
              </Avatar>
            </Button>
          ) : (
            <Button variant="ghost" className="flex items-center gap-2" onClick={() => signIn('spotify')}>
              <LogIn className="h-4 w-4" />
              Login
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
