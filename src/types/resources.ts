export interface ResourceAllocation {
  id: string;
  project: string;
  project_name?: string;
  project_code?: string;
  employee: string;
  employee_name?: string;
  employee_email?: string;
  allocation_percentage: number;
  start_date: string;
  end_date: string;
  actual_start_date?: string;
  actual_end_date?: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
  hourly_rate: string;
  estimated_cost: string;
  actual_cost: string;
  approved_by_name?: string;
  approved_by?: string;
  approved_date?: string;
  created_by_name?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  allocation_duration?: number;
  is_active?: boolean;
}

export interface Timesheet {
  id: string;
  employee: string;
  employee_name?: string;
  employee_email?: string;
  project: string;
  project_name?: string;
  project_code?: string;
  resource_allocation?: string;
  week_start_date: string;
  week_end_date: string;
  total_hours: number;
  regular_hours: number;
  overtime_hours: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
  approved_by_name?: string;
  approved_by?: string;
  approved_date?: string;
  total_cost: string;
  employee_comments: string;
  approver_comments: string;
  created_at: string;
  updated_at: string;
  entries?: TimesheetEntry[];
}

export interface TimesheetEntry {
  id: string;
  timesheet: string;
  date: string;
  regular_hours: number;
  overtime_hours: number;
  task_description: string;
  task_category: string;
  is_billable: boolean;
  created_at: string;
  total_hours?: number;
}

export interface LeaveRequest {
  id: string;
  employee: string;
  employee_name?: string;
  employee_email?: string;
  leave_type: 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'unpaid' | 'other';
  start_date: string;
  end_date: string;
  total_days: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approved_by_name?: string;
  approved_by?: string;
  approved_date?: string;
  reason: string;
  emergency_contact: string;
  attachment?: string;
  handover_notes: string;
  handover_to_name?: string;
  handover_to?: string;
  created_at: string;
  updated_at: string;
}

export interface Equipment {
  id: string;
  name: string;
  equipment_type: 'laptop' | 'desktop' | 'mobile' | 'tablet' | 'server' | 'network' | 'printer' | 'other';
  model_number: string;
  serial_number?: string;
  brand: string;
  status: 'available' | 'assigned' | 'maintenance' | 'retired' | 'lost';
  assigned_to_name?: string;
  assigned_to?: string;
  assigned_date?: string;
  return_date?: string;
  purchase_date?: string;
  purchase_cost?: string;
  purchase_order_number: string;
  vendor: string;
  specifications: Record<string, any>;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  maintenance_notes: string;
  notes: string;
  created_by_name?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  is_assigned?: boolean;
  needs_maintenance?: boolean;
}

export interface EquipmentMaintenance {
  id: string;
  equipment: string;
  equipment_name?: string;
  maintenance_type: 'preventive' | 'repair' | 'upgrade' | 'inspection';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  title: string;
  description: string;
  scheduled_date: string;
  completed_date?: string;
  cost?: string;
  vendor: string;
  invoice_number: string;
  assigned_to_name?: string;
  assigned_to?: string;
  created_by_name?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ResourceRequest {
  id: string;
  project: string;
  project_name?: string;
  project_code?: string;
  requested_by: string;
  requested_by_name?: string;
  request_type: 'new' | 'replacement' | 'additional' | 'extension';
  title: string;
  description: string;
  skill_requirements: string;
  experience_level: string;
  quantity: number;
  needed_by_date: string;
  duration_days: number;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'fulfilled' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimated_cost: string;
  budget_approved: boolean;
  fulfilled_by_name?: string;
  fulfilled_by?: string;
  fulfillment_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ResourcesStats {
  total_allocations: number;
  active_allocations: number;
  pending_allocations: number;
  total_equipment: number;
  available_equipment: number;
  assigned_equipment: number;
  maintenance_equipment: number;
  total_timesheets: number;
  pending_timesheets: number;
  approved_timesheets: number;
  total_leave_requests: number;
  pending_leave_requests: number;
  approved_leave_requests: number;
  total_resource_requests: number;
  pending_resource_requests: number;
  approved_resource_requests: number;
  allocation_by_status: Record<string, number>;
  equipment_by_status: Record<string, number>;
  timesheet_status_distribution: Record<string, number>;
  leave_type_distribution: Record<string, number>;
  resource_request_priority_distribution: Record<string, number>;
}

export interface ResourceUtilization {
  employee_name: string;
  employee_id: string;
  total_allocation_percentage: number;
  active_projects: string[];
  current_allocations: ResourceAllocation[];
  utilization_trend: {
    date: string;
    allocation_percentage: number;
  }[];
}

export interface EquipmentInventory {
  total_count: number;
  by_type: Record<string, number>;
  by_status: Record<string, number>;
  by_brand: Record<string, number>;
  maintenance_due: Equipment[];
  recently_assigned: Equipment[];
  total_value: number;
}
