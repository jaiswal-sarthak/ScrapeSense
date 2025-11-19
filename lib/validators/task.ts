import { z } from "zod";

const urlRegex =
  /^(https?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!$&'()*+,;=.]+$/i;

export const siteSchema = z.object({
  url: z
    .string()
    .url("Provide a valid URL")
    .refine((value) => urlRegex.test(value), "Unsupported URL format"),
  title: z.string().min(2, "Enter a short label").max(120).optional(),
});

export const instructionSchema = z.object({
  siteId: z.string().uuid("Missing site"),
  instructionText: z
    .string()
    .min(10, "Provide more context")
    .max(2_000, "Instruction capped at 2k characters"),
  scheduleIntervalHours: z
    .number()
    .int()
    .min(1)
    .max(24 * 7)
    .default(24),
});

export const instructionWithSchema = instructionSchema.extend({
  aiGeneratedSchema: z
    .object({
      selectors: z.array(
        z.object({
          field: z.string(),
          selector: z.string(),
          attribute: z.string().optional(),
        }),
      ),
      filters: z.array(z.string()).optional(),
    })
    .optional(),
});

export const settingsSchema = z.object({
  telegramChatId: z.string().optional(),
  notificationEmail: z.string().email().optional(),
  alertThreshold: z.preprocess(
    (val) => (val === undefined || val === null ? 1 : Number(val)),
    z.number().int().min(1).max(50)
  ),
});

export type SitePayload = z.infer<typeof siteSchema>;
export type InstructionPayload = z.infer<typeof instructionSchema>;
export type InstructionWithSchemaPayload = z.infer<
  typeof instructionWithSchema
>;
export type SettingsPayload = z.infer<typeof settingsSchema>;

