import React from 'react';
import { useQuery } from 'react-query';
import { dashboardAPI } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { 
  Users, 
  DollarSign, 
  Activity, 
  MapPin, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const DashboardPage = () => {
  const { data: overview, isLoading: overviewLoading } = useQuery(
    'dashboard-overview',
    dashboardAPI.getOverview,
    { refetchInterval: 30000 } // Refetch every 30 seconds
  );

  const { data: recentActivities, isLoading: activitiesLoading } = useQuery(
    'recent-activities',
    () => dashboardAPI.getRecentActivities(10)
  );

  const { data: alerts } = useQuery(
    'dashboard-alerts',
    dashboardAPI.getAlerts
  );

  if (overviewLoading) {
    return <LoadingSpinner size="xl" className="h-64" />;
  }

  const stats = overview?.data || {};
  const activities = recentActivities?.data?.activities || [];
  const systemAlerts = alerts?.data?.alerts || [];

  // Stats cards data
  const statCards = [
    {
      title: 'Total Farmers',
      value: stats.overview?.totalFarmers || 0,
      change: `+${stats.recent?.newFarmers || 0} this month`,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Loans',
      value: stats.overview?.totalLoans || 0,
      change: `₵${(stats.financial?.totalDisbursed || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Activities',
      value: stats.overview?.totalActivities || 0,
      change: `${stats.overview?.completedActivities || 0} completed`,
      icon: Activity,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Land Records',
      value: stats.overview?.totalLandRecords || 0,
      change: `${stats.overview?.activeFarmers || 0} active farmers`,
      icon: MapPin,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
    },
  ];

  // Sample data for charts (you can replace with real API data)
  const monthlyData = [
    { month: 'Jan', farmers: 45, loans: 23, activities: 89 },
    { month: 'Feb', farmers: 52, loans: 31, activities: 67 },
    { month: 'Mar', farmers: 48, loans: 28, activities: 93 },
    { month: 'Apr', farmers: 61, loans: 42, activities: 81 },
    { month: 'May', farmers: 55, loans: 38, activities: 105 },
    { month: 'Jun', farmers: 67, loans: 45, activities: 98 },
  ];

  const loanStatusData = stats.loanStatusDistribution?.map(item => ({ 
    name: item._id, 
    value: item.count,
    amount: item.totalAmount 
  })) || [];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'farmer_registration':
        return <Users className="w-4 h-4" />;
      case 'loan_application':
        return <DollarSign className="w-4 h-4" />;
      case 'farming_activity':
        return <Activity className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your farm support system.</p>
      </div>

      {/* Alerts */}
      {systemAlerts.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {systemAlerts.map((alert, index) => (
            <div key={index} className={`card p-4 border-l-4 ${
              alert.type === 'error' ? 'border-red-500 bg-red-50' :
              alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
              'border-blue-500 bg-blue-50'
            }`}>
              <div className="flex items-center">
                {getAlertIcon(alert.type)}
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">{alert.title}</h3>
                  <p className="text-sm text-gray-600">{alert.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{stat.change}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Trends */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="farmers" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="loans" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="activities" stroke="#F59E0B" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Loan Status Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={loanStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {loanStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
            {activitiesLoading ? (
              <LoadingSpinner size="md" className="h-32" />
            ) : (
              <div className="space-y-4">
                {activities.slice(0, 8).map((activity, index) => (
                  <div key={index} className="flex items-center py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-500">{activity.subtitle}</p>
                    </div>
                    <div className="flex-shrink-0 text-xs text-gray-400">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Farmers</span>
                <span className="text-sm font-semibold text-green-600">
                  {stats.overview?.activeFarmers || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Loans</span>
                <span className="text-sm font-semibold text-yellow-600">
                  {stats.overview?.pendingLoans || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Disbursed</span>
                <span className="text-sm font-semibold text-blue-600">
                  ₵{(stats.financial?.totalDisbursed || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Outstanding</span>
                <span className="text-sm font-semibold text-red-600">
                  ₵{(stats.financial?.outstandingAmount || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Regions</h3>
            <div className="space-y-3">
              {stats.topRegions?.map((region, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{region._id || 'Unknown'}</span>
                  <span className="text-sm font-semibold text-gray-900">{region.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;