'use client';

import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { risksAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CreateRiskPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    risk_level: 'medium',
    status: 'open',
    category: '',       // swagger filter shows category as string
    project: '',        // uuid string (optional)
    department: '',     // uuid string (optional)
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) return toast.error('Title is required');

    try {
      setLoading(true);

      // Send only fields backend expects; keep optional fields conditional.
      const payload: any = {
        title: form.title.trim(),
        description: form.description?.trim() || '',
        risk_level: form.risk_level,
        status: form.status,
        category: form.category?.trim() || null,
      };

      if (form.project.trim()) payload.project = form.project.trim();
      if (form.department.trim()) payload.department = form.department.trim();

      const res = await risksAPI.createRisk(payload);

      toast.success('Risk created');
      const id = res.data?.id;
      router.push(id ? `/risks/risks/${id}` : '/risks/risks');
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.detail || 'Failed to create risk';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Risk</h1>
              <p className="text-gray-600">Add a new risk item</p>
            </div>
            <Link href="/risks/risks">
              <Button variant="outline">Back</Button>
            </Link>
          </div>

          <form onSubmit={submit} className="bg-white shadow rounded-lg p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                name="title"
                value={form.title}
                onChange={onChange}
                className="border rounded-md px-3 py-2 w-full"
                placeholder="e.g., Data security breach risk"
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
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                <select
                  name="risk_level"
                  value={form.risk_level}
                  onChange={onChange}
                  className="border rounded-md px-3 py-2 w-full"
                >
                  <option value="high">high</option>
                  <option value="medium">medium</option>
                  <option value="low">low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={onChange}
                  className="border rounded-md px-3 py-2 w-full"
                >
                  <option value="open">open</option>
                  <option value="mitigated">mitigated</option>
                  <option value="escalated">escalated</option>
                  <option value="closed">closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  name="category"
                  value={form.category}
                  onChange={onChange}
                  className="border rounded-md px-3 py-2 w-full"
                  placeholder="e.g., Security"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project (UUID)</label>
                <input
                  name="project"
                  value={form.project}
                  onChange={onChange}
                  className="border rounded-md px-3 py-2 w-full"
                  placeholder="optional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department (UUID)</label>
                <input
                  name="department"
                  value={form.department}
                  onChange={onChange}
                  className="border rounded-md px-3 py-2 w-full"
                  placeholder="optional"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Link href="/risks/risks">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Risk'}
              </Button>
            </div>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
