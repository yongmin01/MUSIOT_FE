import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';

interface JoinGroupProps {
  onJoinGroup: (code: string, password?: string) => void;
}

export function JoinGroup({ onJoinGroup }: JoinGroupProps) {
  const [groupCode, setGroupCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupCode.trim()) return;

    onJoinGroup(groupCode, password || undefined);
  };

  const handleCodeCheck = () => {
    if (!groupCode.trim()) return;

    // Simulate checking if group requires password
    // In real app, this would be an API call
    const requiresPassword = groupCode.toLowerCase().includes('private');
    setShowPasswordField(requiresPassword);

    if (!requiresPassword) {
      onJoinGroup(groupCode);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-8">
        <h1>Join Group</h1>
        <p className="text-muted-foreground">Enter a group code or link to join an existing music voting group</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Group Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Group Code or Link</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  placeholder="Enter group code (e.g., ABC123)"
                  value={groupCode}
                  onChange={(e) => setGroupCode(e.target.value)}
                  required
                />
                <Button type="button" variant="outline" onClick={handleCodeCheck}>
                  Check
                </Button>
              </div>
            </div>

            {showPasswordField && (
              <div className="space-y-2">
                <Label htmlFor="password">Group Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter group password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full">
              Join Group
            </Button>
          </form>

          <Separator />

          <div className="text-center">
            <h3 className="font-medium mb-2">How to find group codes:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Ask the group creator to share the code</li>
              <li>• Look for invitation links shared with you</li>
              <li>• Check group invitations in messages</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
