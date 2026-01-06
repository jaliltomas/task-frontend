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
        {{ loading ? 'Generando...' : '🚀 Generar Listas' }}
      </button>
    </div>

    <!-- Stats -->
    <div v-if="data" class="grid grid-cols-3 gap-4 mb-6">
      <div class="card p-4 text-center">
        <p class="text-2xl font-bold text-primary-600">{{ data.totalProducts }}</p>
        <p class="text-sm text-slate-500">Productos</p>
      </div>
      <div class="card p-4 text-center">
        <p class="text-2xl font-bold text-accent-600">{{ data.totalCategories }}</p>
        <p class="text-sm text-slate-500">Categorías</p>
      </div>
      <div class="card p-4 text-center">
        <p class="text-sm font-medium text-slate-600">{{ formattedDate }}</p>
        <p class="text-sm text-slate-500">Generado</p>
      </div>
    </div>

    <!-- Lists -->
    <div v-if="data" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          <pre class="whitespace-pre-wrap text-sm font-mono bg-slate-50 p-4 rounded-xl max-h-[500px] overflow-y-auto">{{ data.listCF }}</pre>
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
          <pre class="whitespace-pre-wrap text-sm font-mono bg-slate-50 p-4 rounded-xl max-h-[500px] overflow-y-auto">{{ data.listRV }}</pre>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading" class="card p-12 text-center">
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
        <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-slate-800 mb-2">No hay listas generadas</h3>
      <p class="text-slate-500 mb-4">Hacé clic en "Generar Listas" para crear las listas de precios</p>
      <button @click="generateLists" class="btn-primary">
        🚀 Generar Listas
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const loading = ref(false)
const data = ref(null)
const copiedCF = ref(false)
const copiedRV = ref(false)

const formattedDate = computed(() => {
  if (!data.value?.generatedAt) return ''
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(data.value.generatedAt))
})

async function generateLists() {
  loading.value = true
  try {
    const response = await axios.get(`${API_URL}/products/lists/generate`)
    data.value = response.data
  } catch (error) {
    console.error('Error generating lists:', error)
    alert('Error al generar las listas')
  } finally {
    loading.value = false
  }
}

async function copyToClipboard(type) {
  const text = type === 'CF' ? data.value.listCF : data.value.listRV
  
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
</script>
