export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  manager_name?: string;
  manager?: string;
  parent_department_name?: string;
  parent_department?: string;
  budget: string;
  created_at: string;
  updated_at: string;
  employees?: Employee[];
  sub_departments?: Department[];
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string;
  created_at: string;
  employees?: Employee[];
}

export interface Employee {
  id: string;
  user: string;
  user_name?: string;
  user_email?: string;
  employee_id: string;
  hire_date: string;
  job_title: string;
  salary?: string;
  department_name?: string;
  department?: string;
  manager_name?: string;
  manager?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  skills?: EmployeeSkill[];
}

export interface EmployeeSkill {
  id: string;
  employee: string;
  employee_name?: string;
  skill: string;
  skill_name?: string;
  skill_category?: string;
  level: 1 | 2 | 3 | 4;
  verified: boolean;
  verified_by_name?: string;
  verified_by?: string;
  verified_date?: string;
  created_at: string;
}

export interface OrganizationStats {
  total_departments: number;
  total_employees: number;
  active_employees: number;
  total_skills: number;
  departments_by_size: Record<string, number>;
  employees_by_department: Record<string, number>;
  skills_by_category: Record<string, number>;
  recent_hires: Employee[];
  upcoming_verifications: EmployeeSkill[];
}

export interface DepartmentHierarchy {
  id: string;
  name: string;
  code: string;
  manager_name?: string;
  employee_count: number;
  budget: string;
  sub_departments: DepartmentHierarchy[];
}
