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
  TrashIcon,
  PencilIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  FireIcon,
  BuildingOfficeIcon,
  UserIcon,
  CalendarIcon,
  TagIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

type UUID = string;

type RiskDetail = {
  id: UUID;
  title: string;
  description: string;

  risk_level: string;
  impact_level?: string;
  probability_level?: string;
  risk_score?: number;

  status: string;

  category?: any;        // could be uuid OR object
  department?: any;      // could be uuid OR object
  project?: any;         // could be uuid OR object

  risk_owner?: any;      // could be string OR object

  reference_code?: string;
  identified_date?: string;
  review_date?: string;
  closure_date?: string;
  next_review_date?: string;

  affected_areas?: string[];
  potential_impact?: string;
  existing_controls?: string[];
  risk_treatment?: string;
  escalation_level?: number;

  created_at?: string;
  updated_at?: string;

  assessments_count?: number;
  mitigations_count?: number;
  issues_count?: number;
};

const safeText = (v: any, fallback = '—') => {
  if (v === null || v === undefined) return fallback;
  if (typeof v === 'string') return v || fallback;
  if (typeof v === 'number') return String(v);
  return fallback;
};

const safeName = (val: any) => {
  if (!val) return '—';
  if (typeof val === 'string') return val;
  return val.name || val.title || val.full_name || val.username || val.email || val.code || val.id || '—';
};

const toArray = (v: any): string[] => (Array.isArray(v) ? v.map(String) : []);

