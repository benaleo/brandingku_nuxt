// composables/useFileUpload.ts
import { createClient } from '@supabase/supabase-js'

export const useFileUpload = () => {
    const { $supabase } = useNuxtApp()

    const uploadFile = async (bucket, fileName, file) => {
        try {
            // Check if user is authenticated
            const { data: { session } } = await $supabase.auth.getSession()

            if (!session) {
                throw new Error('You must be logged in to upload files')
            }

            // Use userId as the first folder in the path for RLS protection
            const userId = session.user.id
            const filePath = `${userId}/${fileName}`

            // Upload the file directly
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
        } catch (err) {
            console.error('Upload error:', err)
            throw err
        }
    }

    const getFileUrl = async (bucket, filePath) => {
        const { data } = await $supabase
            .storage
            .from(bucket)
            .getPublicUrl(filePath)

        return data?.publicUrl
    }

    return {
        uploadFile,
        getFileUrl
    }
}