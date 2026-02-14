export interface KPI {
  id: string;
  name: string;
  code: string;
  description: string;
  category: 'financial' | 'operational' | 'project' | 'resource' | 'customer' | 'innovation' | 'quality' | 'safety';
  unit: 'percentage' | 'currency' | 'count' | 'time' | 'ratio' | 'score' | 'rating' | 'other';
  formula: string;
  data_source: string;
  target_value?: number;
  minimum_threshold?: number;
  maximum_threshold?: number;
  trend_direction: 'increase' | 'decrease' | 'neutral';
  weight: number;
  is_active: boolean;
  is_calculated: boolean;
  chart_type: string;
  color: string;
  created_by_name?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Metric {
  id: string;
  kpi: string;
  kpi_name?: string;
  kpi_code?: string;
  value: number;
  period_date: string;
  calculated_date: string;
  project?: string;
  project_name?: string;
  department?: string;
  department_name?: string;
  target_value?: number;
  variance?: number;
  variance_percentage?: number;
  status: 'on_target' | 'below_target' | 'above_target' | 'critical';
  notes: string;
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  dashboard_type: 'executive' | 'project' | 'department' | 'financial' | 'resource' | 'risk' | 'custom';
  project?: string;
  project_name?: string;
  department?: string;
  department_name?: string;
  layout_config: Record<string, any>;
  filters: Record<string, any>;
  refresh_interval: number;
  is_public: boolean;
  allowed_users: string[];
  is_active: boolean;
  created_by_name?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  widgets?: Widget[];
}

export interface Widget {
  id: string;
  dashboard: string;
  dashboard_name?: string;
  title: string;
  widget_type: 'kpi_gauge' | 'line_chart' | 'bar_chart' | 'pie_chart' | 'table' | 'heatmap' | 'treemap' | 'scatter_plot' | 'summary_card' | 'trend_line';
  size: 'small' | 'medium' | 'large' | 'extra_large' | 'full_width';
  kpis: string[];
  data_source: string;
  query_parameters: Record<string, any>;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  color_scheme: string;
  show_legend: boolean;
  show_tooltip: boolean;
  time_range: string;
  auto_refresh: boolean;
  refresh_interval: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReportSchedule {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  custom_cron: string;
  start_date: string;
  end_date?: string;
  next_run?: string;
  last_run?: string;
  report_type: string;
  report_parameters: Record<string, any>;
  output_format: 'pdf' | 'excel' | 'csv' | 'html' | 'json';
  recipients: string[];
  email_subject: string;
  email_body: string;
  is_active: boolean;
  last_status: 'success' | 'failed' | 'pending';
  last_error: string;
  created_by_name?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PortfolioHealth {
  id: string;
  portfolio_date: string;
  project?: string;
  project_name?: string;
  department?: string;
  department_name?: string;
  budget_health: number;
  timeline_health: number;
  resource_health: number;
  risk_health: number;
  quality_health: number;
  overall_health: number;
  health_status: 'critical' | 'poor' | 'fair' | 'good' | 'excellent';
  trend_direction: 'improving' | 'stable' | 'declining' | 'volatile';
  key_issues: string[];
  recommendations: string[];
  calculated_at: string;
  calculated_by_name?: string;
  calculated_by?: string;
}

export interface PredictiveAnalytics {
  id: string;
  name: string;
  description: string;
  model_type: 'regression' | 'classification' | 'clustering' | 'time_series' | 'anomaly_detection' | 'forecasting';
  target_variable: string;
  features: string[];
  training_data_range_start?: string;
  training_data_range_end?: string;
  accuracy_score?: number;
  precision_score?: number;
  recall_score?: number;
  f1_score?: number;
  mse?: number;
  mae?: number;
  predictions: Record<string, any>;
  next_prediction_date?: string;
  next_predicted_value?: number;
  confidence_interval: Record<string, any>;
  is_active: boolean;
  last_trained?: string;
  created_by_name?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DataExport {
  id: string;
  export_type: string;
  filters: Record<string, any>;
  columns: string[];
  format: 'csv' | 'excel' | 'json' | 'pdf';
  file_name: string;
  file_path: string;
  file_size?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requested_by_name?: string;
  requested_by?: string;
  requested_at: string;
  completed_at?: string;
  error_message: string;
}

export interface AnalyticsStats {
  total_kpis: number;
  active_kpis: number;
  total_metrics: number;
  recent_metrics: number;
  total_dashboards: number;
  public_dashboards: number;
  total_widgets: number;
  active_widgets: number;
  total_reports: number;
  active_reports: number;
  kpi_by_category: Record<string, number>;
  dashboard_by_type: Record<string, number>;
  metric_status_distribution: Record<string, number>;
  health_status_distribution: Record<string, number>;
}

export interface AnalyticsSummary {
  portfolio_health: {
    current_score: number;
    trend: 'improving' | 'stable' | 'declining';
    status: 'critical' | 'poor' | 'fair' | 'good' | 'excellent';
  };
  top_kpis: {
    kpi: KPI;
    latest_metric: Metric;
    performance: 'above_target' | 'on_target' | 'below_target' | 'critical';
  }[];
  recent_alerts: {
    id: string;
    type: 'kpi' | 'health' | 'system';
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: string;
  }[];
  upcoming_reports: ReportSchedule[];
  active_models: PredictiveAnalytics[];
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
    borderWidth?: number;
    fill?: boolean;
  }[];
}

export interface KPITrend {
  kpi: KPI;
  metrics: Metric[];
  trend: 'up' | 'down' | 'stable';
  trend_percentage: number;
  performance: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
}

export interface DashboardLayout {
  grid: {
    cols: number;
    rows: number;
    gap: number;
  };
  widgets: {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
  }[];
}

export interface AnalyticsFilters {
  date_range: {
    start: string;
    end: string;
  };
  projects: string[];
  departments: string[];
  kpi_categories: string[];
  status: string[];
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'json' | 'pdf';
  include_charts: boolean;
  date_range: {
    start: string;
    end: string;
  };
  filters: AnalyticsFilters;
  columns: string[];
}
