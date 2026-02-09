import React from 'react';
import { UserPlus } from 'lucide-react';

const UsersPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage system users and permissions</p>
        </div>
        <button className="btn btn-primary">
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </button>
      </div>

      <div className="card p-6">
        <div className="text-center py-12">
          <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
          <p className="text-gray-500 mb-6">
            This page will contain user management and permission features.
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Manage admin users</p>
            <p>• Create field officer accounts</p>
            <p>• Set user permissions</p>
            <p>• Monitor user activity</p>
            <p>• Deactivate/activate users</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;