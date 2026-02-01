<template>
  <div class="animate-fade-in">
    <!-- Filters -->
    <div class="card p-4 mb-6">
      <div class="flex flex-wrap gap-4 items-center justify-between">
        <div class="flex-1 flex gap-4 items-center min-w-[200px]">
          <input
            v-model="searchQuery"
            @input="debouncedSearch"
            type="text"
            placeholder="Buscar productos..."
            class="form-input flex-1"
          />
          
          <select 
            v-model="selectedCategory" 
            @change="onCategoryChange"
            class="form-input w-auto"
          >
            <option :value="null">Todas las categorías</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <div class="flex items-center gap-4 border-l pl-4 border-slate-200">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-slate-700">Ver Snapshot</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="snapshotMode" class="sr-only peer" @change="onSnapshotModeChange">
              <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
           
           <div v-if="snapshotMode">
             <input type="date" v-model="snapshotDate" class="form-input py-1.5" @change="onSnapshotDateChange">
           </div>
        </div>
      </div>
      
      <div v-if="snapshotMode" class="mt-4 p-3 bg-purple-50 text-purple-700 text-sm rounded-lg flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <span><strong>Modo Histórico:</strong> Viendo la foto de los productos del día {{ formatDate(snapshotDate) }}. Los productos sin precios ese día no se mostrarán.</span>
      </div>
    </div>
    
    <!-- Products Table -->
    <div class="card overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold">Catálogo de Productos</h2>
            <p class="text-sm text-slate-500">
              {{ productsStore.pagination.total }} productos encontrados
            </p>
          </div>
        </div>
      </div>
      
      <div v-if="productsStore.loading" class="flex items-center justify-center py-12">
        <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
      
      <div v-else-if="productsStore.products.length === 0" class="text-center py-12">
        <p class="text-slate-500">No se encontraron productos</p>
      </div>
      
      <div v-else class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th class="text-right">Costo</th>
              <th class="text-right">P. Reseller</th>
              <th class="text-right">P. Consumidor</th>
              <th>Proveedor</th>
              <th>Actualizado</th>
              <th class="text-center">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="product in productsStore.products" 
              :key="product.id"
              @click="openHistoryModal(product)"
              class="cursor-pointer hover:bg-primary-50 transition-colors"
            >
              <td>
                <div class="font-medium text-slate-800 max-w-[300px] truncate">
                  {{ product.nameNormalized }}
                </div>
              </td>
              <td>
                <span class="badge badge-info">
                  {{ product.category?.name || 'Sin categoría' }}
                </span>
              </td>
              <td class="text-right font-mono">
                ${{ formatPrice(product.lastPrice) }}
              </td>
              <td class="text-right font-mono text-emerald-600">
                ${{ formatPrice(product.suggestedPriceReseller) }}
              </td>
              <td class="text-right font-mono text-primary-600 font-semibold">
                ${{ formatPrice(product.suggestedPriceRetail) }}
              </td>
              <td>
                <span class="text-sm text-slate-600">
                  {{ product.bestProvider?.name || '-' }}
                </span>
              </td>
              <td>
                <span class="text-sm text-slate-500">
                  {{ formatDate(product.updatedAt) }}
                </span>
              </td>
              <td class="text-center">
                <button 
                  @click.stop="confirmDeleteProduct(product)"
                  class="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar producto"
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
      <div v-if="productsStore.totalPages > 1" class="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
        <p class="text-sm text-slate-500">
          Página {{ productsStore.pagination.page }} de {{ productsStore.totalPages }}
        </p>
        <div class="flex gap-2">
          <button 
            @click="prevPage" 
            :disabled="productsStore.pagination.page === 1"
            class="btn-secondary disabled:opacity-50"
          >
            Anterior
          </button>
          <button 
            @click="nextPage" 
            :disabled="productsStore.pagination.page >= productsStore.totalPages"
            class="btn-secondary disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>

    <!-- Price History Modal -->
    <div 
      v-if="showModal" 
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="font-semibold text-lg">Historial de Precios</h3>
            <p class="text-sm text-slate-500">{{ selectedProduct?.nameNormalized }}</p>
          </div>
          <button @click="closeModal" class="p-2 hover:bg-slate-100 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="p-6">
          <div v-if="loadingHistory" class="flex items-center justify-center py-8">
            <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          </div>
          
          <div v-else-if="priceHistory.length === 0" class="text-center py-8 text-slate-500">
            No hay historial de precios
          </div>
          
          <div v-else>
            <!-- Chart -->
            <div class="h-64 mb-6">
              <canvas ref="chartCanvas"></canvas>
            </div>
            
            <!-- History Table -->
            <div class="max-h-48 overflow-y-auto">
              <table class="w-full text-sm">
                <thead class="bg-slate-50 sticky top-0">
                  <tr>
                    <th class="text-left p-2">Fecha</th>
                    <th class="text-left p-2">Nombre Original</th>
                    <th class="text-right p-2">Precio</th>
                    <th class="text-left p-2">Proveedor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="entry in priceHistory" :key="entry.id" class="border-t">
                    <td class="p-2">{{ formatDateTime(entry.createdAt) }}</td>
                    <td class="p-2 text-slate-600 max-w-[200px] truncate">{{ entry.rawName }}</td>
                    <td class="p-2 text-right font-mono">${{ formatPrice(entry.price) }}</td>
                    <td class="p-2">{{ entry.provider?.name || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useProductsStore } from '../stores/products'
import { useCategoriesStore } from '../stores/categories'
import { productsApi } from '../api'

const productsStore = useProductsStore()
const categoriesStore = useCategoriesStore()

const searchQuery = ref('')
const selectedCategory = ref(null)
const categories = ref([])

// Snapshot mode
const snapshotMode = ref(false)
const snapshotDate = ref(new Date().toISOString().split('T')[0])

// Modal state
const showModal = ref(false)
const selectedProduct = ref(null)
const priceHistory = ref([])
const loadingHistory = ref(false)
const chartCanvas = ref(null)
let chartInstance = null

let searchTimeout = null

function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    productsStore.setSearch(searchQuery.value)
  }, 300)
}

