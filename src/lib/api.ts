import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-hot-toast';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://portfoliomgmt-backend.vercel.app/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true, // Important for CSRF cookies
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout. Please check your connection and try again.');
      } else if (error.message === 'Network Error') {
        toast.error('Network error. Please check your internet connection and ensure the backend server is running.');
      } else {
        toast.error('Network error. Please try again.');
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          // Retry the original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access}`;
          }
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Enhanced error handling
export const handleAPIError = (error: any) => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const data = error.response.data;
    
    switch (status) {
      case 400:
        if (typeof data === 'object' && data) {
          // Handle validation errors
          const errors = Object.entries(data).map(([field, messages]) => {
            if (Array.isArray(messages)) {
              return `${field}: ${messages.join(', ')}`;
            }
            return `${field}: ${messages}`;
          });
          return { type: 'validation', message: errors.join('; ') };
        }
        return { type: 'error', message: data.detail || 'Bad request' };
      case 401:
        return { type: 'auth', message: 'Authentication required' };
      case 403:
        return { type: 'permission', message: 'Permission denied' };
      case 404:
        return { type: 'not_found', message: 'Resource not found' };
      case 429:
        return { type: 'rate_limit', message: 'Too many requests, please try again later' };
      case 500:
        return { type: 'server', message: 'Server error, please try again later' };
      default:
        return { type: 'error', message: data.detail || 'An error occurred' };
    }
  } else if (error.request) {
    // Network error
    return { type: 'network', message: 'Network error, please check your connection' };
  } else {
    // Other error
    return { type: 'error', message: error.message || 'An unexpected error occurred' };
  }
};

// Enhanced Authentication API with new features
export const authAPI = {
  login: (credentials: { email: string; password: string; remember_me?: boolean }) =>
    api.post('/auth/login/', credentials),
  
  register: (userData: {
    email: string;
    password: string;
    password2: string;
    first_name: string;
    last_name: string;
    phone?: string;
    role?: string;
  }) => api.post('/auth/register/', userData),
  
  logout: () => api.post('/auth/logout/'),
  
  refreshToken: (refresh: string) =>
    api.post('/auth/token/refresh/', { refresh }),
  
  verifyToken: (token: string) =>
    api.post('/auth/token/verify/', { token }),
  
  getUser: () => api.get('/auth/users/me/'),
  
  updateProfile: (userData: any) => api.put('/auth/profile/', userData),
  
  changePassword: (passwordData: {
    old_password: string;
    new_password: string;
    new_password2: string;
  }) => api.post('/auth/change-password/', passwordData),
  
  getUsers: (params?: any) => api.get('/auth/users/', { params }),
  
  // Login history
  getLoginHistory: (params?: any) => 
    api.get('/auth/login-history/', { params }),
  
  // User management (admin only)
  createUser: (userData: any) => api.post('/auth/users/', userData),
  
  updateUser: (id: string, userData: any) => 
    api.patch(`/auth/users/${id}/`, userData),
  
  deactivateUser: (id: string) => 
    api.patch(`/auth/users/${id}/`, { is_active: false }),
  
  activateUser: (id: string) => 
    api.patch(`/auth/users/${id}/`, { is_active: true }),
};

