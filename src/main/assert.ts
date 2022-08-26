/**
 * Throws an error if the condition is falsy, regardless of environment.
 */
export function strictAssert(
  condition: unknown,
  message: string
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
