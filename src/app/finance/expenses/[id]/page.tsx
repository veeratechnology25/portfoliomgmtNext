'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { financeAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeftIcon,
  CurrencyDollarIcon,
  UserIcon,
  CalendarIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XMarkIcon,
  ReceiptRefundIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { formatDate, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Expense {
  id: string;
  title: string;
  description: string;
  amount: number;
  category: string;
  status: string;
  date: string;
  submitted_by: {
    id: string;
    first_name: string;
    last_name: string;
  };
  approved_by?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  budget: {
    id: string;
    name: string;
    code: string;
  };
  receipt_url?: string;
  created_at: string;
  updated_at: string;
  rejection_comments?: string;
  approval_comments?: string;
}

export default function ExpenseDetailPage({ params }: { params: { id: string } }) {
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpense();
  }, [params.id]);

  const fetchExpense = async () => {
    try {
      setLoading(true);
      const response = await financeAPI.getExpense(params.id);
      setExpense(response.data);
    } catch (error) {
      console.error('Failed to fetch expense:', error);
      toast.error('Failed to load expense details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
      return;
    }

    try {
      await financeAPI.deleteExpense(params.id);
      toast.success('Expense deleted successfully');
      window.location.href = '/finance/expenses';
    } catch (error) {
      console.error('Failed to delete expense:', error);
      toast.error('Failed to delete expense');
    }
  };

  const handleApprove = async () => {
    try {
      await financeAPI.approveExpense(params.id);
      toast.success('Expense approved successfully');
      fetchExpense();
    } catch (error) {
      console.error('Failed to approve expense:', error);
      toast.error('Failed to approve expense');
    }
  };

  const handleReject = async () => {
    const comments = prompt('Please provide rejection comments:');
    if (!comments) return;

    try {
      await financeAPI.rejectExpense(params.id, { comments });
      toast.success('Expense rejected successfully');
      fetchExpense();
    } catch (error) {
      console.error('Failed to reject expense:', error);
      toast.error('Failed to reject expense');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon className="h-4 w-4" />;
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      case 'rejected': return <XMarkIcon className="h-4 w-4" />;
      case 'paid': return <CheckCircleIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
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

  if (!expense) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-12">
            <ReceiptRefundIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Expense not found</h3>
            <p className="mt-1 text-sm text-gray-500">The expense you're looking for doesn't exist.</p>
            <div className="mt-6">
              <Link href="/finance/expenses">
                <Button>
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Expenses
                </Button>
              </Link>
            </div>
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
            <div className="flex items-center">
              <Link href="/finance/expenses">
                <Button variant="outline" size="sm" className="mr-4">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Expenses
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{expense.title}</h1>
                <p className="text-gray-600">Expense Report</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {expense.status === 'pending' && (
                <>
                  <Button onClick={handleApprove}>
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button variant="outline" onClick={handleReject} className="text-red-600 hover:text-red-700">
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}
              {expense.status === 'approved' && (
                <Button onClick={() => financeAPI.markExpenseAsPaid(params.id)}>
                  <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                  Mark as Paid
                </Button>
              )}
              <Link href={`/finance/expenses/${params.id}/edit`}>
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

          {/* Expense Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <ReceiptRefundIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-900">{expense.title}</h2>
                  <div className="flex items-center mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(expense.status)}`}>
                      <span className="flex items-center">
                        {getStatusIcon(expense.status)}
                        <span className="ml-1">{expense.status.toUpperCase()}</span>
                      </span>
                    </span>
                    <span className="ml-3 text-sm text-gray-500">{expense.category}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(expense.amount)}</p>
                <p className="text-sm text-gray-500">Expense Amount</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600">{expense.description}</p>
            </div>

            {/* Expense Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Expense Date</h3>
                <p className="text-gray-900">{formatDate(expense.date)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Category</h3>
                <p className="text-gray-900">{expense.category}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Budget</h3>
                <Link href={`/finance/budgets/${expense.budget.id}`} className="text-blue-600 hover:text-blue-800">
                  {expense.budget.name} ({expense.budget.code})
                </Link>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Amount</h3>
                <p className="text-gray-900 font-medium">{formatCurrency(expense.amount)}</p>
              </div>
            </div>

            {/* Receipt */}
            {expense.receipt_url && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Receipt</h3>
                <Button variant="outline" className="flex items-center">
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  View Receipt
                </Button>
              </div>
            )}

            {/* Approval Information */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Approval Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Submitted By</h4>
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">
                      {expense.submitted_by.first_name} {expense.submitted_by.last_name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Submitted on {formatDate(expense.created_at)}</p>
                </div>
                
                {expense.approved_by ? (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Approved By</h4>
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-gray-900">
                        {expense.approved_by.first_name} {expense.approved_by.last_name}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Approved on {formatDate(expense.updated_at)}</p>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Approval Status</h4>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 text-yellow-600 mr-2" />
                      <span className="text-gray-900">Pending approval</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Comments */}
              {(expense.approval_comments || expense.rejection_comments) && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">
                    {expense.approval_comments ? 'Approval Comments' : 'Rejection Comments'}
                  </h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                    {expense.approval_comments || expense.rejection_comments}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <ReceiptRefundIcon className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">Expense Submitted</h4>
                  <p className="text-sm text-gray-600">
                    {expense.submitted_by.first_name} {expense.submitted_by.last_name} submitted this expense for approval.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(expense.created_at)}</p>
                </div>
              </div>

              {expense.approved_by && (
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900">Expense Approved</h4>
                    <p className="text-sm text-gray-600">
                      {expense.approved_by.first_name} {expense.approved_by.last_name} approved this expense.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(expense.updated_at)}</p>
                  </div>
                </div>
              )}

              {expense.status === 'rejected' && (
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                      <XMarkIcon className="h-4 w-4 text-red-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900">Expense Rejected</h4>
                    <p className="text-sm text-gray-600">
                      This expense was rejected.
                      {expense.rejection_comments && ` Reason: ${expense.rejection_comments}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(expense.updated_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
