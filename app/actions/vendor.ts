"use server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

export async function getVendorHistory() {
  try {
    // Get distinct vendors from SPK table, ordered by most recent
    const { data, error } = await supabaseAdmin
      .from("spk")
      .select("vendor_name, vendor_email, vendor_phone")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Remove duplicates based on vendor_name (case insensitive)
    const uniqueVendors = data.reduce((acc: any[], current) => {
      const exists = acc.find(
        (v) =>
          v.vendor_name.toLowerCase() === current.vendor_name.toLowerCase(),
      );
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);

    return { success: true, data: uniqueVendors };
  } catch (error) {
    console.error("Error fetching vendor history:", error);
    return { success: false, error: "Failed to fetch vendor history" };
  }
}

/**
 * Find or create a vendor record and return its access_token.
 * Used when creating an SPK to generate a stable vendor share link.
 */
export async function getOrCreateVendorToken(
  email: string,
  name: string,
  phone?: string,
): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    // Look up existing vendor by email (case-insensitive)
    const { data: existing, error: findError } = await supabaseAdmin
      .from("vendor")
      .select("id, access_token")
      .ilike("email", email)
      .maybeSingle();

    if (findError) {
      console.error("Error finding vendor:", findError.message);
      throw findError;
    }

    if (existing && existing.access_token) {
      return { success: true, token: existing.access_token };
    }

    if (existing && !existing.access_token) {
      // Vendor exists but has no token — generate one
      const token = randomUUID();
      const { error: updateError } = await supabaseAdmin
        .from("vendor")
        .update({ access_token: token })
        .eq("id", existing.id);

      if (updateError) throw updateError;
      return { success: true, token };
    }

    // No vendor found — create one
    const token = randomUUID();
    const { error: insertError } = await supabaseAdmin
      .from("vendor")
      .insert({
        name,
        email,
        phone: phone || null,
        access_token: token,
      });

    if (insertError) throw insertError;
    return { success: true, token };
  } catch (error) {
    console.error("Error in getOrCreateVendorToken:", error);
    return { success: false, error: "Failed to get vendor token" };
  }
}

/**
 * Resolve a vendor access_token to a vendor record.
 */
export async function getVendorByToken(token: string) {
  try {
    const { data: vendor, error } = await supabaseAdmin
      .from("vendor")
      .select("*")
      .eq("access_token", token)
      .maybeSingle();

    if (error) {
      console.error("Error fetching vendor by token:", error.message);
      return null;
    }

    return vendor;
  } catch (error) {
    console.error("Error in getVendorByToken:", error);
    return null;
  }
}
