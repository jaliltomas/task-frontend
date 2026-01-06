import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { title: 'Dashboard' }
  },
  {
    path: '/catalog',
    name: 'Catalog',
    component: () => import('../views/Catalog.vue'),
    meta: { title: 'Catálogo' }
  },
  {
    path: '/providers',
    name: 'Providers',
    component: () => import('../views/Providers.vue'),
    meta: { title: 'Proveedores' }
  },
  {
    path: '/lists',
    name: 'Lists',
    component: () => import('../views/Listas.vue'),
    meta: { title: 'Listas' }
  },
  {
    path: '/registros',
    name: 'Registros',
    component: () => import('../views/Registros.vue'),
    meta: { title: 'Registros' }
  },
  {
    path: '/integraciones',
    name: 'Integraciones',
    component: () => import('../views/Integraciones.vue'),
    meta: { title: 'Integraciones' }
  },
  {
    path: '/configuration',
    name: 'Configuration',
    component: () => import('../views/Configuration.vue'),
    meta: { title: 'Configuración' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Update document title
router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || 'Inicio'} | WhatsApp Catalog`
  next()
})

export default router
