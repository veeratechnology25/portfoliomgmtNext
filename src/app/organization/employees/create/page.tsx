'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { organizationAPI, authAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
    ArrowLeftIcon,
    PlusIcon,
    UserIcon,
    BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { getRoleDisplayName } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

type Department = {
    id: string;
    name: string;
    code?: string;
};

type CreateEmployeePayload = {
    user_id: string;          // ✅ required (employee user id)

    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    role: string;
    department?: string; // usually backend expects department id
    job_title?: string;
    hire_date?: string; // YYYY-MM-DD
    salary?: string; // keep string to match your detail page parsing
    status: string;
};

export default function EmployeeCreatePage() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);

    // departments (optional)
    const [departments, setDepartments] = useState<Department[]>([]);
    const [depsLoading, setDepsLoading] = useState(true);
    const { user } = useAuth();
    const loggedInUserId = user?.id;

    const ROLE_OPTIONS = useMemo(
        () => ['employee', 'manager', 'project_manager', 'hr', 'admin'],
        []
    );

    const STATUS_OPTIONS = useMemo(
        () => ['active', 'inactive', 'on_leave', 'terminated'],
        []
    );


    const [form, setForm] = useState<CreateEmployeePayload>({
        user_id: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: 'employee',
        department: '',
        job_title: '',
        hire_date: '',
        salary: '',
        status: 'active',
    });

    useEffect(() => {
        // If your backend has departments endpoint, load it
        const loadDepartments = async () => {
            try {
                setDepsLoading(true);

                // If you DON'T have this endpoint, remove this call and just keep a text input.
                // Expected shapes supported:
                // - { data: { results: [...] } }
                // - { data: [...] }
                const res = await organizationAPI.getDepartments?.();
                if (!res) {
                    setDepartments([]);
                    return;
                }

                const data = res.data?.results ?? res.data ?? [];
                setDepartments(data);
            } catch (e) {
                // Don't block create if departments fail
                setDepartments([]);
            } finally {
                setDepsLoading(false);
            }

            // const meRes = await authAPI.getUser();
            // const loggedInUserId = meRes.data.id;

        };

        loadDepartments();
    }, []);

    const setField = <K extends keyof CreateEmployeePayload>(key: K, value: CreateEmployeePayload[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const canSubmit =
        form.first_name.trim() &&
        form.last_name.trim() &&
        form.email.trim() &&
        form.job_title?.trim() &&
        form.hire_date?.trim() &&
        form.role &&
        form.status;


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) {
            toast.error('Please fill required fields');
            return;
        }

        try {
            setLoading(true);
            // get logged-in user id
            const meRes = await authAPI.getUser();   // <-- or from context
            const loggedInUserId = meRes.data.id;

            const payload = {
                user_id: loggedInUserId,   // ✅ ADD THIS LINE
                // Build payload: only send what backend expects
                // Common backend expectation: department is department_id string or null.

                first_name: form.first_name.trim(),
                last_name: form.last_name.trim(),
                email: form.email.trim(),
                role: form.role,
                status: form.status,
                phone: form.phone?.trim() || null,
                job_title: form.job_title?.trim() || null,
                hire_date: form.hire_date?.trim() || null,
                salary: form.salary?.trim() || null,
                department: form.department?.trim() || null, // dept id or null
            };

            if (form.phone?.trim()) payload.phone = form.phone.trim();
            if (form.job_title?.trim()) payload.job_title = form.job_title.trim();
            if (form.hire_date?.trim()) payload.hire_date = form.hire_date.trim();
            if (form.salary?.trim()) payload.salary = form.salary.trim();
            if (form.department?.trim()) payload.department = form.department.trim(); // dept id

            // ✅ Your backend call
            // Must exist in organizationAPI: createEmployee(payload)
            const res = await organizationAPI.createEmployee(payload);

            // Support common response shapes:
            // - { data: { id: '...' } }
            // - { data: { employee: { id } } }
            // - { data: { result: { id } } }
            const created =
                res?.data?.employee ??
                res?.data?.result ??
                res?.data;

            const createdId = created?.id;

            if (!createdId) {
                toast.success('Employee created');
                router.push('/organization/employees');
                return;
            }

            toast.success('Employee created successfully');
            router.push(`/organization/employees/${createdId}`);
        } catch (error: any) {
            console.error('Failed to create employee:', error);

            // Try to show server message if provided
            const msg =
                error?.response?.data?.message ||
                error?.response?.data?.detail ||
                error?.message ||
                'Failed to create employee';

            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <Layout>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Link href="/organization/employees">
                                <Button variant="outline" size="sm" className="mr-4">
                                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                    Back to Employees
                                </Button>
                            </Link>

                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Add Employee</h1>
                                <p className="text-gray-600">Create a new employee record</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Button onClick={handleSubmit as any} disabled={!canSubmit || loading}>
                                <PlusIcon className="h-4 w-4 mr-2" />
                                {loading ? 'Creating...' : 'Create'}
                            </Button>
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center mb-6">
                            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                                <UserIcon className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <h2 className="text-xl font-semibold text-gray-900">Employee Information</h2>
                                <p className="text-gray-500">Fill in the details below</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        value={form.first_name}
                                        onChange={(e) => setField('first_name', e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="John"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        value={form.last_name}
                                        onChange={(e) => setField('last_name', e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Doe"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setField('email', e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="john.doe@company.com"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                    <input
                                        value={form.phone ?? ''}
                                        onChange={(e) => setField('phone', e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>
                            </div>

                            {/* Work */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                    <select
                                        value={form.role}
                                        onChange={(e) => setField('role', e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    >
                                        {ROLE_OPTIONS.map((r) => (
                                            <option key={r} value={r}>
                                                {getRoleDisplayName(r)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => setField('status', e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    >
                                        {STATUS_OPTIONS.map((s) => (
                                            <option key={s} value={s}>
                                                {s.replace('_', ' ').toUpperCase()}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                                    <div className="flex items-center">
                                        <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-2" />
                                        {departments.length > 0 ? (
                                            <select
                                                value={form.department ?? ''}
                                                onChange={(e) => setField('department', e.target.value)}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                disabled={depsLoading}
                                            >
                                                <option value="">Not assigned</option>
                                                {departments.map((d) => (
                                                    <option key={d.id} value={d.id}>
                                                        {d.name}{d.code ? ` (${d.code})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                value={form.department ?? ''}
                                                onChange={(e) => setField('department', e.target.value)}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                placeholder="(Optional) Department ID"
                                            />
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        If your backend requires department ID, select it here.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Job_title</label>
                                    <input
                                        value={form.job_title ?? ''}
                                        onChange={(e) => setField('job_title', e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Senior Developer"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Hire Date</label>
                                    <input
                                        type="date"
                                        value={form.hire_date ?? ''}
                                        onChange={(e) => setField('hire_date', e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Salary</label>
                                    <input
                                        value={form.salary ?? ''}
                                        onChange={(e) => setField('salary', e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="50000"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3">
                                <Link href="/organization/employees">
                                    <Button type="button" variant="outline">Cancel</Button>
                                </Link>
                                <Button type="submit" disabled={!canSubmit || loading}>
                                    {loading ? 'Creating...' : 'Create Employee'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
