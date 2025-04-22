// composables/useSupabaseS3.ts
export const useSupabaseS3 = () => {
    const { $supabase } = useNuxtApp()
    const config = useRuntimeConfig()

    // Function to authenticate with S3
    const getAuthenticatedClient = async () => {
        try {
            // First ensure the user is logged in
            const { data: { session } } = await $supabase.auth.getSession()

            if (!session) {
                throw new Error('You must be logged in to upload files')
            }

            // Get S3 credentials from your Supabase Function
            const { data, error } = await $supabase.functions.invoke('get-s3-credentials', {
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                }
            })

            if (error) {
                console.error('Error getting S3 credentials:', error)
                throw error
            }

            // Create a new client with the temporary credentials
            return createClient(
                config.public.supabaseUrl,
                config.public.supabaseKey,
                {
                    global: {
                        headers: {
                            'x-supabase-storage-s3-access-key': data.accessKeyId,
                            'x-supabase-storage-s3-secret-key': data.secretAccessKey,
                            'x-supabase-storage-s3-session-token': data.sessionToken,
                        }
                    }
                }
            )
        } catch (err) {
            console.error('Failed to get authenticated client:', err)
            throw err
        }
    }

    // Function to upload file using S3 authentication
    const uploadFileWithS3Auth = async (bucket, path, file) => {
        try {
            // Get authenticated client with S3 credentials
            const s3Client = await getAuthenticatedClient()

            // Use this client to upload file
            const { data, error } = await s3Client
                .storage
                .from(bucket)
                .upload(path, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (error) throw error
            return data
        } catch (err) {
            console.error('Upload error:', err)
            throw err
        }
    }

    return {
        uploadFileWithS3Auth
    }
}