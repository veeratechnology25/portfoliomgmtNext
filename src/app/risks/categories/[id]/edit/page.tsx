'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { risksAPI } from '@/lib/api';

import { ArrowLeftIcon } from '@heroicons/react/24/outline';

type RiskCategory = {
  id: string;
  name: string;
  description: string;
  code: string;
  parent_category?: string | null;
  status: string;
  risk_count: number;
  color_code: string;
  icon?: string | null;
  hierarchy_level: number;
};

const firstFieldError = (data: any): string | null => {
  if (!data || typeof data !== 'object') return null;
  if (typeof data.detail === 'string') return data.detail;

  for (const key of Object.keys(data)) {
    const v = data[key];
    if (Array.isArray(v) && v.length && typeof v[0] === 'string') return v[0];
  }
  return null;
};

export default function CategoryEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = String((params as any)?.id || '');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState<RiskCategory | null>(null);

  // form
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [colorCode, setColorCode] = useState('#3B82F6');
  const [icon, setIcon] = useState('');

  const canSave = useMemo(() => name.trim().length > 0 && code.trim().length > 0 && !saving, [name, code, saving]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const res = await risksAPI.getRiskCategory(id);
      const data = res?.data?.results ?? res?.data ?? res;

      setCategory(data as RiskCategory);

      setName(data?.name ?? '');
      setCode(data?.code ?? '');
      setDescription(data?.description ?? '');
      setStatus(data?.status ?? 'active');
      setColorCode(data?.color_code ?? '#3B82F6');
      setIcon(data?.icon ?? '');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.detail || 'Failed to load category');
      setCategory(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchCategory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSave = async () => {
    if (!id) return;

    const payload: any = {
      name: name.trim(),
      code: code.trim(),
      description: description.trim(),
      status,
      color_code: colorCode,
      icon: icon.trim() || null,
    };

    try {
      setSaving(true);
      await risksAPI.updateRiskCategory(id, payload);
      toast.success('Category updated');
      router.push(`/risks/categories/${id}`);
    } catch (e: any) {
      console.error(e);
      const msg = firstFieldError(e?.response?.data) || 'Failed to update category';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href={`/risks/categories/${id}`}>
                <Button variant="outline" className="flex items-center">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Edit Category</h1>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push(`/risks/categories/${id}`)}>
                Cancel
              </Button>
              <Button onClick={onSave} disabled={!canSave}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
          ) : !category ? (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-700">Category not found or you don’t have access.</p>
              <div className="mt-4">
                <Link href="/risks/categories">
                  <Button>Go to Categories</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    className="mt-1 w-full border rounded-md px-3 py-2"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Category name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Code</label>
                  <input
                    className="mt-1 w-full border rounded-md px-3 py-2"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. SEC"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    className="mt-1 w-full border rounded-md px-3 py-2 min-h-[120px]"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe this category..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    className="mt-1 w-full border rounded-md px-3 py-2"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="active">active</option>
                    <option value="inactive">inactive</option>
                    <option value="archived">archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Color Code</label>
                  <input
                    className="mt-1 w-full border rounded-md px-3 py-2"
                    value={colorCode}
                    onChange={(e) => setColorCode(e.target.value)}
                    placeholder="#3B82F6"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Icon</label>
                  <input
                    className="mt-1 w-full border rounded-md px-3 py-2"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="Optional icon name"
                  />
                </div>
              </div>

              <div className="text-sm text-gray-500">
                If your backend requires additional fields (like parent_category), add them to the payload.
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
