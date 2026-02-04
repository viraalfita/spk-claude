// Database types matching updated Supabase schema

export interface SPK {
  id: string;
  spk_number: string; // Auto-generated, but editable
  vendor_name: string;
  vendor_email: string | null;
  vendor_phone: string | null;
  project_name: string;
  project_description: string | null;
  contract_value: number;
  currency: string; // IDR, USD, SGD, EUR, MYR, etc.
  start_date: string;
  end_date: string | null;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
  created_by: string; // Auto from session
  created_by_email: string; // Auto from session
  notes: string | null;
  pdf_url: string | null;
}

export interface Payment {
  id: string;
  spk_id: string;
  term_name: string; // Dynamic: "Down Payment", "Progress 1", etc.
  term_order: number; // Sequence: 1, 2, 3, ...
  amount: number;
  percentage: number | null; // Optional
  input_type: "percentage" | "nominal";
  status: "pending" | "paid" | "overdue";
  due_date: string | null;
  paid_date: string | null;
  payment_reference: string | null;
  description: string | null; // Optional description for the payment term
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
export interface PaymentTerm {
  term_name: string;
  term_order: number;
  amount: number;
  percentage?: number | null;
  input_type: "percentage" | "nominal";
  due_date?: string;
  description?: string;
}

export interface CreateSPKFormData {
  spkNumber?: string; // Optional, will be auto-generated if not provided
  vendorName: string;
  vendorEmail?: string;
  vendorPhone?: string;
  picName?: string;
  picEmail?: string;
  projectName: string;
  projectDescription?: string;
  contractValue: number;
  currency: string; // IDR, USD, SGD, EUR, MYR, etc.
  startDate: string;
  endDate?: string;
  paymentTerms: PaymentTerm[]; // Dynamic array of payment terms
  notes?: string;
}

export interface UpdatePaymentFormData {
  paymentId: string;
  status: "pending" | "paid" | "overdue";
  paidDate?: string;
  paymentReference?: string;
  sendEmail?: boolean; // Optional: whether to send email notification
}

// Combined types for display
export interface SPKWithPayments extends SPK {
  payments: Payment[];
}

// Currency options
export const CURRENCY_OPTIONS = [
  { value: "IDR", label: "IDR - Indonesian Rupiah", symbol: "Rp" },
  { value: "USD", label: "USD - US Dollar", symbol: "$" },
  { value: "SGD", label: "SGD - Singapore Dollar", symbol: "S$" },
  { value: "EUR", label: "EUR - Euro", symbol: "€" },
  { value: "MYR", label: "MYR - Malaysian Ringgit", symbol: "RM" },
  { value: "etc", label: "etc - Other", symbol: "" },
] as const;

// Simple currency list for forms
export const CURRENCIES = ["IDR", "USD", "SGD", "EUR", "MYR", "etc"] as const;

// Status badge colors
export const STATUS_COLORS = {
  draft: "bg-gray-100 text-gray-800",
  published: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  overdue: "bg-red-100 text-red-800",
} as const;
