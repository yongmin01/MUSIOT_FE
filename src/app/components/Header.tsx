'use client';
import { Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export function Header() {
  const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const redirectToAuthCodeFlow = (clientId: string) => {
    // const verifier = generateCodeVerifier(128);
    // const challenge = await generateCodeChallenge(verifier);

    // localStorage.setItem('verifier', verifier);

    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('response_type', 'code');
    params.append('redirect_uri', 'http://127.0.0.1:3000/loginloading');
    // params.append('scope', 'user-read-private user-read-email');
    // params.append('code_challenge_method', 'S256');
    // params.append('code_challenge', challenge);

    const path = `https://accounts.spotify.com/authorize?${params.toString()}`;
    return path;
  };
  const navItems = [
    {
      path: '/create-group',
      label: 'Create Group',
    },
    {
      path: '/join-group',
      label: 'Join Group',
    },
    {
      path: '/my-groups',
      label: 'My Groups',
    },
    { path: `${redirectToAuthCodeFlow}`, label: 'Login' },
  ];
  return (
    <header className="border-b bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2">
            <Music className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-semibold">MUSIOT</h1>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-6 ml-8">
          {navItems.map((item) => (
            <Link href={item.path} key={item.path}>
              <Button variant="ghost" className="text-sm" onClick={() => redirectToAuthCodeFlow(client_id)}>
                {item.label}
              </Button>
            </Link>
          ))}

          <Avatar className="h-8 w-8">
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </nav>
      </div>
    </header>
  );
}
