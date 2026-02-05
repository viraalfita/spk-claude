"use server";

import { sendSPKCreatedEmail } from "@/lib/email";
import { generateSPKPDFBuffer } from "@/lib/pdf/generate-buffer";
import { supabaseAdmin } from "@/lib/supabase/server";
import { CreateSPKFormData, SPKWithPayments } from "@/lib/types";
import { generateSPKDatePrefix } from "@/lib/utils";
import { getOrCreateVendorToken } from "@/app/actions/vendor";
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

    // Generate SPK number with format ELX/SPK/YYYYMMDD/###
    const datePrefix = generateSPKDatePrefix();

    // Query existing SPK numbers for today to determine next sequential number
    const { data: existingNumbers } = await supabaseAdmin
      .from("spk")
      .select("spk_number")
      .like("spk_number", `${datePrefix}/%`);

    let nextIncrement = 1;
    if (existingNumbers && existingNumbers.length > 0) {
      const increments = existingNumbers
        .map((row) => {
          const parts = row.spk_number.split("/");
          return parseInt(parts[parts.length - 1], 10);
        })
        .filter((n) => !isNaN(n));
      if (increments.length > 0) {
        nextIncrement = Math.max(...increments) + 1;
      }
    }

    const spkNumber = `${datePrefix}/${nextIncrement.toString().padStart(3, "0")}`;

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
        created_by: data.picName?.trim() || session.user.name,
        created_by_email: data.picEmail?.trim() || session.user.email,
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

    // Create or find vendor record and get share token
    let vendorToken: string | undefined;
    if (data.vendorEmail) {
      const tokenResult = await getOrCreateVendorToken(
        data.vendorEmail,
        data.vendorName,
        data.vendorPhone,
      );
      if (tokenResult.success) {
        vendorToken = tokenResult.token;
      }
    }

    revalidatePath("/dashboard");
    return { success: true, data: spk, vendorToken };
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

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Send email notification with PDF attachment (optional, user-triggered)
    if (sendEmail && spk.vendor_email) {
      // Get SPK with payments for PDF generation
      const spkWithPayments = await getSPKWithPayments(spkId);

      if (spkWithPayments.success && spkWithPayments.data) {
        // Generate PDF buffer for attachment
        const pdfBuffer = await generateSPKPDFBuffer(spkWithPayments.data);

        // Get or create vendor token for dashboard link
        const tokenResult = await getOrCreateVendorToken(
          spk.vendor_email,
          spk.vendor_name,
          spk.vendor_phone
        );

        const vendorDashboardUrl = tokenResult.success && tokenResult.token
          ? `${baseUrl}/vendor?token=${tokenResult.token}`
          : undefined;

        // Send email with PDF attachment and vendor dashboard link
        await sendSPKCreatedEmail({
          to: spk.vendor_email,
          spk,
          pdfBuffer,
          vendorDashboardUrl,
        });
      }
    }

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/spk/${spkId}`);
    return { success: true, data: spk };
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
