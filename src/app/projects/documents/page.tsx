'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { projectsAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  DocumentIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import { formatDate, formatFileSize } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface ProjectDocument {
  id: string;
  title: string;
  description?: string;
  file_name: string;
  file_type: string;
  file_size: number;
  project_name?: string;
  project_id?: string;
  uploaded_by_name?: string;
  uploaded_at: string;
  updated_at: string;
  is_public: boolean;
  version: number;
  download_count?: number;
}

export default function ProjectDocumentsPage() {
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchingRef = useRef(false);

useEffect(() => {
  if (fetchingRef.current) return;
  fetchingRef.current = true;

  fetchData().finally(() => {
    fetchingRef.current = false;
  });
}, []);


  // useEffect(() => {
  //   fetchData();
  // }, []);

const fetchData = async () => {
  try {
    setLoading(true);

    const projectsResponse = await projectsAPI.getProjects();
    const projectsData = projectsResponse.data.results || projectsResponse.data || [];
    setProjects(projectsData);

    const results = await Promise.allSettled(
      projectsData.map(async (project: any) => {
        const documentsResponse = await projectsAPI.getProjectDocuments(project.id);
        const docs = documentsResponse.data.results || documentsResponse.data || [];
        return docs.map((doc: any) => ({
          ...doc,
          project_name: project.name,
          project_id: project.id,
        }));
      })
    );

    const allDocuments = results
      .filter((r): r is PromiseFulfilledResult<any[]> => r.status === "fulfilled")
      .flatMap((r) => r.value);

    setDocuments(allDocuments);
  } catch (error: any) {
    console.error("Failed to fetch data:", error);
    toast.error("Failed to load documents");
  } finally {
    setLoading(false);
  }
};


  const handleDelete = async (projectId: string, documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await projectsAPI.deleteProjectDocument(projectId, documentId);
      toast.success('Document deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to delete document:', error);
      toast.error('Failed to delete document');
    }
  };

  const handleDownload = async (projectId: string, documentId: string, fileName: string) => {
    try {
      const response = await projectsAPI.downloadProjectDocument(projectId, documentId);
      
      // Create blob from response
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      
      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Document downloaded successfully');
    } catch (error) {
      console.error('Failed to download document:', error);
      toast.error('Failed to download document');
    }
  };

  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return <DocumentIcon className="h-5 w-5 text-red-500" />;
    if (type.includes('doc') || type.includes('word')) return <DocumentIcon className="h-5 w-5 text-blue-500" />;
    if (type.includes('xls') || type.includes('excel')) return <DocumentIcon className="h-5 w-5 text-green-500" />;
    if (type.includes('ppt') || type.includes('powerpoint')) return <DocumentIcon className="h-5 w-5 text-orange-500" />;
    if (type.includes('image')) return <DocumentIcon className="h-5 w-5 text-purple-500" />;
    if (type.includes('video')) return <DocumentIcon className="h-5 w-5 text-pink-500" />;
    return <DocumentIcon className="h-5 w-5 text-gray-500" />;
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase()) ||
                         (doc.description?.toLowerCase().includes(search.toLowerCase()) || '') ||
                         (doc.file_name?.toLowerCase().includes(search.toLowerCase()) || '') ||
                         (doc.project_name?.toLowerCase().includes(search.toLowerCase()) || '');
    const matchesProject = projectFilter === 'all' || doc.project_id === projectFilter;
    const matchesType = typeFilter === 'all' || doc.file_type.includes(typeFilter);

    return matchesSearch && matchesProject && matchesType;
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => 
    new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
  );

  const fileTypes = [...new Set(documents.map(doc => doc.file_type.split('/')[0]))];

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
              <h1 className="text-2xl font-bold text-gray-900">Project Documents</h1>
              <p className="text-gray-600">Manage project documents and files</p>
            </div>
            <Link href="/projects/documents/create">
              <Button className="flex items-center">
                <PlusIcon className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Documents
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
                    placeholder="Search documents..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project
                </label>
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Projects</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Types</option>
                  {fileTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Documents Grid */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {sortedDocuments.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {sortedDocuments.map((doc) => (
                  <div key={`${doc.project_id}-${doc.id}`} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-gray-100 rounded-lg p-2">
                            {getFileIcon(doc.file_type)}
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <h3 className="text-lg font-medium text-gray-900">{doc.title}</h3>
                              <span className="ml-3 text-sm text-gray-500">v{doc.version}</span>
                              {!doc.is_public && (
                                <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                  Private
                                </span>
                              )}
                            </div>
                            <div className="flex items-center mt-1">
                              <span className="text-sm text-gray-500">{doc.file_name}</span>
                              <span className="mx-2 text-gray-300">•</span>
                              <span className="text-sm text-gray-500">{formatFileSize(doc.file_size)}</span>
                              {doc.project_name && (
                                <>
                                  <span className="mx-2 text-gray-300">•</span>
                                  <Link href={`/projects/${doc.project_id}`} className="text-sm text-blue-600 hover:text-blue-800">
                                    {doc.project_name}
                                  </Link>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {doc.description && (
                          <div className="mt-3">
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {doc.description}
                            </p>
                          </div>
                        )}

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <UserIcon className="h-4 w-4 mr-2" />
                            {doc.uploaded_by_name || 'Unknown'}
                          </div>

                          <div className="flex items-center text-sm text-gray-500">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            {formatDate(doc.uploaded_at)}
                          </div>

                          {doc.download_count !== undefined && (
                            <div className="flex items-center text-sm text-gray-500">
                              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                              {doc.download_count} downloads
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="ml-4 flex items-center space-x-2">
                        <button
                          onClick={() => handleDownload(doc.project_id!, doc.id, doc.file_name)}
                          className="text-gray-400 hover:text-green-600"
                          title="Download"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                        <Link href={`/projects/documents/${doc.project_id}/${doc.id}`}>
                          <Button variant="outline" size="sm">
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Link href={`/projects/documents/${doc.project_id}/${doc.id}/edit`}>
                          <button className="text-gray-400 hover:text-blue-600">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDelete(doc.project_id!, doc.id)}
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
                <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {search || projectFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Get started by uploading a new document'
                  }
                </p>
                {!search && projectFilter === 'all' && typeFilter === 'all' && (
                  <div className="mt-6">
                    <Link href="/projects/documents/create">
                      <Button>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Upload Document
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
