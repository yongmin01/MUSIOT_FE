import { Music, Home, Users, UserPlus, FolderOpen } from 'lucide-react';
import { Button } from './ui/button';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'create-group', label: 'Create Group', icon: UserPlus },
    { id: 'join-group', label: 'Join Group', icon: Users },
    { id: 'my-groups', label: 'My Groups', icon: FolderOpen },
  ];

  return (
    <header className="border-b bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-semibold">MusicVote</h1>
        </div>

        <nav className="flex items-center gap-2">
          {navItems.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={currentPage === id ? 'default' : 'ghost'}
              onClick={() => onPageChange(id)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}
