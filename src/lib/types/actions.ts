export type ActionResult<T = void> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; message?: string; data?: never };
