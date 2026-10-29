import type { ConsoleAccess } from '~/types/access.type'
import { useAccessService } from '~/services/access.service'

export const useConsoleAccess = () => {
  const access = useState<ConsoleAccess | null>('console-access', () => null)
  const service = useAccessService()
  const clear = () => { access.value = null }
  const refresh = async () => {
    try { access.value = (await service.access()).consoleAccess; return access.value }
    catch (error) { clear(); throw error }
  }
  const can = (code: string) => access.value?.role.name === 'superadmin' || !!access.value?.permissions.some(p => p.code === code)
  const menus = computed(() => {
    const permissions = access.value?.permissions || []
    return permissions.filter(p => p.is_group).sort((a, b) => a.orders - b.orders).map(group => ({
      group_name: group.menu,
      group_icon: group.icon,
      sub: permissions.filter(p => p.parent_id === group.id && p.permission === 'index')
        .sort((a, b) => a.orders - b.orders)
        .map(p => ({ name: p.menu, icon: p.icon, href: p.route })),
    })).filter(group => group.sub.length)
  })
  const firstRoute = computed(() => menus.value.flatMap(g => g.sub).find(p => p.href.startsWith('/console/secret/'))?.href || '/')
  const canVisit = (path: string) => {
    if (path === '/console/secret/profile') return true
    const item = (access.value?.permissions || []).filter(p => p.permission === 'index' && p.route.startsWith('/console/secret/'))
      .sort((a, b) => b.route.length - a.route.length)
      .find(p => path === p.route || path.startsWith(p.route + '/'))
    if (!item) return false
    const action = path.endsWith('/add') ? 'create' : path.endsWith('/edit') ? 'update' : 'index'
    return can(item.code.replace(/\.index$/, `.${action}`))
  }
  const canAction = (path: string, action: 'index' | 'create' | 'update' | 'delete') => {
    const item = (access.value?.permissions || []).filter(p => p.permission === 'index' && p.route.startsWith('/console/secret/'))
      .sort((a, b) => b.route.length - a.route.length)
      .find(p => path === p.route || path.startsWith(p.route + '/'))
    return !!item && can(item.code.replace(/\.index$/, `.${action}`))
  }
  return { access, menus, firstRoute, refresh, clear, can, canVisit, canAction }
}
