/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@supabase/supabase-js";
import {
  InstructionPayload,
  SettingsPayload,
} from "@/lib/validators/task";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase service client missing env configuration");
}

const serviceClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const db = {
  async getDashboardData(userId: string) {
    const { data, error } = await serviceClient
      .from("instructions")
      .select(
        `
        id,
        instruction_text,
        schedule_interval_hours,
        ai_generated_schema,
        created_at,
        site:sites (
          id,
          url,
          title,
          last_health_status
        ),
        last_run:scrape_runs!scrape_runs_instruction_id_fkey (
          run_status,
          run_time,
          error_message
        ),
        results(count)
      `,
      )
      .eq("site.user_id", userId)
      .limit(10);

    if (error) {
      throw error;
    }
    return data;
  },

  async getResults(userId: string) {
    const { data, error } = await serviceClient
      .from("results")
      .select(
        `
        id,
        title,
        description,
        url,
        metadata,
        ai_summary,
        created_at,
        instruction:instructions!inner (
          id,
          site:sites!inner (
            user_id
          )
        )
      `,
      )
      .eq("instruction.site.user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return data;
  },

  async getChangeLogs(userId: string) {
    const { data, error } = await serviceClient
      .from("change_logs")
      .select(
        `
        id,
        change_type,
        created_at,
        new_value,
        result:results!inner (
          id,
          title,
          url,
          instruction:instructions!inner (
            site:sites!inner ( user_id )
          )
        )
      `,
      )
      .eq("result.instruction.site.user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return data;
  },

  async getSettings(userId: string) {
    const { data, error } = await serviceClient
      .from("settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }
    return data ?? null;
  },

  async saveSettings(userId: string, payload: SettingsPayload) {
    const existing = await serviceClient
      .from("settings")
      .select("*")
      .eq("user_id", userId)
      .single()
      .then((res) => (res.error ? null : res.data));
    if (existing) {
      const { error } = await serviceClient
        .from("settings")
        .update({
          telegram_chat_id: payload.telegramChatId,
          notification_email: payload.notificationEmail,
          alert_threshold: payload.alertThreshold,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);
      if (error) throw error;
      return this.getSettings(userId);
    }

    const { data, error } = await serviceClient
      .from("settings")
      .insert({
        user_id: userId,
        telegram_chat_id: payload.telegramChatId,
        notification_email: payload.notificationEmail,
        alert_threshold: payload.alertThreshold,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async upsertSite(payload: { url: string; title?: string; userId: string }) {
    const existing = await serviceClient
      .from("sites")
      .select("*")
      .eq("user_id", payload.userId)
      .eq("url", payload.url)
      .maybeSingle();
    if (existing.data) {
      return existing.data;
    }

    const { data, error } = await serviceClient
      .from("sites")
      .insert({
        url: payload.url,
        title: payload.title,
        user_id: payload.userId,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateInstruction(id: string, payload: { aiSchema: Record<string, unknown> }) {
    const { data, error } = await serviceClient
      .from("instructions")
      .update({
        ai_generated_schema: payload.aiSchema,
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async createInstruction(
    payload: InstructionPayload & { userId: string; aiSchema?: Record<string, unknown> },
  ) {
    const { data, error } = await serviceClient
      .from("instructions")
      .insert({
        site_id: payload.siteId,
        instruction_text: payload.instructionText,
        schedule_interval_hours: payload.scheduleIntervalHours,
        ai_generated_schema: payload.aiSchema ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async logScrapeRun({
    instructionId,
    status,
    errorMessage,
    durationMs,
  }: {
    instructionId: string;
    status: string;
    errorMessage?: string;
    durationMs?: number;
  }) {
    const { data, error } = await serviceClient
      .from("scrape_runs")
      .insert({
        instruction_id: instructionId,
        run_status: status,
        error_message: errorMessage ?? null,
        duration_ms: durationMs ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async insertResults(
    instructionId: string,
    results: Array<{
      title: string;
      description?: string;
      url: string;
      metadata?: Record<string, unknown>;
      ai_summary?: string;
    }>,
  ) {
    if (results.length === 0) return [];
    const payload = results.map((result) => ({
      instruction_id: instructionId,
      title: result.title,
      description: result.description ?? null,
      url: result.url,
      metadata: result.metadata ?? {},
      ai_summary: result.ai_summary ?? null,
    }));
    const { data, error } = await serviceClient
      .from("results")
      .insert(payload)
      .select();
    if (error) throw error;
    return data;
  },

  async getActiveInstructions() {
    const { data, error } = await serviceClient
      .from("instructions")
      .select(
        `
        id,
        instruction_text,
        ai_generated_schema,
        schedule_interval_hours,
        site:sites (
          id,
          url,
          user_id,
          title,
          last_health_status
        ),
        last_run:scrape_runs (
          run_time
        )
      `,
      )
      .eq("is_active", true)
      .order("run_time", { foreignTable: "scrape_runs", ascending: false })
      .limit(1, { foreignTable: "scrape_runs" });
    if (error) throw error;
    return data;
  },

  async updateSiteHealth(siteId: string, status: "healthy" | "degraded" | "failed") {
    const { error } = await serviceClient
      .from("sites")
      .update({ last_health_status: status })
      .eq("id", siteId);
    if (error) throw error;
  },

  async deleteInstruction(instructionId: string, userId: string) {
    // First verify the user owns this instruction
    const { data: instruction, error: fetchError } = await serviceClient
      .from("instructions")
      .select(
        `
        id,
        site:sites!inner (
          user_id
        )
      `
      )
      .eq("id", instructionId)
      .single();

    if (fetchError) throw fetchError;

    const site = Array.isArray(instruction.site)
      ? instruction.site[0]
      : instruction.site;

    if (!site || (site as any).user_id !== userId) {
      throw new Error("Unauthorized: You don't own this instruction");
    }

    // Delete the instruction (cascade will handle results and scrape_runs)
    const { error: deleteError } = await serviceClient
      .from("instructions")
      .delete()
      .eq("id", instructionId);

    if (deleteError) throw deleteError;
  },
};
