export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
export const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function validatePhotoEnvelope(file: { size: number; type: string }) {
  if (file.size <= 0) return "La photo est vide.";
  if (file.size > MAX_PHOTO_BYTES) return "La photo dépasse la limite de 8 Mo.";
  if (!ALLOWED_PHOTO_TYPES.has(file.type)) return "Format accepté : JPEG, PNG ou WebP.";
  return null;
}
