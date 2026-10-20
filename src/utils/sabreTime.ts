/** Sabre expects times as HH:mm (no seconds). */
export const formatSabreTime = (time?: string | null): string => {
  if (!time) return "";
  const trimmed = String(time).trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return trimmed;
  const hours = match[1].padStart(2, "0");
  const minutes = match[2];
  return `${hours}:${minutes}`;
};
