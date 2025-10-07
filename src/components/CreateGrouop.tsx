'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';

interface CreateGroupProps {
  onCreateGroup: (groupData: { name: string; description: string; hasPassword: boolean; password?: string }) => void;
}

export function CreateGroup({ onCreateGroup }: CreateGroupProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    hasPassword: false,
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onCreateGroup({
      name: formData.name,
      description: formData.description,
      hasPassword: formData.hasPassword,
      password: formData.hasPassword ? formData.password : undefined,
    });

    // Reset form
    setFormData({
      name: '',
      description: '',
      hasPassword: false,
      password: '',
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-8">
        <h1>Create New Group</h1>
        <p className="text-muted-foreground">Create a music voting group for you and your friends</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Group Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                placeholder="Enter group name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your music group (optional)"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Password Protection</Label>
                <p className="text-sm text-muted-foreground">Require a password to join this group</p>
              </div>
              <Switch
                checked={formData.hasPassword}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, hasPassword: checked, password: checked ? prev.password : '' }))
                }
              />
            </div>

            {formData.hasPassword && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter group password"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  required={formData.hasPassword}
                />
              </div>
            )}

            <Button type="submit" className="w-full">
              Create Group
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
