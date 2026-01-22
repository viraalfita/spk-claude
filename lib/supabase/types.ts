// Auto-generated Supabase types
export interface Database {
  public: {
    Tables: {
      spk: {
        Row: {
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
        };
        Insert: Omit<
          Database["public"]["Tables"]["spk"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["spk"]["Insert"]>;
      };
      payment: {
        Row: {
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
        };
        Insert: {
          spk_id: string;
          term: "dp" | "progress" | "final";
          amount: number;
          percentage: number;
          status: "pending" | "paid" | "overdue";
          paid_date?: string | null;
          payment_reference?: string | null;
          updated_by: string;
        };
        Update: {
          spk_id?: string;
          term?: "dp" | "progress" | "final";
          amount?: number;
          percentage?: number;
          status?: "pending" | "paid" | "overdue";
          paid_date?: string | null;
          payment_reference?: string | null;
          updated_by?: string;
        };
      };
      vendor: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          access_token: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["vendor"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["vendor"]["Insert"]>;
      };
    };
  };
}
