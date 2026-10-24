import { useGql } from '~/composables/useGql'

export type AppSetting = { key: string; value: string; description: string; updated_at: string }

export const useAppSettingsService = () => {
    const { gqlFetch } = useGql()

    const getAppSettings = async (prefix?: string) => {
        const query = `query getAppSettings($prefix: String) { getAppSettings(prefix: $prefix) { key value description updated_at } }`
        const res = await gqlFetch<{ getAppSettings: AppSetting[] }>(query, { prefix }, { auth: true })
        return res?.getAppSettings || []
    }

    const updateAppSettings = async (input: { key: string; value: string }[]) => {
        const mutation = `mutation updateAppSettings($input: [AppSettingInput!]!) { updateAppSettings(input: $input) { key value description updated_at } }`
        const res = await gqlFetch<{ updateAppSettings: AppSetting[] }>(mutation, { input }, { auth: true })
        return res?.updateAppSettings || []
    }

    return { getAppSettings, updateAppSettings }
}
