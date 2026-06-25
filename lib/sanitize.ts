export function sanitizeUserInput(input: string): string {
  return input.replace(/[\u0000-\u001F\u007F]/g, "").slice(0, 500);
}
