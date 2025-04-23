import { useNuxtApp } from '#app'

export const useFileUpload = () => {
    const { $supabase } = useNuxtApp()

    /**
     * Upload a file to Supabase Storage
     * @param bucket The storage bucket name
     * @param path The path within the bucket
     * @param file The file to upload
     * @returns The upload result or null on error
     */
    const uploadFile = async (bucket: string, path: string, file: File) => {
        try {
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
                    upsert: false
                })

            if (error) {
                console.error('Storage error:', error)
                throw error
            }

            return data
        } catch (error: any) {
            console.error('Upload error:', error)
            return null
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

    return {
        uploadFile,
        getFileUrl
    }
}