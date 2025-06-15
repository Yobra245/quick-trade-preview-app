
import React from 'react';
import UserProfile from '@/components/UserProfile';

const Profile = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and personal information.
        </p>
      </div>
      
      <UserProfile />
    </div>
  );
};

export default Profile;
