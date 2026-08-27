import { supabase, isSupabaseConfigured } from './supabaseClient';

export const storageService = {
  /**
   * Uploads file to Supabase Storage bucket 'employee-documents' or converts to base64 DataURL fallback
   */
  async uploadFile(file, employeeId, category = 'general') {
    if (!file) throw new Error('No file provided');

    const fileExt = file.name.split('.').pop();
    const fileName = `${employeeId}/${category}_${Date.now()}.${fileExt}`;

    // If Supabase is configured with real storage bucket
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.storage
          .from('employee-documents')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.warn('Supabase storage upload error, falling back to local:', error);
        } else {
          const { data: publicData } = supabase.storage
            .from('employee-documents')
            .getPublicUrl(fileName);

          return {
            filePath: publicData?.publicUrl || fileName,
            fileName: file.name,
            fileType: file.type || 'application/octet-stream',
            fileSize: file.size
          };
        }
      } catch (err) {
        console.warn('Supabase upload exception:', err);
      }
    }

    // Fallback: Read as Base64 DataURL for instant local preview and persistent local testing
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          filePath: reader.result,
          fileName: file.name,
          fileType: file.type || 'application/octet-stream',
          fileSize: file.size
        });
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }
};
