"use server";

import { sendSPKCreatedEmail } from "@/lib/email";
import { notifySPKPublished } from "@/lib/slack";
import { supabaseAdmin } from "@/lib/supabase/server";
import { CreateSPKFormData, SPKWithPayments } from "@/lib/types";
import { generateSPKNumber } from "@/lib/utils";
import { revalidatePath } from "next/cache";

// Helper to get user session (placeholder - implement based on your auth strategy)
async function getUserSession() {
  // TODO: Implement actual session retrieval
  // For now, return a mock session
  return {
    user: {
      name: "Admin User",
      email: "admin@company.com",
    },
  };
}

export async function createSPK(data: CreateSPKFormData) {
  try {
    const session = await getUserSession();

    // Generate SPK number if not provided or check uniqueness if provided
    let spkNumber = data.spkNumber?.trim();
    if (!spkNumber || spkNumber === "") {
      spkNumber = generateSPKNumber();
    } else {
      // Check if SPK number already exists
      const { data: existing } = await supabaseAdmin
        .from("spk")
        .select("id")
        .eq("spk_number", spkNumber)
        .single();

      if (existing) {
        return {
          success: false,
          error: `SPK number ${spkNumber} already exists`,
        };
      }
    }

    // Create SPK record (without hardcoded payment fields)
    const { data: spk, error: spkError } = await supabaseAdmin
      .from("spk")
      .insert({
        spk_number: spkNumber,
        vendor_name: data.vendorName,
        vendor_email: data.vendorEmail || null,
        vendor_phone: data.vendorPhone || null,
        project_name: data.projectName,
        project_description: data.projectDescription || null,
        contract_value: data.contractValue,
        currency: data.currency,
        start_date: data.startDate,
        end_date: data.endDate || null,
        status: "draft",
        created_by: session.user.name,
        created_by_email: session.user.email,
        notes: data.notes || null,
      })
      .select()
      .single();

    if (spkError) throw spkError;

    // Create dynamic payment records
    const payments = data.paymentTerms.map((term, index) => ({
      spk_id: spk.id,
      term_name: term.term_name,
      term_order: term.term_order || index + 1,
      amount: term.amount,
      percentage: term.percentage || null,
      input_type: term.input_type,
      due_date: term.due_date || null,
      status: "pending" as const,
      updated_by: session.user.email,
    }));

    const { error: paymentError } = await supabaseAdmin
      .from("payment")
      .insert(payments);

    if (paymentError) throw paymentError;

    revalidatePath("/dashboard");
    return { success: true, data: spk };
  } catch (error) {
    console.error("Error creating SPK:", error);
    return { success: false, error: "Failed to create SPK" };
  }
}

export async function publishSPK(spkId: string, sendEmail: boolean = false) {
  try {
    // Update SPK status
    const { data: spk, error } = await supabaseAdmin
      .from("spk")
      .update({ status: "published" })
      .eq("id", spkId)
      .select()
      .single();

    if (error) throw error;

    // Generate PDF URL for sharing
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const pdfUrl = `${baseUrl}/api/pdf/${spkId}`;

    // Send Slack notification (automatic)
    await notifySPKPublished(spk);

    // Send email notification (optional, user-triggered)
    if (sendEmail && spk.vendor_email) {
      await sendSPKCreatedEmail({
        to: spk.vendor_email,
        spk,
        pdfUrl,
      });
    }

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/spk/${spkId}`);
    return { success: true, data: spk, pdfUrl };
  } catch (error) {
    console.error("Error publishing SPK:", error);
    return { success: false, error: "Failed to publish SPK" };
  }
}

export async function getSPKList(status?: "draft" | "published") {
  try {
    let query = supabaseAdmin
      .from("spk")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching SPK list:", error);
    return { success: false, error: "Failed to fetch SPK list" };
  }
}

export async function getSPKWithPayments(
  spkId: string,
): Promise<{ success: boolean; data?: SPKWithPayments; error?: string }> {
  try {
    const { data: spk, error: spkError } = await supabaseAdmin
      .from("spk")
      .select("*")
      .eq("id", spkId)
      .single();

    if (spkError) throw spkError;

    const { data: payments, error: paymentError } = await supabaseAdmin
      .from("payment")
      .select("*")
      .eq("spk_id", spkId)
      .order("term_order", { ascending: true }); // Order by term_order instead of term

    if (paymentError) throw paymentError;

    return { success: true, data: { ...spk, payments } };
  } catch (error) {
    console.error("Error fetching SPK details:", error);
    return { success: false, error: "Failed to fetch SPK details" };
  }
}

export async function updateSPK(
  spkId: string,
  data: Partial<CreateSPKFormData>,
) {
  try {
    const { error } = await supabaseAdmin
      .from("spk")
      .update({
        vendor_name: data.vendorName,
        vendor_email: data.vendorEmail || null,
        vendor_phone: data.vendorPhone || null,
        project_name: data.projectName,
        project_description: data.projectDescription || null,
        contract_value: data.contractValue,
        currency: data.currency,
        start_date: data.startDate,
        end_date: data.endDate || null,
        notes: data.notes || null,
      })
      .eq("id", spkId);

    if (error) throw error;

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/spk/${spkId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating SPK:", error);
    return { success: false, error: "Failed to update SPK" };
  }
}

export async function deleteSPK(spkId: string) {
  try {
    const { error } = await supabaseAdmin.from("spk").delete().eq("id", spkId);

    if (error) throw error;

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting SPK:", error);
    return { success: false, error: "Failed to delete SPK" };
  }
}
