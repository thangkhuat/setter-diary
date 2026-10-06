import type { Context, ErrorHandler } from "hono";
import {
	ERROR_STATUS,
	type ErrorCode,
	type ErrorResponse,
} from "../src/contracts/errors";
import { logError } from "./log";

export function errorResponse(c: Context, code: ErrorCode, message: string) {
	const body: ErrorResponse = { error: { code, message } };
	return c.json(body, ERROR_STATUS[code]);
}

/** Last resort for anything a route throws: log it, never leak it to the client. */
export const handleUnhandledError: ErrorHandler = (error, c) => {
	logError("unhandled_error", error);
	return errorResponse(c, "INTERNAL_ERROR", "Something went wrong. Try again.");
};
