'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { financeAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { z } from 'zod';
import toast from 'react-hot-toast';

// Form validation schema
const lineItemSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  amount: z.string().min(1, 'Amount is required'),
  sequence: z.number().min(1, 'Sequence is required'),
});

type LineItemFormData = z.infer<typeof lineItemSchema>;

interface Budget {
  id: string;
  name: string;
  code: string;
  total_amount: string;
  allocated_amount: string;
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
  updated_at: string;
}

export default function EditLineItemPage({ params }: { params: { id: string; lineItemId: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [lineItem, setLineItem] = useState<LineItem | null>(null);
  
  const [formData, setFormData] = useState<LineItemFormData>({
    category: '',
    description: '',
    amount: '',
    sequence: 1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, [params.id, params.lineItemId]);

  const fetchData = async () => {
    try {
      setInitialLoading(true);
      
      // Fetch budget details
      const budgetResponse = await financeAPI.getBudget(params.id);
      setBudget(budgetResponse.data);
      
      // Fetch line item details
      const lineItemResponse = await financeAPI.getBudgetLineItem(params.id, params.lineItemId);
      const item = lineItemResponse.data;
      setLineItem(item);
      
      setFormData({
        category: item.category || '',
        description: item.description || '',
        amount: item.amount || '',
        sequence: item.sequence || 1,
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load line item data');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'sequence' ? parseInt(value) || 1 : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.amount.trim()) newErrors.amount = 'Amount is required';
    if (parseFloat(formData.amount) <= 0) newErrors.amount = 'Amount must be greater than 0';
    if (!formData.sequence || formData.sequence < 1) newErrors.sequence = 'Sequence must be a positive number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const lineItemData = {
        ...formData,
        amount: parseFloat(formData.amount),
        allocated_amount: parseFloat(formData.amount),
        utilized_amount: parseFloat(lineItem?.utilized_amount || '0'),
        remaining_amount: parseFloat(formData.amount) - parseFloat(lineItem?.utilized_amount || '0'),
      };

      await financeAPI.updateBudgetLineItem(params.id, params.lineItemId, lineItemData);
      toast.success('Line item updated successfully');
      router.push(`/finance/budgets/${params.id}/line-items`);
    } catch (error) {
      console.error('Failed to update line item:', error);
      toast.error('Failed to update line item');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
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

  if (!budget || !lineItem) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-12">
            <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Item not found</h3>
            <p className="mt-1 text-sm text-gray-500">The line item you're looking for doesn't exist.</p>
            <div className="mt-6">
              <Link href={`/finance/budgets/${params.id}/line-items`}>
                <Button>
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Line Items
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
            <div className="flex items-center space-x-4">
              <Link href={`/finance/budgets/${params.id}/line-items`}>
                <Button variant="outline" className="flex items-center">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Line Items
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Line Item</h1>
                <p className="text-gray-600">
                  Update line item for {budget.name} ({budget.code})
                </p>
              </div>
            </div>
          </div>

          {/* Current Utilization Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 text-yellow-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-yellow-900">Current Utilization</h3>
                <p className="text-sm text-yellow-700">
                  Utilized: {parseFloat(lineItem.utilized_amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })} • 
                  Remaining: {parseFloat(lineItem.remaining_amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.category ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Personnel, Equipment, Materials"
                  />
                  {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sequence *
                  </label>
                  <input
                    type="number"
                    name="sequence"
                    value={formData.sequence}
                    onChange={handleInputChange}
                    min="1"
                    className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.sequence ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Line item sequence number"
                  />
                  {errors.sequence && <p className="mt-1 text-sm text-red-600">{errors.sequence}</p>}
                  <p className="mt-1 text-sm text-gray-500">
                    Determines the order of line items in the budget
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount *
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.amount ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter line item description (optional)"
                  />
                </div>
              </div>

              {/* Common Categories */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Common Categories</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    'Personnel',
                    'Equipment',
                    'Materials',
                    'Software',
                    'Training',
                    'Travel',
                    'Marketing',
                    'Consulting',
                    'Utilities',
                    'Maintenance',
                    'Insurance',
                    'Other'
                  ].map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category }))}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Warning if reducing amount below utilized */}
              {parseFloat(formData.amount) < parseFloat(lineItem.utilized_amount) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 text-red-600 mr-2" />
                    <div>
                      <h3 className="text-sm font-medium text-red-900">Warning: Amount Below Utilized</h3>
                      <p className="text-sm text-red-700">
                        You're reducing the amount below the already utilized amount ({parseFloat(lineItem.utilized_amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}). This may create a negative balance.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <Link href={`/finance/budgets/${params.id}/line-items`}>
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Line Item'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
