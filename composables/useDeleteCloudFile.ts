import { useGql } from '~/composables/useGql'

export const useDeleteCloudFile = () => {
  const { gqlFetch } = useGql()

  const deleteCloudFile = async (path: string): Promise<boolean> => {
    const query = /* GraphQL */ `
      mutation ($path: String!) {
        deleteFile(path: $path)
      }
    `
    const res = await gqlFetch<{ deleteFile: boolean }>(query, { path }, { auth: true })
    return !!res.deleteFile
  }

  return { deleteCloudFile }
}
