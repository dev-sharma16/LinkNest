import { z } from "zod";
import type { AIOperationName, AIOperationContext } from "@/lib/ai/types";

export type AIOperation = {
  name: AIOperationName;
  description: string;
  inputSchema: z.ZodType;
  authorize: (ctx: AIOperationContext) => boolean | Promise<boolean>;
  execute: (ctx: AIOperationContext, input: unknown) => Promise<unknown>;
  handleError: (error: Error, ctx: AIOperationContext) => Error;
};

const operationRegistry = new Map<AIOperationName, AIOperation>();

export function registerOperation(op: AIOperation): void {
  operationRegistry.set(op.name, op);
}

export function getOperation(name: AIOperationName): AIOperation | undefined {
  return operationRegistry.get(name);
}

export function getAllOperations(): AIOperation[] {
  return Array.from(operationRegistry.values());
}

export function validateOperationInput(
  name: AIOperationName,
  input: unknown,
): { success: true; data: unknown } | { success: false; error: string } {
  const op = operationRegistry.get(name);
  if (!op) {
    return { success: false, error: `Unknown operation: ${name}` };
  }

  const result = op.inputSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message ?? "Invalid input" };
  }

  return { success: true, data: result.data };
}

export async function executeOperation(
  name: AIOperationName,
  input: unknown,
  ctx: AIOperationContext,
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const op = operationRegistry.get(name);
  if (!op) {
    return { success: false, error: `Unknown operation: ${name}` };
  }

  const validation = op.inputSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message ?? "Invalid input" };
  }

  const authorized = await op.authorize(ctx);
  if (!authorized) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const data = await op.execute(ctx, validation.data);
    return { success: true, data };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    const handled = op.handleError(err, ctx);
    return { success: false, error: handled.message };
  }
}

registerOperation({
  name: "create",
  description: "Create a new resource",
  inputSchema: z.object({
    targetType: z.enum(["bio", "storefront"]),
    data: z.record(z.string(), z.unknown()),
  }),
  authorize: () => true,
  execute: async (_ctx, input) => input,
  handleError: (err) => new Error(`Create failed: ${err.message}`),
});

registerOperation({
  name: "update",
  description: "Update an existing resource",
  inputSchema: z.object({
    targetType: z.enum(["bio", "storefront"]),
    targetId: z.string().uuid(),
    data: z.record(z.string(), z.unknown()),
  }),
  authorize: () => true,
  execute: async (_ctx, input) => input,
  handleError: (err) => new Error(`Update failed: ${err.message}`),
});

registerOperation({
  name: "delete",
  description: "Delete a resource",
  inputSchema: z.object({
    targetType: z.enum(["bio", "storefront"]),
    targetId: z.string().uuid(),
  }),
  authorize: () => true,
  execute: async (_ctx, input) => input,
  handleError: (err) => new Error(`Delete failed: ${err.message}`),
});

registerOperation({
  name: "reorder",
  description: "Reorder items",
  inputSchema: z.object({
    targetType: z.enum(["bio", "storefront"]),
    ids: z.array(z.string().uuid()).min(1).max(500),
  }),
  authorize: () => true,
  execute: async (_ctx, input) => input,
  handleError: (err) => new Error(`Reorder failed: ${err.message}`),
});

registerOperation({
  name: "duplicate",
  description: "Duplicate a resource",
  inputSchema: z.object({
    targetType: z.enum(["bio", "storefront"]),
    targetId: z.string().uuid(),
  }),
  authorize: () => true,
  execute: async (_ctx, input) => input,
  handleError: (err) => new Error(`Duplicate failed: ${err.message}`),
});

registerOperation({
  name: "move",
  description: "Move a resource",
  inputSchema: z.object({
    targetType: z.enum(["bio", "storefront"]),
    targetId: z.string().uuid(),
    destinationId: z.string().uuid().optional(),
  }),
  authorize: () => true,
  execute: async (_ctx, input) => input,
  handleError: (err) => new Error(`Move failed: ${err.message}`),
});

registerOperation({
  name: "restyle",
  description: "Update styling/theme",
  inputSchema: z.object({
    targetType: z.enum(["bio", "storefront"]),
    theme: z.record(z.string(), z.unknown()),
  }),
  authorize: () => true,
  execute: async (_ctx, input) => input,
  handleError: (err) => new Error(`Restyle failed: ${err.message}`),
});

registerOperation({
  name: "generate",
  description: "Generate new content via AI",
  inputSchema: z.object({
    targetType: z.enum(["bio", "storefront"]),
    prompt: z.string().min(1).max(2000),
  }),
  authorize: () => true,
  execute: async (_ctx, input) => input,
  handleError: (err) => new Error(`Generate failed: ${err.message}`),
});

registerOperation({
  name: "analyze",
  description: "Analyze existing content",
  inputSchema: z.object({
    targetType: z.enum(["bio", "storefront"]),
    targetId: z.string().uuid().optional(),
  }),
  authorize: () => true,
  execute: async (_ctx, input) => input,
  handleError: (err) => new Error(`Analyze failed: ${err.message}`),
});

registerOperation({
  name: "organize",
  description: "Organize and categorize content",
  inputSchema: z.object({
    targetType: z.enum(["bio", "storefront"]),
    action: z.string(),
  }),
  authorize: () => true,
  execute: async (_ctx, input) => input,
  handleError: (err) => new Error(`Organize failed: ${err.message}`),
});

registerOperation({
  name: "optimize",
  description: "Optimize content for performance or SEO",
  inputSchema: z.object({
    targetType: z.enum(["bio", "storefront"]),
    targetId: z.string().uuid().optional(),
  }),
  authorize: () => true,
  execute: async (_ctx, input) => input,
  handleError: (err) => new Error(`Optimize failed: ${err.message}`),
});
