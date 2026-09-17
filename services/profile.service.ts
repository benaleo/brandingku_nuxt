export interface MyProfile { id: number; name: string; email: string; address: string; phone: string; avatar: string | null }
export interface MyProfileInput { name: string; address?: string; phone?: string }
const userFields = 'id name email address phone avatar'
export const useProfileService = () => {
  const { gqlFetch } = useGql()
  const auth = { auth: true }
  return {
    myProfile: (id: number) => gqlFetch<{ getUserDetail: MyProfile | null }>(`query($id: Int!) { getUserDetail(id: $id) { ${userFields} } }`, { id }, auth),
    updateProfile: (id: number, input: MyProfileInput) => gqlFetch<{ updateUser: MyProfile }>(`mutation($id: Int!, $name: String, $address: String, $phone: String) { updateUser(id: $id, name: $name, address: $address, phone: $phone) { ${userFields} } }`, { id, ...input }, auth),
    updateAvatar: (id: number, avatar: string) => gqlFetch<{ updateUserAvatar: string }>('mutation($id: Int!, $avatar: String!) { updateUserAvatar(id: $id, avatar: $avatar) }', { id, avatar }, auth),
    changePassword: (newPassword: string) => gqlFetch<{ userUpdatePassword: boolean }>('mutation($newPassword: String!) { userUpdatePassword(newPassword: $newPassword) }', { newPassword }, auth),
  }
}
