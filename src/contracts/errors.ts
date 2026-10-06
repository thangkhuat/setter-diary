import { z } from "zod";

/**
 * The closed set of API error codes, each with its fixed HTTP status.
 * New codes are added here, never inline in a route.
 */
export const ERROR_STATUS = {
	NOT_FOUND: 404,
	RATE_LIMITED: 429,
	INTERNAL_ERROR: 500,
	SERVICE_BUSY: 503,
} as const;

export type ErrorCode = keyof typeof ERROR_STATUS;

export const errorCodeSchema = z.enum(
	Object.keys(ERROR_STATUS) as [ErrorCode, ...ErrorCode[]],
);

export const errorResponseSchema = z.object({
	error: z.object({
		code: errorCodeSchema,
		message: z.string(),
		details: z.unknown().optional(),
	}),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
