'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { financeAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  UserIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Approval {
  id: string;
  approver_name?: string;
  approver_role?: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  created_at: string;
  approved_at?: string;
  rejected_at?: string;
  level: number;
  required: boolean;
}

interface Budget {
  id: string;
  name: string;
  code: string;
  status: string;
  total_amount: string;
  created_by_name?: string;
}

export default function BudgetApprovalsPage({ params }: { params: { id: string } }) {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch budget details
      const budgetResponse = await financeAPI.getBudget(params.id);
      setBudget(budgetResponse.data);
      
      // Fetch approvals
      const approvalsResponse = await financeAPI.getBudgetApprovals(params.id);
      setApprovals(approvalsResponse.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approvalId: string) => {
    try {
      await financeAPI.approveBudgetApproval(params.id, approvalId, {
        status: 'approved',
        comments: 'Approved'
      });
      toast.success('Approval recorded successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to approve:', error);
      toast.error('Failed to record approval');
    }
  };

  const handleReject = async (approvalId: string, comments: string) => {
    try {
      await financeAPI.approveBudgetApproval(params.id, approvalId, {
        status: 'rejected',
        comments
      });
      toast.success('Rejection recorded successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to reject:', error);
      toast.error('Failed to record rejection');
    }
  };

  const filteredApprovals = approvals.filter(approval => {
    const matchesSearch = approval.approver_name?.toLowerCase().includes(search.toLowerCase()) ||
                         approval.comments?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || approval.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      case 'approved': return <CheckCircleIcon className="h-4 w-4" />;
      case 'rejected': return <XMarkIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getOverallApprovalStatus = () => {
    if (approvals.length === 0) return { status: 'pending', text: 'No approvals required', color: 'gray' };
    
    const pendingApprovals = approvals.filter(a => a.status === 'pending' && a.required);
    const rejectedApprovals = approvals.filter(a => a.status === 'rejected');
    
    if (rejectedApprovals.length > 0) {
      return { status: 'rejected', text: 'Rejected', color: 'red' };
    }
    
    if (pendingApprovals.length > 0) {
      return { status: 'pending', text: `Pending (${pendingApprovals.length} remaining)`, color: 'yellow' };
    }
    
    return { status: 'approved', text: 'Fully Approved', color: 'green' };
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

  if (!budget) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-12">
            <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Budget not found</h3>
            <p className="mt-1 text-sm text-gray-500">The budget you're looking for doesn't exist.</p>
            <div className="mt-6">
              <Link href="/finance/budgets">
                <Button>
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Budgets
                </Button>
              </Link>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const overallStatus = getOverallApprovalStatus();

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href={`/finance/budgets/${params.id}`}>
                <Button variant="outline" size="sm" className="mr-4">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Budget
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Budget Approvals</h1>
                <p className="text-gray-600">
                  {budget.name} ({budget.code})
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                overallStatus.color === 'green' ? 'bg-green-100 text-green-800' :
                overallStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                overallStatus.color === 'red' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {overallStatus.text}
              </span>
            </div>
          </div>

          {/* Budget Summary */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Budget Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Budget Amount</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {parseFloat(budget.total_amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Created By</h3>
                <p className="text-gray-900">{budget.created_by_name || 'Unknown'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Budget Status</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  budget.status === 'approved' ? 'bg-green-100 text-green-800' :
                  budget.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  budget.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {budget.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search approvals..."
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="text-sm text-gray-500">
                {filteredApprovals.length} approval{filteredApprovals.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Approvals List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {filteredApprovals.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredApprovals.map((approval) => (
                  <div key={approval.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-gray-100 rounded-lg p-2">
                            <UserIcon className="h-6 w-6 text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <h3 className="text-lg font-medium text-gray-900">
                                {approval.approver_name || 'Pending Approver'}
                              </h3>
                              {approval.approver_role && (
                                <span className="ml-3 text-sm text-gray-500">({approval.approver_role})</span>
                              )}
                              <span className="ml-3 text-sm text-gray-500">Level {approval.level}</span>
                              {approval.required && (
                                <span className="ml-3 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                  Required
                                </span>
                              )}
                            </div>
                            <div className="flex items-center mt-1">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getApprovalStatusColor(approval.status)}`}>
                                <span className="flex items-center">
                                  {getStatusIcon(approval.status)}
                                  <span className="ml-1">{approval.status.toUpperCase()}</span>
                                </span>
                              </span>
                              <span className="ml-3 text-sm text-gray-500">
                                Requested: {formatDate(approval.created_at)}
                              </span>
                              {approval.approved_at && (
                                <span className="ml-3 text-sm text-gray-500">
                                  Approved: {formatDate(approval.approved_at)}
                                </span>
                              )}
                              {approval.rejected_at && (
                                <span className="ml-3 text-sm text-gray-500">
                                  Rejected: {formatDate(approval.rejected_at)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {approval.comments && (
                          <div className="mt-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Comments</h4>
                            <p className="text-gray-600">{approval.comments}</p>
                          </div>
                        )}
                      </div>

                      {approval.status === 'pending' && (
                        <div className="ml-4 flex items-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(approval.id)}
                            className="flex items-center"
                          >
                            <CheckCircleIcon className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const comments = prompt('Please provide rejection comments:');
                              if (comments) {
                                handleReject(approval.id, comments);
                              }
                            }}
                            className="text-red-600 hover:text-red-700 flex items-center"
                          >
                            <XMarkIcon className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No approvals found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {search || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'No approval workflow has been set up for this budget.'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Approval Workflow Summary */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Approval Workflow Summary</h2>
            <div className="space-y-3">
              {approvals.length > 0 ? (
                approvals
                  .sort((a, b) => a.level - b.level)
                  .map((approval, index) => (
                    <div key={approval.id} className="flex items-center">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        approval.status === 'approved' ? 'bg-green-100 text-green-600' :
                        approval.status === 'rejected' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        {getStatusIcon(approval.status)}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            Level {approval.level}: {approval.approver_name || 'Pending Approver'}
                          </p>
                          {approval.required && (
                            <span className="ml-2 text-xs text-blue-600">Required</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {approval.status === 'approved' ? `Approved on ${formatDate(approval.approved_at || '')}` :
                           approval.status === 'rejected' ? `Rejected on ${formatDate(approval.rejected_at || '')}` :
                           'Pending approval'
                          }
                        </p>
                      </div>
                      {index < approvals.length - 1 && (
                        <div className="ml-3">
                          <div className="w-8 h-px bg-gray-300"></div>
                        </div>
                      )}
                    </div>
                  ))
              ) : (
                <p className="text-sm text-gray-500">No approval workflow configured.</p>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
