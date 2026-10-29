import { BadgeCheck, Headset, Leaf, PenTool, ShieldCheck, Timer } from 'lucide-vue-next'

// The services Brandingku offers, in one place for the landing page, /services and the navbar
// menu. `id` is the anchor of the service's section on /services; `key` picks its texts:
// app.services.menu.<key> (name), app.services.items.<key> (short line), app.servicesPage.items.<key>.
export const SERVICES = [
  { id: 'servis-terbaik', key: 'bestService', icon: Headset },
  { id: 'desain-logo', key: 'freeLogoDesign', icon: PenTool },
  { id: 'cek-kualitas', key: 'qualityCheck', icon: BadgeCheck },
  { id: 'produksi-tepat-waktu', key: 'timelyProduction', icon: Timer },
  { id: 'ramah-lingkungan', key: 'ecoFriendly', icon: Leaf },
  { id: 'garansi', key: 'warranty', icon: ShieldCheck },
] as const
