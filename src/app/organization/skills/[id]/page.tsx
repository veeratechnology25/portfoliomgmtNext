'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { organizationAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeftIcon,
  AcademicCapIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  StarIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Skill {
  id: string;
  name: string;
  description?: string;
  category?: string;
  proficiency_levels?: string[];
  employee_count?: number;
  created_at: string;
  updated_at: string;
}

interface EmployeeSkill {
  id: string;
  employee: string;
  employee_name: string;
  employee_email: string;
  skill: string;
  skill_name: string;
  proficiency_level: string;
  years_of_experience?: number;
  certification_details?: string;
  created_at: string;
}

export default function SkillDetailPage({ params }: { params: { id: string } }) {
  const [skill, setSkill] = useState<Skill | null>(null);
  const [employeeSkills, setEmployeeSkills] = useState<EmployeeSkill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch skill details
      const skillResponse = await organizationAPI.getSkill(params.id);
      setSkill(skillResponse.data);
      
      // Fetch employees with this skill
      const employeeSkillsResponse = await organizationAPI.getEmployeeSkills({ skill: params.id });
      setEmployeeSkills(employeeSkillsResponse.data.results || employeeSkillsResponse.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load skill details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this skill? This action cannot be undone.')) {
      return;
    }

    try {
      await organizationAPI.deleteSkill(params.id);
      toast.success('Skill deleted successfully');
      window.location.href = '/organization/skills';
    } catch (error) {
      console.error('Failed to delete skill:', error);
      toast.error('Failed to delete skill');
    }
  };

  const getProficiencyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-blue-100 text-blue-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
      case 'expert': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
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

  if (!skill) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-12">
            <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Skill not found</h3>
            <p className="mt-1 text-sm text-gray-500">The skill you're looking for doesn't exist.</p>
            <div className="mt-6">
              <Link href="/organization/skills">
                <Button>
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Skills
                </Button>
              </Link>
            </div>
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
            <div className="flex items-center">
              <Link href="/organization/skills">
                <Button variant="outline" size="sm" className="mr-4">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Skills
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{skill.name}</h1>
                <p className="text-gray-600">Skill Details</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link href={`/organization/skills/${params.id}/edit`}>
                <Button variant="outline">
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          {/* Skill Overview */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <AcademicCapIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-900">{skill.name}</h2>
                  {skill.category && (
                    <p className="text-gray-500">{skill.category}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {skill.employee_count || 0}
                </p>
                <p className="text-sm text-gray-500">Employees</p>
              </div>
            </div>

            {skill.description && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                <p className="text-gray-600">{skill.description}</p>
              </div>
            )}

            {/* Skill Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Category</h3>
                <p className="text-gray-900">{skill.category || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Employee Count</h3>
                <p className="text-gray-900">{skill.employee_count || 0} employees</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Created Date</h3>
                <p className="text-gray-900">{formatDate(skill.created_at)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Last Updated</h3>
                <p className="text-gray-900">{formatDate(skill.updated_at)}</p>
              </div>
            </div>

            {/* Proficiency Levels */}
            {skill.proficiency_levels && skill.proficiency_levels.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Proficiency Levels</h3>
                <div className="flex flex-wrap gap-2">
                  {skill.proficiency_levels.map((level, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 text-xs font-medium rounded-full ${getProficiencyColor(level)}`}
                    >
                      {level}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Employees with this Skill */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Employees with this Skill</h3>
              <Link href="/organization/employees">
                <Button variant="outline" size="sm">View All Employees</Button>
              </Link>
            </div>
            
            {employeeSkills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employeeSkills.map((employeeSkill) => (
                  <div key={employeeSkill.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{employeeSkill.employee_name}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getProficiencyColor(employeeSkill.proficiency_level)}`}>
                        {employeeSkill.proficiency_level}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">{employeeSkill.employee_email}</p>
                    {employeeSkill.years_of_experience && (
                      <p className="text-sm text-gray-600 mb-1">
                        {employeeSkill.years_of_experience} years experience
                      </p>
                    )}
                    {employeeSkill.certification_details && (
                      <p className="text-xs text-gray-500 italic">
                        {employeeSkill.certification_details}
                      </p>
                    )}
                    <div className="mt-3">
                      <Link href={`/organization/employees/${employeeSkill.employee}`}>
                        <Button variant="outline" size="sm">View Employee</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No employees with this skill</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Employees assigned this skill will appear here.
                </p>
                <div className="mt-6">
                  <Link href="/organization/employees">
                    <Button variant="outline">Manage Employees</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href={`/organization/skills/${params.id}/edit`}>
                <Button variant="outline" className="w-full justify-center">
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Skill
                </Button>
              </Link>
              <Link href="/organization/employee-skills">
                <Button variant="outline" className="w-full justify-center">
                  <UserGroupIcon className="h-4 w-4 mr-2" />
                  Manage Employee Skills
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-center text-red-600 hover:text-red-700">
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete Skill
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