const badge = (cls: string, text: string) => (
  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${cls}`}>
    {text}
  </span>
);

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'open':
    case 'identified':
    case 'active':
      return badge('bg-red-100 text-red-800', status);
    case 'mitigated':
    case 'resolved':
      return badge('bg-green-100 text-green-800', status);
    case 'in_progress':
      return badge('bg-blue-100 text-blue-800', status);
    case 'escalated':
      return badge('bg-orange-100 text-orange-800', status);
    case 'closed':
      return badge('bg-gray-100 text-gray-800', status);
    default:
      return badge('bg-gray-100 text-gray-800', status || '—');
  }
};

const getRiskLevelBadge = (level: string) => {
  switch (level) {
    case 'high':
      return badge('bg-red-100 text-red-800', 'high');
    case 'medium':
      return badge('bg-yellow-100 text-yellow-800', 'medium');
    case 'low':
      return badge('bg-green-100 text-green-800', 'low');
    default:
      return badge('bg-gray-100 text-gray-800', level || '—');
  }
};

export default function RiskViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = String((params as any)?.id || '');

  const [loading, setLoading] = useState(true);
  const [risk, setRisk] = useState<RiskDetail | null>(null);
  const [busyAction, setBusyAction] = useState<'delete' | 'close' | 'escalate' | null>(null);

  const fetchRisk = async () => {
    try {
      setLoading(true);

      // You need this in your api client:
      // GET /api/risks/risks/:id/
      const res = await risksAPI.getRisk(id);

      // handle both {..} and {data:{..}} shapes
      const data = res?.data?.results ?? res?.data ?? res;
      setRisk(data as RiskDetail);
    } catch (e: any) {
      console.error(e);

      const status = e?.response?.status;
      if (status === 404) toast.error('Risk not found (404)');
      else toast.error('Failed to load risk details');

      setRisk(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchRisk();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onDelete = async () => {
    if (!risk?.id) return;

    const ok = confirm('Are you sure you want to delete this risk? This cannot be undone.');
    if (!ok) return;

    try {
      setBusyAction('delete');
      // You need this in api client:
      // DELETE /api/risks/risks/:id/
      await risksAPI.deleteRisk(risk.id);
      toast.success('Risk deleted');
      router.push('/risks/risks');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.detail || 'Failed to delete risk');
    } finally {
      setBusyAction(null);
    }
  };

  // Optional: only if your backend supports these endpoints
  const onClose = async () => {
    if (!risk?.id) return;
    try {
      setBusyAction('close');
      await risksAPI.closeRisk(risk.id);
      toast.success('Risk closed');
      fetchRisk();
    } catch (e: any) {
      console.error(e);
      toast.error('Failed to close risk');
    } finally {
      setBusyAction(null);
    }
  };

  const onEscalate = async () => {
    if (!risk?.id) return;
    try {
      setBusyAction('escalate');
      await risksAPI.escalateRisk(risk.id);
      toast.success('Risk escalated');
      fetchRisk();
    } catch (e: any) {
      console.error(e);
      toast.error('Failed to escalate risk');
    } finally {
      setBusyAction(null);
    }
  };

  const affectedAreas = useMemo(() => toArray(risk?.affected_areas), [risk?.affected_areas]);
  const controls = useMemo(() => toArray(risk?.existing_controls), [risk?.existing_controls]);

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Link href="/risks/risks">
                  <Button variant="outline" className="flex items-center">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Risk Details</h1>
              </div>
              <p className="text-gray-600 mt-2">View the full record and metadata for this risk.</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link href={`/risks/risks/${id}/edit`}>
                <Button variant="outline" className="flex items-center">
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>

              {/* Optional buttons */}
              <Button
                variant="outline"
                onClick={onEscalate}
                disabled={busyAction !== null || loading}
                className="text-orange-600 hover:text-orange-700"
                title="Escalate"
              >
                <ExclamationTriangleIcon className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                onClick={onClose}
                disabled={busyAction !== null || loading}
                className="text-green-600 hover:text-green-700"
                title="Close"
              >
                <CheckCircleIcon className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                onClick={onDelete}
                disabled={busyAction !== null || loading}
                className="text-red-600 hover:text-red-700"
                title="Delete"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
          ) : !risk ? (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No risk found</h3>
              <p className="mt-1 text-sm text-gray-500">This risk may have been deleted or you don’t have access.</p>
              <div className="mt-4">
                <Link href="/risks/risks">
                  <Button>Go back</Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Top summary card */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold text-gray-900 truncate">
                      {risk.title || '—'}
                    </h2>
                    <p className="text-gray-600 mt-2 whitespace-pre-wrap">
                      {risk.description || '—'}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {getStatusBadge(risk.status)}
                      {getRiskLevelBadge(risk.risk_level)}
                      {typeof risk.risk_score === 'number' && badge('bg-purple-100 text-purple-800', `score: ${risk.risk_score}`)}
                      {risk.reference_code && badge('bg-indigo-100 text-indigo-800', `ref: ${risk.reference_code}`)}
                    </div>
                  </div>

                  <div className="flex-shrink-0 w-full sm:w-80">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="rounded-lg border p-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <UserIcon className="h-4 w-4 mr-2" />
                          Owner
                        </div>
                        <div className="text-sm font-medium text-gray-900 mt-1">
                          {safeName(risk.risk_owner)}
                        </div>
                      </div>

                      <div className="rounded-lg border p-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                          Department
                        </div>
                        <div className="text-sm font-medium text-gray-900 mt-1">
                          {safeName(risk.department)}
                        </div>
                      </div>

                      <div className="rounded-lg border p-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <TagIcon className="h-4 w-4 mr-2" />
                          Category
                        </div>
                        <div className="text-sm font-medium text-gray-900 mt-1">
                          {safeName(risk.category)}
                        </div>
                      </div>

                      <div className="rounded-lg border p-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          Identified
                        </div>
                        <div className="text-sm font-medium text-gray-900 mt-1">
                          {risk.identified_date ? formatDate(risk.identified_date) : '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: scoring / dates */}
                <div className="bg-white shadow rounded-lg p-6 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900">Scoring</h3>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Impact</span>
                    <span className="font-medium text-gray-900">{safeText(risk.impact_level)}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Probability</span>
                    <span className="font-medium text-gray-900">{safeText(risk.probability_level)}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Escalation Level</span>
                    <span className="font-medium text-gray-900">{safeText(risk.escalation_level, '0')}</span>
                  </div>

                  <hr />

                  <h3 className="text-sm font-semibold text-gray-900">Dates</h3>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Review</span>
                    <span className="font-medium text-gray-900">
                      {risk.review_date ? formatDate(risk.review_date) : '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Next Review</span>
                    <span className="font-medium text-gray-900">
                      {risk.next_review_date ? formatDate(risk.next_review_date) : '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Closure</span>
                    <span className="font-medium text-gray-900">
                      {risk.closure_date ? formatDate(risk.closure_date) : '—'}
                    </span>
                  </div>
                </div>

                {/* Middle: impact/controls */}
                <div className="bg-white shadow rounded-lg p-6 space-y-4 lg:col-span-2">
                  <h3 className="text-sm font-semibold text-gray-900">Impact & Treatment</h3>

                  <div className="text-sm">
                    <div className="text-gray-600">Potential Impact</div>
                    <div className="mt-1 text-gray-900 whitespace-pre-wrap">
                      {safeText(risk.potential_impact, '') || '—'}
                    </div>
                  </div>

                  <div className="text-sm">
                    <div className="text-gray-600">Treatment</div>
                    <div className="mt-1 text-gray-900">
                      {safeText(risk.risk_treatment)}
                    </div>
                  </div>

                  <div className="text-sm">
                    <div className="text-gray-600">Existing Controls</div>
                    {controls.length ? (
                      <ul className="list-disc ml-5 mt-1 space-y-1">
                        {controls.map((c, i) => (
                          <li key={i} className="text-gray-900">{c}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="mt-1 text-gray-900">—</div>
                    )}
                  </div>

                  <div className="text-sm">
                    <div className="text-gray-600">Affected Areas</div>
                    {affectedAreas.length ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {affectedAreas.map((a, i) => (
                          <span key={i} className="inline-flex px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
                            {a}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-1 text-gray-900">—</div>
                    )}
                  </div>

                  <hr />

                  <h3 className="text-sm font-semibold text-gray-900">Counts</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-gray-600">Assessments</div>
                      <div className="text-lg font-semibold text-gray-900">{safeText(risk.assessments_count, '0')}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-gray-600">Mitigations</div>
                      <div className="text-lg font-semibold text-gray-900">{safeText(risk.mitigations_count, '0')}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-gray-600">Issues</div>
                      <div className="text-lg font-semibold text-gray-900">{safeText(risk.issues_count, '0')}</div>
                    </div>
                  </div>

                  <hr />

                  <h3 className="text-sm font-semibold text-gray-900">Audit</h3>
                  <div className="text-sm text-gray-700 space-y-1">
                    <div>Created: {risk.created_at ? formatDate(risk.created_at) : '—'}</div>
                    <div>Updated: {risk.updated_at ? formatDate(risk.updated_at) : '—'}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
