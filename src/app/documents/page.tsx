'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { projectsAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  DocumentIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  CalendarIcon,
  UserIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  TrashIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/utils';

interface ProjectDocument {
  id: string;
  name: string;
  document_type: string;
  file: string;
  uploaded_at: string;
  description?: string;
  uploaded_by_name: string;
  project_name?: string;
  project_code?: string;
}

interface DocumentStats {
  total_documents: number;
  total_size: string;
  recent_uploads: number;
  by_type: Record<string, number>;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<ProjectDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [stats, setStats] = useState<DocumentStats | null>(null);

  const DOCUMENT_TYPES = [
    { value: 'all', label: 'All Types' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'contract', label: 'Contract' },
    { value: 'plan', label: 'Plan' },
    { value: 'report', label: 'Report' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, selectedType]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      // Since we don't have a global documents endpoint, we'll fetch from all projects
      const projectsResponse = await projectsAPI.getProjects();
      const projects = projectsResponse.data.results || projectsResponse.data;
      
      let allDocuments: ProjectDocument[] = [];
      
      // Fetch documents for each project
      for (const project of projects) {
        try {
          const docsResponse = await projectsAPI.getProjectDocuments(project.id);
          const projectDocs = docsResponse.data.results || docsResponse.data;
          allDocuments = [
            ...allDocuments,
            ...projectDocs.map((doc: any) => ({
              ...doc,
              project_name: project.name,
              project_code: project.code,
            }))
          ];
        } catch (error) {
          console.error(`Failed to fetch documents for project ${project.id}:`, error);
        }
      }
      
      setDocuments(allDocuments);
      calculateStats(allDocuments);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      // Fallback to mock data
      const mockDocuments: ProjectDocument[] = [
        {
          id: '1',
          name: 'Project Requirements.pdf',
          document_type: 'proposal',
          file: '/documents/project-requirements.pdf',
          uploaded_at: '2024-01-15T10:30:00Z',
          description: 'Detailed project requirements and specifications',
          uploaded_by_name: 'John Doe',
          project_name: 'Website Redesign',
          project_code: 'WEB-001',
        },
        {
          id: '2',
          name: 'Contract Agreement.pdf',
          document_type: 'contract',
          file: '/documents/contract-agreement.pdf',
          uploaded_at: '2024-01-10T14:20:00Z',
          description: 'Signed contract agreement with client',
          uploaded_by_name: 'Sarah Wilson',
          project_name: 'Mobile App Development',
          project_code: 'MOB-002',
        },
        {
          id: '3',
          name: 'Progress Report.pdf',
          document_type: 'report',
          file: '/documents/progress-report.pdf',
          uploaded_at: '2024-01-20T09:15:00Z',
          description: 'Monthly progress report',
          uploaded_by_name: 'Mike Johnson',
          project_name: 'Website Redesign',
          project_code: 'WEB-001',
        },
        {
          id: '4',
          name: 'Technical Plan.pdf',
          document_type: 'plan',
          file: '/documents/technical-plan.pdf',
          uploaded_at: '2024-01-18T16:45:00Z',
          description: 'Technical implementation plan',
          uploaded_by_name: 'Jane Smith',
          project_name: 'Database Migration',
          project_code: 'DB-003',
        },
        {
          id: '5',
          name: 'Meeting Notes.docx',
          document_type: 'other',
          file: '/documents/meeting-notes.docx',
          uploaded_at: '2024-01-22T11:30:00Z',
          description: 'Client meeting notes and action items',
          uploaded_by_name: 'Tom Brown',
          project_name: 'Mobile App Development',
          project_code: 'MOB-002',
        },
      ];
      setDocuments(mockDocuments);
      calculateStats(mockDocuments);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (docs: ProjectDocument[]) => {
    const byType: Record<string, number> = {};
    let recentUploads = 0;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    docs.forEach(doc => {
      byType[doc.document_type] = (byType[doc.document_type] || 0) + 1;
      if (new Date(doc.uploaded_at) > oneWeekAgo) {
        recentUploads++;
      }
    });

    setStats({
      total_documents: docs.length,
      total_size: '45.2 MB', // Mock calculation
      recent_uploads: recentUploads,
      by_type: byType,
    });
  };

  const filterDocuments = () => {
    let filtered = documents;

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(doc => doc.document_type === selectedType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.uploaded_by_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDocuments(filtered);
  };

  const getDocumentIcon = (type: string) => {
    return <DocumentIcon className="h-5 w-5" />;
  };

  const getDocumentTypeLabel = (type: string) => {
    const docType = DOCUMENT_TYPES.find(t => t.value === type);
    return docType?.label || type;
  };

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || 'FILE';
  };

  const getFileSize = (fileName: string) => {
    // Mock file size calculation
    const sizes = ['2.3 MB', '1.5 MB', '3.7 MB', '890 KB', '4.2 MB', '1.1 MB'];
    return sizes[Math.floor(Math.random() * sizes.length)];
  };

  const handleDownload = (document: ProjectDocument) => {
    // Mock download
    console.log('Downloading document:', document.name);
    alert(`Downloading ${document.name}...`);
  };

  const handleView = (document: ProjectDocument) => {
    // Mock view
    console.log('Viewing document:', document.name);
    alert(`Opening ${document.name} for viewing...`);
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      // Find the document to get project ID
      const document = documents.find(doc => doc.id === documentId);
      if (document) {
        // Extract project ID from document or use a default
        const projectId = 'project-id'; // This would need to be stored in the document
        await projectsAPI.deleteProjectDocument(projectId, documentId);
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
      alert('Failed to delete document. Please try again.');
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            <p className="text-gray-600">Manage all project documents and files</p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                    <DocumentIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Documents</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_documents}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                    <FolderIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Size</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_size}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                    <CalendarIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Recent Uploads</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.recent_uploads}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-orange-100 rounded-lg p-3">
                    <UserIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">{new Set(documents.map(d => d.uploaded_by_name)).size}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters and Search */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  {DOCUMENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center">
                <Button variant="outline" className="flex items-center">
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Documents Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || selectedType !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Get started by uploading your first document'
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Document
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Uploaded By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDocuments.map((document) => (
                      <tr key={document.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded">
                              {getDocumentIcon(document.document_type)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {document.name}
                              </div>
                              {document.description && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {document.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {getDocumentTypeLabel(document.document_type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {document.project_name && (
                            <div>
                              <div className="font-medium">{document.project_name}</div>
                              <div className="text-gray-500">{document.project_code}</div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {document.uploaded_by_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(document.uploaded_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getFileSize(document.name)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleView(document)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDownload(document)}
                              className="text-green-600 hover:text-green-900"
                              title="Download"
                            >
                              <ArrowDownTrayIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(document.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
