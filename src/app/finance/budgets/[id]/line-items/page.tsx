'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { financeAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  CurrencyDollarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

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
  updated_at: string;
}

interface Budget {
  id: string;
  name: string;
  code: string;
  total_amount: string;
  allocated_amount: string;
  utilized_amount: string;
  remaining_amount: string;
}

export default function BudgetLineItemsPage({ params }: { params: { id: string } }) {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('sequence');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch budget details
      const budgetResponse = await financeAPI.getBudget(params.id);
      setBudget(budgetResponse.data);
      
      // Fetch line items
      const lineItemsResponse = await financeAPI.getBudgetLineItems(params.id);
      setLineItems(lineItemsResponse.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load line items');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (lineItemId: string) => {
    if (!confirm('Are you sure you want to delete this line item?')) return;

    try {
      await financeAPI.deleteBudgetLineItem(params.id, lineItemId);
      toast.success('Line item deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to delete line item:', error);
      toast.error('Failed to delete line item');
    }
  };

  const filteredAndSortedLineItems = lineItems
    .filter(item => 
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'sequence':
          comparison = a.sequence - b.sequence;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'amount':
          comparison = parseFloat(a.amount) - parseFloat(b.amount);
          break;
        case 'utilized':
          comparison = parseFloat(a.utilized_amount) - parseFloat(b.utilized_amount);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getUtilizationStatus = (allocated: string, utilized: string) => {
    const allocatedNum = parseFloat(allocated);
    const utilizedNum = parseFloat(utilized);
    const utilization = allocatedNum > 0 ? (utilizedNum / allocatedNum) * 100 : 0;
    
    if (utilization > 100) return { color: 'red', text: 'Over Budget' };
    if (utilization > 90) return { color: 'yellow', text: 'At Risk' };
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
                <h1 className="text-2xl font-bold text-gray-900">Budget Line Items</h1>
                <p className="text-gray-600">
                  {budget.name} ({budget.code})
                </p>
              </div>
            </div>
            <Link href={`/finance/budgets/${params.id}/line-items/create`}>
              <Button className="flex items-center">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Line Item
              </Button>
            </Link>
          </div>

          {/* Budget Summary */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Budget Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search line items..."
                  />
                </div>
              </div>
              <div className="ml-4 text-sm text-gray-500">
                {filteredAndSortedLineItems.length} line item{filteredAndSortedLineItems.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Line Items List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {filteredAndSortedLineItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('sequence')}
                      >
                        <div className="flex items-center">
                          #
                          {sortBy === 'sequence' && (
                            <span className="ml-1">
                              {sortOrder === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('category')}
                      >
                        <div className="flex items-center">
                          Category
                          {sortBy === 'category' && (
                            <span className="ml-1">
                              {sortOrder === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('amount')}
                      >
                        <div className="flex items-center">
                          Amount
                          {sortBy === 'amount' && (
                            <span className="ml-1">
                              {sortOrder === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('utilized')}
                      >
                        <div className="flex items-center">
                          Utilized
                          {sortBy === 'utilized' && (
                            <span className="ml-1">
                              {sortOrder === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remaining
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedLineItems.map((item) => {
                      const utilizationStatus = getUtilizationStatus(item.allocated_amount, item.utilized_amount);
                      const utilizationRate = parseFloat(item.allocated_amount) > 0 
                        ? (parseFloat(item.utilized_amount) / parseFloat(item.allocated_amount)) * 100 
                        : 0;
                      
                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.sequence}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {item.category}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {item.description || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(parseFloat(item.amount))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatCurrency(parseFloat(item.utilized_amount))}
                            </div>
                            <div className="text-xs text-gray-500">
                              {utilizationRate.toFixed(1)}%
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(parseFloat(item.remaining_amount))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              utilizationStatus.color === 'red' ? 'bg-red-100 text-red-800' :
                              utilizationStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {utilizationStatus.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Link href={`/finance/budgets/${params.id}/line-items/${item.id}/edit`}>
                                <button className="text-gray-400 hover:text-blue-600">
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                              </Link>
                              <button 
                                onClick={() => handleDelete(item.id)}
                                className="text-gray-400 hover:text-red-600"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No line items found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {search ? 'Try adjusting your search criteria' : 'Get started by adding line items to this budget.'}
                </p>
                {!search && (
                  <div className="mt-6">
                    <Link href={`/finance/budgets/${params.id}/line-items/create`}>
                      <Button>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add First Line Item
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
