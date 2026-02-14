'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { risksAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';

import {
  ArrowLeftIcon,
  FolderIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

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
  created_by: string;
  created_at: string;
  updated_at: string;
  last_used?: string | null;
  hierarchy_level: number;
  subcategories?: RiskCategory[];
};

const statusBadge = (status: string) => {
  const base = 'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full';
  if (status === 'active') return `${base} bg-green-100 text-green-800`;
  if (status === 'inactive') return `${base} bg-gray-100 text-gray-800`;
  if (status === 'archived') return `${base} bg-red-100 text-red-800`;
  return `${base} bg-gray-100 text-gray-800`;
};

const statusIcon = (status: string) => {
  if (status === 'active') return <CheckCircleIcon className="h-4 w-4" />;
  if (status === 'inactive') return <ClockIcon className="h-4 w-4" />;
  if (status === 'archived') return <XCircleIcon className="h-4 w-4" />;
  return <ClockIcon className="h-4 w-4" />;
};

export default function CategoryViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = String((params as any)?.id || '');

  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<RiskCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const res = await risksAPI.getRiskCategory(id);
      const data = res?.data?.results ?? res?.data ?? res;
      setCategory(data as RiskCategory);
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

  const onDelete = async () => {
    if (!id) return;
    const ok = confirm('Delete this category? This cannot be undone.');
    if (!ok) return;

    try {
      setDeleting(true);
      await risksAPI.deleteRiskCategory(id);
      toast.success('Category deleted');
      router.push('/risks/categories');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.detail || 'Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  const subcats = useMemo(() => category?.subcategories ?? [], [category?.subcategories]);

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Link href="/risks/categories">
                  <Button variant="outline" className="flex items-center">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Category Details</h1>
              </div>
              <p className="text-gray-600 mt-2">View risk category information.</p>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/risks/categories/${id}/edit`}>
                <Button variant="outline" className="flex items-center">
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>

              <Button
                variant="outline"
                onClick={onDelete}
                disabled={deleting || loading}
                className="text-red-600 hover:text-red-700"
                title="Delete"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
          ) : !category ? (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No category found</h3>
              <p className="mt-1 text-sm text-gray-500">This category may have been deleted or you don’t have access.</p>
              <div className="mt-4">
                <Link href="/risks/categories">
                  <Button>Go back</Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div
                        className="rounded-lg p-2"
                        style={{ backgroundColor: `${category.color_code}20` }}
                      >
                        <FolderIcon className="h-6 w-6" style={{ color: category.color_code }} />
                      </div>

                      <div className="min-w-0">
                        <h2 className="text-xl font-semibold text-gray-900 truncate">{category.name}</h2>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className={statusBadge(category.status)}>
                            <span className="flex items-center">
                              {statusIcon(category.status)}
                              <span className="ml-1">{category.status}</span>
                            </span>
                          </span>
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            {category.code}
                          </span>
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            Level {category.hierarchy_level}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="mt-4 text-gray-700 whitespace-pre-wrap">{category.description}</p>

                    {category.parent_category && (
                      <div className="mt-3 text-sm text-gray-600">
                        <span className="font-medium">Parent:</span> {category.parent_category}
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0 w-full sm:w-80">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="rounded-lg border p-3">
                        <div className="text-xs text-gray-600">Risks Assigned</div>
                        <div className="text-lg font-semibold text-gray-900">{category.risk_count}</div>
                      </div>

                      <div className="rounded-lg border p-3">
                        <div className="text-xs text-gray-600">Created</div>
                        <div className="text-sm font-medium text-gray-900">{formatDate(category.created_at)}</div>
                      </div>

                      <div className="rounded-lg border p-3">
                        <div className="text-xs text-gray-600">Updated</div>
                        <div className="text-sm font-medium text-gray-900">{formatDate(category.updated_at)}</div>
                      </div>

                      {category.last_used && (
                        <div className="rounded-lg border p-3">
                          <div className="text-xs text-gray-600">Last Used</div>
                          <div className="text-sm font-medium text-gray-900">{formatDate(category.last_used)}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {subcats.length > 0 && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-gray-900">Subcategories</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {subcats.map((s) => (
                      <span
                        key={s.id}
                        className="inline-flex px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800"
                      >
                        {s.name} ({s.risk_count})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
