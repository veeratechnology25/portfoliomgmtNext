'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { dashboardAPI } from '@/lib/api';
import {
  ChartBarIcon,
  FolderIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  budgetUsed: number;
  totalEmployees: number;
  activeEmployees: number;
  pendingTasks: number;
  totalEquipment: number;
  equipmentInUse: number;
  equipmentAvailable: number;
  equipmentMaintenance: number;
}

interface RecentActivity {
  id: string;
  type: 'project' | 'finance' | 'employee' | 'resource';
  title: string;
  description: string;
  timestamp: string;
  user: string;
}

interface Project {
  id: string;
  name: string;
  status: string;
  progress: number;
  deadline?: string;
  manager: string;
  health?: number;
  budget?: number;
  spent?: number;
  end_date?: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalBudget: 0,
    budgetUsed: 0,
    totalEmployees: 0,
    activeEmployees: 0,
    pendingTasks: 0,
    totalEquipment: 0,
    equipmentInUse: 0,
    equipmentAvailable: 0,
    equipmentMaintenance: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch actual data from API
        const [quickStats, notifications, dashboards] = await Promise.all([
          dashboardAPI.getOverview(),
          dashboardAPI.getRecentActivity(),
          dashboardAPI.getOverviewDashboards()
        ]);
        
        // Get the first available overview dashboard
        const dashboardsData = dashboards.data || dashboards; // Handle both response formats
        const dashboardArray = Array.isArray(dashboardsData) ? dashboardsData : [dashboardsData];
        const overviewDashboard = dashboardArray.find((d: any) => d.is_active);
        