function onCategoryChange() {
  productsStore.setCategory(selectedCategory.value)
}

function onSnapshotModeChange() {
  if (snapshotMode.value) {
    productsStore.setDate(snapshotDate.value)
  } else {
    productsStore.setDate(null)
  }
}

function onSnapshotDateChange() {
  if (snapshotMode.value) {
    productsStore.setDate(snapshotDate.value)
  }
}

function prevPage() {
  if (productsStore.pagination.page > 1) {
    productsStore.setPage(productsStore.pagination.page - 1)
  }
}

function nextPage() {
  if (productsStore.pagination.page < productsStore.totalPages) {
    productsStore.setPage(productsStore.pagination.page + 1)
  }
}

function formatPrice(value) {
  if (!value) return '0.00'
  return Number(value).toFixed(2)
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateStr))
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

async function openHistoryModal(product) {
  selectedProduct.value = product
  showModal.value = true
  loadingHistory.value = true
  priceHistory.value = []
  
  try {
    const response = await productsApi.getHistory(product.id, { limit: 100 })
    priceHistory.value = response.data
    loadingHistory.value = false
    
    // Wait for DOM to update before rendering chart
    await nextTick()
    await nextTick()
    renderChart()
  } catch (error) {
    console.error('Error fetching history:', error)
    loadingHistory.value = false
  }
}

function closeModal() {
  showModal.value = false
  selectedProduct.value = null
  priceHistory.value = []
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
}

async function renderChart() {
  if (!chartCanvas.value || priceHistory.value.length === 0) return
  
  // Dynamically import Chart.js
  const { Chart, registerables } = await import('chart.js')
  Chart.register(...registerables)
  
  if (chartInstance) {
    chartInstance.destroy()
  }
  
  const sortedData = [...priceHistory.value].reverse()
  const labels = sortedData.map(e => formatDate(e.createdAt))
  const prices = sortedData.map(e => e.price)
  
  chartInstance = new Chart(chartCanvas.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Precio USD',
        data: prices,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: '#6366f1'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: (value) => '$' + value
          }
        }
      }
    }
  })
}

onMounted(async () => {
  await categoriesStore.fetchCategories()
  categories.value = categoriesStore.categories
  await productsStore.fetchProducts()
})

async function confirmDeleteProduct(product) {
  const confirmed = confirm(`¿Estás seguro de eliminar "${product.nameNormalized}"?\n\nEsta acción también eliminará todo su historial de precios.`)
  
  if (confirmed) {
    try {
      await productsApi.delete(product.id)
      await productsStore.fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Error al eliminar el producto')
    }
  }
}
</script>
