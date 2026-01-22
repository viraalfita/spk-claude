// Database types matching Supabase schema

export interface SPK {
  id: string;
  spk_number: string;
  vendor_name: string;
  vendor_email: string | null;
  vendor_phone: string | null;
  project_name: string;
  project_description: string | null;
  contract_value: number;
  currency: string;
  start_date: string;
  end_date: string | null;
  dp_percentage: number;
  dp_amount: number;
  progress_percentage: number;
  progress_amount: number;
  final_percentage: number;
  final_amount: number;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
  created_by: string;
  notes: string | null;
  pdf_url: string | null;
}

export interface Payment {
  id: string;
  spk_id: string;
  term: "dp" | "progress" | "final";
  amount: number;
  percentage: number;
  status: "pending" | "paid" | "overdue";
  paid_date: string | null;
  payment_reference: string | null;
  updated_at: string;
  updated_by: string;
}

export interface Vendor {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  access_token: string | null;
  created_at: string;
}

// Form data types
export interface CreateSPKFormData {
  vendorName: string;
  vendorEmail?: string;
  vendorPhone?: string;
  projectName: string;
  projectDescription?: string;
  contractValue: number;
  currency: string;
  startDate: string;
  endDate?: string;
  dpPercentage: number;
  progressPercentage: number;
  finalPercentage: number;
  notes?: string;
}

export interface UpdatePaymentFormData {
  paymentId: string;
  status: "pending" | "paid" | "overdue";
  paidDate?: string;
  paymentReference?: string;
}

// Combined types for display
export interface SPKWithPayments extends SPK {
  payments: Payment[];
}

// Payment term labels
export const PAYMENT_TERM_LABELS: Record<Payment["term"], string> = {
  dp: "Down Payment",
  progress: "Progress Payment",
  final: "Final Payment",
};

// Status badge colors
export const STATUS_COLORS = {
  draft: "bg-gray-100 text-gray-800",
  published: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  overdue: "bg-red-100 text-red-800",
} as const;