export const resourcesAPI = {
  // Human Resources Management
  getResources: (params?: any) => api.get('/resources/', { params }),
  
  getResource: (id: string) => api.get(`/resources/${id}/`),
  
  createResource: (resourceData: any) => api.post('/resources/', resourceData),
  
  updateResource: (id: string, resourceData: any) =>
    api.put(`/resources/${id}/`, resourceData),
  
  deleteResource: (id: string) => api.delete(`/resources/${id}/`),

  // Resource Allocations
  getResourceAllocations: (params?: any) => api.get('/resources/allocations/', { params }),
  
  getResourceAllocation: (id: string) => api.get(`/resources/allocations/${id}/`),
  
  createResourceAllocation: (allocationData: any) => api.post('/resources/allocations/', allocationData),
  
  updateResourceAllocation: (id: string, allocationData: any) =>
    api.put(`/resources/allocations/${id}/`, allocationData),
  
  deleteResourceAllocation: (id: string) => api.delete(`/resources/allocations/${id}/`),

  // Project-specific allocations
  getProjectAllocations: (projectId: string) => 
    api.get(`/resources/allocations/?project=${projectId}`),

  // Employee-specific allocations
  getEmployeeAllocations: (employeeId: string) => 
    api.get(`/resources/allocations/?employee=${employeeId}`),

  // Timesheets
  getTimesheets: (params?: any) => api.get('/resources/timesheets/', { params }),
  
  getTimesheet: (id: string) => api.get(`/resources/timesheets/${id}/`),
  
  createTimesheet: (timesheetData: any) => api.post('/resources/timesheets/', timesheetData),
  
  updateTimesheet: (id: string, timesheetData: any) =>
    api.put(`/resources/timesheets/${id}/`, timesheetData),
  
  deleteTimesheet: (id: string) => api.delete(`/resources/timesheets/${id}/`),
  
  // Timesheet Entries (nested under timesheets)
  getTimesheetEntries: (timesheetId: string) => 
    api.get(`/resources/timesheets/${timesheetId}/entries/`),
  
  createTimesheetEntry: (timesheetId: string, entryData: any) => 
    api.post(`/resources/timesheets/${timesheetId}/entries/`, entryData),
  
  updateTimesheetEntry: (timesheetId: string, entryId: string, entryData: any) =>
    api.put(`/resources/timesheets/${timesheetId}/entries/${entryId}/`, entryData),
  
  deleteTimesheetEntry: (timesheetId: string, entryId: string) =>
    api.delete(`/resources/timesheets/${timesheetId}/entries/${entryId}/`),

  // Leave Requests
  getLeaveRequests: (params?: any) => api.get('/resources/leave-requests/', { params }),
  
  getLeaveRequest: (id: string) => api.get(`/resources/leave-requests/${id}/`),
  
  createLeaveRequest: (leaveData: any) => api.post('/resources/leave-requests/', leaveData),
  
  updateLeaveRequest: (id: string, leaveData: any) =>
    api.put(`/resources/leave-requests/${id}/`, leaveData),
  
  deleteLeaveRequest: (id: string) => api.delete(`/resources/leave-requests/${id}/`),
  
  // Employee leave requests
  getEmployeeLeaveRequests: (employeeId: string) => 
    api.get(`/resources/leave-requests/?employee=${employeeId}`),

  // Resource Requests
  getResourceRequests: (params?: any) => api.get('/resources/resource-requests/', { params }),
  
  getResourceRequest: (id: string) => api.get(`/resources/resource-requests/${id}/`),
  
  createResourceRequest: (requestData: any) => api.post('/resources/resource-requests/', requestData),
  
  updateResourceRequest: (id: string, requestData: any) =>
    api.put(`/resources/resource-requests/${id}/`, requestData),
  
  deleteResourceRequest: (id: string) => api.delete(`/resources/resource-requests/${id}/`),
  
  // Project resource requests
  getProjectResourceRequests: (projectId: string) => 
    api.get(`/resources/resource-requests/?project=${projectId}`),

  // Equipment
  getEquipment: (params?: any) => api.get('/resources/equipment/', { params }),
  
  getEquipmentItem: (id: string) => api.get(`/resources/equipment/${id}/`),
  
  createEquipment: (equipmentData: any) => api.post('/resources/equipment/', equipmentData),
  
  updateEquipment: (id: string, equipmentData: any) =>
    api.put(`/resources/equipment/${id}/`, equipmentData),
  
  deleteEquipment: (id: string) => api.delete(`/resources/equipment/${id}/`),
  
  // Equipment assignment actions
  assignEquipment: (id: string, assignmentData: any) =>
    api.post(`/resources/equipment/${id}/assign/`, assignmentData),
  
  returnEquipment: (id: string) =>
    api.post(`/resources/equipment/${id}/return/`),

  // Equipment Maintenance
  getEquipmentMaintenance: (params?: any) => api.get('/resources/equipment-maintenance/', { params }),
  
  getEquipmentMaintenanceRecord: (id: string) => api.get(`/resources/equipment-maintenance/${id}/`),
  
  createEquipmentMaintenance: (maintenanceData: any) => 
    api.post('/resources/equipment-maintenance/', maintenanceData),
  
  updateEquipmentMaintenance: (id: string, maintenanceData: any) =>
    api.put(`/resources/equipment-maintenance/${id}/`, maintenanceData),
  
  deleteEquipmentMaintenance: (id: string) => api.delete(`/resources/equipment-maintenance/${id}/`),
  
  // Equipment-specific maintenance
  getEquipmentMaintenanceHistory: (equipmentId: string) => 
    api.get(`/resources/equipment-maintenance/?equipment=${equipmentId}`),
  
  completeMaintenance: (id: string, completionData?: any) =>
    api.post(`/resources/equipment-maintenance/${id}/complete/`, completionData),

  // Timesheet actions
  submitTimesheet: (id: string) =>
    api.post(`/resources/timesheets/${id}/submit/`),
  
  approveTimesheet: (id: string, approvalData?: any) =>
    api.post(`/resources/timesheets/${id}/approve/`, approvalData),
  
  rejectTimesheet: (id: string, rejectionData?: any) =>
    api.post(`/resources/timesheets/${id}/reject/`, rejectionData),

  // Leave request actions
  approveLeaveRequest: (id: string, approvalData?: any) =>
    api.post(`/resources/leave-requests/${id}/approve/`, approvalData),
  
  rejectLeaveRequest: (id: string, rejectionData?: any) =>
    api.post(`/resources/leave-requests/${id}/reject/`, rejectionData),

  // Resource request actions
  submitResourceRequest: (id: string) =>
    api.post(`/resources/resource-requests/${id}/submit/`),
  
  approveResourceRequest: (id: string, approvalData?: any) =>
    api.post(`/resources/resource-requests/${id}/approve/`, approvalData),
  
  rejectResourceRequest: (id: string, rejectionData?: any) =>
    api.post(`/resources/resource-requests/${id}/reject/`, rejectionData),
  
  fulfillResourceRequest: (id: string, fulfillmentData?: any) =>
    api.post(`/resources/resource-requests/${id}/fulfill/`, fulfillmentData),

  // Additional equipment functions
  startEquipmentMaintenance: (id: string) =>
    api.post(`/resources/equipment/${id}/start/`),

  completeEquipmentMaintenance: (id: string) =>
    api.post(`/resources/equipment/${id}/complete/`),

  getUpcomingMaintenance: (params?: any) => api.get('/resources/equipment/upcoming/', { params }),

  getUpcomingLeaves: (params?: any) => api.get('/resources/leave-requests/upcoming_leaves/', { params }),

  getCurrentWeekTimesheet: (params?: any) => api.get('/resources/timesheets/current_week/', { params }),

  // Additional resource allocation functions
  activateResourceAllocation: (id: string, activationData?: any) =>
    api.post(`/resources/allocations/${id}/activate/`, activationData),

  approveResourceAllocation: (id: string, approvalData?: any) =>
    api.post(`/resources/allocations/${id}/approve/`, approvalData),

  getUtilizationReport: (params?: any) => api.get('/resources/allocations/utilization_report/', { params }),

  // General resources
  getAvailableResources: (params?: any) => api.get('/resources/available/', { params }),
  
  getResourcesByDepartment: (params?: any) => api.get('/resources/by_department/', { params }),
  
  getUtilizationSummary: (params?: any) => api.get('/resources/utilization_summary/', { params }),
};

