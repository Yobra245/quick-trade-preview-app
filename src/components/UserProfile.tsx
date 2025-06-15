
import React, { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

const UserProfile = () => {
  const { user, signOut } = useAuth();
  const { profile, tradingProfile, loading, updateProfile, updateTradingProfile } = useProfile();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    preferred_exchange: 'binance',
    risk_tolerance: 'medium',
    max_position_size: 1000,
    auto_trading_enabled: false
  });

  React.useEffect(() => {
    if (profile && tradingProfile) {
      setFormData({
        username: profile.username || '',
        full_name: profile.full_name || '',
        preferred_exchange: tradingProfile.preferred_exchange,
        risk_tolerance: tradingProfile.risk_tolerance,
        max_position_size: tradingProfile.max_position_size,
        auto_trading_enabled: tradingProfile.auto_trading_enabled
      });
    }
  }, [profile, tradingProfile]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  const handleSave = async () => {
    const profileUpdate = await updateProfile({
      username: formData.username,
      full_name: formData.full_name,
      updated_at: new Date().toISOString()
    });

    const tradingUpdate = await updateTradingProfile({
      preferred_exchange: formData.preferred_exchange,
      risk_tolerance: formData.risk_tolerance,
      max_position_size: formData.max_position_size,
      auto_trading_enabled: formData.auto_trading_enabled,
      updated_at: new Date().toISOString()
    });

    if (profileUpdate.success && tradingUpdate.success) {
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      setEditing(false);
    } else {
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Manage your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={!editing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                disabled={!editing}
              />
            </div>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <Button onClick={handleSave}>Save Changes</Button>
                  <Button variant="outline" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setEditing(true)}>Edit Profile</Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trading Settings</CardTitle>
            <CardDescription>Configure your trading preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Preferred Exchange</Label>
              <Select
                value={formData.preferred_exchange}
                onValueChange={(value) => setFormData({ ...formData, preferred_exchange: value })}
                disabled={!editing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="binance">Binance</SelectItem>
                  <SelectItem value="coinbase">Coinbase</SelectItem>
                  <SelectItem value="kraken">Kraken</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Risk Tolerance</Label>
              <Select
                value={formData.risk_tolerance}
                onValueChange={(value) => setFormData({ ...formData, risk_tolerance: value })}
                disabled={!editing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_position_size">Max Position Size ($)</Label>
              <Input
                id="max_position_size"
                type="number"
                value={formData.max_position_size}
                onChange={(e) => setFormData({ ...formData, max_position_size: parseFloat(e.target.value) })}
                disabled={!editing}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="auto_trading"
                checked={formData.auto_trading_enabled}
                onCheckedChange={(checked) => setFormData({ ...formData, auto_trading_enabled: checked })}
                disabled={!editing}
              />
              <Label htmlFor="auto_trading">Enable Auto Trading</Label>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={signOut} variant="destructive">
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
