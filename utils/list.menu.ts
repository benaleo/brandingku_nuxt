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
        group_name: 'Toko',
        group_icon: 'Product',
        sub: [
            {
                name: 'Produk',
                icon: 'Package',
                href: '/console/secret/products'
            },
            {
                name: 'Produk Kategori',
                icon: 'Box',
                href: '/console/secret/product-categories'
            },

        ]
    },
     {
        group_name: 'Administrator',
        group_icon: 'ShieldUser',
        sub: [
            {
                name: 'Privilege',
                icon: 'ShieldCheck',
                href: '/console/secret/products'
            },
            {
                name: 'Admin',
                icon: 'UserCog',
                href: '/console/secret/product-categories'
            },

        ]
    },


    // Add more menu groups here
]
