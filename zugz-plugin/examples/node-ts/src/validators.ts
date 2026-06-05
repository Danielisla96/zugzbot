export function validateEmail(email: string | null): boolean {
  if (email === null || email === undefined) return false;
  if (typeof email !== "string") return false;
  if (email.trim() === "") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
