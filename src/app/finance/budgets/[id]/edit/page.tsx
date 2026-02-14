'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { financeAPI, organizationAPI, projectsAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { z } from 'zod';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

// Form validation schema
const budgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required'),
  code: z.string().min(1, 'Budget code is required'),
  description: z.string().optional(),
  department: z.string().optional(),
  project: z.string().optional(),
  total_amount: z.string().min(1, 'Total amount is required'),
  fiscal_year: z.number().min(2020).max(2050),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  line_items: z.array(z.object({
    category: z.string().min(1, 'Category is required'),
    description: z.string().optional(),
    amount: z.string().min(1, 'Amount is required'),
    sequence: z.number().min(1),
  })).optional(),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface Department {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  code: string;
}

interface Budget {
  id: string;
  name: string;
  code: string;
  description?: string;
  department?: string;
  project?: string;
  total_amount: string;
  fiscal_year?: number;
  start_date?: string;
  end_date?: string;
}

interface LineItem {
  id?: string;
  category: string;
  description?: string;
  amount: string;
  sequence: number;
}

export default function EditBudgetPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  
  const [formData, setFormData] = useState<BudgetFormData>({
    name: '',
    code: '',
    description: '',
    department: '',
    project: '',
    total_amount: '',
    fiscal_year: new Date().getFullYear(),
    start_date: '',
    end_date: '',
    line_items: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      const [budgetResponse, deptResponse, projectResponse, lineItemsResponse] = await Promise.all([
        financeAPI.getBudget(params.id),
        organizationAPI.getDepartments(),
        projectsAPI.getProjects(),
        financeAPI.getBudgetLineItems(params.id).catch(() => ({ data: [] })),
      ]);
      
      const budget = budgetResponse.data;
      setFormData({
        name: budget.name || '',
        code: budget.code || '',
        description: budget.description || '',
        department: budget.department || '',
        project: budget.project || '',
        total_amount: budget.total_amount || '',
        fiscal_year: budget.fiscal_year || new Date().getFullYear(),
        start_date: budget.start_date || '',
        end_date: budget.end_date || '',
        line_items: [],
      });
      
      setLineItems(lineItemsResponse.data.map((item: any) => ({
        id: item.id,
        category: item.category,
        description: item.description || '',
        amount: item.amount,
        sequence: item.sequence,
      })));
      
      setDepartments(deptResponse.data.results || deptResponse.data);
      setProjects(projectResponse.data.results || projectResponse.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load budget data');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'fiscal_year' ? parseInt(value) || '' : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addLineItem = () => {
    const newSequence = lineItems.length + 1;
    setLineItems(prev => [...prev, { 
      category: '', 
      description: '', 
      amount: '', 
      sequence: newSequence 
    }]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleLineItemChange = (index: number, field: string, value: string) => {
    setLineItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Budget name is required';
    if (!formData.code.trim()) newErrors.code = 'Budget code is required';
    if (!formData.total_amount.trim()) newErrors.total_amount = 'Total amount is required';
    if (!formData.start_date) newErrors.start_date = 'Start date is required';
    if (!formData.end_date) newErrors.end_date = 'End date is required';
    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      newErrors.end_date = 'End date must be after start date';
    }
    
    // Validate line items
    lineItems.forEach((item, index) => {
      if (!item.category.trim()) {
        newErrors[`line_item_${index}_category`] = 'Category is required';
      }
      if (!item.amount.trim()) {
        newErrors[`line_item_${index}_amount`] = 'Amount is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const budgetData = {
        ...formData,
        line_items: lineItems.map(item => ({
          ...item,
          amount: parseFloat(item.amount),
          allocated_amount: parseFloat(item.amount),
          utilized_amount: 0,
        })),
        total_amount: parseFloat(formData.total_amount),
        allocated_amount: 0,
        utilized_amount: 0,
      };

      await financeAPI.updateBudget(params.id, budgetData);
      toast.success('Budget updated successfully');
      router.push(`/finance/budgets/${params.id}`);
    } catch (error) {
      console.error('Failed to update budget:', error);
      toast.error('Failed to update budget');
    } finally {
      setLoading(false);
    }
  };

  const generateBudgetCode = () => {
    const deptCode = departments.find(d => d.id === formData.department)?.name.substring(0, 3).toUpperCase() || 'GEN';
    const year = formData.fiscal_year;
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setFormData(prev => ({ ...prev, code: `${deptCode}-${year}-${random}` }));
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

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/finance/budgets/${params.id}`}>
                <Button variant="outline" className="flex items-center">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Budget
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Budget</h1>
                <p className="text-gray-600">Update budget information and allocations</p>
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
                    Budget Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter budget name"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Code *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      className={`flex-1 block px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.code ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter budget code"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateBudgetCode}
                      className="flex items-center"
                    >
                      Generate
                    </Button>
                  </div>
                  {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
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
                    placeholder="Enter budget description"
                  />
                </div>
              </div>

              {/* Association */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project
                  </label>
                  <select
                    name="project"
                    value={formData.project}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select Project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name} ({project.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fiscal Year *
                  </label>
                  <input
                    type="number"
                    name="fiscal_year"
                    value={formData.fiscal_year}
                    onChange={handleInputChange}
                    min="2020"
                    max="2050"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Amounts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Amount *
                  </label>
                  <input
                    type="number"
                    name="total_amount"
                    value={formData.total_amount}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.total_amount ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.total_amount && <p className="mt-1 text-sm text-red-600">{errors.total_amount}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.start_date ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.end_date ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
                </div>
              </div>

              {/* Budget Line Items */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Budget Line Items</h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addLineItem}
                    className="flex items-center"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Line Item
                  </Button>
                </div>

                <div className="space-y-3">
                  {lineItems.map((item, index) => (
                    <div key={item.id || index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category *
                          </label>
                          <input
                            type="text"
                            value={item.category}
                            onChange={(e) => handleLineItemChange(index, 'category', e.target.value)}
                            className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                              errors[`line_item_${index}_category`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="e.g., Personnel, Equipment"
                          />
                          {errors[`line_item_${index}_category`] && (
                            <p className="mt-1 text-sm text-red-600">{errors[`line_item_${index}_category`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Amount *
                          </label>
                          <input
                            type="number"
                            value={item.amount}
                            onChange={(e) => handleLineItemChange(index, 'amount', e.target.value)}
                            step="0.01"
                            min="0"
                            className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                              errors[`line_item_${index}_amount`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                          />
                          {errors[`line_item_${index}_amount`] && (
                            <p className="mt-1 text-sm text-red-600">{errors[`line_item_${index}_amount`]}</p>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Line item description"
                          />
                        </div>
                      </div>

                      {lineItems.length > 1 && (
                        <div className="mt-3 flex justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => removeLineItem(index)}
                            className="text-red-600 hover:text-red-700 flex items-center"
                          >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <Link href={`/finance/budgets/${params.id}`}>
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
                    'Update Budget'
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
