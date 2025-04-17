export interface MenuItem {
    name: string
    icon?: string
    href?: string
}

export interface MenuGroup {
    group_name: string
    group_icon?: string
    sub: MenuItem[]
}

export const secretConsoleMenu: MenuGroup[] = [
    {
        group_name: 'Dashboard',
        group_icon: 'LayoutDashboard',
        sub: [
            {
                name: 'Overview',
                icon: 'Home',
                href: '/console/secret/dashboard'
            }
        ]
    },
    {
        group_name: 'Produk',
        group_icon: 'Product',
        sub: [
            {
                name: 'Produk',
                icon: 'Home',
                href: '/console/secret/product'
            },
            {
                name: 'Produk Kategori',
                icon: 'Home',
                href: '/console/secret/product-category'
            },

        ]
    },

    // Add more menu groups here
]
