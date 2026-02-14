'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { risksAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  ChartBarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  FireIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface RiskMatrix {
  id: string;
  name: string;
  description: string;
  matrix_type: string;
  impact_levels: string[];
  probability_levels: string[];
  risk_scoring_method: string;
  threshold_values: Record<string, number>;
  color_scheme: Record<string, string>;
  is_default: boolean;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_used?: string;
  risk_count: number;
  department?: string;
  organization: string;
}

interface MatrixCell {
  impact: string;
  probability: string;
  score: number;
  color: string;
  label: string;
  risk_count?: number;
}

export default function RiskMatricesPage() {
  const [matrices, setMatrices] = useState<RiskMatrix[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedMatrix, setSelectedMatrix] = useState<RiskMatrix | null>(null);

  useEffect(() => {
    fetchMatrices();
  }, []);

  const fetchMatrices = async () => {
    try {
      setLoading(true);
      console.log('Fetching risk matrices...');
      const response = await risksAPI.getRiskMatrices();
      console.log('API Response:', response);
      setMatrices(response.data.results || response.data);
    } catch (error: any) {
      console.error('Failed to fetch risk matrices:', error);
      console.error('Error details:', error.response?.status, error.response?.data);
      
      if (error.response?.status === 404) {
        toast.error('API endpoint not found. Please ensure the Django backend server is running on port 8000.');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please check the backend logs.');
      } else {
        toast.error('Failed to load risk matrices - using demo data');
      }
      
      // Fallback to mock data if API fails
      console.log('Using fallback mock data...');
      const mockMatrices: RiskMatrix[] = [
        {
          id: '1',
          name: 'Standard Risk Matrix',
          description: 'Standard 5x5 risk matrix with impact and probability levels',
          matrix_type: '5x5',
          impact_levels: ['Very Low', 'Low', 'Medium', 'High', 'Very High'],
          probability_levels: ['Very Low', 'Low', 'Medium', 'High', 'Very High'],
          risk_scoring_method: 'multiplication',
          threshold_values: {
            'low': 5,
            'medium': 10,
            'high': 15,
            'critical': 20,
          },
          color_scheme: {
            'low': '#10B981',
            'medium': '#F59E0B',
            'high': '#F97316',
            'critical': '#EF4444',
          },
          is_default: true,
          is_active: true,
          created_by: 'John Smith',
          created_at: '2024-11-01T10:00:00Z',
          updated_at: '2024-12-15T14:30:00Z',
          last_used: '2024-12-20T09:15:00Z',
          risk_count: 45,
          organization: 'Jaffer Business Systems',
        },
        {
          id: '2',
          name: 'Financial Risk Matrix',
          description: 'Specialized matrix for financial risk assessment with monetary impact levels',
          matrix_type: '4x4',
          impact_levels: ['<$1K', '$1K-$10K', '$10K-$100K', '>$100K'],
          probability_levels: ['Rare', 'Unlikely', 'Possible', 'Likely'],
          risk_scoring_method: 'multiplication',
          threshold_values: {
            'low': 3,
            'medium': 8,
            'high': 12,
            'critical': 16,
          },
          color_scheme: {
            'low': '#10B981',
            'medium': '#F59E0B',
            'high': '#F97316',
            'critical': '#EF4444',
          },
          is_default: false,
          is_active: true,
          created_by: 'Sarah Johnson',
          created_at: '2024-11-05T11:30:00Z',
          updated_at: '2024-12-18T10:15:00Z',
          last_used: '2024-12-19T16:45:00Z',
          risk_count: 15,
          department: 'Finance',
          organization: 'Jaffer Business Systems',
        },
        {
          id: '3',
          name: 'Project Risk Matrix',
          description: 'Matrix optimized for project management risk assessment',
          matrix_type: '3x3',
          impact_levels: ['Minor', 'Moderate', 'Major'],
          probability_levels: ['Low', 'Medium', 'High'],
          risk_scoring_method: 'addition',
          threshold_values: {
            'low': 2,
            'medium': 4,
            'high': 6,
          },
          color_scheme: {
            'low': '#10B981',
            'medium': '#F59E0B',
            'high': '#EF4444',
          },
          is_default: false,
          is_active: true,
          created_by: 'Mike Davis',
          created_at: '2024-11-10T09:45:00Z',
          updated_at: '2024-12-17T13:20:00Z',
          last_used: '2024-12-20T11:30:00Z',
          risk_count: 22,
          department: 'Project Management',
          organization: 'Jaffer Business Systems',
        },
        {
          id: '4',
          name: 'Security Risk Matrix',
          description: 'Specialized matrix for cybersecurity and information security risks',
          matrix_type: '5x5',
          impact_levels: ['Minimal', 'Minor', 'Moderate', 'Major', 'Catastrophic'],
          probability_levels: ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'],
          risk_scoring_method: 'multiplication',
          threshold_values: {
            'low': 6,
            'medium': 12,
            'high': 18,
            'critical': 24,
          },
          color_scheme: {
            'low': '#10B981',
            'medium': '#F59E0B',
            'high': '#F97316',
            'critical': '#EF4444',
          },
          is_default: false,
          is_active: true,
          created_by: 'David Wilson',
          created_at: '2024-11-12T14:20:00Z',
          updated_at: '2024-12-16T15:45:00Z',
          last_used: '2024-12-17T09:00:00Z',
          risk_count: 18,
          department: 'IT Security',
          organization: 'Jaffer Business Systems',
        },
        {
          id: '5',
          name: 'Legacy Risk Matrix',
          description: 'Old matrix format - deprecated but retained for historical data',
          matrix_type: '3x3',
          impact_levels: ['Low', 'Medium', 'High'],
          probability_levels: ['Low', 'Medium', 'High'],
          risk_scoring_method: 'multiplication',
          threshold_values: {
            'low': 2,
            'medium': 5,
            'high': 8,
          },
          color_scheme: {
            'low': '#10B981',
            'medium': '#F59E0B',
            'high': '#EF4444',
          },
          is_default: false,
          is_active: false,
          created_by: 'Emily Chen',
          created_at: '2024-09-15T16:10:00Z',
          updated_at: '2024-11-20T12:30:00Z',
          last_used: '2024-11-25T14:15:00Z',
          risk_count: 5,
          organization: 'Jaffer Business Systems',
        },
      ];

      setMatrices(mockMatrices);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMatrix = async (id: string) => {
    try {
      console.log('Deleting matrix:', id);
      await risksAPI.deleteRiskMatrix(id);
      toast.success('Risk matrix deleted successfully');
      fetchMatrices();
    } catch (error: any) {
      console.error('Failed to delete matrix:', error);
      toast.error('Failed to delete matrix');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      console.log('Setting matrix as default:', id);
      await risksAPI.setDefaultRiskMatrix(id);
      toast.success('Risk matrix set as default');
      fetchMatrices();
    } catch (error: any) {
      console.error('Failed to set matrix as default:', error);
      toast.error('Failed to set matrix as default');
    }
  };

  const generateMatrixCells = (matrix: RiskMatrix): MatrixCell[] => {
    const cells: MatrixCell[] = [];
    const impactLevels = matrix.impact_levels;
    const probabilityLevels = matrix.probability_levels;

    for (let i = 0; i < impactLevels.length; i++) {
      for (let j = 0; j < probabilityLevels.length; j++) {
        const impactIndex = i + 1;
        const probabilityIndex = j + 1;
        let score: number;

        if (matrix.risk_scoring_method === 'multiplication') {
          score = impactIndex * probabilityIndex;
        } else {
          score = impactIndex + probabilityIndex;
        }

        let color = matrix.color_scheme.low;
        let label = 'Low';

        if (score >= (matrix.threshold_values.critical || 20)) {
          color = matrix.color_scheme.critical;
          label = 'Critical';
        } else if (score >= (matrix.threshold_values.high || 15)) {
          color = matrix.color_scheme.high;
          label = 'High';
        } else if (score >= (matrix.threshold_values.medium || 10)) {
          color = matrix.color_scheme.medium;
          label = 'Medium';
        }

        cells.push({
          impact: impactLevels[i],
          probability: probabilityLevels[j],
          score,
          color,
          label,
        });
      }
    }

    return cells;
  };

  const filteredMatrices = matrices.filter((matrix) => {
    const matchesSearch = 
      matrix.name.toLowerCase().includes(search.toLowerCase()) ||
      matrix.description.toLowerCase().includes(search.toLowerCase()) ||
      matrix.matrix_type.toLowerCase().includes(search.toLowerCase()) ||
      matrix.created_by.toLowerCase().includes(search.toLowerCase()) ||
      matrix.department?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && matrix.is_active) ||
      (statusFilter === 'inactive' && !matrix.is_active);
    
    const matchesType = typeFilter === 'all' || matrix.matrix_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const activeCount = matrices.filter(m => m.is_active).length;
  const defaultCount = matrices.filter(m => m.is_default).length;
  const totalRisks = matrices.reduce((sum, m) => sum + m.risk_count, 0);
  const matrixTypes = [...new Set(matrices.map(m => m.matrix_type))];

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? <CheckCircleIcon className="h-4 w-4" /> : <ClockIcon className="h-4 w-4" />;
  };

  const getMatrixTypeColor = (type: string) => {
    switch (type) {
      case '3x3': return 'bg-blue-100 text-blue-800';
      case '4x4': return 'bg-purple-100 text-purple-800';
      case '5x5': return 'bg-orange-100 text-orange-800';
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
              <h1 className="text-2xl font-bold text-gray-900">Risk Matrices</h1>
              <p className="text-gray-600">Manage risk assessment matrices and scoring methodologies</p>
            </div>
            <div className="flex space-x-2">
              <Link href="/risks/matrices/compare">
                <Button variant="outline" className="flex items-center">
                  <ChartBarIcon className="h-4 w-4 mr-2" />
                  Compare
                </Button>
              </Link>
              <Link href="/risks/matrices/create">
                <Button className="flex items-center">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Matrix
                </Button>
              </Link>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <ChartBarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Matrices</p>
                  <p className="text-2xl font-bold text-gray-900">{matrices.length}</p>
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
                  <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Default</p>
                  <p className="text-2xl font-bold text-gray-900">{defaultCount}</p>
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
                  Search Matrices
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
                    placeholder="Search by name, description, or type..."
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
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matrix Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Types</option>
                  {matrixTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Actions
                </label>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={fetchMatrices}>
                    <ClockIcon className="h-4 w-4" />
                  </Button>
                  <Link href="/risks/matrices/export">
                    <Button variant="outline" size="sm">
                      Export
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Matrices List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {filteredMatrices.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredMatrices.map((matrix) => (
                  <div key={matrix.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-blue-100 rounded-lg p-2">
                            <ChartBarIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <h3 className="text-lg font-medium text-gray-900">{matrix.name}</h3>
                              {matrix.is_default && (
                                <span className="ml-3 px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                                  <ShieldCheckIcon className="h-4 w-4 inline mr-1" />
                                  Default
                                </span>
                              )}
                              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(matrix.is_active)}`}>
                                <span className="flex items-center">
                                  {getStatusIcon(matrix.is_active)}
                                  <span className="ml-1">{matrix.is_active ? 'Active' : 'Inactive'}</span>
                                </span>
                              </span>
                              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getMatrixTypeColor(matrix.matrix_type)}`}>
                                {matrix.matrix_type}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <UserIcon className="h-4 w-4 mr-1" />
                                {matrix.created_by}
                              </span>
                              <span className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {formatDate(matrix.created_at)}
                              </span>
                              <span className="flex items-center">
                                <DocumentTextIcon className="h-4 w-4 mr-1" />
                                {matrix.risk_count} risks
                              </span>
                              {matrix.department && (
                                <span className="flex items-center">
                                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                                  {matrix.department}
                                </span>
                              )}
                              {matrix.last_used && (
                                <span className="flex items-center">
                                  <ClockIcon className="h-4 w-4 mr-1" />
                                  Last used: {formatDate(matrix.last_used)}
                                </span>
                              )}
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                              <p>{matrix.description}</p>
                            </div>
                            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                              <span>Scoring: {matrix.risk_scoring_method}</span>
                              <span>Impact levels: {matrix.impact_levels.length}</span>
                              <span>Probability levels: {matrix.probability_levels.length}</span>
                            </div>
                            
                            {/* Mini Matrix Preview */}
                            <div className="mt-3">
                              <div className="text-sm font-medium text-gray-700 mb-2">Matrix Preview:</div>
                              <div className="grid grid-cols-3 gap-1 max-w-xs">
                                {generateMatrixCells(matrix).slice(0, 9).map((cell, index) => (
                                  <div
                                    key={index}
                                    className="p-1 text-xs text-center rounded"
                                    style={{ backgroundColor: cell.color + '20', color: cell.color }}
                                  >
                                    {cell.score}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-500 mb-2">
                            {matrix.matrix_type} matrix
                          </div>
                          <div className="flex items-center space-x-2">
                            <Link href={`/risks/matrices/${matrix.id}`}>
                              <Button variant="outline" size="sm">
                                <EyeIcon className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/risks/matrices/${matrix.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                            </Link>
                            {!matrix.is_default && matrix.is_active && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleSetDefault(matrix.id)}
                                className="text-purple-600 hover:text-purple-700"
                              >
                                <ShieldCheckIcon className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteMatrix(matrix.id)}
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
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No risk matrices found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {search || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Get started by creating a new risk matrix'
                  }
                </p>
                {!search && statusFilter === 'all' && typeFilter === 'all' && (
                  <div className="mt-6">
                    <Link href="/risks/matrices/create">
                      <Button>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        New Matrix
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
