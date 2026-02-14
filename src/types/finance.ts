export interface Budget {
  id: string;
  name: string;
  code: string;
  description?: string;
  department_name?: string;
  project_name?: string;
  department?: string;
  project?: string;
  total_amount: string;
  allocated_amount: string;
  utilized_amount: string;
  remaining_amount?: string;
  utilization_rate?: number;
  variance?: string;
  fiscal_year: number;
  start_date: string;
  end_date: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'active' | 'closed';
  approved_by_name?: string;
  approved_date?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  line_items?: BudgetLineItem[];
  approvals?: BudgetApproval[];
}

export interface BudgetLineItem {
  id: string;
  budget: string;
  category: string;
  description?: string;
  amount: string;
  allocated_amount: string;
  utilized_amount: string;
  sequence: number;
  created_at: string;
  updated_at: string;
  expenses?: Expense[];
}

export interface Expense {
  id: string;
  reference_number: string;
  description: string;
  budget_line_item_category?: string;
  project_name?: string;
  department_name?: string;
  employee_name?: string;
  budget_line_item?: string;
  project?: string;
  department?: string;
  employee?: string;
  amount: string;
  tax_amount: string;
  total_amount: string;
  expense_date: string;
  submission_date: string;
  payment_date?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
  payment_method: 'cash' | 'check' | 'credit_card' | 'bank_transfer' | 'digital_wallet' | '';
  receipt?: string;
  notes?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetApproval {
  id: string;
  budget: string;
  approver_name?: string;
  approver?: string;
  approval_level: number;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'active' | 'closed';
  comments?: string;
  approved_at?: string;
  created_at: string;
}

export interface FinanceStats {
  total_budgets: number;
  total_amount: string;
  total_utilized: string;
  total_remaining: string;
  average_utilization: number;
  pending_approvals: number;
  total_expenses: number;
  total_expense_amount: string;
  budgets_by_status: Record<string, number>;
  expenses_by_status: Record<string, number>;
}
