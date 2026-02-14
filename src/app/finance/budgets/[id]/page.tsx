'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { financeAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeftIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { formatDate, formatCurrency, formatPercentage } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Budget {
  id: string;
  name: string;
  code: string;
  description?: string;
  department_name?: string;
  project_name?: string;
  total_amount: string;
  allocated_amount: string;
  utilized_amount: string;
  remaining_amount: string;
  utilization_rate: number;
  variance: string;
  status: string;
  start_date?: string;
  end_date?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  fiscal_year?: number;
}

interface LineItem {
  id: string;
  category: string;
  description?: string;
  amount: string;
  allocated_amount: string;
  utilized_amount: string;
  remaining_amount: string;
  sequence: number;
  created_at: string;
}

interface Approval {
  id: string;
  approver_name?: string;
  status: string;
  comments?: string;
  created_at: string;
  approved_at?: string;
}

export default function BudgetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const id = unwrappedParams.id;
  
  const [budget, setBudget] = useState<Budget | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchBudgetDetails();
  }, [id]);

  const fetchBudgetDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch budget details
      const budgetResponse = await financeAPI.getBudget(id);
      setBudget(budgetResponse.data);
      
      // Fetch line items
      try {
        const lineItemsResponse = await financeAPI.getBudgetLineItems(id);
        setLineItems(lineItemsResponse.data);
      } catch (error) {
        console.error('Failed to fetch line items:', error);
      }
      
      // Fetch approvals
      try {
        const approvalsResponse = await financeAPI.getBudgetApprovals(id);
        setApprovals(approvalsResponse.data);
      } catch (error) {
        console.error('Failed to fetch approvals:', error);
      }
    } catch (error) {
      console.error('Failed to fetch budget details:', error);
      toast.error('Failed to load budget details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this budget? This action cannot be undone.')) {
      return;
    }

    try {
      await financeAPI.deleteBudget(id);
      toast.success('Budget deleted successfully');
      window.location.href = '/finance/budgets';
    } catch (error) {
      console.error('Failed to delete budget:', error);
      toast.error('Failed to delete budget');
    }
  };

  const handleApprove = async () => {
    try {
      await financeAPI.approveBudget(id);
      toast.success('Budget approved successfully');
      fetchBudgetDetails();
    } catch (error) {
      console.error('Failed to approve budget:', error);
      toast.error('Failed to approve budget');
    }
  };

  const handleSubmitForApproval = async () => {
    try {
      await financeAPI.submitBudgetForApproval(id);
      toast.success('Budget submitted for approval');
      fetchBudgetDetails();
    } catch (error) {
      console.error('Failed to submit budget:', error);
      toast.error('Failed to submit budget');
    }
  };

  const getBudgetStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-emerald-100 text-emerald-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSpendingStatus = (utilization: number) => {
    if (utilization > 90) return { color: 'red', text: 'Over Budget' };
    if (utilization > 75) return { color: 'yellow', text: 'At Risk' };
    return { color: 'green', text: 'On Track' };
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
            <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
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

  const utilization = budget.utilization_rate || 0;
  const spendingStatus = getSpendingStatus(utilization);

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/finance/budgets">
                <Button variant="outline" size="sm" className="mr-4">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Budgets
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{budget.name}</h1>
                <p className="text-gray-600">Budget Code: {budget.code}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {budget.status === 'draft' && (
                <Button variant="outline" onClick={handleSubmitForApproval}>
                  <ClockIcon className="h-4 w-4 mr-2" />
                  Submit for Approval
                </Button>
              )}
              {budget.status === 'under_review' && (
                <Button onClick={handleApprove}>
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Approve Budget
                </Button>
              )}
              <Link href={`/finance/budgets/${id}/edit`}>
                <Button variant="outline">
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          {/* Budget Overview */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-900">{budget.name}</h2>
                  <div className="flex items-center mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBudgetStatusColor(budget.status)}`}>
                      {budget.status.replace('_', ' ').toUpperCase()}
                    </span>
                    {budget.department_name && (
                      <>
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="text-sm text-gray-500">{budget.department_name}</span>
                      </>
                    )}
                    {budget.project_name && (
                      <>
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="text-sm text-gray-500">{budget.project_name}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {budget.description && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                <p className="text-gray-600">{budget.description}</p>
              </div>
            )}

            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Total Budget</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(parseFloat(budget.total_amount))}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Allocated</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(parseFloat(budget.allocated_amount))}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Utilized</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(parseFloat(budget.utilized_amount))}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Remaining</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(parseFloat(budget.remaining_amount))}
                </p>
              </div>
            </div>

            {/* Budget Utilization */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Budget Utilization</span>
                <span className={`text-sm font-medium ${
                  spendingStatus.color === 'red' ? 'text-red-600' :
                  spendingStatus.color === 'yellow' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {formatPercentage(utilization / 100)} • {spendingStatus.text}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    spendingStatus.color === 'red' ? 'bg-red-600' :
                    spendingStatus.color === 'yellow' ? 'bg-yellow-600' : 'bg-green-600'
                  }`}
                  style={{ width: `${utilization}%` }}
                ></div>
              </div>
            </div>

            {/* Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Fiscal Year</h3>
                <p className="text-gray-900">{budget.fiscal_year || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Start Date</h3>
                <p className="text-gray-900">
                  {budget.start_date ? formatDate(budget.start_date) : 'Not specified'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">End Date</h3>
                <p className="text-gray-900">
                  {budget.end_date ? formatDate(budget.end_date) : 'Not specified'}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white shadow rounded-lg">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {['overview', 'line-items', 'approvals'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-6 text-sm font-medium border-b-2 ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Budget Overview</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Created by</span>
                      <span className="text-gray-900">{budget.created_by_name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Created at</span>
                      <span className="text-gray-900">{formatDate(budget.created_at)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Last updated</span>
                      <span className="text-gray-900">{formatDate(budget.updated_at)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Variance</span>
                      <span className={`font-medium ${
                        parseFloat(budget.variance) < 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {formatCurrency(parseFloat(budget.variance))}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'line-items' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Budget Line Items</h3>
                    <Link href={`/finance/budgets/${id}/line-items/create`}>
                      <Button size="sm">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Line Item
                      </Button>
                    </Link>
                  </div>
                  {lineItems.length > 0 ? (
                    <div className="space-y-3">
                      {lineItems.map((item) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{item.category}</h4>
                              {item.description && (
                                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">
                                {formatCurrency(parseFloat(item.amount))}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatCurrency(parseFloat(item.utilized_amount))} utilized
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No line items</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by adding line items to this budget.</p>
                      <div className="mt-6">
                        <Link href={`/finance/budgets/${id}/line-items/create`}>
                          <Button>
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Add First Line Item
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'approvals' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Budget Approvals</h3>
                  {approvals.length > 0 ? (
                    <div className="space-y-3">
                      {approvals.map((approval) => (
                        <div key={approval.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{approval.approver_name || 'Unknown'}</h4>
                              {approval.comments && (
                                <p className="text-sm text-gray-600 mt-1">{approval.comments}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                approval.status === 'approved' ? 'bg-green-100 text-green-800' :
                                approval.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {approval.status.toUpperCase()}
                              </span>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDate(approval.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No approvals yet</h3>
                      <p className="mt-1 text-sm text-gray-500">This budget hasn't been submitted for approval.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
