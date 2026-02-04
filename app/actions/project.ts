"use server";

import { supabaseAdmin } from "@/lib/supabase/server";

export async function getProjectHistory() {
  try {
    // Get distinct projects from SPK table, ordered by most recent
    const { data, error } = await supabaseAdmin
      .from("spk")
      .select("project_name, project_description")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Remove duplicates based on project_name (case insensitive)
    const uniqueProjects = data.reduce(
      (acc: { project_name: string; project_description: string | null }[], current) => {
        const exists = acc.find(
          (p) =>
            p.project_name.toLowerCase() === current.project_name.toLowerCase(),
        );
        if (!exists) {
          acc.push(current);
        }
        return acc;
      },
      [],
    );

    return { success: true, data: uniqueProjects };
  } catch (error) {
    console.error("Error fetching project history:", error);
    return { success: false, error: "Failed to fetch project history" };
  }
}
