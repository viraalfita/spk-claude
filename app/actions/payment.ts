"use server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { UpdatePaymentFormData } from "@/lib/types";

export async function updatePaymentStatus(data: UpdatePaymentFormData) {
  try {
    const updateData: any = {
      status: data.status,
      updated_by: "admin@company.com", // TODO: Get from auth session
    };

    if (data.paidDate) {
      updateData.paid_date = data.paidDate;
    }

    if (data.paymentReference) {
      updateData.payment_reference = data.paymentReference;
    }

    const { data: payment, error } = await supabaseAdmin
      .from("payment")
      .update(updateData)
      .eq("id", data.paymentId)
      .select("*, spk:spk_id(*)")
      .single();

    if (error) throw error;

    // Trigger n8n webhook for payment status updated
    if (process.env.N8N_WEBHOOK_PAYMENT_UPDATED && payment.spk) {
      await fetch(process.env.N8N_WEBHOOK_PAYMENT_UPDATED, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "payment.updated",
          id: payment.spk.id,
          spkNumber: payment.spk.spk_number,
          vendorName: payment.spk.vendor_name,
          vendorEmail: payment.spk.vendor_email,
          vendorPhone: payment.spk.vendor_phone,
          projectName: payment.spk.project_name,
          projectDescription: payment.spk.project_description,
          contractValue: payment.spk.contract_value,
          currency: payment.spk.currency,
          startDate: payment.spk.start_date,
          endDate: payment.spk.end_date,
          dpPercentage: payment.spk.dp_percentage,
          dpAmount: payment.spk.dp_amount,
          progressPercentage: payment.spk.progress_percentage,
          progressAmount: payment.spk.progress_amount,
          finalPercentage: payment.spk.final_percentage,
          finalAmount: payment.spk.final_amount,
          status: payment.spk.status,
          createdAt: payment.spk.created_at,
          updatedAt: payment.spk.updated_at,
          createdBy: payment.spk.created_by,
          notes: payment.spk.notes,
          paymentId: payment.id,
          paymentTerm: payment.term,
          paymentAmount: payment.amount,
          paymentPercentage: payment.percentage,
          paymentStatus: payment.status,
          paymentPaidDate: payment.paid_date,
          paymentReference: payment.payment_reference,
          paymentUpdatedAt: payment.updated_at,
          paymentUpdatedBy: payment.updated_by,
        }),
      });
    }

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/spk/${payment.spk_id}`);
    return { success: true, data: payment };
  } catch (error) {
    console.error("Error updating payment status:", error);
    return { success: false, error: "Failed to update payment status" };
  }
}

export async function getPaymentsBySPK(spkId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("payment")
      .select("*")
      .eq("spk_id", spkId)
      .order("term", { ascending: true });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching payments:", error);
    return { success: false, error: "Failed to fetch payments" };
  }
}
