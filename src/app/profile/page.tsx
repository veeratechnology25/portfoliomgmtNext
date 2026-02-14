'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import {
  UserIcon,
  CameraIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  KeyIcon,
  PencilIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/utils';

interface UserProfile {
  id: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    phone: string;
    department?: {
      id: string;
      name: string;
    };
  };
  avatar?: string;
  bio?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  created_at: string;
  updated_at: string;
}

interface LoginHistory {
  id: string;
  ip_address: string;
  user_agent: string;
  login_time: string;
  logout_time?: string;
  success: boolean;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    bio: '',
    date_of_birth: '',
    address: '',
    city: '',
    country: '',
    postal_code: '',
  });

  useEffect(() => {
    fetchProfile();
    fetchLoginHistory();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getUser();
      
      // Create profile structure from user response
      const profileData = {
        id: response.data.id,
        user: response.data,
        bio: '', // Will be fetched from profile endpoint if needed
        date_of_birth: '',
        address: '',
        city: '',
        country: '',
        postal_code: '',
        created_at: response.data.date_joined,
        updated_at: new Date().toISOString(),
      };
      
      setProfile(profileData);
      setFormData({
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        phone: response.data.phone || '',
        bio: profileData.bio,
        date_of_birth: profileData.date_of_birth,
        address: profileData.address,
        city: profileData.city,
        country: profileData.country,
        postal_code: profileData.postal_code,
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setErrorMessage('Failed to load profile data');
      // Fallback to mock data
      const mockProfile: UserProfile = {
        id: '1',
        user: {
          id: '1',
          email: user?.email || 'john.doe@example.com',
          first_name: 'John',
          last_name: 'Doe',
          role: 'employee',
          phone: '+1 234 567 8900',
          department: {
            id: '1',
            name: 'Engineering',
          },
        },
        bio: 'Passionate software developer with expertise in web technologies and project management.',
        date_of_birth: '1990-01-15',
        address: '123 Main Street',
        city: 'New York',
        country: 'United States',
        postal_code: '10001',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T10:30:00Z',
      };
      setProfile(mockProfile);
      setFormData({
        first_name: mockProfile.user.first_name,
        last_name: mockProfile.user.last_name,
        phone: mockProfile.user.phone,
        bio: mockProfile.bio || '',
        date_of_birth: mockProfile.date_of_birth || '',
        address: mockProfile.address || '',
        city: mockProfile.city || '',
        country: mockProfile.country || '',
        postal_code: mockProfile.postal_code || '',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLoginHistory = async () => {
    try {
      // Mock login history since we don't have the endpoint
      const mockHistory: LoginHistory[] = [
        {
          id: '1',
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          login_time: '2024-01-20T09:00:00Z',
          logout_time: '2024-01-20T17:30:00Z',
          success: true,
        },
        {
          id: '2',
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          login_time: '2024-01-19T08:45:00Z',
          logout_time: '2024-01-19T18:15:00Z',
          success: true,
        },
        {
          id: '3',
          ip_address: '192.168.1.101',
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          login_time: '2024-01-18T09:30:00Z',
          logout_time: '2024-01-18T17:00:00Z',
          success: true,
        },
      ];
      setLoginHistory(mockHistory);
    } catch (error) {
      console.error('Failed to fetch login history:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Update user basic info
      const userData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
      };

      await authAPI.updateProfile(userData);
      
      // Update local state
      if (profile) {
        const updatedProfile = {
          ...profile,
          user: {
            ...profile.user,
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone: formData.phone,
          },
          bio: formData.bio,
          date_of_birth: formData.date_of_birth,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          postal_code: formData.postal_code,
        };
        setProfile(updatedProfile);
      }

      setSuccessMessage('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setErrorMessage('Failed to update profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'project_manager':
        return 'bg-green-100 text-green-800';
      case 'team_lead':
        return 'bg-yellow-100 text-yellow-800';
      case 'finance':
        return 'bg-orange-100 text-orange-800';
      case 'hr':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      admin: 'System Administrator',
      manager: 'Department Manager',
      project_manager: 'Project Manager',
      team_lead: 'Team Lead',
      employee: 'Regular Employee',
      finance: 'Finance Department',
      hr: 'HR Department',
    };
    return roleLabels[role] || role;
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600">Manage your personal information and account settings</p>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm text-green-800">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white shadow rounded-lg">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {['overview', 'security', 'activity'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-6 text-sm font-medium border-b-2 ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Profile Header */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center">
                        {profile?.avatar ? (
                          <img
                            src={profile.avatar}
                            alt="Profile"
                            className="h-24 w-24 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-medium text-gray-700">
                            {profile?.user.first_name?.charAt(0)}
                            {profile?.user.last_name?.charAt(0)}
                          </span>
                        )}
                      </div>
                      <button className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 text-white hover:bg-blue-700">
                        <CameraIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {profile?.user.first_name} {profile?.user.last_name}
                      </h2>
                      <p className="text-gray-600">{profile?.user.email}</p>
                      <div className="flex items-center space-x-3 mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(profile?.user.role || '')}`}>
                          <ShieldCheckIcon className="h-3 w-3 mr-1" />
                          {getRoleLabel(profile?.user.role || '')}
                        </span>
                        {profile?.user.department && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                            {profile.user.department.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => setEditing(!editing)}
                        variant="outline"
                        className="flex items-center"
                      >
                        <PencilIcon className="h-4 w-4 mr-2" />
                        {editing ? 'Cancel' : 'Edit Profile'}
                      </Button>
                    </div>
                  </div>

                  {/* Edit Form */}
                  {editing ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name
                          </label>
                          <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name
                          </label>
                          <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            name="date_of_birth"
                            value={formData.date_of_birth}
                            onChange={handleInputChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bio
                        </label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          rows={4}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address
                          </label>
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Country
                          </label>
                          <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Postal Code
                          </label>
                          <input
                            type="text"
                            name="postal_code"
                            value={formData.postal_code}
                            onChange={handleInputChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setEditing(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={updating}>
                          {updating ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    /* Profile Details */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="text-sm font-medium text-gray-900">{profile?.user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <PhoneIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="text-sm font-medium text-gray-900">{profile?.user.phone || 'Not provided'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <CalendarIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Date of Birth</p>
                            <p className="text-sm font-medium text-gray-900">
                              {profile?.date_of_birth ? formatDate(profile.date_of_birth) : 'Not provided'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <MapPinIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="text-sm font-medium text-gray-900">
                              {[profile?.city, profile?.country].filter(Boolean).join(', ') || 'Not provided'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <UserIcon className="h-5 w-5 text-gray-400 mt-1" />
                          <div>
                            <p className="text-sm text-gray-500">Bio</p>
                            <p className="text-sm text-gray-900">{profile?.bio || 'No bio provided'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
                  <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                      <div className="flex">
                        <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" />
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">Password Change</h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>For security reasons, password changes must be done through a separate process.</p>
                            <Button variant="outline" className="mt-2 flex items-center">
                              <KeyIcon className="h-4 w-4 mr-2" />
                              Change Password
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Login History</h3>
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    {loginHistory.length === 0 ? (
                      <div className="text-center py-12">
                        <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No login history</h3>
                        <p className="mt-1 text-sm text-gray-500">Your login activity will appear here</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Login Time
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Logout Time
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                IP Address
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {loginHistory.map((login) => (
                              <tr key={login.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {formatDate(login.login_time)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {login.logout_time ? formatDate(login.logout_time) : 'Still active'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {login.ip_address}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    login.success
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {login.success ? 'Success' : 'Failed'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
