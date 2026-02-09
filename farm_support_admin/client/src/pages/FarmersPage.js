import React from 'react';
import { Users } from 'lucide-react';

const FarmersPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Farmers</h1>
          <p className="text-gray-600">Manage farmer registrations and profiles</p>
        </div>
        <button className="btn btn-primary">
          <Users className="w-4 h-4 mr-2" />
          Add Farmer
        </button>
      </div>

      <div className="card p-6">
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Farmers Management</h3>
          <p className="text-gray-500 mb-6">
            This page will contain farmer registration, verification, and management features.
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• View all registered farmers</p>
            <p>• Add new farmer profiles</p>
            <p>• Verify farmer information</p>
            <p>• Manage farmer status</p>
            <p>• View farmer statistics</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmersPage;