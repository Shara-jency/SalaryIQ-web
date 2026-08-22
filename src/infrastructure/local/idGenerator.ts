import type { Id } from "@domain/models";

/**
 * crypto.randomUUID() produces string ids in the same shape a future
 * ASP.NET Core backend's Guid primary keys would serialize as, so no
 * id-format migration is needed when repositories are swapped for API ones.
 */
export function generateId(): Id {
  return crypto.randomUUID();
}
