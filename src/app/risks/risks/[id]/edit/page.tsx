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

type UUID = string;

type RiskDetail = {
  id: UUID;
  title: string;
  description: string;
  probability?: number;
  impact?: number;
  risk_level?: string;
  risk_score?: number;
  status: string;

  reference_code?: string;
  identified_date?: string | null;
  target_resolution_date?: string | null;

  category?: string;   // uuid
  department?: string; // uuid
  project?: string;    // uuid
  owner?: string | null; // uuid
};

const safeStr = (v: any) => (typeof v === 'string' ? v : v == null ? '' : String(v));

export default function RiskEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = String((params as any)?.id || '');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [risk, setRisk] = useState<RiskDetail | null>(null);

  // form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('open');
  const [probability, setProbability] = useState<number | ''>('');
  const [impact, setImpact] = useState<number | ''>('');
  const [referenceCode, setReferenceCode] = useState('');
  const [identifiedDate, setIdentifiedDate] = useState<string>('');
  const [targetResolutionDate, setTargetResolutionDate] = useState<string>('');

  const fetchRisk = async () => {
    try {
      setLoading(true);
      const res = await risksAPI.getRisk(id);
      const data = res?.data ?? res;

      setRisk(data);

      // populate form
      setTitle(safeStr(data.title));
      setDescription(safeStr(data.description));
      setStatus(safeStr(data.status) || 'open');
      setProbability(typeof data.probability === 'number' ? data.probability : '');
      setImpact(typeof data.impact === 'number' ? data.impact : '');
      setReferenceCode(safeStr(data.reference_code));
      setIdentifiedDate(safeStr(data.identified_date)); // format: YYYY-MM-DD
      setTargetResolutionDate(safeStr(data.target_resolution_date));
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.detail || 'Failed to load risk');
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

  const canSave = useMemo(() => {
    return title.trim().length > 0 && description.trim().length > 0 && !saving;
  }, [title, description, saving]);

  const onSave = async () => {
    if (!risk?.id) return;

    // Build PATCH payload – only send fields your API accepts
    const payload: any = {
      title: title.trim(),
      description: description.trim(),
      status,
      reference_code: referenceCode.trim() || undefined,
      identified_date: identifiedDate || null,
      target_resolution_date: targetResolutionDate || null,
      probability: probability === '' ? null : Number(probability),
      impact: impact === '' ? null : Number(impact),
    };

    // remove undefined keys (keeps PATCH clean)
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    try {
      setSaving(true);
      await risksAPI.updateRisk(risk.id, payload);
      toast.success('Risk updated');
      router.push(`/risks/risks/${risk.id}`);
    } catch (e: any) {
      console.error(e);
      const data = e?.response?.data;

      // show DRF field errors nicely
      const msg =
        data?.detail ||
        (typeof data === 'object' ? Object.values(data)?.flat?.()?.[0] : null) ||
        'Failed to update risk';

      toast.error(String(msg));
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
              <Link href={`/risks/risks/${id}`}>
                <Button variant="outline" className="flex items-center">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Edit Risk</h1>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push(`/risks/risks/${id}`)}>
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
          ) : !risk ? (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-700">Risk not found or you don’t have access.</p>
              <div className="mt-4">
                <Link href="/risks/risks">
                  <Button>Go to Risks</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    className="mt-1 w-full border rounded-md px-3 py-2"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Risk title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    className="mt-1 w-full border rounded-md px-3 py-2"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="open">open</option>
                    <option value="escalated">escalated</option>
                    <option value="mitigated">mitigated</option>
                    <option value="closed">closed</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    className="mt-1 w-full border rounded-md px-3 py-2 min-h-[120px]"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the risk..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Reference Code</label>
                  <input
                    className="mt-1 w-full border rounded-md px-3 py-2"
                    value={referenceCode}
                    onChange={(e) => setReferenceCode(e.target.value)}
                    placeholder="e.g. RISK_001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Identified Date</label>
                  <input
                    type="date"
                    className="mt-1 w-full border rounded-md px-3 py-2"
                    value={identifiedDate}
                    onChange={(e) => setIdentifiedDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Target Resolution Date</label>
                  <input
                    type="date"
                    className="mt-1 w-full border rounded-md px-3 py-2"
                    value={targetResolutionDate}
                    onChange={(e) => setTargetResolutionDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Probability</label>
                  <input
                    type="number"
                    min={0}
                    className="mt-1 w-full border rounded-md px-3 py-2"
                    value={probability}
                    onChange={(e) => setProbability(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Impact</label>
                  <input
                    type="number"
                    min={0}
                    className="mt-1 w-full border rounded-md px-3 py-2"
                    value={impact}
                    onChange={(e) => setImpact(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="text-sm text-gray-500">
                Note: If your backend expects different field names (e.g. owner vs risk_owner), adjust the PATCH payload.
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
