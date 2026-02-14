'use client';

import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { organizationAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { z } from 'zod';
import toast from 'react-hot-toast';

// Form validation schema
const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  proficiency_levels: z.string().optional(),
});

type SkillFormData = z.infer<typeof skillSchema>;

export default function CreateSkillPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<SkillFormData>({
    name: '',
    description: '',
    category: '',
    proficiency_levels: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    'Technical',
    'Management',
    'Communication',
    'Design',
    'Marketing',
    'Finance',
    'Sales',
    'Customer Service',
    'Operations',
    'Legal',
    'HR',
    'Other'
  ];

  const proficiencyLevelOptions = [
    'Beginner',
    'Intermediate',
    'Advanced',
    'Expert'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Skill name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const skillData = {
        ...formData,
        proficiency_levels: formData.proficiency_levels ? formData.proficiency_levels.split(',').map(level => level.trim()) : [],
      };

      await organizationAPI.createSkill(skillData);
      toast.success('Skill created successfully');
      router.push('/organization/skills');
    } catch (error) {
      console.error('Failed to create skill:', error);
      toast.error('Failed to create skill');
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
            <div className="flex items-center space-x-4">
              <Link href="/organization/skills">
                <Button variant="outline" className="flex items-center">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Skills
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create Skill</h1>
                <p className="text-gray-600">Add a new skill to the system</p>
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
                    Skill Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter skill name"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter skill description"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proficiency Levels
                  </label>
                  <input
                    type="text"
                    name="proficiency_levels"
                    value={formData.proficiency_levels}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter comma-separated proficiency levels (e.g., Beginner, Intermediate, Advanced, Expert)"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Common levels: {proficiencyLevelOptions.join(', ')}
                  </p>
                </div>
              </div>

              {/* Common Categories */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Common Categories</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category }))}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Common Proficiency Levels */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Common Proficiency Levels</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {proficiencyLevelOptions.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => {
                        const currentLevels = formData.proficiency_levels ? formData.proficiency_levels.split(',').map(l => l.trim()) : [];
                        if (!currentLevels.includes(level)) {
                          setFormData(prev => ({ 
                            ...prev, 
                            proficiency_levels: [...currentLevels, level].join(', ')
                          }));
                        }
                      }}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <Link href="/organization/skills">
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
                      Creating...
                    </>
                  ) : (
                    'Create Skill'
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
