import type { AdminInput, AdminUser, ConsoleAccess, Permission, Role, RoleInput } from '~/types/access.type'

const roleFields = 'id name description is_active is_system permission_ids'
const permissionFields = 'id parent_id code menu icon route permission is_group orders'
const adminFields = `id name email is_active role { ${roleFields} }`

export const useAccessService = () => {
  const { gqlFetch } = useGql()
  const auth = { auth: true }
  return {
    access: () => gqlFetch<{ consoleAccess: ConsoleAccess }>(`query { consoleAccess { user_id role { ${roleFields} } permissions { ${permissionFields} } } }`, undefined, auth),
    roles: () => gqlFetch<{ roles: Role[] }>(`query { roles { ${roleFields} } }`, undefined, auth),
    permissions: () => gqlFetch<{ permissions: Permission[] }>(`query { permissions { ${permissionFields} } }`, undefined, auth),
    admins: () => gqlFetch<{ adminUsers: AdminUser[] }>(`query { adminUsers { ${adminFields} } }`, undefined, auth),
    saveRole: (id: number | null, input: RoleInput) => gqlFetch<{ saveRole: Role }>(`mutation($id: Int, $input: RoleInput!) { saveRole(id: $id, input: $input) { ${roleFields} } }`, { id, input }, auth),
    deleteRole: (id: number) => gqlFetch('mutation($id: Int!) { deleteRole(id: $id) }', { id }, auth),
    saveAdmin: (id: number | null, input: AdminInput) => gqlFetch<{ saveAdmin: AdminUser }>(`mutation($id: Int, $input: AdminInput!) { saveAdmin(id: $id, input: $input) { ${adminFields} } }`, { id, input }, auth),
    deleteAdmin: (id: number) => gqlFetch('mutation($id: Int!) { deleteAdmin(id: $id) }', { id }, auth),
  }
}
