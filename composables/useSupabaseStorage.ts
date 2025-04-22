export const useSupabaseStorage = () => {
    const { $supabase } = useNuxtApp()

    const uploadFile = async (
        bucket: string,
        filePath: string,
        file: File
    ) => {
        const { data, error } = await $supabase
            .storage
            .from(bucket)
            .upload(filePath, file)

        if (error) throw error
        return data
    }

    const getPublicUrl = (bucket: string, filePath: string) => {
        const { data } = $supabase
            .storage
            .from(bucket)
            .getPublicUrl(filePath)

        return data.publicUrl
    }

    const removeFile = async (bucket: string, filePath: string) => {
        const { data, error } = await $supabase
            .storage
            .from(bucket)
            .remove([filePath])

        if (error) throw error
        return data
    }

    return {
        uploadFile,
        getPublicUrl,
        removeFile,
    }
}
