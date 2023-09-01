import { useBillStore } from '@/store/billStore'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        name: 'home',
        path: '/',
        component: () => import('@/views/ViewWelcome.vue'),
    },
    {
        name: 'persons',
        path: '/persons',
        component: () => import('@/views/ViewPersons.vue'),
    },
    {
        name: 'items',
        path: '/items',
        component: () => import('@/views/ViewItems.vue'),
        beforeEnter: () => {
            const billStore = useBillStore()
            if (!billStore.hasPersons) {
                return { name: 'home' }
            }
        },
    },
    {
        name: 'results',
        path: '/results',
        component: () => import('@/views/ViewResults.vue'),
        beforeEnter: () => {
            const billStore = useBillStore()
            if (!billStore.hasResults) {
                return { name: 'home' }
            }
        },
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: {
            name: 'home',
            params: {},
        },
    },
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
})

export default router
