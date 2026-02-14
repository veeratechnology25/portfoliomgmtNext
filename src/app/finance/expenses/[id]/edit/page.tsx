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
  DocumentTextIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import { z } from 'zod';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

// Form validation schema
const expenseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  amount: z.string().min(1, 'Amount is required'),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  budget: z.string().min(1, 'Budget is required'),
  receipt_url: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface Budget {
  id: string;
  name: string;
  code: string;
  total_amount: string;
  allocated_amount: string;
  utilized_amount: string;
  remaining_amount: string;
  status: string;
}

interface Expense {
  id: string;
  title: string;
  description: string;
  amount: number;
  category: string;
  status: string;
  date: string;
  budget: {
    id: string;
    name: string;
    code: string;
  };
  receipt_url?: string;
  created_at: string;
  updated_at: string;
}

export default function EditExpensePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expense, setExpense] = useState<Expense | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState<ExpenseFormData>({
    title: '',
    description: '',
    amount: '',
    category: '',
    date: '',
    budget: '',
    receipt_url: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      setInitialLoading(true);
      
      // Fetch expense details
      const expenseResponse = await financeAPI.getExpense(params.id);
      const expenseData = expenseResponse.data;
      setExpense(expenseData);
      
      // Set form data
      setFormData({
        title: expenseData.title || '',
        description: expenseData.description || '',
        amount: expenseData.amount?.toString() || '',
        category: expenseData.category || '',
        date: expenseData.date || '',
        budget: expenseData.budget?.id || '',
        receipt_url: expenseData.receipt_url || '',
      });
      
      // Fetch budgets
      const budgetsResponse = await financeAPI.getBudgets();
      setBudgets(budgetsResponse.data.results || budgetsResponse.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load expense data');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/pdf', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF, JPEG, and PNG files are allowed');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setReceiptFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!receiptFile) return '';
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', receiptFile);
      
      // This would need to be implemented in your API
      // const response = await financeAPI.uploadReceipt(formData);
      // return response.data.url;
      
      // For now, return a mock URL
      return `/receipts/${Date.now()}-${receiptFile.name}`;
    } catch (error) {
      console.error('Failed to upload receipt:', error);
      toast.error('Failed to upload receipt');
      return '';
    } finally {
      setUploading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.amount.trim()) newErrors.amount = 'Amount is required';
    if (parseFloat(formData.amount) <= 0) newErrors.amount = 'Amount must be greater than 0';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.budget) newErrors.budget = 'Budget is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      let receiptUrl = formData.receipt_url;
      if (receiptFile) {
        receiptUrl = await handleFileUpload();
      }

      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        receipt_url: receiptUrl || undefined,
      };

      await financeAPI.updateExpense(params.id, expenseData);
      toast.success('Expense updated successfully');
      router.push(`/finance/expenses/${params.id}`);
    } catch (error) {
      console.error('Failed to update expense:', error);
      toast.error('Failed to update expense');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Office Supplies',
    'Software',
    'Meals & Entertainment',
    'Travel',
    'Training',
    'Equipment',
    'Marketing',
    'Utilities',
    'Insurance',
    'Maintenance',
    'Professional Services',
    'Other'
  ];

  const getAvailableBudgets = () => {
    return budgets.filter(budget => 
      parseFloat(budget.remaining_amount) > 0 && 
      budget.status === 'active'
    );
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

  if (!expense) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-12">
            <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
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

  const canEdit = expense.status === 'pending' || expense.status === 'rejected';

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/finance/expenses/${params.id}`}>
                <Button variant="outline" className="flex items-center">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Expense
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Expense</h1>
                <p className="text-gray-600">Update expense information</p>
              </div>
            </div>
          </div>

          {/* Status Warning */}
          {!canEdit && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 text-yellow-600 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-900">Expense Status Warning</h3>
                  <p className="text-sm text-yellow-700">
                    This expense is {expense.status}. Some fields may be read-only.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    disabled={!canEdit}
                    className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    } ${!canEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="Enter expense title"
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
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
                    disabled={!canEdit}
                    step="0.01"
                    min="0"
                    className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.amount ? 'border-red-300' : 'border-gray-300'
                    } ${!canEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="0.00"
                  />
                  {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    disabled={!canEdit}
                    className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.category ? 'border-red-300' : 'border-gray-300'
                    } ${!canEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    disabled={!canEdit}
                    className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.date ? 'border-red-300' : 'border-gray-300'
                    } ${!canEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                  {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget *
                  </label>
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    disabled={!canEdit}
                    className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.budget ? 'border-red-300' : 'border-gray-300'
                    } ${!canEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  >
                    <option value="">Select Budget</option>
                    {getAvailableBudgets().map((budget) => (
                      <option key={budget.id} value={budget.id}>
                        {budget.name} ({budget.code}) - {parseFloat(budget.remaining_amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })} available
                      </option>
                    ))}
                  </select>
                  {errors.budget && <p className="mt-1 text-sm text-red-600">{errors.budget}</p>}
                  {getAvailableBudgets().length === 0 && canEdit && (
                    <p className="mt-1 text-sm text-yellow-600">
                      No active budgets with available funds found.
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    disabled={!canEdit}
                    rows={4}
                    className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.description ? 'border-red-300' : 'border-gray-300'
                    } ${!canEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="Enter expense description"
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>
              </div>

              {/* Receipt Upload */}
              {canEdit && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Receipt Upload</h3>
                  <div className="border-2 border-gray-300 border-dashed rounded-lg p-6">
                    <div className="text-center">
                      <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label htmlFor="receipt-upload" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Click to upload or drag and drop
                          </span>
                          <span className="mt-1 block text-xs text-gray-500">
                            PDF, PNG, JPG up to 5MB
                          </span>
                        </label>
                        <input
                          id="receipt-upload"
                          name="receipt-upload"
                          type="file"
                          className="sr-only"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                        />
                      </div>
                      {receiptFile && (
                        <div className="mt-4 flex items-center justify-center">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">{receiptFile.name}</span>
                          <button
                            type="button"
                            onClick={() => setReceiptFile(null)}
                            className="ml-2 text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      {formData.receipt_url && !receiptFile && (
                        <div className="mt-4 flex items-center justify-center">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">Current receipt uploaded</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Upload a receipt for this expense. This is optional but recommended for faster approval.
                  </p>
                </div>
              )}

              {/* Budget Information */}
              {formData.budget && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-900">Selected Budget</h3>
                      <p className="text-sm text-blue-700">
                        {budgets.find(b => b.id === formData.budget)?.name} - 
                        Available: {parseFloat(budgets.find(b => b.id === formData.budget)?.remaining_amount || '0').toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              {canEdit && (
                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                  <Link href={`/finance/expenses/${params.id}`}>
                    <Button variant="outline">Cancel</Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={loading || uploading}
                    className="flex items-center"
                  >
                    {loading || uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {uploading ? 'Uploading...' : 'Updating...'}
                      </>
                    ) : (
                      'Update Expense'
                    )}
                  </Button>
                </div>
              )}
            </form>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
