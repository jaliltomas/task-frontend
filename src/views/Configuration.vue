<template>
  <div class="animate-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-lg font-semibold">Configuración de Márgenes</h2>
        <p class="text-sm text-slate-500">Define los márgenes de ganancia por categoría</p>
      </div>
      <button @click="seedCategories" class="btn-secondary" :disabled="seeding">
        {{ seeding ? 'Cargando...' : 'Cargar Categorías Por Defecto' }}
      </button>
    </div>
    
    <!-- Categories Grid -->
    <div v-if="categoriesStore.loading" class="flex items-center justify-center py-12">
      <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>
    
    <div v-else-if="categoriesStore.categories.length === 0" class="card p-12 text-center">
      <p class="text-slate-500 mb-4">No hay categorías configuradas</p>
      <button @click="seedCategories" class="btn-primary">
        Cargar categorías por defecto
      </button>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <CategoryForm 
        v-for="category in categoriesStore.categories" 
        :key="category.id"
        :category="category"
        @update="updateCategory"
      />
    </div>
    
    <!-- Info Card -->
    <div class="card p-6 mt-8 bg-gradient-to-r from-primary-50 to-accent-50">
      <div class="flex gap-4">
        <div class="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 class="font-medium text-slate-800">¿Cómo funcionan los márgenes?</h3>
          <p class="text-sm text-slate-600 mt-1">
            <strong>Porcentaje:</strong> El margen se calcula como un porcentaje del costo. 
            Ej: 15% sobre $100 = $115
          </p>
          <p class="text-sm text-slate-600 mt-1">
            <strong>Suma fija:</strong> Se suma un valor fijo al costo. 
            Ej: +$50 sobre $100 = $150
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCategoriesStore } from '../stores/categories'
import CategoryForm from '../components/CategoryForm.vue'

const categoriesStore = useCategoriesStore()
const seeding = ref(false)

async function seedCategories() {
  seeding.value = true
  try {
    await categoriesStore.seedCategories()
  } catch (error) {
    console.error('Error seeding categories:', error)
  } finally {
    seeding.value = false
  }
}

async function updateCategory(id, data) {
  await categoriesStore.updateCategory(id, data)
}

onMounted(() => {
  categoriesStore.fetchCategories()
})
</script>
