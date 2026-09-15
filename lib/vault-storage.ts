import { supabase } from "@/lib/supabase"

/**
 * Uploads a file to the 'vault_attachments' Supabase Storage bucket.
 * Returns the public URL of the uploaded file, or falls back to data URL on failure.
 */
export async function uploadVaultFile(file: File, userId: string = "general"): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop() || 'bin';
    const cleanFileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('vault_attachments')
      .upload(cleanFileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.warn("Storage upload note (falling back to data URL if needed):", error.message);
      return await fileToDataUrl(file);
    }

    const { data: urlData } = supabase.storage
      .from('vault_attachments')
      .getPublicUrl(cleanFileName);

    return urlData.publicUrl;
  } catch (err) {
    console.warn("Error in uploadVaultFile:", err);
    return await fileToDataUrl(file);
  }
}

/**
 * Convert file to Base64 Data URL as fallback
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
