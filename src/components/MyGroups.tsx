import { Users, Calendar, Crown, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isOwner: boolean;
  lastActivity: string;
  code: string;
}

interface MyGroupsProps {
  groups: Group[];
  onSelectGroup: (groupId: string) => void;
  onCreateGroup: () => void;
}

export function MyGroups({ groups, onSelectGroup, onCreateGroup }: MyGroupsProps) {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>My Groups</h1>
          <p className="text-muted-foreground">Manage your music voting groups</p>
        </div>

        <Button onClick={onCreateGroup}>Create New Group</Button>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3>No Groups Yet</h3>
            <p className="text-muted-foreground text-center mb-6">
              Create your first group or join an existing one to start voting on music!
            </p>
            <Button onClick={onCreateGroup}>Create Your First Group</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Card key={group.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {group.name}
                    {group.isOwner && <Crown className="h-4 w-4 text-yellow-500" />}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {group.code}
                  </Badge>
                </div>
                {group.description && <p className="text-sm text-muted-foreground line-clamp-2">{group.description}</p>}
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {group.memberCount} members
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {group.lastActivity}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => onSelectGroup(group.id)} className="flex-1">
                    Open Group
                  </Button>
                  {group.isOwner && (
                    <Button variant="outline" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
