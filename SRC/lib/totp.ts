export function generateTOTP(secret: string, offset = 0): string {
  const epoch = Math.floor(Date.now() / 30000) + offset;
  let hash = 0;
  const str = secret + epoch;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const code = Math.abs(hash) % 1000000;
  return String(code).padStart(6, '0');
}

export function generateSecret(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let result = "MOUX-";
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) result += "-";
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateRecoveryCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 4; i++) {
    const rawCode = Math.floor(10000000 + Math.random() * 90000000).toString();
    codes.push(`${rawCode.substring(0, 4)}-${rawCode.substring(4)}`);
  }
  return codes;
}

export function verifyTOTP(secret: string, enteredCode: string): boolean {
  const cleanEntered = enteredCode.replace(/\s+/g, '');
  // Allow drift for tolerance
  return (
    generateTOTP(secret, 0) === cleanEntered ||
    generateTOTP(secret, -1) === cleanEntered ||
    generateTOTP(secret, 1) === cleanEntered
  );
}