// Enhanced Projects API with advanced features
export const projectsAPI = {
  getProjects: (params?: any) => api.get('/projects/projects/', { params }),
  
  getProject: (id: string) => api.get(`/projects/projects/${id}/`),
  
  createProject: (projectData: any) => api.post('/projects/projects/', projectData),
  
  updateProject: (id: string, projectData: any) =>
    api.patch(`/projects/projects/${id}/`, projectData),
  
  deleteProject: (id: string) => api.delete(`/projects/projects/${id}/`),
  
  // Project Documents with enhanced file handling
  getProjectDocuments: (projectId: string, params?: any) => 
    api.get(`/projects/projects/${projectId}/documents/`, { params }),
  
  getProjectDocument: (projectId: string, documentId: string) => 
    api.get(`/projects/projects/${projectId}/documents/${documentId}/`),
  
  createProjectDocument: (projectId: string, formData: FormData) => 
    api.post(`/projects/projects/${projectId}/documents/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  updateProjectDocument: (projectId: string, documentId: string, formData: FormData) =>
    api.patch(`/projects/projects/${projectId}/documents/${documentId}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  deleteProjectDocument: (projectId: string, documentId: string) =>
    api.delete(`/projects/projects/${projectId}/documents/${documentId}/`),
  
  downloadProjectDocument: (projectId: string, documentId: string) =>
    api.get(`/projects/projects/${projectId}/documents/${documentId}/download/`, {
      responseType: 'blob'
    }),
  
  // Project Phases with enhanced validation
  getProjectPhases: (projectId: string, params?: any) => 
    api.get(`/projects/projects/${projectId}/phases/`, { params }),
  
  getProjectPhase: (projectId: string, phaseId: string) => 
    api.get(`/projects/projects/${projectId}/phases/${phaseId}/`),
  
  createProjectPhase: (projectId: string, phaseData: any) => 
    api.post(`/projects/projects/${projectId}/phases/`, phaseData),
  
  updateProjectPhase: (projectId: string, phaseId: string, phaseData: any) =>
    api.patch(`/projects/projects/${projectId}/phases/${phaseId}/`, phaseData),
  
  deleteProjectPhase: (projectId: string, phaseId: string) =>
    api.delete(`/projects/projects/${projectId}/phases/${phaseId}/`),
  
  reorderProjectPhases: (projectId: string, phases: Array<{id: string, sequence: number}>) =>
    api.post(`/projects/projects/${projectId}/phases/reorder/`, { phases }),
  
  // Project Summary and Progress with enhanced metrics
  getProjectSummary: (projectId: string) => 
    api.get(`/projects/projects/${projectId}/summary/`),
  
  updateProjectProgress: (projectId: string, progressData: { progress: number }) =>
    api.post(`/projects/projects/${projectId}/update-progress/`, progressData),
  
  getProjectTimeline: (projectId: string) =>
    api.get(`/projects/projects/${projectId}/timeline/`),
  
  getProjectBudgetOverview: (projectId: string) =>
    api.get(`/projects/projects/${projectId}/budget-overview/`),
  
  getProjectTeam: (projectId: string) =>
    api.get(`/projects/projects/${projectId}/team/`),
  
  addProjectTeamMember: (projectId: string, memberData: any) =>
    api.post(`/projects/projects/${projectId}/team/`, memberData),
  
  removeProjectTeamMember: (projectId: string, userId: string) =>
    api.delete(`/projects/projects/${projectId}/team/${userId}/`),
  
  // Categories with enhanced statistics
  getCategories: (params?: any) => api.get('/projects/categories/', { params }),
  
  createCategory: (categoryData: any) => api.post('/projects/categories/', categoryData),
  
  updateCategory: (id: string, categoryData: any) =>
    api.patch(`/projects/categories/${id}/`, categoryData),
  
  deleteCategory: (id: string) => api.delete(`/projects/categories/${id}/`),
  
  getCategoryStatistics: (id: string) =>
    api.get(`/projects/categories/${id}/statistics/`),
  
  // Project actions
  archiveProject: (id: string) =>
    api.post(`/projects/projects/${id}/archive/`),
  
  restoreProject: (id: string) =>
    api.post(`/projects/projects/${id}/restore/`),
  
  duplicateProject: (id: string, projectData?: any) =>
    api.post(`/projects/projects/${id}/duplicate/`, projectData),
  
  // Advanced filtering and search
  searchProjects: (query: string, filters?: any) =>
    api.get('/projects/projects/search/', { params: { q: query, ...filters } }),
  
  exportProjects: (format: 'csv' | 'excel' | 'pdf', filters?: any) =>
    api.get('/projects/projects/export/', { 
      params: { format, ...filters },
      responseType: 'blob'
    }),
};

export const financeAPI = {
  // Budgets
  getBudgets: (params?: any) => api.get('/finance/budgets/', { params }),
  
  getBudget: (id: string) => api.get(`/finance/budgets/${id}/`),
  
  createBudget: (budgetData: any) => api.post('/finance/budgets/', budgetData),
  
  updateBudget: (id: string, budgetData: any) =>
    api.put(`/finance/budgets/${id}/`, budgetData),
  
  deleteBudget: (id: string) => api.delete(`/finance/budgets/${id}/`),
  
  // Budget Line Items
  getBudgetLineItems: (budgetId: string) => 
    api.get(`/finance/budgets/${budgetId}/line-items/`),
  
  getBudgetLineItem: (budgetId: string, lineItemId: string) => 
    api.get(`/finance/budgets/${budgetId}/line-items/${lineItemId}/`),
  
  createBudgetLineItem: (budgetId: string, lineItemData: any) => 
    api.post(`/finance/budgets/${budgetId}/line-items/`, lineItemData),
  
  updateBudgetLineItem: (budgetId: string, lineItemId: string, lineItemData: any) =>
    api.put(`/finance/budgets/${budgetId}/line-items/${lineItemId}/`, lineItemData),
  
  deleteBudgetLineItem: (budgetId: string, lineItemId: string) =>
    api.delete(`/finance/budgets/${budgetId}/line-items/${lineItemId}/`),
  
  // Budget Approvals
  getBudgetApprovals: (budgetId: string) => 
    api.get(`/finance/budgets/${budgetId}/approvals/`),
  
  getBudgetApproval: (budgetId: string, approvalId: string) => 
    api.get(`/finance/budgets/${budgetId}/approvals/${approvalId}/`),
  
  createBudgetApproval: (budgetId: string, approvalData: any) => 
    api.post(`/finance/budgets/${budgetId}/approvals/`, approvalData),
  
  updateBudgetApproval: (budgetId: string, approvalId: string, approvalData: any) =>
    api.put(`/finance/budgets/${budgetId}/approvals/${approvalId}/`, approvalData),
  
  deleteBudgetApproval: (budgetId: string, approvalId: string) =>
    api.delete(`/finance/budgets/${budgetId}/approvals/${approvalId}/`),
  
  // Budget Actions
  submitBudgetForApproval: (id: string) => 
    api.post(`/finance/budgets/${id}/submit_for_approval/`),
  
  approveBudget: (id: string, data?: any) => 
    api.post(`/finance/budgets/${id}/approve/`, data),
  
  // Expenses
  getExpenses: (params?: any) => api.get('/finance/expenses/', { params }),
  
  getExpense: (id: string) => api.get(`/finance/expenses/${id}/`),
  
  createExpense: (expenseData: any) => api.post('/finance/expenses/', expenseData),
  
  updateExpense: (id: string, expenseData: any) =>
    api.put(`/finance/expenses/${id}/`, expenseData),
  
  deleteExpense: (id: string) => api.delete(`/finance/expenses/${id}/`),

  // Expense Actions
  approveExpense: (id: string, data?: any) => 
    api.post(`/finance/expenses/${id}/approve/`, data),

  rejectExpense: (id: string, data: any) => 
    api.post(`/finance/expenses/${id}/reject/`, data),

  markExpenseAsPaid: (id: string, data?: any) => 
    api.post(`/finance/expenses/${id}/mark_as_paid/`, data),

  // Budget Approval Actions
  approveBudgetApproval: (budgetId: string, approvalId: string, data: any) =>
    api.post(`/finance/budgets/${budgetId}/approvals/${approvalId}/approve/`, data),

  rejectBudgetApproval: (budgetId: string, approvalId: string, data: any) =>
    api.post(`/finance/budgets/${budgetId}/approvals/${approvalId}/reject/`, data),

  // File Upload
  uploadReceipt: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/finance/upload-receipt/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Budget Statistics
  getBudgetStatistics: (id: string) => 
    api.get(`/finance/budgets/${id}/statistics/`),

  getExpenseStatistics: (params?: any) => 
    api.get('/finance/expenses/statistics/', { params }),

  // Reports
  generateBudgetReport: (id: string, format: 'pdf' | 'excel' = 'pdf') =>
    api.get(`/finance/budgets/${id}/report/`, { 
      params: { format },
      responseType: 'blob'
    }),

  generateExpenseReport: (params: any, format: 'pdf' | 'excel' = 'pdf') =>
    api.get('/finance/expenses/report/', {
      params: { ...params, format },
      responseType: 'blob'
    }),
};

// Enhanced Revenue API with comprehensive functionality
export const revenueAPI = {
  // Revenue Clients Management
  getClients: (params?: any) => api.get('/revenue/clients/', { params }),
  
  getClient: (id: string) => api.get(`/revenue/clients/${id}/`),
  
  createClient: (clientData: any) => api.post('/revenue/clients/', clientData),
  
  updateClient: (id: string, clientData: any) =>
    api.put(`/revenue/clients/${id}/`, clientData),
  
  partialUpdateClient: (id: string, clientData: any) =>
    api.patch(`/revenue/clients/${id}/`, clientData),
  
  deleteClient: (id: string) => api.delete(`/revenue/clients/${id}/`),

  getClientRevenueSummary: (id: string) => 
    api.get(`/revenue/clients/${id}/revenue_summary/`),

  // Revenue Collections Management
  getCollections: (params?: any) => api.get('/revenue/collections/', { params }),
  
  getCollection: (id: string) => api.get(`/revenue/collections/${id}/`),
  
  createCollection: (collectionData: any) => api.post('/revenue/collections/', collectionData),
  
  updateCollection: (id: string, collectionData: any) =>
    api.put(`/revenue/collections/${id}/`, collectionData),
  
  partialUpdateCollection: (id: string, collectionData: any) =>
    api.patch(`/revenue/collections/${id}/`, collectionData),
  
  deleteCollection: (id: string) => api.delete(`/revenue/collections/${id}/`),

  markCollectionCleared: (id: string, clearanceData?: any) =>
    api.post(`/revenue/collections/${id}/mark_cleared/`, clearanceData),

  // Revenue Invoices Management
  getInvoices: (params?: any) => api.get('/revenue/invoices/', { params }),
  
  getInvoice: (id: string) => api.get(`/revenue/invoices/${id}/`),
  
  createInvoice: (invoiceData: any) => api.post('/revenue/invoices/', invoiceData),
  
  updateInvoice: (id: string, invoiceData: any) =>
    api.put(`/revenue/invoices/${id}/`, invoiceData),
  
  partialUpdateInvoice: (id: string, invoiceData: any) =>
    api.patch(`/revenue/invoices/${id}/`, invoiceData),
  
  deleteInvoice: (id: string) => api.delete(`/revenue/invoices/${id}/`),

  getOverdueInvoices: (params?: any) => api.get('/revenue/invoices/overdue_invoices/', { params }),

  recordInvoicePayment: (id: string, paymentData: any) =>
    api.post(`/revenue/invoices/${id}/record_payment/`, paymentData),

  sendInvoice: (id: string, sendData?: any) =>
    api.post(`/revenue/invoices/${id}/send_invoice/`, sendData),

  // Invoice Line Items
  getInvoiceLineItems: (invoiceId: string) => 
    api.get(`/revenue/invoices/${invoiceId}/line-items/`),
  
  getInvoiceLineItem: (invoiceId: string, lineItemId: string) => 
    api.get(`/revenue/invoices/${invoiceId}/line-items/${lineItemId}/`),
  
  createInvoiceLineItem: (invoiceId: string, lineItemData: any) => 
    api.post(`/revenue/invoices/${invoiceId}/line-items/`, lineItemData),
  
  updateInvoiceLineItem: (invoiceId: string, lineItemId: string, lineItemData: any) =>
    api.put(`/revenue/invoices/${invoiceId}/line-items/${lineItemId}/`, lineItemData),
  
  partialUpdateInvoiceLineItem: (invoiceId: string, lineItemId: string, lineItemData: any) =>
    api.patch(`/revenue/invoices/${invoiceId}/line-items/${lineItemId}/`, lineItemData),
  
  deleteInvoiceLineItem: (invoiceId: string, lineItemId: string) =>
    api.delete(`/revenue/invoices/${invoiceId}/line-items/${lineItemId}/`),

  // Revenue Streams Management
  getRevenueStreams: (params?: any) => api.get('/revenue/revenue-streams/', { params }),
  
  getRevenueStream: (id: string) => api.get(`/revenue/revenue-streams/${id}/`),
  
  createRevenueStream: (streamData: any) => api.post('/revenue/revenue-streams/', streamData),
  
  updateRevenueStream: (id: string, streamData: any) =>
    api.put(`/revenue/revenue-streams/${id}/`, streamData),
  
  partialUpdateRevenueStream: (id: string, streamData: any) =>
    api.patch(`/revenue/revenue-streams/${id}/`, streamData),
  
  deleteRevenueStream: (id: string) => api.delete(`/revenue/revenue-streams/${id}/`),

  getRevenueStreamPerformanceReport: (params?: any) => 
    api.get('/revenue/revenue-streams/performance_report/', { params }),

  // Revenue Records Management
  getRevenues: (params?: any) => api.get('/revenue/revenues/', { params }),
  
  getRevenue: (id: string) => api.get(`/revenue/revenues/${id}/`),
  
  createRevenue: (revenueData: any) => api.post('/revenue/revenues/', revenueData),
  
  updateRevenue: (id: string, revenueData: any) =>
    api.put(`/revenue/revenues/${id}/`, revenueData),
  
  partialUpdateRevenue: (id: string, revenueData: any) =>
    api.patch(`/revenue/revenues/${id}/`, revenueData),
  
  deleteRevenue: (id: string) => api.delete(`/revenue/revenues/${id}/`),

  verifyRevenue: (id: string, verificationData?: any) =>
    api.post(`/revenue/revenues/${id}/verify/`, verificationData),

  // Revenue Reports
  getRevenueReports: (params?: any) => api.get('/revenue/reports/', { params }),
};

// Analytics API
export const analyticsAPI = {
  // Main Analytics Endpoints
  getAnalytics: (params?: any) => api.get('/analytics/analytics/', { params }),
  getDashboardSummary: (params?: any) => api.get('/analytics/analytics/dashboard-summary/', { params }),
  getFinancialForecast: (params?: any) => api.get('/analytics/analytics/financial-forecast/', { params }),
  getPortfolioHealth: (params?: any) => api.get('/analytics/analytics/portfolio-health/', { params }),
  getProjectPerformance: (params?: any) => api.get('/analytics/analytics/project-performance/', { params }),
  getResourceAnalytics: (params?: any) => api.get('/analytics/analytics/resource-analytics/', { params }),
  getSuccessPrediction: (params?: any) => api.get('/analytics/analytics/success-prediction/', { params }),

  // Dashboards
  getDashboards: (params?: any) => api.get('/analytics/dashboards/', { params }),
  createDashboard: (dashboardData: any) => api.post('/analytics/dashboards/', dashboardData),
  getDashboard: (id: string) => api.get(`/analytics/dashboards/${id}/`),
  updateDashboard: (id: string, dashboardData: any) => api.put(`/analytics/dashboards/${id}/`, dashboardData),
  patchDashboard: (id: string, dashboardData: any) => api.patch(`/analytics/dashboards/${id}/`, dashboardData),
  deleteDashboard: (id: string) => api.delete(`/analytics/dashboards/${id}/`),
  duplicateDashboard: (id: string) => api.post(`/analytics/dashboards/${id}/duplicate/`),

  // Data Exports
  getDataExports: (params?: any) => api.get('/analytics/data-exports/', { params }),
  createDataExport: (exportData: any) => api.post('/analytics/data-exports/', exportData),
  getDataExport: (id: string) => api.get(`/analytics/data-exports/${id}/`),
  updateDataExport: (id: string, exportData: any) => api.put(`/analytics/data-exports/${id}/`, exportData),
  patchDataExport: (id: string, exportData: any) => api.patch(`/analytics/data-exports/${id}/`, exportData),
  deleteDataExport: (id: string) => api.delete(`/analytics/data-exports/${id}/`),
  processDataExport: (id: string) => api.post(`/analytics/data-exports/${id}/process/`),

  // KPIs
  getKPIs: (params?: any) => api.get('/analytics/kpis/', { params }),
  createKPI: (kpiData: any) => api.post('/analytics/kpis/', kpiData),
  getKPI: (id: string) => api.get(`/analytics/kpis/${id}/`),
  updateKPI: (id: string, kpiData: any) => api.put(`/analytics/kpis/${id}/`, kpiData),
  patchKPI: (id: string, kpiData: any) => api.patch(`/analytics/kpis/${id}/`, kpiData),
  deleteKPI: (id: string) => api.delete(`/analytics/kpis/${id}/`),
  getKPIMetrics: (id: string) => api.get(`/analytics/kpis/${id}/metrics/`),
  getKPIStatistics: (id: string) => api.get(`/analytics/kpis/${id}/statistics/`),

  // Metrics
  getMetrics: (params?: any) => api.get('/analytics/metrics/', { params }),
  createMetric: (metricData: any) => api.post('/analytics/metrics/', metricData),
  bulkCreateMetrics: (metricsData: any) => api.post('/analytics/metrics/bulk_create/', metricsData),
  getMetricTrends: (params?: any) => api.get('/analytics/metrics/trends/', { params }),
  getMetric: (id: string) => api.get(`/analytics/metrics/${id}/`),
  updateMetric: (id: string, metricData: any) => api.put(`/analytics/metrics/${id}/`, metricData),
  patchMetric: (id: string, metricData: any) => api.patch(`/analytics/metrics/${id}/`, metricData),
  deleteMetric: (id: string) => api.delete(`/analytics/metrics/${id}/`),

  // Portfolio Health
  getPortfolioHealthData: (params?: any) => api.get('/analytics/portfolio-health/', { params }),
  createPortfolioHealth: (healthData: any) => api.post('/analytics/portfolio-health/', healthData),
  getPortfolioHealthItem: (id: string) => api.get(`/analytics/portfolio-health/${id}/`),
  updatePortfolioHealth: (id: string, healthData: any) => api.put(`/analytics/portfolio-health/${id}/`, healthData),
  patchPortfolioHealth: (id: string, healthData: any) => api.patch(`/analytics/portfolio-health/${id}/`, healthData),
  deletePortfolioHealth: (id: string) => api.delete(`/analytics/portfolio-health/${id}/`),

  // Predictive Analytics
  getPredictiveAnalytics: (params?: any) => api.get('/analytics/predictive-analytics/', { params }),
  createPredictiveAnalytics: (analyticsData: any) => api.post('/analytics/predictive-analytics/', analyticsData),
  getPredictiveAnalyticsItem: (id: string) => api.get(`/analytics/predictive-analytics/${id}/`),
  updatePredictiveAnalytics: (id: string, analyticsData: any) => api.put(`/analytics/predictive-analytics/${id}/`, analyticsData),
  patchPredictiveAnalytics: (id: string, analyticsData: any) => api.patch(`/analytics/predictive-analytics/${id}/`, analyticsData),
  deletePredictiveAnalytics: (id: string) => api.delete(`/analytics/predictive-analytics/${id}/`),
  runPrediction: (id: string) => api.post(`/analytics/predictive-analytics/${id}/predict/`),
  trainModel: (id: string) => api.post(`/analytics/predictive-analytics/${id}/train_model/`),

  // Report Schedules
  getReportSchedules: (params?: any) => api.get('/analytics/report-schedules/', { params }),
  createReportSchedule: (scheduleData: any) => api.post('/analytics/report-schedules/', scheduleData),
  getReportSchedule: (id: string) => api.get(`/analytics/report-schedules/${id}/`),
  updateReportSchedule: (id: string, scheduleData: any) => api.put(`/analytics/report-schedules/${id}/`, scheduleData),
  patchReportSchedule: (id: string, scheduleData: any) => api.patch(`/analytics/report-schedules/${id}/`, scheduleData),
  deleteReportSchedule: (id: string) => api.delete(`/analytics/report-schedules/${id}/`),
  runReportNow: (id: string) => api.post(`/analytics/report-schedules/${id}/run_now/`),

  // Widgets
  getWidgets: (params?: any) => api.get('/analytics/widgets/', { params }),
  createWidget: (widgetData: any) => api.post('/analytics/widgets/', widgetData),
  getWidget: (id: string) => api.get(`/analytics/widgets/${id}/`),
  updateWidget: (id: string, widgetData: any) => api.put(`/analytics/widgets/${id}/`, widgetData),
  patchWidget: (id: string, widgetData: any) => api.patch(`/analytics/widgets/${id}/`, widgetData),
  deleteWidget: (id: string) => api.delete(`/analytics/widgets/${id}/`),
};

export const organizationAPI = {
  // Departments
  getDepartments: (params?: any) => api.get('/organization/departments/', { params }),
  
  getDepartment: (id: string) => api.get(`/organization/departments/${id}/`),
  
  createDepartment: (departmentData: any) =>
    api.post('/organization/departments/', departmentData),
  
  updateDepartment: (id: string, departmentData: any) =>
    api.put(`/organization/departments/${id}/`, departmentData),
  
  deleteDepartment: (id: string) =>
    api.delete(`/organization/departments/${id}/`),
  
  // Employees
  getEmployees: (params?: any) => api.get('/organization/employees/', { params }),
  
  getEmployee: (id: string) => api.get(`/organization/employees/${id}/`),
  
  createEmployee: (employeeData: any) =>
    api.post('/organization/employees/', employeeData),
  
  updateEmployee: (id: string, employeeData: any) =>
    api.put(`/organization/employees/${id}/`, employeeData),
  
  deleteEmployee: (id: string) =>
    api.delete(`/organization/employees/${id}/`),
  
  // Skills
  getSkills: (params?: any) => api.get('/organization/skills/', { params }),
  
  getSkill: (id: string) => api.get(`/organization/skills/${id}/`),
  
  createSkill: (skillData: any) =>
    api.post('/organization/skills/', skillData),
  
  updateSkill: (id: string, skillData: any) =>
    api.put(`/organization/skills/${id}/`, skillData),
  
  deleteSkill: (id: string) =>
    api.delete(`/organization/skills/${id}/`),
  
  // Employee Skills
  getEmployeeSkills: (params?: any) => api.get('/organization/employee-skills/', { params }),
  
  getEmployeeSkill: (id: string) => api.get(`/organization/employee-skills/${id}/`),
  
  createEmployeeSkill: (skillData: any) =>
    api.post('/organization/employee-skills/', skillData),
  
  updateEmployeeSkill: (id: string, skillData: any) =>
    api.put(`/organization/employee-skills/${id}/`, skillData),
  
  deleteEmployeeSkill: (id: string) =>
    api.delete(`/organization/employee-skills/${id}/`),
  
  verifyEmployeeSkill: (id: string, data?: any) =>
    api.post(`/organization/employee-skills/${id}/verify/`, data),

  // Organization Statistics
  getDepartmentStatistics: (id: string) => 
    api.get(`/organization/departments/${id}/statistics/`),

  getEmployeeStatistics: (params?: any) => 
    api.get('/organization/employees/statistics/', { params }),

  getSkillStatistics: (params?: any) => 
    api.get('/organization/skills/statistics/', { params }),

  // Organization Reports
  generateDepartmentReport: (id: string, format: 'pdf' | 'excel' = 'pdf') =>
    api.get(`/organization/departments/${id}/report/`, { 
      params: { format },
      responseType: 'blob'
    }),

  generateEmployeeReport: (params: any, format: 'pdf' | 'excel' = 'pdf') =>
    api.get('/organization/employees/report/', {
      params: { ...params, format },
      responseType: 'blob'
    }),

  generateSkillReport: (params: any, format: 'pdf' | 'excel' = 'pdf') =>
    api.get('/organization/skills/report/', {
      params: { ...params, format },
      responseType: 'blob'
    }),

  // Bulk Operations
  bulkAssignSkills: (data: any) =>
    api.post('/organization/employee-skills/bulk_assign/', data),

  bulkUpdateEmployees: (data: any) =>
    api.post('/organization/employees/bulk_update/', data),

  bulkUpdateDepartments: (data: any) =>
    api.post('/organization/departments/bulk_update/', data),
};

// Dashboard API
export const dashboardAPI = {
  // Overview dashboard data
  getOverview: () => api.get('/dashboard/operations/quick-stats/'),
  
  getRecentActivity: () => api.get('/dashboard/operations/notifications/'),
  
  getOverviewDashboards: () => api.get('/dashboard/overview-dashboards/'),
  
  getOverviewDashboardData: (dashboardId: string) => 
    api.get(`/dashboard/overview-dashboards/${dashboardId}/data/`),

  // Financial dashboard data
  getFinancialDashboards: () => api.get('/dashboard/financial-dashboards/'),
  getFinancialDashboardData: (dashboardId: string) => 
    api.get(`/dashboard/financial-dashboards/${dashboardId}/data/`),

  // Project dashboard data
  getProjectDashboards: () => api.get('/dashboard/project-dashboards/'),
  getProjectDashboardData: (dashboardId: string) => 
    api.get(`/dashboard/project-dashboards/${dashboardId}/data/`),

  // Resource dashboard data
  getResourceDashboards: () => api.get('/dashboard/resource-dashboards/'),
  getResourceDashboardData: (dashboardId: string) => 
    api.get(`/dashboard/resource-dashboards/${dashboardId}/data/`),

  // Executive dashboard data
  getExecutiveDashboards: () => api.get('/dashboard/executive-dashboards/'),
  getExecutiveDashboardData: (dashboardId: string) => 
    api.get(`/dashboard/executive-dashboards/${dashboardId}/data/`),

  // Custom dashboard data
  getCustomDashboards: () => api.get('/dashboard/custom-dashboards/'),
  getCustomDashboardData: (dashboardId: string) => 
    api.get(`/dashboard/custom-dashboards/${dashboardId}/data/`),

  // Custom dashboard CRUD
  createCustomDashboard: (dashboardData: any) => 
    api.post('/dashboard/custom-dashboards/', dashboardData),
  getCustomDashboard: (id: string) => 
    api.get(`/dashboard/custom-dashboards/${id}/`),
  updateCustomDashboard: (id: string, dashboardData: any) => 
    api.put(`/dashboard/custom-dashboards/${id}/`, dashboardData),
  patchCustomDashboard: (id: string, dashboardData: any) => 
    api.patch(`/dashboard/custom-dashboards/${id}/`, dashboardData),
  deleteCustomDashboard: (id: string) => 
    api.delete(`/dashboard/custom-dashboards/${id}/`),
  cloneCustomDashboard: (id: string) => 
    api.post(`/dashboard/custom-dashboards/${id}/clone/`),

  // Custom dashboard filters
  getCustomDashboardFilters: (dashboardId: string) => 
    api.get(`/dashboard/custom-dashboards/${dashboardId}/filters/`),
  createCustomDashboardFilter: (dashboardId: string, filterData: any) => 
    api.post(`/dashboard/custom-dashboards/${dashboardId}/filters/`, filterData),
  getCustomDashboardFilter: (dashboardId: string, filterId: string) => 
    api.get(`/dashboard/custom-dashboards/${dashboardId}/filters/${filterId}/`),
  updateCustomDashboardFilter: (dashboardId: string, filterId: string, filterData: any) => 
    api.put(`/dashboard/custom-dashboards/${dashboardId}/filters/${filterId}/`, filterData),
  patchCustomDashboardFilter: (dashboardId: string, filterId: string, filterData: any) => 
    api.patch(`/dashboard/custom-dashboards/${dashboardId}/filters/${filterId}/`, filterData),
  deleteCustomDashboardFilter: (dashboardId: string, filterId: string) => 
    api.delete(`/dashboard/custom-dashboards/${dashboardId}/filters/${filterId}/`),

  // Custom dashboard widgets
  getCustomDashboardWidgets: (dashboardId: string) => 
    api.get(`/dashboard/custom-dashboards/${dashboardId}/widgets/`),
  createCustomDashboardWidget: (dashboardId: string, widgetData: any) => 
    api.post(`/dashboard/custom-dashboards/${dashboardId}/widgets/`, widgetData),
  getCustomDashboardWidget: (dashboardId: string, widgetId: string) => 
    api.get(`/dashboard/custom-dashboards/${dashboardId}/widgets/${widgetId}/`),
  updateCustomDashboardWidget: (dashboardId: string, widgetId: string, widgetData: any) => 
    api.put(`/dashboard/custom-dashboards/${dashboardId}/widgets/${widgetId}/`, widgetData),
  patchCustomDashboardWidget: (dashboardId: string, widgetId: string, widgetData: any) => 
    api.patch(`/dashboard/custom-dashboards/${dashboardId}/widgets/${widgetId}/`, widgetData),
  deleteCustomDashboardWidget: (dashboardId: string, widgetId: string) => 
    api.delete(`/dashboard/custom-dashboards/${dashboardId}/widgets/${widgetId}/`),
  getCustomDashboardWidgetData: (dashboardId: string, widgetId: string) => 
    api.get(`/dashboard/custom-dashboards/${dashboardId}/widgets/${widgetId}/data/`),

  // Dashboard exports
  getDashboardExports: () => api.get('/dashboard/dashboard-exports/'),
  createDashboardExport: (exportData: any) => 
    api.post('/dashboard/dashboard-exports/', exportData),
  getDashboardExport: (id: string) => 
    api.get(`/dashboard/dashboard-exports/${id}/`),
  updateDashboardExport: (id: string, exportData: any) => 
    api.put(`/dashboard/dashboard-exports/${id}/`, exportData),
  patchDashboardExport: (id: string, exportData: any) => 
    api.patch(`/dashboard/dashboard-exports/${id}/`, exportData),
  deleteDashboardExport: (id: string) => 
    api.delete(`/dashboard/dashboard-exports/${id}/`),
  processDashboardExport: (id: string) => 
    api.post(`/dashboard/dashboard-exports/${id}/process/`),

  // Dashboard filters (global)
  getDashboardFilters: () => api.get('/dashboard/dashboard-filters/'),
  createDashboardFilter: (filterData: any) => 
    api.post('/dashboard/dashboard-filters/', filterData),
  getDashboardFilter: (id: string) => 
    api.get(`/dashboard/dashboard-filters/${id}/`),
  updateDashboardFilter: (id: string, filterData: any) => 
    api.put(`/dashboard/dashboard-filters/${id}/`, filterData),
  patchDashboardFilter: (id: string, filterData: any) => 
    api.patch(`/dashboard/dashboard-filters/${id}/`, filterData),
  deleteDashboardFilter: (id: string) => 
    api.delete(`/dashboard/dashboard-filters/${id}/`),

  // Dashboard shares
  getDashboardShares: () => api.get('/dashboard/dashboard-shares/'),
  createDashboardShare: (shareData: any) => 
    api.post('/dashboard/dashboard-shares/', shareData),
  getDashboardShare: (id: string) => 
    api.get(`/dashboard/dashboard-shares/${id}/`),
  updateDashboardShare: (id: string, shareData: any) => 
    api.put(`/dashboard/dashboard-shares/${id}/`, shareData),
  patchDashboardShare: (id: string, shareData: any) => 
    api.patch(`/dashboard/dashboard-shares/${id}/`, shareData),
  deleteDashboardShare: (id: string) => 
    api.delete(`/dashboard/dashboard-shares/${id}/`),
  revokeDashboardShare: (id: string) => 
    api.post(`/dashboard/dashboard-shares/${id}/revoke/`),

  // Dashboard widgets (global)
  getDashboardWidgets: () => api.get('/dashboard/dashboard-widgets/'),
  createDashboardWidget: (widgetData: any) => 
    api.post('/dashboard/dashboard-widgets/', widgetData),
  getDashboardWidget: (id: string) => 
    api.get(`/dashboard/dashboard-widgets/${id}/`),
  updateDashboardWidget: (id: string, widgetData: any) => 
    api.put(`/dashboard/dashboard-widgets/${id}/`, widgetData),
  patchDashboardWidget: (id: string, widgetData: any) => 
    api.patch(`/dashboard/dashboard-widgets/${id}/`, widgetData),
  deleteDashboardWidget: (id: string) => 
    api.delete(`/dashboard/dashboard-widgets/${id}/`),
  getDashboardWidgetData: (id: string) => 
    api.get(`/dashboard/dashboard-widgets/${id}/data/`),

  // Dashboard operations
  markNotificationRead: (notificationData?: any) => 
    api.post('/dashboard/operations/mark-notification-read/', notificationData),
  getNotifications: () => api.get('/dashboard/operations/notifications/'),
  createNotification: (notificationData: any) => 
    api.post('/dashboard/operations/notifications/', notificationData),
  getQuickStats: () => api.get('/dashboard/operations/quick-stats/'),
  createQuickStats: (statsData: any) => 
    api.post('/dashboard/operations/quick-stats/', statsData),
  searchDashboard: (searchData: any) => 
    api.post('/dashboard/operations/search/', searchData),
  updateUserPreferences: (preferencesData: any) => 
    api.post('/dashboard/operations/update-preferences/', preferencesData),
  getUserPreferences: () => api.get('/dashboard/operations/user-preferences/'),
  createUserPreferences: (preferencesData: any) => 
    api.post('/dashboard/operations/user-preferences/', preferencesData),

  // Special endpoints
  getMyCustomDashboards: () => api.get('/dashboard/custom-dashboards/my_dashboards/'),
  getCustomDashboardTemplates: () => api.get('/dashboard/custom-dashboards/templates/'),
  getPublicDashboards: () => api.get('/dashboard/public/'),
};

// Risks Management API
export const risksAPI = {
  // Risk Assessments Management
  getRiskAssessments: (params?: any) => api.get('/risks/assessments/', { params }),
  
  getRiskAssessment: (id: string) => api.get(`/risks/assessments/${id}/`),
  
  createRiskAssessment: (assessmentData: any) => api.post('/risks/assessments/', assessmentData),
  
  updateRiskAssessment: (id: string, assessmentData: any) =>
    api.put(`/risks/assessments/${id}/`, assessmentData),
  
  partialUpdateRiskAssessment: (id: string, assessmentData: any) =>
    api.patch(`/risks/assessments/${id}/`, assessmentData),
  
  deleteRiskAssessment: (id: string) => api.delete(`/risks/assessments/${id}/`),

  approveRiskAssessment: (id: string, approvalData?: any) =>
    api.post(`/risks/assessments/${id}/approve/`, approvalData),

  // Risk Categories Management
  getRiskCategories: (params?: any) => api.get('/risks/categories/', { params }),
  
  getRiskCategory: (id: string) => api.get(`/risks/categories/${id}/`),
  
  createRiskCategory: (categoryData: any) => api.post('/risks/categories/', categoryData),
  
  updateRiskCategory: (id: string, categoryData: any) =>
    api.put(`/risks/categories/${id}/`, categoryData),
  
  partialUpdateRiskCategory: (id: string, categoryData: any) =>
    api.patch(`/risks/categories/${id}/`, categoryData),
  
  deleteRiskCategory: (id: string) => api.delete(`/risks/categories/${id}/`),

  // Risk Issues Management
  getRiskIssues: (params?: any) => api.get('/risks/issues/', { params }),
  
  getRiskIssue: (id: string) => api.get(`/risks/issues/${id}/`),
  
  createRiskIssue: (issueData: any) => api.post('/risks/issues/', issueData),
  
  updateRiskIssue: (id: string, issueData: any) =>
    api.put(`/risks/issues/${id}/`, issueData),
  
  partialUpdateRiskIssue: (id: string, issueData: any) =>
    api.patch(`/risks/issues/${id}/`, issueData),
  
  deleteRiskIssue: (id: string) => api.delete(`/risks/issues/${id}/`),

  assignRiskIssue: (id: string, assignmentData: any) =>
    api.post(`/risks/issues/${id}/assign/`, assignmentData),
  
  resolveRiskIssue: (id: string, resolutionData?: any) =>
    api.post(`/risks/issues/${id}/resolve/`, resolutionData),

  // Risk Mitigations Management
  getRiskMitigations: (params?: any) => api.get('/risks/mitigations/', { params }),
  
  getRiskMitigation: (id: string) => api.get(`/risks/mitigations/${id}/`),
  
  createRiskMitigation: (mitigationData: any) => api.post('/risks/mitigations/', mitigationData),
  
  updateRiskMitigation: (id: string, mitigationData: any) =>
    api.put(`/risks/mitigations/${id}/`, mitigationData),
  
  partialUpdateRiskMitigation: (id: string, mitigationData: any) =>
    api.patch(`/risks/mitigations/${id}/`, mitigationData),
  
  deleteRiskMitigation: (id: string) => api.delete(`/risks/mitigations/${id}/`),

  markMitigationCompleted: (id: string, completionData?: any) =>
    api.post(`/risks/mitigations/${id}/mark_completed/`, completionData),
  
  updateMitigationProgress: (id: string, progressData: any) =>
    api.post(`/risks/mitigations/${id}/update_progress/`, progressData),

  // Risk Matrices Management
  getRiskMatrices: (params?: any) => api.get('/risks/risk-matrices/', { params }),
  
  getRiskMatrix: (id: string) => api.get(`/risks/risk-matrices/${id}/`),
  
  createRiskMatrix: (matrixData: any) => api.post('/risks/risk-matrices/', matrixData),
  
  updateRiskMatrix: (id: string, matrixData: any) =>
    api.put(`/risks/risk-matrices/${id}/`, matrixData),
  
  partialUpdateRiskMatrix: (id: string, matrixData: any) =>
    api.patch(`/risks/risk-matrices/${id}/`, matrixData),
  
  deleteRiskMatrix: (id: string) => api.delete(`/risks/risk-matrices/${id}/`),

  calculateRisk: (id: string, calculationData?: any) =>
    api.post(`/risks/risk-matrices/${id}/calculate_risk/`, calculationData),

  // Risk Registers Management
  getRiskRegisters: (params?: any) => api.get('/risks/risk-registers/', { params }),
  
  getRiskRegister: (id: string) => api.get(`/risks/risk-registers/${id}/`),
  
  createRiskRegister: (registerData: any) => api.post('/risks/risk-registers/', registerData),
  
  updateRiskRegister: (id: string, registerData: any) =>
    api.put(`/risks/risk-registers/${id}/`, registerData),
  
  partialUpdateRiskRegister: (id: string, registerData: any) =>
    api.patch(`/risks/risk-registers/${id}/`, registerData),
  
  deleteRiskRegister: (id: string) => api.delete(`/risks/risk-registers/${id}/`),

  // Main Risk Items Management
  getRisks: (params?: any) => api.get('/risks/risks/', { params }),
  
  getRisk: (id: string) => api.get(`/risks/risks/${id}/`),
  
  createRisk: (riskData: any) => api.post('/risks/risks/', riskData),
  
  updateRisk: (id: string, riskData: any) =>
    api.put(`/risks/risks/${id}/`, riskData),
  
  partialUpdateRisk: (id: string, riskData: any) =>
    api.patch(`/risks/risks/${id}/`, riskData),
  
  deleteRisk: (id: string) => api.delete(`/risks/risks/${id}/`),

  closeRisk: (id: string, closureData?: any) =>
    api.post(`/risks/risks/${id}/close/`, closureData),
  
  escalateRisk: (id: string, escalationData?: any) =>
    api.post(`/risks/risks/${id}/escalate/`, escalationData),

  getHeatmapData: (params?: any) => api.get('/risks/risks/heatmap_data/', { params }),

  // Risk Dashboard
  getRiskDashboard: () => api.get('/risks/dashboard/'),

  // Risk Reports
  getRiskReports: (params?: any) => api.get('/risks/reports/', { params }),
  
  getRiskReport: (id: string) => api.get(`/risks/reports/${id}/`),
  
  createRiskReport: (reportData: any) => api.post('/risks/reports/', reportData),
  
  updateRiskReport: (id: string, reportData: any) =>
    api.put(`/risks/reports/${id}/`, reportData),
  
  partialUpdateRiskReport: (id: string, reportData: any) =>
    api.patch(`/risks/reports/${id}/`, reportData),
  
  deleteRiskReport: (id: string) => api.delete(`/risks/reports/${id}/`),
  
  downloadRiskReport: (id: string) => api.get(`/risks/reports/${id}/download/`),
  
  shareRiskReport: (id: string, shareData?: any) =>
    api.post(`/risks/reports/${id}/share/`, shareData),

  // Risk Matrices - Additional Functions
  setDefaultRiskMatrix: (id: string) => api.post(`/risks/matrices/${id}/set_default/`),

  // Risk Registers - Additional Functions
  exportRiskRegister: (id: string, exportData?: any) =>
    api.get(`/risks/registers/${id}/export/`, exportData),
};

export default api;
