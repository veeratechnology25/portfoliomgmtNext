'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { resourcesAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function LeaveRequestViewPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const fetchOne = async () => {
      try {
        setLoading(true)
        const res = await resourcesAPI.getLeaveRequest(id)
        setData(res.data)
      } catch (e: any) {
        console.error(e)
        toast.error('Failed to load leave request')
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchOne()
  }, [id])

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  if (!data) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="p-6 bg-white rounded-lg shadow">
            <p className="text-red-600">Leave request not found.</p>
            <div className="mt-4">
              <Link href="/resources/leave-requests">
                <Button variant="outline">Back</Button>
              </Link>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Leave Request</h1>
              <p className="text-gray-600">ID: {id}</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push(`/resources/leave-requests/${id}/edit`)}>
                Edit
              </Button>
              <Link href="/resources/leave-requests">
                <Button variant="outline">Back</Button>
              </Link>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Employee</p>
                <p className="font-medium">{data.employee_name || data.employee?.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">{data.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Leave Type</p>
                <p className="font-medium">{data.leave_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Days</p>
                <p className="font-medium">{data.total_days ?? '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Start Date</p>
                <p className="font-medium">{data.start_date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">End Date</p>
                <p className="font-medium">{data.end_date}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Reason</p>
              <p className="mt-1 whitespace-pre-wrap">{data.reason}</p>
            </div>

            {data.handover_notes && (
              <div>
                <p className="text-sm text-gray-500">Notes</p>
                <p className="mt-1 whitespace-pre-wrap">{data.handover_notes}</p>
              </div>
            )}

            {data.attachment && (
              <div>
                <p className="text-sm text-gray-500">Attachment</p>
                <a className="text-blue-600 underline" href={data.attachment} target="_blank" rel="noreferrer">
                  View attachment
                </a>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}