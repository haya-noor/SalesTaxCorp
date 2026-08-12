export const PASSWORD_REQUIREMENTS =
  "Use at least 8 characters with 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.";

export const PASSWORD_PATTERN =
  "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9\\s]).{8,72}";

export function meetsPasswordRequirements(password: string) {
  return (
    password.length >= 8 &&
    password.length <= 72 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9\s]/.test(password)
  );
}
