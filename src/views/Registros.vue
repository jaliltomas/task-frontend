<template>
  <div class="animate-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-lg font-semibold">Registros de Precios</h2>
        <p class="text-sm text-slate-500">Historial de todos los precios recibidos</p>
      </div>
      <button
        @click="openBulkDeleteModal"
        class="btn-secondary text-red-600 border-red-200 hover:bg-red-50"
      >
        🗑️ Eliminar por fecha
      </button>
    </div>

    <!-- Filters -->
    <div class="card p-4 mb-6">
      <div class="flex flex-wrap gap-4 items-center">
        <div class="flex-1 min-w-[200px]">
          <input
            v-model="searchQuery"
            @input="debouncedSearch"
            type="text"
            placeholder="Buscar por nombre original..."
            class="form-input"
          />
        </div>
      </div>
    </div>
    
    <!-- Records Table -->
    <div class="card overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100">
        <div class="flex items-center justify-between">
          <p class="text-sm text-slate-500">
            {{ pagination.total }} registros encontrados
          </p>
        </div>
      </div>
      
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
      
      <div v-else-if="records.length === 0" class="text-center py-12">
        <p class="text-slate-500">No se encontraron registros</p>
      </div>
      
      <div v-else class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Nombre Original</th>
              <th>Producto Normalizado</th>
              <th>Categoría</th>
              <th class="text-right">Precio</th>
              <th>Proveedor</th>
              <th class="text-center">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in records" :key="record.id">
              <td>
                <span class="text-sm text-slate-600">
                  {{ formatDateTime(record.createdAt) }}
                </span>
              </td>
              <td>
                <div class="max-w-[250px] truncate font-mono text-sm text-slate-700" :title="record.rawName">
                  {{ record.rawName }}
                </div>
              </td>
              <td>
                <div class="font-medium text-slate-800 max-w-[200px] truncate">
                  {{ record.product?.nameNormalized || '-' }}
                </div>
              </td>
              <td>
                <span v-if="record.product?.category" class="badge badge-info">
                  {{ record.product.category.name }}
                </span>
                <span v-else class="text-slate-400">-</span>
              </td>
              <td class="text-right font-mono text-primary-600 font-semibold">
                ${{ formatPrice(record.price) }}
              </td>
              <td>
                <span class="text-sm text-slate-600">
                  {{ record.provider?.name || '-' }}
                </span>
              </td>
              <td class="text-center">
                <button 
                  @click="deleteRecord(record)"
                  class="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar registro"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
        <p class="text-sm text-slate-500">
          Página {{ pagination.page }} de {{ totalPages }}
        </p>
        <div class="flex gap-2">
          <button 
            @click="prevPage" 
            :disabled="pagination.page === 1"
            class="btn-secondary disabled:opacity-50"
          >
            Anterior
          </button>
          <button 
            @click="nextPage" 
            :disabled="pagination.page >= totalPages"
            class="btn-secondary disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>

    <!-- Bulk Delete Modal -->
    <div 
      v-if="showBulkDeleteModal" 
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      @click.self="closeBulkDeleteModal"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 class="text-lg font-semibold text-red-600 mb-4">⚠️ Eliminar registros por fecha</h3>
        
        <div class="space-y-4">
          <div>
            <label class="form-label">Seleccionar fecha</label>
            <input
              v-model="bulkDeleteDate"
              type="date"
              class="form-input"
            />
          </div>
          
          <div class="p-3 bg-red-50 rounded-xl">
            <p class="text-sm text-red-700">
              <strong>¡Atención!</strong> Esta acción eliminará TODOS los registros de precios del día seleccionado. Esta acción no se puede deshacer.
            </p>
          </div>
          
          <div>
            <label class="form-label">Para confirmar, escribí "eliminar"</label>
            <input
              v-model="bulkDeleteConfirm"
              type="text"
              placeholder="eliminar"
              class="form-input"
            />
          </div>
        </div>
        
        <div class="flex gap-3 mt-6">
          <button 
            @click="closeBulkDeleteModal"
            class="btn-secondary flex-1"
          >
            Cancelar
          </button>
          <button 
            @click="executeBulkDelete"
            :disabled="bulkDeleteConfirm.toLowerCase() !== 'eliminar' || !bulkDeleteDate || deletingBulk"
            class="btn-primary flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ deletingBulk ? 'Eliminando...' : 'Eliminar todos' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://34.72.106.241:8000/api'

const loading = ref(false)
const records = ref([])
const searchQuery = ref('')
const pagination = ref({
  page: 1,
  pageSize: 50,
  total: 0
})

// Bulk delete state
const showBulkDeleteModal = ref(false)
const bulkDeleteDate = ref('')
const bulkDeleteConfirm = ref('')
const deletingBulk = ref(false)

let searchTimeout = null

const totalPages = computed(() => 
  Math.ceil(pagination.value.total / pagination.value.pageSize)
)

async function fetchRecords() {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      page_size: pagination.value.pageSize,
      ...(searchQuery.value && { search: searchQuery.value })
    }
    const response = await axios.get(`${API_URL}/products/history/all`, { params })
    records.value = response.data.items
    pagination.value.total = response.data.total
  } catch (error) {
    console.error('Error fetching records:', error)
  } finally {
    loading.value = false
  }
}

function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1
    fetchRecords()
  }, 300)
}

function prevPage() {
  if (pagination.value.page > 1) {
    pagination.value.page--
    fetchRecords()
  }
}

function nextPage() {
  if (pagination.value.page < totalPages.value) {
    pagination.value.page++
    fetchRecords()
  }
}

function formatPrice(value) {
  if (!value) return '0.00'
  return Number(value).toFixed(2)
}

function formatDateTime(dateStr) {
  if (!dateStr) return '-'
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateStr))
}

async function deleteRecord(record) {
  const confirmed = confirm('¿Eliminar este registro?')
  if (confirmed) {
    try {
      await axios.delete(`${API_URL}/products/history/${record.id}`)
      await fetchRecords()
    } catch (error) {
      console.error('Error deleting record:', error)
      alert('Error al eliminar el registro')
    }
  }
}

function openBulkDeleteModal() {
  showBulkDeleteModal.value = true
  bulkDeleteDate.value = new Date().toISOString().split('T')[0]
  bulkDeleteConfirm.value = ''
}

function closeBulkDeleteModal() {
  showBulkDeleteModal.value = false
  bulkDeleteDate.value = ''
  bulkDeleteConfirm.value = ''
}

async function executeBulkDelete() {
  if (bulkDeleteConfirm.value.toLowerCase() !== 'eliminar') return
  
  deletingBulk.value = true
  try {
    const response = await axios.delete(`${API_URL}/products/history/date/${bulkDeleteDate.value}`)
    alert(`Se eliminaron ${response.data.deleted} registros`)
    closeBulkDeleteModal()
    await fetchRecords()
  } catch (error) {
    console.error('Error bulk deleting:', error)
    alert('Error al eliminar los registros')
  } finally {
    deletingBulk.value = false
  }
}

onMounted(() => {
  fetchRecords()
})
</script>
