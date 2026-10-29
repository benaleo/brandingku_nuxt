export interface Permission {
  id: number
  parent_id: number | null
  code: string
  menu: string
  icon: string
  route: string
  permission: 'group' | 'index' | 'create' | 'update' | 'delete'
  is_group: boolean
  orders: number
}
export interface Role {
  id: number
  name: string
  description: string
  is_active: boolean
  is_system: boolean
  permission_ids: number[]
}
export interface ConsoleAccess { user_id: number; role: Role; permissions: Permission[] }
export interface AdminUser { avatar: string; address: string; phone: string; id: number; name: string; email: string; is_active: boolean; role: Role }
export interface RoleInput { name: string; description: string; is_active: boolean; permission_ids: number[] }
export interface AdminInput { avatar?: string; address?: string; phone?: string; name: string; email: string; password?: string; role_id: number; is_active: boolean }
