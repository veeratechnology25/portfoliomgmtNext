'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { 
  FolderIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  CogIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">PFMS</h1>
              <span className="ml-2 text-gray-600">Portfolio Management System</span>
            </div>
            <div className="flex space-x-4">
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              Manage Your
              <span className="text-blue-600"> Projects</span> with Confidence
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Comprehensive portfolio management solution for teams of all sizes. Track projects, manage budgets, and optimize resources.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start Free Trial
                  </Button>
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link href="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">
                Everything You Need to Manage Projects
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                Powerful features to help your team collaborate and deliver projects on time and within budget.
              </p>
            </div>

            <div className="mt-12">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                <div className="pt-6">
                  <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-md shadow-lg">
                          <FolderIcon className="h-6 w-6 text-blue-600" />
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                        Project Management
                      </h3>
                      <p className="mt-5 text-base text-gray-500">
                        Plan, track, and manage projects from start to finish with intuitive tools and real-time collaboration.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-green-100 rounded-md shadow-lg">
                          <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                        Budget Tracking
                      </h3>
                      <p className="mt-5 text-base text-gray-500">
                        Monitor expenses, track budget utilization, and get insights into your financial performance.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-md shadow-lg">
                          <UserGroupIcon className="h-6 w-6 text-purple-600" />
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                        Team Collaboration
                      </h3>
                      <p className="mt-5 text-base text-gray-500">
                        Manage team members, assign tasks, and foster collaboration across departments and projects.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-yellow-100 rounded-md shadow-lg">
                          <ChartBarIcon className="h-6 w-6 text-yellow-600" />
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                        Analytics & Reports
                      </h3>
                      <p className="mt-5 text-base text-gray-500">
                        Get detailed insights into project performance, resource utilization, and team productivity.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600">
          <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white">
              Ready to get started?
            </h2>
            <p className="mt-4 text-lg leading-6 text-blue-200">
              Join thousands of teams already using PFMS to manage their projects more efficiently.
            </p>
            <div className="mt-8">
              <Link href="/register">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50">
                  Start Your Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-base text-gray-500">
              &copy; 2024 Portfolio Management System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
// org complete 
