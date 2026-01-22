"use server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { CreateSPKFormData } from "@/lib/types";
import { generateSPKNumber } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function createSPK(data: CreateSPKFormData) {
  try {
    // Calculate payment amounts based on percentages
    const dpAmount = (data.contractValue * data.dpPercentage) / 100;
    const progressAmount = (data.contractValue * data.progressPercentage) / 100;
    const finalAmount =
      (data.contractValue *
        (100 - data.dpPercentage - data.progressPercentage)) /
      100;

    // Generate SPK number if not provided
    const spkNumber = generateSPKNumber();

    // Create SPK record
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
        dp_percentage: data.dpPercentage,
        dp_amount: dpAmount,
        progress_percentage: data.progressPercentage,
        progress_amount: progressAmount,
        final_percentage: 100 - data.dpPercentage - data.progressPercentage,
        final_amount: finalAmount,
        status: "draft",
        created_by: "admin@company.com", // TODO: Get from auth session
        notes: data.notes || null,
      })
      .select()
      .single();

    if (spkError) throw spkError;

    // Create payment records
    const payments = [
      {
        spk_id: spk.id,
        term: "dp" as const,
        amount: dpAmount,
        percentage: data.dpPercentage,
        status: "pending" as const,
        updated_by: "admin@company.com",
      },
      {
        spk_id: spk.id,
        term: "progress" as const,
        amount: progressAmount,
        percentage: data.progressPercentage,
        status: "pending" as const,
        updated_by: "admin@company.com",
      },
      {
        spk_id: spk.id,
        term: "final" as const,
        amount: finalAmount,
        percentage: 100 - data.dpPercentage - data.progressPercentage,
        status: "pending" as const,
        updated_by: "admin@company.com",
      },
    ];

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

export async function publishSPK(spkId: string) {
  try {
    const { data: spk, error } = await supabaseAdmin
      .from("spk")
      .update({ status: "published" })
      .eq("id", spkId)
      .select()
      .single();

    if (error) throw error;

    // Trigger n8n webhook for SPK published
    if (process.env.N8N_WEBHOOK_SPK_PUBLISHED) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
      if (!baseUrl) {
        throw new Error(
          "NEXT_PUBLIC_APP_URL is not set in environment variables",
        );
      }
      const pdfUrl = `${baseUrl}/api/pdf/${spkId}`;
      const vendorLink = `${baseUrl}/vendor?spkId=${spkId}`;

      await fetch(process.env.N8N_WEBHOOK_SPK_PUBLISHED, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spkNumber: spk.spk_number,
          vendorName: spk.vendor_name,
          vendorEmail: spk.vendor_email,
          projectName: spk.project_name,
          contractValue: spk.contract_value,
          currency: spk.currency,
          pdfUrl: pdfUrl,
          vendorLink: vendorLink,
        }),
      });
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

export async function getSPKWithPayments(spkId: string) {
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
      .order("term", { ascending: true });

    if (paymentError) throw paymentError;

    return { success: true, data: { ...spk, payments } };
  } catch (error) {
    console.error("Error fetching SPK details:", error);
    return { success: false, error: "Failed to fetch SPK details" };
  }
}
