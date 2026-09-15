/** Build-time configuration. Donation links are disabled in local/staging builds. */
export const DONATE_URL = process.env.NEXT_PUBLIC_DONATE_URL || "";
