'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music, Users, UserPlus, FolderOpen, LogIn } from 'lucide-react';
import { Button } from './ui/button';

export function Navigation() {
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
          <Button variant="ghost" asChild className="flex items-center gap-2">
            <Link href="/auth">
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
