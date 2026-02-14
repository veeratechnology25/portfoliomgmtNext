'use client';

import React, { useState, useEffect } from 'react';
import { projectsAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  DocumentIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  EllipsisVerticalIcon,
  DocumentTextIcon,
  DocumentChartBarIcon,
  DocumentArrowDownIcon,
  DocumentMagnifyingGlassIcon,
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
}

interface DocumentManagerProps {
  projectId: string;
  onDocumentUploaded?: (document: ProjectDocument) => void;
}

const DOCUMENT_TYPES = [
  { value: 'proposal', label: 'Proposal', icon: DocumentTextIcon },
  { value: 'contract', label: 'Contract', icon: DocumentChartBarIcon },
  { value: 'plan', label: 'Plan', icon: DocumentArrowDownIcon },
  { value: 'report', label: 'Report', icon: DocumentMagnifyingGlassIcon },
  { value: 'other', label: 'Other', icon: DocumentIcon },
];

export default function DocumentManager({ projectId, onDocumentUploaded }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState('other');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, [projectId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getProjectDocuments(projectId);
      setDocuments(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      // Fallback to mock data if API fails
      const mockDocuments: ProjectDocument[] = [
        {
          id: '1',
          name: 'Project Requirements.pdf',
          document_type: 'proposal',
          file: '/documents/project-requirements.pdf',
          uploaded_at: '2024-01-15T10:30:00Z',
          description: 'Detailed project requirements and specifications',
          uploaded_by_name: 'John Doe',
        },
        {
          id: '2',
          name: 'Contract Agreement.pdf',
          document_type: 'contract',
          file: '/documents/contract-agreement.pdf',
          uploaded_at: '2024-01-10T14:20:00Z',
          description: 'Signed contract agreement with client',
          uploaded_by_name: 'Sarah Wilson',
        },
        {
          id: '3',
          name: 'Progress Report.pdf',
          document_type: 'report',
          file: '/documents/progress-report.pdf',
          uploaded_at: '2024-01-20T09:15:00Z',
          description: 'Monthly progress report',
          uploaded_by_name: 'Mike Johnson',
        },
      ];
      setDocuments(mockDocuments);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setDocumentName(file.name);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', documentName);
      formData.append('document_type', documentType);
      formData.append('description', description);
      formData.append('project', projectId);

      const response = await projectsAPI.createProjectDocument(projectId, formData);
      const newDocument = response.data;
      
      setDocuments(prev => [newDocument, ...prev]);
      setShowUploadModal(false);
      setSelectedFile(null);
      setDocumentName('');
      setDescription('');
      
      if (onDocumentUploaded) {
        onDocumentUploaded(newDocument);
      }
    } catch (error) {
      console.error('Failed to upload document:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await projectsAPI.deleteProjectDocument(projectId, documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const getDocumentIcon = (type: string) => {
    const docType = DOCUMENT_TYPES.find(t => t.value === type);
    const Icon = docType?.icon || DocumentIcon;
    return <Icon className="h-5 w-5" />;
  };

  const getDocumentTypeLabel = (type: string) => {
    const docType = DOCUMENT_TYPES.find(t => t.value === type);
    return docType?.label || type;
  };

  const getFileSize = (fileName: string) => {
    // Mock file size calculation
    const sizes = ['2.3 MB', '1.5 MB', '3.7 MB', '890 KB', '4.2 MB'];
    return sizes[Math.floor(Math.random() * sizes.length)];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Documents</h3>
          <p className="text-sm text-gray-500">Manage project documents and files</p>
        </div>
        <Button onClick={() => setShowUploadModal(true)} className="flex items-center">
          <PlusIcon className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by uploading your first document
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((document) => (
            <div key={document.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-lg p-2 text-blue-600">
                    {getDocumentIcon(document.document_type)}
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {document.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {getDocumentTypeLabel(document.document_type)}
                    </p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <EllipsisVerticalIcon className="h-4 w-4" />
                </button>
              </div>

              {document.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {document.description}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>{getFileSize(document.name)}</span>
                <span>{formatDate(document.uploaded_at)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  by {document.uploaded_by_name}
                </span>
                <div className="flex items-center space-x-1">
                  <button className="p-1 text-gray-400 hover:text-blue-600" title="View">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-green-600" title="Download">
                    <ArrowDownTrayIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(document.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Delete"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Document</h3>
              
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select File *
                  </label>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Name *
                  </label>
                  <input
                    type="text"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type *
                  </label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    {DOCUMENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowUploadModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={uploading || !selectedFile}>
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
