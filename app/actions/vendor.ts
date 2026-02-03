"use server";

import { supabaseAdmin } from "@/lib/supabase/server";

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
