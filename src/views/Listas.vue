<template>
  <div class="animate-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-lg font-semibold">Generar Listas de Precios</h2>
        <p class="text-sm text-slate-500">Genera listas formateadas para WhatsApp</p>
      </div>
      <button 
        @click="generateLists" 
        class="btn-primary"
        :disabled="loading"
      >
        <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ loading ? 'Generando...' : '🚀 Generar Nueva Lista' }}
      </button>
    </div>

    <!-- Stats -->
    <div v-if="currentList" class="grid grid-cols-3 gap-4 mb-6">
      <div class="card p-4 text-center">
        <p class="text-2xl font-bold text-primary-600">{{ currentList.totalProducts }}</p>
        <p class="text-sm text-slate-500">Productos</p>
      </div>
      <div class="card p-4 text-center">
        <p class="text-2xl font-bold text-accent-600">{{ currentList.totalCategories }}</p>
        <p class="text-sm text-slate-500">Categorías</p>
      </div>
      <div class="card p-4 text-center">
        <p class="text-sm font-medium text-slate-600">{{ formattedDate }}</p>
        <p class="text-sm text-slate-500">Generado</p>
      </div>
    </div>

    <!-- Lists -->
    <div v-if="currentList" class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- CF List -->
      <div class="card">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="font-semibold text-primary-600">💎 Consumidor Final</h3>
            <p class="text-xs text-slate-500">Precios para público general</p>
          </div>
          <button 
            @click="copyToClipboard('CF')" 
            class="btn-secondary text-sm py-2"
          >
            {{ copiedCF ? '✓ Copiado!' : '📋 Copiar' }}
          </button>
        </div>
        <div class="p-5">
          <pre class="whitespace-pre-wrap text-sm font-mono bg-slate-50 p-4 rounded-xl max-h-[500px] overflow-y-auto">{{ currentList.listCF }}</pre>
        </div>
      </div>

      <!-- RV List -->
      <div class="card">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="font-semibold text-emerald-600">💼 Revendedor</h3>
            <p class="text-xs text-slate-500">Precios mayoristas</p>
          </div>
          <button 
            @click="copyToClipboard('RV')" 
            class="btn-secondary text-sm py-2"
          >
            {{ copiedRV ? '✓ Copiado!' : '📋 Copiar' }}
          </button>
        </div>
        <div class="p-5">
          <pre class="whitespace-pre-wrap text-sm font-mono bg-slate-50 p-4 rounded-xl max-h-[500px] overflow-y-auto">{{ currentList.listRV }}</pre>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && history.length === 0" class="card p-12 text-center mb-8">
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
        <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-slate-800 mb-2">No hay listas generadas</h3>
      <p class="text-slate-500 mb-4">Hacé clic en "Generar Nueva Lista" para crear las listas de precios</p>
      <button @click="generateLists" class="btn-primary">
        🚀 Generar Lista
      </button>
    </div>

    <!-- History Section -->
    <div v-if="history.length > 0" class="card">
      <div class="px-5 py-4 border-b border-slate-100">
        <h3 class="font-semibold text-slate-700">📜 Historial de Listas</h3>
        <p class="text-xs text-slate-500">Listas generadas anteriormente</p>
      </div>
      <div class="divide-y divide-slate-100">
        <div 
          v-for="item in history" 
          :key="item.id" 
          class="px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
          :class="{ 'bg-primary-50': currentList?.id === item.id }"
          @click="loadList(item.id)"
        >
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-medium">
              {{ item.totalProducts }}
            </div>
            <div>
              <p class="font-medium text-slate-700">{{ formatHistoryDate(item.createdAt) }}</p>
              <p class="text-sm text-slate-500">{{ item.totalProducts }} productos • {{ item.totalCategories }} categorías</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button 
              v-if="currentList?.id === item.id"
              class="text-xs text-primary-600 font-medium px-3 py-1 bg-primary-100 rounded-full"
            >
              Viendo
            </button>
            <button 
              @click.stop="deleteList(item.id)" 
              class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar lista"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
        <button 
          @click="loadHistory(currentPage - 1)" 
          :disabled="currentPage <= 1"
          class="btn-secondary text-sm py-2"
        >
          ← Anterior
        </button>
        <span class="text-sm text-slate-500">Página {{ currentPage }} de {{ totalPages }}</span>
        <button 
          @click="loadHistory(currentPage + 1)" 
          :disabled="currentPage >= totalPages"
          class="btn-secondary text-sm py-2"
        >
          Siguiente →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { API_URL } from '@/config/api.js'

const loading = ref(false)
const currentList = ref(null)
const history = ref([])
const totalItems = ref(0)
const currentPage = ref(1)
const pageSize = 10
const copiedCF = ref(false)
const copiedRV = ref(false)

const totalPages = computed(() => Math.ceil(totalItems.value / pageSize))

const formattedDate = computed(() => {
  if (!currentList.value?.generatedAt) return ''
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(currentList.value.generatedAt))
})

function formatHistoryDate(dateStr) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateStr))
}

async function loadHistory(page = 1) {
  try {
    const response = await axios.get(`${API_URL}/products/lists`, {
      params: { page, page_size: pageSize }
    })
    history.value = response.data.items
    totalItems.value = response.data.total
    currentPage.value = page
  } catch (error) {
    console.error('Error loading history:', error)
  }
}

async function loadList(id) {
  try {
    const response = await axios.get(`${API_URL}/products/lists/${id}`)
    currentList.value = response.data
  } catch (error) {
    console.error('Error loading list:', error)
    alert('Error al cargar la lista')
  }
}

async function generateLists() {
  loading.value = true
  try {
    const response = await axios.get(`${API_URL}/products/lists/generate`)
    currentList.value = response.data
    // Reload history to include new list
    await loadHistory(1)
  } catch (error) {
    console.error('Error generating lists:', error)
    alert('Error al generar las listas')
  } finally {
    loading.value = false
  }
}

async function deleteList(id) {
  if (!confirm('¿Estás seguro de eliminar esta lista?')) return
  
  try {
    await axios.delete(`${API_URL}/products/lists/${id}`)
    // If we deleted the current list, clear it
    if (currentList.value?.id === id) {
      currentList.value = null
    }
    // Reload history
    await loadHistory(currentPage.value)
    // Load first list if available
    if (!currentList.value && history.value.length > 0) {
      await loadList(history.value[0].id)
    }
  } catch (error) {
    console.error('Error deleting list:', error)
    alert('Error al eliminar la lista')
  }
}

async function copyToClipboard(type) {
  const text = type === 'CF' ? currentList.value.listCF : currentList.value.listRV
  
  try {
    await navigator.clipboard.writeText(text)
    if (type === 'CF') {
      copiedCF.value = true
      setTimeout(() => copiedCF.value = false, 2000)
    } else {
      copiedRV.value = true
      setTimeout(() => copiedRV.value = false, 2000)
    }
  } catch (error) {
    console.error('Error copying to clipboard:', error)
  }
}

onMounted(async () => {
  await loadHistory()
  // Load most recent list if available
  if (history.value.length > 0) {
    await loadList(history.value[0].id)
  }
})
</script>
