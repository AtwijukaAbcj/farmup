import React from 'react';
import { DollarSign } from 'lucide-react';

const LoansPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loans</h1>
          <p className="text-gray-600">Manage loan applications and disbursements</p>
        </div>
        <button className="btn btn-primary">
          <DollarSign className="w-4 h-4 mr-2" />
          New Loan
        </button>
      </div>

      <div className="card p-6">
        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loan Management</h3>
          <p className="text-gray-500 mb-6">
            This page will contain loan application processing and management features.
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Review loan applications</p>
            <p>• Approve or reject loans</p>
            <p>• Disburse approved loans</p>
            <p>• Track loan repayments</p>
            <p>• Generate loan reports</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoansPage;