/** Structured JSON log line. Never pass names, emails or free-text notes. */
export const logError = (event: string, error: unknown) =>
	console.error(JSON.stringify({ level: "error", event, error: String(error) }));