        if (overviewDashboard) {
          // Fetch detailed dashboard data
          const dashboardData = await dashboardAPI.getOverviewDashboardData(overviewDashboard.id);
          const data = dashboardData.data || dashboardData; // Handle both response formats
          
          // Map backend data to frontend format
          setStats({
            totalProjects: data.portfolio_summary?.total_projects || 0,
            activeProjects: data.portfolio_summary?.active_projects || 0,
            completedProjects: data.portfolio_summary?.completed_projects || 0,
            totalBudget: data.portfolio_summary?.total_budget || 0,
            budgetUsed: data.portfolio_summary?.utilized_budget || 0,
            totalEmployees: data.resource_utilization?.total_resources || 0,
            activeEmployees: data.resource_utilization?.allocated || 0,
            pendingTasks: data.risk_heatmap?.open_issues || 0,
            totalEquipment: data.resource_utilization?.equipment?.total_equipment || 0,
            equipmentInUse: data.resource_utilization?.equipment?.in_use || 0,
            equipmentAvailable: data.resource_utilization?.equipment?.available || 0,
            equipmentMaintenance: data.resource_utilization?.equipment?.maintenance || 0,
          });
          
          // Map recent activities
          setRecentActivity(data.recent_activities?.map((activity: any) => ({
            id: activity.id,
            type: activity.type === 'project_update' ? 'project' : 
                  activity.type === 'budget_approval' ? 'finance' : 
                  activity.type === 'risk_identified' ? 'resource' : 'employee',
            title: activity.title,
            description: activity.description,
            timestamp: activity.timestamp,
            user: activity.user,
          })) || []);
          
          // Map projects (from project_portfolio)
          setProjects(data.project_portfolio?.map((project: any) => ({
            id: project.id.toString(),
            name: project.name,
            status: project.status.replace('_', ' '),
            progress: project.progress,
            deadline: project.end_date,
            manager: project.manager,
            health: project.health,
            budget: project.budget,
            spent: project.spent,
            end_date: project.end_date,
          })) || []);
        } else {
          // Fallback to quick stats if no dashboard available
          const quickStatsData = quickStats.data || quickStats;
          const notificationsData = notifications.data || notifications;
          
          setStats({
            totalProjects: quickStatsData?.total_dashboards || 0,
            activeProjects: quickStatsData?.recent_activity || 0,
            completedProjects: quickStatsData?.unread_notifications || 0,
            totalBudget: 1500000, // Default fallback
            budgetUsed: 980000,    // Default fallback
            totalEmployees: 85,    // Default fallback
            activeEmployees: 78,    // Default fallback
            pendingTasks: quickStatsData?.pending_exports || 0,
            totalEquipment: 120,   // Default fallback
            equipmentInUse: 95,    // Default fallback
            equipmentAvailable: 10, // Default fallback
            equipmentMaintenance: 15, // Default fallback
          });
          
          // Use notifications as recent activity fallback
          setRecentActivity(notificationsData?.map((notif: any) => ({
            id: notif.id,
            type: 'resource',
            title: notif.title,
            description: notif.message,
            timestamp: notif.timestamp,
            user: 'System',
          })) || []);
        }
        
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        
        // Log specific error details with proper type checking
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as any;
          console.error('Error response:', {
            status: axiosError.response?.status,
            statusText: axiosError.response?.statusText,
            data: axiosError.response?.data
          });
        } else if (error && typeof error === 'object' && 'request' in error) {
          console.error('Error request:', (error as any).request);
        } else if (error instanceof Error) {
          console.error('Error message:', error.message);
        } else {
          console.error('Unknown error:', error);
        }
        
        // Fallback to mock data if API fails
        setStats({
          totalProjects: 47,
          activeProjects: 32,
          completedProjects: 15,
          totalBudget: 1500000,
          budgetUsed: 980000,
          totalEmployees: 85,
          activeEmployees: 78,
          pendingTasks: 23,
          totalEquipment: 120,
          equipmentInUse: 95,
          equipmentAvailable: 10,
          equipmentMaintenance: 15,
        });

        setRecentActivity([
          {
            id: '1',
            type: 'project',
            title: 'New Project Created',
            description: 'Website Redesign project was created and assigned to John Doe',
            timestamp: '2024-01-15T10:30:00Z',
            user: 'Jane Smith',
          },
          {
            id: '2',
            type: 'finance',
            title: 'Budget Approved',
            description: 'Q1 Marketing budget of $50,000 was approved',
            timestamp: '2024-01-15T09:15:00Z',
            user: 'Finance Team',
          },
        ]);

        setProjects([
          {
            id: '1',
            name: 'E-commerce Platform',
            status: 'active',
            progress: 75,
            deadline: '2024-02-15',
            manager: 'John Doe',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const budgetUtilization = stats.totalBudget > 0 ? (stats.budgetUsed / stats.totalBudget) * 100 : 0;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your projects.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <FolderIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-gray-500">
                    {stats.activeProjects} active, {stats.completedProjects} completed
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{ width: `${Math.min((stats.completedProjects / stats.totalProjects) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">{((stats.completedProjects / stats.totalProjects) * 100).toFixed(1)}% completed</span>
                  {stats.totalProjects - stats.activeProjects - stats.completedProjects > 0 && (
                    <span className="text-xs text-red-500">
                      {stats.totalProjects - stats.activeProjects - stats.completedProjects} delayed
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Budget Utilization</p>
                <p className="text-2xl font-bold text-gray-900">{budgetUtilization.toFixed(1)}%</p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-gray-500">
                    {formatCurrency(stats.budgetUsed)} / {formatCurrency(stats.totalBudget)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full ${
                      budgetUtilization > 90 ? 'bg-red-500' :
                      budgetUtilization > 75 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                <UserGroupIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Active Employees</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeEmployees}</p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-gray-500">
                    {stats.activeEmployees} / {stats.totalEmployees} total
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full ${
                      (stats.activeEmployees / stats.totalEmployees) > 0.9 ? 'bg-red-500' :
                      (stats.activeEmployees / stats.totalEmployees) > 0.8 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((stats.activeEmployees / stats.totalEmployees) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingTasks}</p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-gray-500">
                    {stats.pendingTasks > 5 ? 'High priority' : 'Normal priority'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full ${
                      stats.pendingTasks > 10 ? 'bg-red-500' :
                      stats.pendingTasks > 5 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((stats.pendingTasks / 10) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">{stats.pendingTasks} open issues</span>
                  {stats.pendingTasks > 5 && (
                    <span className="text-xs text-yellow-600">Requires attention</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Projects */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Recent Projects</h2>
              <span className="text-sm text-gray-500">{projects.length} active projects</span>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-900">{project.name}</h3>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            project.status === 'active' || project.status === 'in_progress' ? 'bg-green-100 text-green-800' :
                            project.status === 'at_risk' ? 'bg-yellow-100 text-yellow-800' :
                            project.status === 'in_review' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status.replace('_', ' ')}
                          </span>
                          {project.health && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              project.health >= 80 ? 'bg-green-100 text-green-800' :
                              project.health >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {project.health}% health
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Manager: {project.manager}</p>
                        {project.budget && project.spent && (
                          <p className="text-sm text-gray-600">
                            Budget: {formatCurrency(project.spent)} / {formatCurrency(project.budget)}
                          </p>
                        )}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full ${
                            project.progress >= 75 ? 'bg-green-500' :
                            project.progress >= 50 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">{project.progress}% complete</p>
                        {project.end_date && (
                          <p className="text-xs text-gray-500">
                            Due: {new Date(project.end_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resources Overview */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Resources Overview</h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Employee Resources */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Employee Resources</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center">
                      <UserGroupIcon className="h-5 w-5 text-blue-600 mr-2" />
                      <div>
                        <p className="text-xs text-blue-600 font-medium">Active Employees</p>
                        <p className="text-lg font-bold text-blue-900">{stats.activeEmployees}</p>
                        <p className="text-xs text-blue-600">of {stats.totalEmployees} total</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                      <div>
                        <p className="text-xs text-green-600 font-medium">Available</p>
                        <p className="text-lg font-bold text-green-900">{stats.totalEmployees - stats.activeEmployees}</p>
                        <p className="text-xs text-green-600">ready for assignment</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Department Breakdown */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-700 mb-2">Department Utilization</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Engineering</span>
                      <span className="text-xs text-gray-500">22/25 (88%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div className="bg-blue-500 h-1 rounded-full" style={{ width: '88%' }} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Design</span>
                      <span className="text-xs text-gray-500">12/15 (80%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div className="bg-purple-500 h-1 rounded-full" style={{ width: '80%' }} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Sales</span>
                      <span className="text-xs text-gray-500">16/18 (89%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div className="bg-green-500 h-1 rounded-full" style={{ width: '89%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Resources */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Skills Distribution</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-indigo-50 rounded-lg p-2">
                    <p className="text-xs text-indigo-600 font-medium">Development</p>
                    <p className="text-sm font-bold text-indigo-900">28/30</p>
                    <p className="text-xs text-indigo-600">93% utilized</p>
                  </div>
                  <div className="bg-pink-50 rounded-lg p-2">
                    <p className="text-xs text-pink-600 font-medium">Design</p>
                    <p className="text-sm font-bold text-pink-900">16/20</p>
                    <p className="text-xs text-pink-600">80% utilized</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-2">
                    <p className="text-xs text-yellow-600 font-medium">Project Mgmt</p>
                    <p className="text-sm font-bold text-yellow-900">12/15</p>
                    <p className="text-xs text-yellow-600">80% utilized</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-2">
                    <p className="text-xs text-orange-600 font-medium">Analytics</p>
                    <p className="text-sm font-bold text-orange-900">10/12</p>
                    <p className="text-xs text-orange-600">83% utilized</p>
                  </div>
                </div>
              </div>

              {/* Equipment Resources */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Equipment Resources</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="flex items-center">
                      <FolderIcon className="h-5 w-5 text-purple-600 mr-2" />
                      <div>
                        <p className="text-xs text-purple-600 font-medium">Equipment in Use</p>
                        <p className="text-lg font-bold text-purple-900">{stats.equipmentInUse}</p>
                        <p className="text-xs text-purple-600">of {stats.totalEquipment} total</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3">
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 text-yellow-600 mr-2" />
                      <div>
                        <p className="text-xs text-yellow-600 font-medium">Maintenance</p>
                        <p className="text-lg font-bold text-yellow-900">{stats.equipmentMaintenance}</p>
                        <p className="text-xs text-yellow-600">under maintenance</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Equipment Categories */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-700 mb-2">Equipment Categories</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Computers</span>
                      <span className="text-gray-500">40/45</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vehicles</span>
                      <span className="text-gray-500">20/25</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Machinery</span>
                      <span className="text-gray-500">22/30</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tools</span>
                      <span className="text-gray-500">13/20</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 rounded-full p-2 ${
                      activity.type === 'project' ? 'bg-blue-100' :
                      activity.type === 'finance' ? 'bg-green-100' :
                      activity.type === 'employee' ? 'bg-purple-100' :
                      'bg-gray-100'
                    }`}>
                      {activity.type === 'project' && <FolderIcon className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'finance' && <CurrencyDollarIcon className="h-4 w-4 text-green-600" />}
                      {activity.type === 'employee' && <UserGroupIcon className="h-4 w-4 text-purple-600" />}
                      {activity.type === 'resource' && <ChartBarIcon className="h-4 w-4 text-gray-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.user} • {formatRelativeTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Budget Overview */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Budget Overview</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalBudget)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Budget Used</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.budgetUsed)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Remaining</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalBudget - stats.budgetUsed)}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full"
                  style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">{budgetUtilization.toFixed(1)}% of budget utilized</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  </ProtectedRoute>
  );
}
