import React from 'react';
import { MapPin } from 'lucide-react';

const LandPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Land Records</h1>
          <p className="text-gray-600">Manage land ownership and usage records</p>
        </div>
        <button className="btn btn-primary">
          <MapPin className="w-4 h-4 mr-2" />
          Add Land Record
        </button>
      </div>

      <div className="card p-6">
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Land Management</h3>
          <p className="text-gray-500 mb-6">
            This page will contain land registration and management features.
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Register land parcels</p>
            <p>• Map land boundaries</p>
            <p>• Track land ownership</p>
            <p>• Monitor land usage</p>
            <p>• Generate land reports</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandPage;