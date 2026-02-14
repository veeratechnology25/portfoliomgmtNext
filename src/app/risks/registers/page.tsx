'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { risksAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  DocumentDuplicateIcon,
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
  FolderIcon,
  BuildingOfficeIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface RiskRegister {
  id: string;
  name: string;
  description: string;
  register_type: string;
  department?: string;
  organization: string;
  status: string;
  risk_count: number;
  last_updated: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_exported?: string;
  version: number;
  approval_status: string;
  approved_by?: string;
  approved_date?: string;
  review_frequency: string;
  next_review_date?: string;
  risk_categories: string[];
  risk_levels: Record<string, number>;
  compliance_requirements: string[];
  stakeholders: string[];
  access_level: string;
  is_template: boolean;
}

export default function RiskRegistersPage() {
  const [registers, setRegisters] = useState<RiskRegister[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  useEffect(() => {
    fetchRegisters();
  }, []);

  const fetchRegisters = async () => {
    try {
      setLoading(true);
      console.log('Fetching risk registers...');
      const response = await risksAPI.getRiskRegisters();
      console.log('API Response:', response);
      setRegisters(response.data.results || response.data);
    } catch (error: any) {
      console.error('Failed to fetch risk registers:', error);
      console.error('Error details:', error.response?.status, error.response?.data);
      
      if (error.response?.status === 404) {
        toast.error('API endpoint not found. Please ensure the Django backend server is running on port 8000.');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please check the backend logs.');
      } else {
        toast.error('Failed to load risk registers - using demo data');
      }
      
      // Fallback to mock data if API fails
      console.log('Using fallback mock data...');
      const mockRegisters: RiskRegister[] = [
        {
          id: '1',
          name: 'Enterprise Risk Register 2024',
          description: 'Comprehensive enterprise-wide risk register covering all departments and risk categories',
          register_type: 'Enterprise',
          organization: 'Jaffer Business Systems',
          status: 'active',
          risk_count: 156,
          last_updated: '2024-12-20T14:30:00Z',
          created_by: 'John Smith',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-12-20T14:30:00Z',
          last_exported: '2024-12-19T16:45:00Z',
          version: 12,
          approval_status: 'approved',
          approved_by: 'CEO',
          approved_date: '2024-12-15T09:30:00Z',
          review_frequency: 'Monthly',
          next_review_date: '2025-01-20',
          risk_categories: ['Security', 'Financial', 'Operational', 'Strategic', 'Compliance'],
          risk_levels: { 'high': 23, 'medium': 67, 'low': 66 },
          compliance_requirements: ['ISO 31000', 'SOX', 'GDPR'],
          stakeholders: ['Board of Directors', 'C-Suite', 'Department Heads'],
          access_level: 'executive',
          is_template: false,
        },
        {
          id: '2',
          name: 'IT Security Risk Register',
          description: 'Focused register for IT and cybersecurity risks across the organization',
          register_type: 'Departmental',
          department: 'IT',
          organization: 'Jaffer Business Systems',
          status: 'active',
          risk_count: 45,
          last_updated: '2024-12-19T11:15:00Z',
          created_by: 'Sarah Johnson',
          created_at: '2024-02-20T14:30:00Z',
          updated_at: '2024-12-19T11:15:00Z',
          last_exported: '2024-12-18T10:30:00Z',
          version: 8,
          approval_status: 'approved',
          approved_by: 'CIO',
          approved_date: '2024-12-10T15:45:00Z',
          review_frequency: 'Weekly',
          next_review_date: '2024-12-26',
          risk_categories: ['Security', 'Technology'],
          risk_levels: { 'high': 12, 'medium': 18, 'low': 15 },
          compliance_requirements: ['NIST', 'ISO 27001'],
          stakeholders: ['CIO', 'IT Security Team', 'Compliance Officer'],
          access_level: 'department',
          is_template: false,
        },
        {
          id: '3',
          name: 'Project Risk Register - Q4 2024',
          description: 'Risk register for all active projects in Q4 2024',
          register_type: 'Project',
          organization: 'Jaffer Business Systems',
          status: 'active',
          risk_count: 78,
          last_updated: '2024-12-18T16:20:00Z',
          created_by: 'Mike Davis',
          created_at: '2024-10-01T09:00:00Z',
          updated_at: '2024-12-18T16:20:00Z',
          last_exported: '2024-12-17T14:15:00Z',
          version: 6,
          approval_status: 'pending',
          review_frequency: 'Bi-weekly',
          next_review_date: '2025-01-01',
          risk_categories: ['Project Management', 'Financial', 'Operational'],
          risk_levels: { 'high': 15, 'medium': 33, 'low': 30 },
          compliance_requirements: ['PMI Standards'],
          stakeholders: ['PMO', 'Project Managers', 'Sponsors'],
          access_level: 'project',
          is_template: false,
        },
        {
          id: '4',
          name: 'Financial Risk Register',
          description: 'Comprehensive register for financial risks including budget, revenue, and market risks',
          register_type: 'Functional',
          department: 'Finance',
          organization: 'Jaffer Business Systems',
          status: 'active',
          risk_count: 34,
          last_updated: '2024-12-17T13:45:00Z',
          created_by: 'David Wilson',
          created_at: '2024-03-15T11:20:00Z',
          updated_at: '2024-12-17T13:45:00Z',
          last_exported: '2024-12-16T09:30:00Z',
          version: 9,
          approval_status: 'approved',
          approved_by: 'CFO',
          approved_date: '2024-12-05T14:20:00Z',
          review_frequency: 'Monthly',
          next_review_date: '2025-01-17',
          risk_categories: ['Financial'],
          risk_levels: { 'high': 8, 'medium': 14, 'low': 12 },
          compliance_requirements: ['SOX', 'IFRS'],
          stakeholders: ['CFO', 'Finance Team', 'Audit Committee'],
          access_level: 'department',
          is_template: false,
        },
        {
          id: '5',
          name: 'Compliance Risk Register',
          description: 'Register for regulatory compliance and legal risks',
          register_type: 'Functional',
          department: 'Legal',
          organization: 'Jaffer Business Systems',
          status: 'active',
          risk_count: 22,
          last_updated: '2024-12-16T10:30:00Z',
          created_by: 'Emily Chen',
          created_at: '2024-04-10T16:45:00Z',
          updated_at: '2024-12-16T10:30:00Z',
          version: 7,
          approval_status: 'approved',
          approved_by: 'Legal Counsel',
          approved_date: '2024-12-08T11:15:00Z',
          review_frequency: 'Quarterly',
          next_review_date: '2025-03-16',
          risk_categories: ['Compliance', 'Legal'],
          risk_levels: { 'high': 5, 'medium': 9, 'low': 8 },
          compliance_requirements: ['GDPR', 'HIPAA', 'Local Regulations'],
          stakeholders: ['Legal Team', 'Compliance Officer', 'Board'],
          access_level: 'department',
          is_template: false,
        },
        {
          id: '6',
          name: 'Risk Register Template',
          description: 'Standard template for creating new risk registers',
          register_type: 'Template',
          organization: 'Jaffer Business Systems',
          status: 'active',
          risk_count: 0,
          last_updated: '2024-11-20T14:00:00Z',
          created_by: 'System Admin',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-11-20T14:00:00Z',
          version: 1,
          approval_status: 'approved',
          approved_by: 'System',
          approved_date: '2024-01-01T00:00:00Z',
          review_frequency: 'As needed',
          risk_categories: ['Security', 'Financial', 'Operational', 'Strategic', 'Compliance'],
          risk_levels: { 'high': 0, 'medium': 0, 'low': 0 },
          compliance_requirements: [],
          stakeholders: [],
          access_level: 'public',
          is_template: true,
        },
        {
          id: '7',
          name: 'HR Risk Register',
          description: 'Human resources risk register covering staffing, training, and employment risks',
          register_type: 'Departmental',
          department: 'HR',
          organization: 'Jaffer Business Systems',
          status: 'archived',
          risk_count: 18,
          last_updated: '2024-11-15T12:30:00Z',
          created_by: 'Lisa Anderson',
          created_at: '2024-05-20T09:15:00Z',
          updated_at: '2024-11-15T12:30:00Z',
          last_exported: '2024-11-14T16:45:00Z',
          version: 4,
          approval_status: 'approved',
          approved_by: 'HR Director',
          approved_date: '2024-11-01T10:20:00Z',
          review_frequency: 'Monthly',
          risk_categories: ['Human Resources'],
          risk_levels: { 'high': 3, 'medium': 7, 'low': 8 },
          compliance_requirements: ['Labor Laws', 'HR Policies'],
          stakeholders: ['HR Director', 'HR Team'],
          access_level: 'department',
          is_template: false,
        },
      ];

      setRegisters(mockRegisters);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRegister = async (id: string) => {
    try {
      console.log('Deleting register:', id);
      await risksAPI.deleteRiskRegister(id);
      toast.success('Risk register deleted successfully');
      fetchRegisters();
    } catch (error: any) {
      console.error('Failed to delete register:', error);
      toast.error('Failed to delete register');
    }
  };

  const handleExportRegister = async (id: string) => {
    try {
      console.log('Exporting register:', id);
      await risksAPI.exportRiskRegister(id);
      toast.success('Risk register exported successfully');
      fetchRegisters();
    } catch (error: any) {
      console.error('Failed to export register:', error);
      toast.error('Failed to export register');
    }
  };

  const filteredRegisters = registers.filter((register) => {
    const matchesSearch = 
      register.name.toLowerCase().includes(search.toLowerCase()) ||
      register.description.toLowerCase().includes(search.toLowerCase()) ||
      register.register_type.toLowerCase().includes(search.toLowerCase()) ||
      register.created_by.toLowerCase().includes(search.toLowerCase()) ||
      register.department?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || register.status === statusFilter;
    const matchesType = typeFilter === 'all' || register.register_type === typeFilter;
    const matchesDepartment = departmentFilter === 'all' || register.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesType && matchesDepartment;
  });

  const activeCount = registers.filter(r => r.status === 'active').length;
  const archivedCount = registers.filter(r => r.status === 'archived').length;
  const totalRisks = registers.reduce((sum, r) => sum + r.risk_count, 0);
  const departments = [...new Set(registers.filter(r => r.department).map(r => r.department!))];
  const registerTypes = [...new Set(registers.map(r => r.register_type))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="h-4 w-4" />;
      case 'archived': return <ClockIcon className="h-4 w-4" />;
      case 'draft': return <ExclamationTriangleIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getApprovalColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Enterprise': return 'bg-purple-100 text-purple-800';
      case 'Departmental': return 'bg-blue-100 text-blue-800';
      case 'Project': return 'bg-orange-100 text-orange-800';
      case 'Functional': return 'bg-indigo-100 text-indigo-800';
      case 'Template': return 'bg-gray-100 text-gray-800';
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
              <h1 className="text-2xl font-bold text-gray-900">Risk Registers</h1>
              <p className="text-gray-600">Manage risk registers for different organizational scopes and purposes</p>
            </div>
            <div className="flex space-x-2">
              <Link href="/risks/registers/templates">
                <Button variant="outline" className="flex items-center">
                  <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                  Templates
                </Button>
              </Link>
              <Link href="/risks/registers/create">
                <Button className="flex items-center">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Register
                </Button>
              </Link>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <DocumentDuplicateIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Registers</p>
                  <p className="text-2xl font-bold text-gray-900">{registers.length}</p>
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
                <div className="flex-shrink-0 bg-orange-100 rounded-lg p-3">
                  <DocumentTextIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Risks</p>
                  <p className="text-2xl font-bold text-gray-900">{totalRisks}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                  <BuildingOfficeIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Departments</p>
                  <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Registers
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
                  <option value="archived">Archived</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Register Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Types</option>
                  {registerTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Departments</option>
                  {departments.map(department => (
                    <option key={department} value={department}>{department}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Actions
                </label>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={fetchRegisters}>
                    <ClockIcon className="h-4 w-4" />
                  </Button>
                  <Link href="/risks/registers/bulk-export">
                    <Button variant="outline" size="sm">
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Registers List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {filteredRegisters.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredRegisters.map((register) => (
                  <div key={register.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-blue-100 rounded-lg p-2">
                            <DocumentDuplicateIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <h3 className="text-lg font-medium text-gray-900">{register.name}</h3>
                              {register.is_template && (
                                <span className="ml-3 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                  <DocumentDuplicateIcon className="h-4 w-4 inline mr-1" />
                                  Template
                                </span>
                              )}
                              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(register.status)}`}>
                                <span className="flex items-center">
                                  {getStatusIcon(register.status)}
                                  <span className="ml-1">{register.status}</span>
                                </span>
                              </span>
                              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(register.register_type)}`}>
                                {register.register_type}
                              </span>
                              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getApprovalColor(register.approval_status)}`}>
                                {register.approval_status}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <UserIcon className="h-4 w-4 mr-1" />
                                {register.created_by}
                              </span>
                              <span className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {formatDate(register.created_at)}
                              </span>
                              <span className="flex items-center">
                                <DocumentTextIcon className="h-4 w-4 mr-1" />
                                {register.risk_count} risks
                              </span>
                              {register.department && (
                                <span className="flex items-center">
                                  <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                                  {register.department}
                                </span>
                              )}
                              <span className="flex items-center">
                                <FolderIcon className="h-4 w-4 mr-1" />
                                v{register.version}
                              </span>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                              <p>{register.description}</p>
                            </div>
                            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                              <span>Review: {register.review_frequency}</span>
                              {register.next_review_date && (
                                <span className="flex items-center">
                                  <CalendarIcon className="h-4 w-4 mr-1" />
                                  Next: {formatDate(register.next_review_date)}
                                </span>
                              )}
                              {register.approved_by && (
                                <span>Approved by: {register.approved_by}</span>
                              )}
                            </div>
                            {register.risk_categories.length > 0 && (
                              <div className="mt-2">
                                <span className="text-sm font-medium text-gray-700">Categories:</span>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {register.risk_categories.map((category, index) => (
                                    <span key={index} className="inline-flex px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
                                      {category}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {register.stakeholders.length > 0 && (
                              <div className="mt-2">
                                <span className="text-sm font-medium text-gray-700">Stakeholders:</span>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {register.stakeholders.slice(0, 3).map((stakeholder, index) => (
                                    <span key={index} className="inline-flex px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                                      {stakeholder}
                                    </span>
                                  ))}
                                  {register.stakeholders.length > 3 && (
                                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
                                      +{register.stakeholders.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-500 mb-2">
                            {register.risk_levels.high} high, {register.risk_levels.medium} medium, {register.risk_levels.low} low
                          </div>
                          <div className="flex items-center space-x-2">
                            <Link href={`/risks/registers/${register.id}`}>
                              <Button variant="outline" size="sm">
                                <EyeIcon className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/risks/registers/${register.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleExportRegister(register.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <ArrowDownTrayIcon className="h-4 w-4" />
                            </Button>
                            {!register.is_template && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteRegister(register.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <DocumentDuplicateIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No risk registers found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {search || statusFilter !== 'all' || typeFilter !== 'all' || departmentFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Get started by creating a new risk register'
                  }
                </p>
                {!search && statusFilter === 'all' && typeFilter === 'all' && departmentFilter === 'all' && (
                  <div className="mt-6">
                    <Link href="/risks/registers/create">
                      <Button>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        New Register
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
