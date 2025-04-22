const uploadFile = async (bucket, fileName, file) => {
    try {
        // Check if user is authenticated
        const { data: { session } } = await $supabase.auth.getSession()

        if (!session) {
            throw new Error('You must be logged in to upload files')
        }

        // Convert UUID to string explicitly
        const userId = session.user.id.toString()
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