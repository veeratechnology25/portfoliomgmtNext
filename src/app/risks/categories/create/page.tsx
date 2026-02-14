'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { risksAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateRiskCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

const [form, setForm] = useState({
  code: '',
  name: '',
  description: '',
});

useEffect(() => {
  if (form.name) {
    setForm(p => ({
      ...p,
      code: p.name.trim().toUpperCase().replace(/\s+/g, '_'),
    }));
  }
}, [form.name]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

const submit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!form.code.trim()) return toast.error('Code is required');
  if (!form.name.trim()) return toast.error('Name is required');

  try {
    setLoading(true);

    await risksAPI.createRiskCategory({
      code: form.code.trim(),
      name: form.name.trim(),
      description: form.description?.trim() || undefined,
    });

    toast.success('Category created');
    router.push('/risks/categories');
  } catch (err: any) {
    console.error(err);
    const data = err?.response?.data;
    if (data && typeof data === 'object') {
      const firstKey = Object.keys(data)[0];
      const firstMsg = Array.isArray(data[firstKey]) ? data[firstKey][0] : String(data[firstKey]);
      toast.error(`${firstKey}: ${firstMsg}`);
    } else {
      toast.error('Failed to create category');
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Heading */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Risk Category</h1>
              <p className="text-gray-600">Add a new category used when creating risks</p>
            </div>
            <Link href="/risks/categories">
              <Button variant="outline">Back</Button>
            </Link>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="bg-white shadow rounded-lg p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                className="border rounded-md px-3 py-2 w-full"
                placeholder="e.g., Security"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                className="border rounded-md px-3 py-2 w-full"
                rows={4}
                placeholder="Optional"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Link href="/risks/categories">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Category'}
              </Button>
            </div>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
