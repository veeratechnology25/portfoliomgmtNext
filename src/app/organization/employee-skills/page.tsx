'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { organizationAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  AcademicCapIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface EmployeeSkill {
  id: string;
  employee: string;          // employee UUID
  skill: string;             // skill UUID
  skill_name: string;
  skill_category?: string;
  level: number;             // 1-4
  verified: boolean;
  verified_date?: string | null;
  created_at: string;

  // UI-enriched fields (we will add)
  employee_name?: string;
  employee_email?: string;
  proficiency_level: string; // derived from level

  years_of_experience?: number;
  certification_details?: string;
  updated_at: string;
}


interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Skill {
  id: string;
  name: string;
  category?: string;
}

export default function EmployeeSkillsPage() {
  const [employeeSkills, setEmployeeSkills] = useState<EmployeeSkill[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');
  const [proficiencyFilter, setProficiencyFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

const levelToName = (level: number) => {
  switch (level) {
    case 1: return 'beginner';
    case 2: return 'intermediate';
    case 3: return 'advanced';
    case 4: return 'expert';
    default: return 'beginner';
  }
};

const fetchData = async () => {
  try {
    setLoading(true);

    const [employeeSkillsResponse, employeesResponse, skillsResponse] = await Promise.all([
      organizationAPI.getEmployeeSkills(),
      organizationAPI.getEmployees(),
      organizationAPI.getSkills(),
    ]);

    const esList = employeeSkillsResponse.data.results || employeeSkillsResponse.data;
    const empList = employeesResponse.data.results || employeesResponse.data;
    const skillsList = skillsResponse.data.results || skillsResponse.data;

    // ✅ normalize employees: employee_id -> id
    const normalizedEmployees: Employee[] = (empList || []).map((e: any) => ({
      id: e.employee_id ?? e.id,
      first_name: e.first_name ?? e.user?.first_name ?? '',
      last_name: e.last_name ?? e.user?.last_name ?? '',
      email: e.email ?? e.user?.email ?? '',
    }));
    setEmployees(normalizedEmployees);

    setSkills(skillsList || []);

    // map employee_id -> employee info
    const empMap = new Map(
      normalizedEmployees.map((e) => [
        e.id,
        { name: `${e.first_name} ${e.last_name}`.trim(), email: e.email },
      ])
    );

    // ✅ enrich employee-skills so your UI fields exist
    const normalizedES: EmployeeSkill[] = (esList || []).map((es: any) => {
      const emp = empMap.get(es.employee);
      return {
        id: es.id,
        employee: es.employee,
        skill: es.skill,
        skill_name: es.skill_name,
        skill_category: es.skill_category,
        level: es.level,
        verified: es.verified,
        verified_date: es.verified_date,
        created_at: es.created_at,
        employee_name: emp?.name || 'Unknown employee',
        employee_email: emp?.email || '',
        proficiency_level: levelToName(es.level),
      };
    });

    setEmployeeSkills(normalizedES);
  } catch (error) {
    console.error('Failed to fetch data:', error);
    toast.error('Failed to load employee skills');
  } finally {
    setLoading(false);
  }
};


  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee skill assignment?')) {
      return;
    }

    try {
      await organizationAPI.deleteEmployeeSkill(id);
      toast.success('Employee skill deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to delete employee skill:', error);
      toast.error('Failed to delete employee skill');
    }
  };

const q = search.toLowerCase();

const filteredEmployeeSkills = employeeSkills.filter((es) => {
  const matchesSearch =
    (es.employee_name ?? '').toLowerCase().includes(q) ||
    (es.skill_name ?? '').toLowerCase().includes(q) ||
    (es.proficiency_level ?? '').toLowerCase().includes(q);

  const matchesEmployee = employeeFilter === 'all' || es.employee === employeeFilter;
  const matchesSkill = skillFilter === 'all' || es.skill === skillFilter;
  const matchesProficiency =
    proficiencyFilter === 'all' || es.proficiency_level === proficiencyFilter;

  return matchesSearch && matchesEmployee && matchesSkill && matchesProficiency;
});


  const proficiencyLevels = ['beginner', 'intermediate', 'advanced', 'expert'];

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

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Employee Skills</h1>
              <p className="text-gray-600">Manage employee skill assignments and expertise</p>
            </div>
            <div className="flex space-x-2">
              <Link href="/organization/employees">
                <Button variant="outline" className="flex items-center">
                  <UserIcon className="h-4 w-4 mr-2" />
                  Employees
                </Button>
              </Link>
              <Link href="/organization/skills">
                <Button variant="outline" className="flex items-center">
                  <AcademicCapIcon className="h-4 w-4 mr-2" />
                  Skills
                </Button>
              </Link>
              <Link href="/organization/employee-skills/create">
                <Button className="flex items-center">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Assign Skill
                </Button>
              </Link>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Skill Assignments</p>
                  <p className="text-2xl font-bold text-gray-900">{employeeSkills.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                  <UserIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Employees with Skills</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(employeeSkills.map(es => es.employee)).size}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                  <StarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Skills Used</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(employeeSkills.map(es => es.skill)).size}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search employee skills..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee
                </label>
                <select
                  value={employeeFilter}
                  onChange={(e) => setEmployeeFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Employees</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill
                </label>
                <select
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Skills</option>
                  {skills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proficiency Level
                </label>
                <select
                  value={proficiencyFilter}
                  onChange={(e) => setProficiencyFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Levels</option>
                  {proficiencyLevels.map((level) => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Employee Skills List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {filteredEmployeeSkills.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredEmployeeSkills.map((employeeSkill) => (
                  <div key={employeeSkill.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-blue-100 rounded-lg p-2">
                            <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <h3 className="text-lg font-medium text-gray-900">
                                {employeeSkill.employee_name}
                              </h3>
                              <span className="mx-2 text-gray-400">•</span>
                              <span className="text-gray-600">{employeeSkill.skill_name}</span>
                              <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getProficiencyColor(employeeSkill.proficiency_level)}`}>
                                {employeeSkill.proficiency_level}
                              </span>
                            </div>
                            <p className="text-gray-500 mt-1">{employeeSkill.employee_email}</p>
                            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                              {employeeSkill.years_of_experience && (
                                <span>
                                  {employeeSkill.years_of_experience} years experience
                                </span>
                              )}
                              <span>
                                Assigned {formatDate(employeeSkill.created_at)}
                              </span>
                            </div>
                            {employeeSkill.certification_details && (
                              <div className="mt-2">
                                <p className="text-sm text-gray-600 italic">
                                  Certification: {employeeSkill.certification_details}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex items-center space-x-2">
                        <Link href={`/organization/employee-skills/${employeeSkill.id}/edit`}>
                          <button className="text-gray-400 hover:text-blue-600">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDelete(employeeSkill.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No employee skills found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {search || employeeFilter !== 'all' || skillFilter !== 'all' || proficiencyFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'Get started by assigning skills to employees'
                  }
                </p>
                {!search && employeeFilter === 'all' && skillFilter === 'all' && proficiencyFilter === 'all' && (
                  <div className="mt-6">
                    <Link href="/organization/employee-skills/create">
                      <Button>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Assign Skill
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
