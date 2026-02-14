'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { organizationAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  AcademicCapIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { z } from 'zod';
import toast from 'react-hot-toast';

// Form validation schema
const employeeSkillSchema = z.object({
  employee: z.string().min(1, 'Employee is required'),
  skill: z.string().min(1, 'Skill is required'),
  proficiency_level: z.string().min(1, 'Proficiency level is required'),
  years_of_experience: z.string().optional(),
  certification_details: z.string().optional(),
});

type EmployeeSkillFormData = z.infer<typeof employeeSkillSchema>;

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
  proficiency_levels?: string[];
}

export default function CreateEmployeeSkillPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  
  const [formData, setFormData] = useState<EmployeeSkillFormData>({
    employee: '',
    skill: '',
    proficiency_level: '',
    years_of_experience: '',
    certification_details: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const proficiencyLevels = ['beginner', 'intermediate', 'advanced', 'expert'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [employeesResponse, skillsResponse] = await Promise.all([
        organizationAPI.getEmployees(),
        organizationAPI.getSkills()
      ]);
      
      setEmployees(employeesResponse.data.results || employeesResponse.data);
      setSkills(skillsResponse.data.results || skillsResponse.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'skill') {
      const skill = skills.find(s => s.id === value);
      setSelectedSkill(skill || null);
      // Reset proficiency level when skill changes
      setFormData(prev => ({
        ...prev,
        [name]: value,
        proficiency_level: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.employee) newErrors.employee = 'Employee is required';
    if (!formData.skill) newErrors.skill = 'Skill is required';
    if (!formData.proficiency_level) newErrors.proficiency_level = 'Proficiency level is required';
    if (formData.years_of_experience && parseFloat(formData.years_of_experience) < 0) {
      newErrors.years_of_experience = 'Years of experience must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const employeeSkillData = {
        ...formData,
        years_of_experience: formData.years_of_experience ? parseFloat(formData.years_of_experience) : null,
      };

      await organizationAPI.createEmployeeSkill(employeeSkillData);
      toast.success('Employee skill assigned successfully');
      router.push('/organization/employee-skills');
    } catch (error) {
      console.error('Failed to assign employee skill:', error);
      toast.error('Failed to assign employee skill');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableProficiencyLevels = () => {
    if (selectedSkill && selectedSkill.proficiency_levels) {
      return selectedSkill.proficiency_levels;
    }
    return proficiencyLevels;
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/organization/employee-skills">
                <Button variant="outline" className="flex items-center">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Employee Skills
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Assign Employee Skill</h1>
                <p className="text-gray-600">Assign a skill to an employee</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee *
                  </label>
                  <select
                    name="employee"
                    value={formData.employee}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.employee ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Employee</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.first_name} {employee.last_name} ({employee.email})
                      </option>
                    ))}
                  </select>
                  {errors.employee && <p className="mt-1 text-sm text-red-600">{errors.employee}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skill *
                  </label>
                  <select
                    name="skill"
                    value={formData.skill}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.skill ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Skill</option>
                    {skills.map((skill) => (
                      <option key={skill.id} value={skill.id}>
                        {skill.name} {skill.category && `(${skill.category})`}
                      </option>
                    ))}
                  </select>
                  {errors.skill && <p className="mt-1 text-sm text-red-600">{errors.skill}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proficiency Level *
                  </label>
                  <select
                    name="proficiency_level"
                    value={formData.proficiency_level}
                    onChange={handleInputChange}
                    disabled={!selectedSkill}
                    className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.proficiency_level ? 'border-red-300' : 'border-gray-300'
                    } ${!selectedSkill ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  >
                    <option value="">Select Proficiency Level</option>
                    {getAvailableProficiencyLevels().map((level) => (
                      <option key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </option>
                    ))}
                  </select>
                  {errors.proficiency_level && <p className="mt-1 text-sm text-red-600">{errors.proficiency_level}</p>}
                  {!selectedSkill && (
                    <p className="mt-1 text-sm text-gray-500">Please select a skill first</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    name="years_of_experience"
                    value={formData.years_of_experience}
                    onChange={handleInputChange}
                    step="0.5"
                    min="0"
                    className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.years_of_experience ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter years of experience"
                  />
                  {errors.years_of_experience && <p className="mt-1 text-sm text-red-600">{errors.years_of_experience}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certification Details
                  </label>
                  <textarea
                    name="certification_details"
                    value={formData.certification_details}
                    onChange={handleInputChange}
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter certification details (optional)"
                  />
                </div>
              </div>

              {/* Skill Preview */}
              {selectedSkill && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Skill Details</h3>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-lg p-2">
                      <AcademicCapIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{selectedSkill.name}</p>
                      {selectedSkill.category && (
                        <p className="text-xs text-gray-500">Category: {selectedSkill.category}</p>
                      )}
                      {selectedSkill.proficiency_levels && (
                        <p className="text-xs text-gray-500">
                          Available levels: {selectedSkill.proficiency_levels.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <Link href="/organization/employee-skills">
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Assigning...
                    </>
                  ) : (
                    'Assign Skill'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
