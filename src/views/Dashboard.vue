<template>
  <div class="animate-fade-in">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="stat-card">
        <div class="flex items-center justify-between">
          <div class="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <span class="badge badge-info">Total</span>
        </div>
        <p class="stat-value">{{ stats?.total_products || 0 }}</p>
        <p class="stat-label">Productos Únicos</p>
      </div>
      
      <div class="stat-card">
        <div class="flex items-center justify-between">
          <div class="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span class="badge badge-success">Activos</span>
        </div>
        <p class="stat-value">{{ stats?.total_providers || 0 }}</p>
        <p class="stat-label">Proveedores</p>
      </div>
      
      <div class="stat-card">
        <div class="flex items-center justify-between">
          <div class="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
        </div>
        <p class="stat-value">{{ stats?.total_categories || 0 }}</p>
        <p class="stat-label">Categorías</p>
      </div>
      
      <div class="stat-card">
        <div class="flex items-center justify-between">
          <div class="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        <p class="stat-value">{{ messageStats?.total_products_processed || 0 }}</p>
        <p class="stat-label">Precios Registrados</p>
      </div>
    </div>
    
    <!-- Recent Messages Section -->
    <div class="card">
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-slate-800">Mensajes Recientes</h2>
          <p class="text-sm text-slate-500">Últimos mensajes procesados de WhatsApp</p>
        </div>
        <div>
        <button @click="refreshData" class="btn-secondary">
          <svg class="w-4 h-4" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
        <button @click="clearMessages" class="btn-secondary ml-2 hover:bg-red-50 hover:text-red-600 transition-colors" :disabled="loading || messages.length === 0" title="Limpiar lista">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Limpiar
        </button>
        </div>
      </div>
      
      <div class="p-6">
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
        
        <div v-else-if="messages.length === 0" class="text-center py-12">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p class="text-slate-500">No hay mensajes recientes</p>
          <p class="text-sm text-slate-400 mt-1">Los mensajes de WhatsApp aparecerán aquí</p>
        </div>
        
        <div v-else class="space-y-4">
          <MessageCard 
            v-for="message in messages" 
            :key="message.id" 
            :message="message" 
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { messagesApi, productsApi } from '../api'
import MessageCard from '../components/MessageCard.vue'

const messages = ref([])
const stats = ref(null)
const messageStats = ref(null)
const loading = ref(false)

async function fetchData() {
  loading.value = true
  try {
    const [messagesRes, statsRes, messageStatsRes] = await Promise.all([
      messagesApi.getRecent(10),
      productsApi.getStats(),
      messagesApi.getStats()
    ])
    messages.value = messagesRes.data.items
    stats.value = statsRes.data
    messageStats.value = messageStatsRes.data
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  } finally {
    loading.value = false
  }
}

async function refreshData() {
  await fetchData()
}

async function clearMessages() {
  if (!confirm('¿Estás seguro de limpiar todos los mensajes recientes?')) return

  loading.value = true
  try {
    await messagesApi.clearRecent()
    messages.value = []
  } catch (error) {
    console.error('Error clearing messages:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>
