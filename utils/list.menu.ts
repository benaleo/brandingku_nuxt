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
        group_name: 'Landing Page',
        group_icon: 'Product',
        sub: [
            {
                name: 'Benefit',
                icon: 'Package',
                href: '/console/secret/landing-page/benefit'
            },
            {
                name: 'Client',
                icon: 'Box',
                href: '/console/secret/landing-page/client'
            },
            {
                name: 'Testimonial',
                icon: 'Box',
                href: '/console/secret/landing-page/testimonial'
            },
            {
                name: 'Options',
                icon: 'Box',
                href: '/console/secret/landing-page/options'
            },

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
        group_name: 'Masterdata',
        group_icon: 'Product',
        sub: [
            {
                name: 'Produk Attribute',
                icon: 'Package',
                href: '/console/secret/product-attributes'
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
                href: '/console/secret/privilege'
            },
            {
                name: 'Admin',
                icon: 'UserCog',
                href: '/console/secret/admin'
            },

        ]
    },


    // Add more menu groups here
]
