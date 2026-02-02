import type { ZodError } from "zod";

/**
 * Formata os erros de validação do Zod para uma string amigável.
 * @param error ZodError
 * @returns string formatada com os erros por campo
 */
export function formatZodErrors(error: ZodError): string {
  return error.issues
    .map((issue) => {
      const field = issue.path.join(".");
      return `${field || "root"}: ${issue.message}`;
    })
    .join("; ");
}
