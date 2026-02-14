'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { risksAPI, projectsAPI, organizationAPI } from '@/lib/api';

import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

type UUID = string;

type ProjectOption = { id: UUID; name: string };
type DepartmentOption = { id: UUID; name: string };

const normalizeList = <T,>(data: any): T[] => {
  const list = data?.results ?? data;
  return Array.isArray(list) ? (list as T[]) : [];
};

export default function CreateRiskPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [projectsLoading, setProjectsLoading] = useState(false);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);

  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);

  type CategoryOption = { id: UUID; name: string };
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [form, setForm] = useState({
    reference_code: '',
    identified_date: '', // yyyy-mm-dd
    title: '',
    description: '',
    risk_level: 'medium',
    status: 'open',
    category: '',      // UUID (not text)
    project: '',
    department: '',
  });


  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  useEffect(() => {
    if (form.title) {
      setForm(p => ({
        ...p,
        reference_code: p.title.trim().toUpperCase().replace(/\s+/g, '_'),
      }));
    }
  }, [form.title]);

  // ---- Load dropdown data ----
  useEffect(() => {
    const load = async () => {
      // Projects
      try {
        setProjectsLoading(true);
        // IMPORTANT: implement this in risksAPI (see notes below)
        const res = await projectsAPI.getProjects();
        const items = normalizeList<any>(res.data);

        // adapt mapping if your project fields differ (e.g. title instead of name)
        const opts: ProjectOption[] = items
          .map((p: any) => ({
            id: String(p.id),
            name: String(p.name ?? p.title ?? p.project_name ?? p.code ?? p.id),
          }))
          .filter((p) => p.id);

        setProjects(opts);
      } catch (e: any) {
        console.error(e);
        toast.error('Failed to load projects');
        setProjects([]);
      } finally {
        setProjectsLoading(false);
      }

      // Departments
      try {
        setDepartmentsLoading(true);
        // IMPORTANT: implement this in risksAPI (see notes below)
        const res = await organizationAPI.getDepartments();
        const items = normalizeList<any>(res.data);

        const opts: DepartmentOption[] = items
          .map((d: any) => ({
            id: String(d.id),
            name: String(d.name ?? d.title ?? d.department_name ?? d.code ?? d.id),
          }))
          .filter((d) => d.id);

        setDepartments(opts);
      } catch (e: any) {
        console.error(e);
        toast.error('Failed to load departments');
        setDepartments([]);
      } finally {
        setDepartmentsLoading(false);
      }

      // Categories
      try {
        setCategoriesLoading(true);
        const res = await risksAPI.getRiskCategories(); // implement in api wrapper
        const items = normalizeList<any>(res.data);

        const opts: CategoryOption[] = items
          .map((c: any) => ({
            id: String(c.id),
            name: String(c.name ?? c.title ?? c.category_name ?? c.code ?? c.id),
          }))
          .filter((c) => c.id);

        setCategories(opts);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load categories');
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }

    };


    load();
  }, []);

  const projectSelectDisabled = projectsLoading || projects.length === 0;
  const departmentSelectDisabled = departmentsLoading || departments.length === 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.reference_code.trim()) return toast.error('Reference code is required');
    if (!form.identified_date) return toast.error('Identified date is required');
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.category) return toast.error('Category is required');

    try {
      setLoading(true);

      const payload: any = {
        reference_code: form.reference_code.trim(),
        identified_date: form.identified_date, // yyyy-mm-dd
        title: form.title.trim(),
        description: form.description?.trim() || '',
        risk_level: form.risk_level,
        status: form.status,
        category: form.category, // UUID
      };

      if (form.project) payload.project = form.project;
      if (form.department) payload.department = form.department;

      const res = await risksAPI.createRisk(payload);

      toast.success('Risk created');
      const id = res.data?.id;
      router.push(id ? `/risks/risks/${id}` : '/risks/risks');
    } catch (err: any) {
      console.error(err);

      // Show DRF field errors nicely if present
      const data = err?.response?.data;
      if (data && typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        const firstMsg = Array.isArray(data[firstKey]) ? data[firstKey][0] : String(data[firstKey]);
        toast.error(`${firstKey}: ${firstMsg}`);
      } else {
        toast.error('Failed to create risk');
      }
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Identified Date *
                </label>
                <input
                  type="date"
                  name="identified_date"
                  value={form.identified_date}
                  onChange={onChange}
                  className="border rounded-md px-3 py-2 w-full"
                />
              </div>
            </div>


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
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={onChange}
                  className="border rounded-md px-3 py-2 w-full"
                  disabled={categoriesLoading || categories.length === 0}
                >
                  <option value="">
                    {categoriesLoading
                      ? 'Loading categories...'
                      : categories.length === 0
                        ? 'No categories found'
                        : 'Select a category'}
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Dynamic dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                <select
                  name="project"
                  value={form.project}
                  onChange={onChange}
                  className="border rounded-md px-3 py-2 w-full"
                  disabled={projectSelectDisabled}
                >
                  <option value="">
                    {projectsLoading
                      ? 'Loading projects...'
                      : projects.length === 0
                        ? 'No projects found'
                        : 'Select a project (optional)'}
                  </option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {/* If you still want to allow manual UUID entry, you can add an input below */}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  name="department"
                  value={form.department}
                  onChange={onChange}
                  className="border rounded-md px-3 py-2 w-full"
                  disabled={departmentSelectDisabled}
                >
                  <option value="">
                    {departmentsLoading
                      ? 'Loading departments...'
                      : departments.length === 0
                        ? 'No departments found'
                        : 'Select a department (optional)'}
                  </option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
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
