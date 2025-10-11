'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';

interface JoinGroupProps {
  onJoinGroup: (code: string, password?: string) => Promise<void>;
}

export function JoinGroup({ onJoinGroup }: JoinGroupProps) {
  const [groupCode, setGroupCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!groupCode.trim()) {
      setError('그룹 코드를 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      await onJoinGroup(groupCode.trim(), password || undefined);
      setGroupCode('');
      setPassword('');
      setShowPasswordField(false);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : '그룹에 참여할 수 없습니다.';
      setError(message);
      if (message.toLowerCase().includes('password')) {
        setShowPasswordField(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCodeCheck = () => {
    if (!groupCode.trim()) return;

    setShowPasswordField(true);
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
                <Button type="button" variant="outline" onClick={handleCodeCheck} disabled={isSubmitting}>
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
                />
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Joining...' : 'Join Group'}
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
