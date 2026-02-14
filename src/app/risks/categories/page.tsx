'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { risksAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  FolderIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  UserIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface RiskCategory {
  id: string;
  name: string;
  description: string;
  code: string;
  parent_category?: string;
  status: string;
  risk_count: number;
  color_code: string;
  icon?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_used?: string;
  hierarchy_level: number;
  subcategories?: RiskCategory[];
}

export default function RiskCategoriesPage() {
  const [categories, setCategories] = useState<RiskCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [hierarchyFilter, setHierarchyFilter] = useState('all');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log('Fetching risk categories...');
      const response = await risksAPI.getRiskCategories();
      console.log('API Response:', response);
      setCategories(response.data.results || response.data);
    } catch (error: any) {
      console.error('Failed to fetch risk categories:', error);
      console.error('Error details:', error.response?.status, error.response?.data);
      
      if (error.response?.status === 404) {
        toast.error('API endpoint not found. Please ensure the Django backend server is running on port 8000.');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please check the backend logs.');
      } else {
        toast.error('Failed to load risk categories - using demo data');
      }
      
      // Fallback to mock data if API fails
      console.log('Using fallback mock data...');
      const mockCategories: RiskCategory[] = [
        {
          id: '1',
          name: 'Security',
          description: 'Risks related to information security, data protection, and cybersecurity',
          code: 'SEC',
          status: 'active',
          risk_count: 12,
          color_code: '#EF4444',
          icon: 'shield',
          created_by: 'John Smith',
          created_at: '2024-11-01T10:00:00Z',
          updated_at: '2024-12-15T14:30:00Z',
          last_used: '2024-12-20T09:15:00Z',
          hierarchy_level: 1,
          subcategories: [
            {
              id: '11',
              name: 'Cybersecurity',
              description: 'Digital security risks and threats',
              code: 'SEC-CYB',
              parent_category: 'Security',
              status: 'active',
              risk_count: 8,
              color_code: '#DC2626',
              icon: 'lock',
              created_by: 'John Smith',
              created_at: '2024-11-01T10:00:00Z',
              updated_at: '2024-12-15T14:30:00Z',
              hierarchy_level: 2,
            },
            {
              id: '12',
              name: 'Physical Security',
              description: 'Physical access and asset protection',
              code: 'SEC-PHY',
              parent_category: 'Security',
              status: 'active',
              risk_count: 4,
              color_code: '#F87171',
              icon: 'building',
              created_by: 'John Smith',
              created_at: '2024-11-01T10:00:00Z',
              updated_at: '2024-12-15T14:30:00Z',
              hierarchy_level: 2,
            },
          ],
        },
        {
          id: '2',
          name: 'Financial',
          description: 'Financial risks including budget, revenue, and cost-related concerns',
          code: 'FIN',
          status: 'active',
          risk_count: 15,
          color_code: '#F59E0B',
          icon: 'currency-dollar',
          created_by: 'Sarah Johnson',
          created_at: '2024-11-02T11:30:00Z',
          updated_at: '2024-12-18T10:15:00Z',
          last_used: '2024-12-19T16:45:00Z',
          hierarchy_level: 1,
          subcategories: [
            {
              id: '21',
              name: 'Budget Risks',
              description: 'Budget allocation and overspending risks',
              code: 'FIN-BUD',
              parent_category: 'Financial',
              status: 'active',
              risk_count: 7,
              color_code: '#D97706',
              icon: 'calculator',
              created_by: 'Sarah Johnson',
              created_at: '2024-11-02T11:30:00Z',
              updated_at: '2024-12-18T10:15:00Z',
              hierarchy_level: 2,
            },
            {
              id: '22',
              name: 'Revenue Risks',
              description: 'Revenue generation and cash flow risks',
              code: 'FIN-REV',
              parent_category: 'Financial',
              status: 'active',
              risk_count: 8,
              color_code: '#F59E0B',
              icon: 'chart-line',
              created_by: 'Sarah Johnson',
              created_at: '2024-11-02T11:30:00Z',
              updated_at: '2024-12-18T10:15:00Z',
              hierarchy_level: 2,
            },
          ],
        },
        {
          id: '3',
          name: 'Operational',
          description: 'Operational risks related to business processes and procedures',
          code: 'OPR',
          status: 'active',
          risk_count: 18,
          color_code: '#3B82F6',
          icon: 'cog',
          created_by: 'Mike Davis',
          created_at: '2024-11-03T09:45:00Z',
          updated_at: '2024-12-17T13:20:00Z',
          last_used: '2024-12-20T11:30:00Z',
          hierarchy_level: 1,
        },
        {
          id: '4',
          name: 'Compliance',
          description: 'Regulatory compliance and legal risks',
          code: 'COM',
          status: 'active',
          risk_count: 8,
          color_code: '#8B5CF6',
          icon: 'gavel',
          created_by: 'David Wilson',
          created_at: '2024-11-04T14:20:00Z',
          updated_at: '2024-12-16T15:45:00Z',
          last_used: '2024-12-17T09:00:00Z',
          hierarchy_level: 1,
        },
        {
          id: '5',
          name: 'Strategic',
          description: 'Strategic risks affecting business objectives and market position',
          code: 'STR',
          status: 'active',
          risk_count: 6,
          color_code: '#10B981',
          icon: 'target',
          created_by: 'Emily Chen',
          created_at: '2024-11-05T16:10:00Z',
          updated_at: '2024-12-14T12:30:00Z',
          last_used: '2024-12-18T14:15:00Z',
          hierarchy_level: 1,
        },
        {
          id: '6',
          name: 'Technology',
          description: 'Technology and IT infrastructure risks',
          code: 'TECH',
          status: 'active',
          risk_count: 10,
          color_code: '#06B6D4',
          icon: 'chip',
          created_by: 'Tom Brown',
          created_at: '2024-11-06T10:30:00Z',
          updated_at: '2024-12-19T11:00:00Z',
          last_used: '2024-12-20T13:45:00Z',
          hierarchy_level: 1,
        },
        {
          id: '7',
          name: 'Human Resources',
          description: 'HR-related risks including staffing and personnel issues',
          code: 'HR',
          status: 'active',
          risk_count: 9,
          color_code: '#EC4899',
          icon: 'users',
          created_by: 'Lisa Anderson',
          created_at: '2024-11-07T13:45:00Z',
          updated_at: '2024-12-15T16:20:00Z',
          last_used: '2024-12-19T10:30:00Z',
          hierarchy_level: 1,
        },
        {
          id: '8',
          name: 'Environmental',
          description: 'Environmental and sustainability risks',
          code: 'ENV',
          status: 'inactive',
          risk_count: 2,
          color_code: '#84CC16',
          icon: 'leaf',
          created_by: 'Rachel Green',
          created_at: '2024-11-08T11:15:00Z',
          updated_at: '2024-12-10T09:30:00Z',
          last_used: '2024-11-25T14:45:00Z',
          hierarchy_level: 1,
        },
      ];

      setCategories(mockCategories);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      console.log('Deleting category:', id);
      await risksAPI.deleteRiskCategory(id);
      toast.success('Risk category deleted successfully');
      fetchCategories();
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      toast.error('Failed to delete category');
    }
  };

  const filteredCategories = categories.filter((category) => {
    const matchesSearch = 
      category.name.toLowerCase().includes(search.toLowerCase()) ||
      category.description.toLowerCase().includes(search.toLowerCase()) ||
      category.code.toLowerCase().includes(search.toLowerCase()) ||
      category.created_by.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || category.status === statusFilter;
    const matchesHierarchy = hierarchyFilter === 'all' || category.hierarchy_level.toString() === hierarchyFilter;

    return matchesSearch && matchesStatus && matchesHierarchy;
  });

  const activeCount = categories.filter(c => c.status === 'active').length;
  const inactiveCount = categories.filter(c => c.status === 'inactive').length;
  const totalRisks = categories.reduce((sum, c) => sum + c.risk_count, 0);
  const topLevelCategories = categories.filter(c => c.hierarchy_level === 1).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="h-4 w-4" />;
      case 'inactive': return <ClockIcon className="h-4 w-4" />;
      case 'archived': return <XCircleIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getHierarchyLabel = (level: number) => {
    switch (level) {
      case 1: return 'Top Level';
      case 2: return 'Subcategory';
      case 3: return 'Sub-subcategory';
      default: return `Level ${level}`;
    }
  };

  const getHierarchyColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-purple-100 text-purple-800';
      case 2: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Risk Categories</h1>
              <p className="text-gray-600">Manage risk categorization and classification system</p>
            </div>
            <div className="flex space-x-2">
              <Link href="/risks/categories/hierarchy">
                <Button variant="outline" className="flex items-center">
                  <FolderIcon className="h-4 w-4 mr-2" />
                  View Hierarchy
                </Button>
              </Link>
              <Link href="/risks/categories/create">
                <Button className="flex items-center">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Category
                </Button>
              </Link>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <FolderIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Categories</p>
                  <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                  <ExclamationTriangleIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Top Level</p>
                  <p className="text-2xl font-bold text-gray-900">{topLevelCategories}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-orange-100 rounded-lg p-3">
                  <DocumentTextIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Risks</p>
                  <p className="text-2xl font-bold text-gray-900">{totalRisks}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Categories
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search by name, description, or code..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hierarchy Level
                </label>
                <select
                  value={hierarchyFilter}
                  onChange={(e) => setHierarchyFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Levels</option>
                  <option value="1">Top Level</option>
                  <option value="2">Subcategories</option>
                  <option value="3">Sub-subcategories</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Actions
                </label>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={fetchCategories}>
                    <ClockIcon className="h-4 w-4" />
                  </Button>
                  <Link href="/risks/categories/export">
                    <Button variant="outline" size="sm">
                      Export
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Categories List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {filteredCategories.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredCategories.map((category) => (
                  <div key={category.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div 
                            className="flex-shrink-0 rounded-lg p-2"
                            style={{ backgroundColor: category.color_code + '20' }}
                          >
                            <FolderIcon 
                              className="h-6 w-6" 
                              style={{ color: category.color_code }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                              <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(category.status)}`}>
                                <span className="flex items-center">
                                  {getStatusIcon(category.status)}
                                  <span className="ml-1">{category.status}</span>
                                </span>
                              </span>
                              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getHierarchyColor(category.hierarchy_level)}`}>
                                {getHierarchyLabel(category.hierarchy_level)}
                              </span>
                              <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                {category.code}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <UserIcon className="h-4 w-4 mr-1" />
                                {category.created_by}
                              </span>
                              <span className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {formatDate(category.created_at)}
                              </span>
                              <span className="flex items-center">
                                <DocumentTextIcon className="h-4 w-4 mr-1" />
                                {category.risk_count} risks
                              </span>
                              {category.last_used && (
                                <span className="flex items-center">
                                  <ClockIcon className="h-4 w-4 mr-1" />
                                  Last used: {formatDate(category.last_used)}
                                </span>
                              )}
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                              <p>{category.description}</p>
                            </div>
                            {category.parent_category && (
                              <div className="mt-2 text-sm text-gray-500">
                                <span className="font-medium">Parent:</span> {category.parent_category}
                              </div>
                            )}
                            {category.subcategories && category.subcategories.length > 0 && (
                              <div className="mt-2">
                                <span className="text-sm font-medium text-gray-700">Subcategories:</span>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {category.subcategories.map((sub) => (
                                    <span key={sub.id} className="inline-flex px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
                                      {sub.name} ({sub.risk_count})
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-500 mb-2">
                            {category.risk_count} risks assigned
                          </div>
                          <div className="flex items-center space-x-2">
                            <Link href={`/risks/categories/${category.id}`}>
                              <Button variant="outline" size="sm">View</Button>
                            </Link>
                            <Link href={`/risks/categories/${category.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No risk categories found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {search || statusFilter !== 'all' || hierarchyFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Get started by creating a new risk category'
                  }
                </p>
                {!search && statusFilter === 'all' && hierarchyFilter === 'all' && (
                  <div className="mt-6">
                    <Link href="/risks/categories/create">
                      <Button>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        New Category
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
