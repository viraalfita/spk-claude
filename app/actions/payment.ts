"use server";

import { sendPaymentUpdateEmail } from "@/lib/email";
import { notifyPaymentUpdated } from "@/lib/slack";
import { supabaseAdmin } from "@/lib/supabase/server";
import { UpdatePaymentFormData } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function updatePaymentStatus(data: UpdatePaymentFormData) {
  try {
    const updateData = {
      status: data.status,
      updated_by: "admin@company.com", // TODO: Get from auth session
      paid_date: data.paidDate || undefined,
      payment_reference: data.paymentReference || undefined,
    };

    const { data: payment, error } = await supabaseAdmin
      .from("payment")
      .update(updateData)
      .eq("id", data.paymentId)
      .select("*, spk:spk_id(*)")
      .single();

    if (error) throw error;

    // Send Slack notification (automatic)
    if (payment.spk) {
      await notifyPaymentUpdated(payment.spk, payment, updateData.updated_by);
    }

    // Send email notification (optional)
    if (data.sendEmail && payment.spk && payment.spk.vendor_email) {
      await sendPaymentUpdateEmail({
        to: payment.spk.vendor_email,
        spk: payment.spk,
        paymentTermName: payment.term_name,
        paymentStatus: payment.status,
        paymentAmount: payment.amount,
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
      .order("term_order", { ascending: true }); // Order by term_order instead of term

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching payments:", error);
    return { success: false, error: "Failed to fetch payments" };
  }
}
