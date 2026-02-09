import React from 'react';
import { Activity } from 'lucide-react';

const ActivitiesPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Farm Activities</h1>
          <p className="text-gray-600">Track and manage farming activities</p>
        </div>
        <button className="btn btn-primary">
          <Activity className="w-4 h-4 mr-2" />
          Record Activity
        </button>
      </div>

      <div className="card p-6">
        <div className="text-center py-12">
          <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Activity Tracking</h3>
          <p className="text-gray-500 mb-6">
            This page will contain farming activity tracking and management features.
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Record farming activities</p>
            <p>• Track crop planting and harvesting</p>
            <p>• Monitor livestock care</p>
            <p>• Log equipment maintenance</p>
            <p>• Generate activity reports</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitiesPage;