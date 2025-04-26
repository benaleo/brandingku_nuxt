import { useNuxtApp } from '#app'

export const useFileUpload = () => {
    const { $supabase } = useNuxtApp()

    /**
     * Get a Supabase session using hardcoded credentials
     * @returns Promise<boolean> True if successful, false otherwise
     */
    const getSupabaseSession = async () => {
        try {
            // Hardcoded credentials - replace with your actual credentials
            const email = 'admin@brandingku.com'
            const password = 'kosongan'
            
            const { data, error } = await $supabase.auth.signInWithPassword({
                email,
                password
            })
            
            if (error) {
                console.error('Error signing in to Supabase:', error)
                return false
            }
            
            return true
        } catch (error) {
            console.error('Failed to sign in to Supabase:', error)
            return false
        }
    }

    /**
     * Upload a file to Supabase Storage
     * @param bucket The storage bucket name
     * @param path The path within the bucket
     * @param file The file to upload
     * @returns The upload result or null on error
     */
    const uploadFile = async (bucket: string, path: string, file: File) => {
        try {
            // Try to get a session first
            await getSupabaseSession()
            
            // Check authentication
            const { data: { session } } = await $supabase.auth.getSession()

            if (!session) {
                throw new Error('Authentication required for file upload')
            }

            // Use userId for folder prefix if path doesn't already include it
            const userId = session.user.id
            const filePath = path.startsWith(userId) ? path : `${userId}/${path}`

            const { data, error } = await $supabase
                .storage
                .from(bucket)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true // Set to true to allow overwriting
                })

            if (error) {
                console.error('Storage error:', error)
                throw error
            }

            return data
        } catch (error: any) {
            console.error('Upload error:', error)
            throw error // Re-throw to allow caller to handle it
        }
    }

    /**
     * Get the public URL for a file in Supabase Storage
     * @param bucket The storage bucket name
     * @param path The path within the bucket
     * @returns The public URL or null on error
     */
    const getFileUrl = async (bucket: string, path: string) => {
        try {
            const { data } = await $supabase
                .storage
                .from(bucket)
                .getPublicUrl(path)

            return data?.publicUrl || null
        } catch (error) {
            console.error('Failed to get file URL:', error)
            return null
        }
    }

    /**
     * Delete a file from Supabase Storage
     * @param bucket The storage bucket name
     * @param path The path within the bucket
     * @returns boolean indicating success or failure
     */
    const deleteFile = async (bucket: string, path: string) => {
        try {
            // Try to get a session first
            await getSupabaseSession()
            
            // Check authentication
            const { data: { session } } = await $supabase.auth.getSession()

            if (!session) {
                throw new Error('Authentication required for file deletion')
            }

            const { error } = await $supabase
                .storage
                .from(bucket)
                .remove([path])

            if (error) {
                console.error('Storage delete error:', error)
                return false
            }

            return true
        } catch (error: any) {
            console.error('Delete error:', error)
            return false
        }
    }

    /**
     * Get path from a public URL
     * @param bucket The storage bucket name
     * @param url The public URL
     * @returns The path within the bucket or null
     */
    const getPathFromUrl = (bucket: string, url: string): string | null => {
        try {
            if (!url) return null;
            
            // Extract the path from URL
            // Example URL: https://xxxx.supabase.co/storage/v1/object/public/images/xxx-xxx-xxxx/filename.jpg
            const regex = new RegExp(`/storage/v1/object/public/${bucket}/(.+)$`);
            const match = url.match(regex);
            
            if (match && match[1]) {
                return match[1];
            }
            
            return null;
        } catch (error) {
            console.error('Failed to extract path from URL:', error);
            return null;
        }
    }

    return {
        uploadFile,
        getFileUrl,
        deleteFile,
        getPathFromUrl
    }
}