<template>
  <div class="animate-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-lg font-semibold">Configuración de Márgenes</h2>
        <p class="text-sm text-slate-500">Define los márgenes de ganancia por categoría</p>
      </div>
      <div class="flex gap-2">
        <button @click="showCreateModal = true" class="btn-primary">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nueva Categoría
        </button>
        <button @click="seedCategories" class="btn-secondary" :disabled="seeding">
          {{ seeding ? 'Cargando...' : 'Por Defecto' }}
        </button>
      </div>
    </div>
    
    <!-- Categories Grid -->
    <div v-if="categoriesStore.loading" class="flex items-center justify-center py-12">
      <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>
    
    <div v-else-if="categoriesStore.categories.length === 0" class="card p-12 text-center">
      <p class="text-slate-500 mb-4">No hay categorías configuradas</p>
      <div class="flex justify-center gap-3">
        <button @click="showCreateModal = true" class="btn-primary">
          Crear nueva categoría
        </button>
        <button @click="seedCategories" class="btn-secondary">
          Cargar por defecto
        </button>
      </div>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <CategoryForm 
        v-for="category in categoriesStore.categories" 
        :key="category.id"
        :category="category"
        @update="updateCategory"
        @delete="deleteCategory"
      />
    </div>
    
    <!-- Create Category Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeCreateModal"></div>
      
      <!-- Modal -->
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-slate-800">Nueva Categoría</h3>
          <button @click="closeCreateModal" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="createCategory" class="space-y-4">
          <!-- Name -->
          <div>
            <label class="form-label">Nombre *</label>
            <input
              v-model="newCategory.name"
              type="text"
              required
              placeholder="Ej: Smartwatch"
              class="form-input"
            />
          </div>
          
          <!-- Description -->
          <div>
            <label class="form-label">Descripción (para IA)</label>
            <input
              v-model="newCategory.description"
              type="text"
              placeholder="Ej: Relojes inteligentes de cualquier marca"
              class="form-input"
            />
            <p class="text-xs text-slate-400 mt-1">Ayuda a la IA a categorizar productos</p>
          </div>
          
          <!-- Retail Markup -->
          <div class="p-3 bg-primary-50 rounded-xl">
            <label class="form-label flex items-center justify-between mb-2">
              <span>Margen Consumidor Final</span>
            </label>
            <div class="flex items-center gap-3 mb-2">
              <button
                type="button"
                @click="newCategory.isRetailPercentage = !newCategory.isRetailPercentage"
                class="w-11 h-6 rounded-full transition-colors relative"
                :class="newCategory.isRetailPercentage ? 'bg-primary-500' : 'bg-slate-400'"
              >
                <span 
                  class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform"
                  :class="newCategory.isRetailPercentage ? 'translate-x-[18px]' : 'translate-x-0'"
                ></span>
              </button>
              <span class="text-sm text-slate-600">
                {{ newCategory.isRetailPercentage ? 'Porcentaje (%)' : 'Suma Fija ($)' }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-slate-500">{{ newCategory.isRetailPercentage ? '%' : '$' }}</span>
              <input
                v-model.number="newCategory.markupRetail"
                type="number"
                :step="newCategory.isRetailPercentage ? 0.01 : 1"
                min="0"
                class="form-input flex-1"
              />
            </div>
          </div>
          
          <!-- Reseller Markup -->
          <div class="p-3 bg-emerald-50 rounded-xl">
            <label class="form-label flex items-center justify-between mb-2">
              <span>Margen Revendedor</span>
            </label>
            <div class="flex items-center gap-3 mb-2">
              <button
                type="button"
                @click="newCategory.isResellerPercentage = !newCategory.isResellerPercentage"
                class="w-11 h-6 rounded-full transition-colors relative"
                :class="newCategory.isResellerPercentage ? 'bg-emerald-500' : 'bg-slate-400'"
              >
                <span 
                  class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform"
                  :class="newCategory.isResellerPercentage ? 'translate-x-[18px]' : 'translate-x-0'"
                ></span>
              </button>
              <span class="text-sm text-slate-600">
                {{ newCategory.isResellerPercentage ? 'Porcentaje (%)' : 'Suma Fija ($)' }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-slate-500">{{ newCategory.isResellerPercentage ? '%' : '$' }}</span>
              <input
                v-model.number="newCategory.markupReseller"
                type="number"
                :step="newCategory.isResellerPercentage ? 0.01 : 1"
                min="0"
                class="form-input flex-1"
              />
            </div>
          </div>
          
          <!-- Error Message -->
          <div v-if="createError" class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {{ createError }}
          </div>
          
          <!-- Actions -->
          <div class="flex gap-3 pt-2">
            <button type="button" @click="closeCreateModal" class="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" class="btn-primary flex-1" :disabled="creating">
              {{ creating ? 'Creando...' : 'Crear Categoría' }}
            </button>
          </div>
        </form>
      </div>
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
import { ref, reactive, onMounted } from 'vue'
import { useCategoriesStore } from '../stores/categories'
import CategoryForm from '../components/CategoryForm.vue'

const categoriesStore = useCategoriesStore()
const seeding = ref(false)
const showCreateModal = ref(false)
const creating = ref(false)
const createError = ref(null)

const newCategory = reactive({
  name: '',
  description: '',
  markupRetail: 0.15,
  markupReseller: 0.05,
  isRetailPercentage: true,
  isResellerPercentage: true
})

function resetNewCategory() {
  newCategory.name = ''
  newCategory.description = ''
  newCategory.markupRetail = 0.15
  newCategory.markupReseller = 0.05
  newCategory.isRetailPercentage = true
  newCategory.isResellerPercentage = true
}

function closeCreateModal() {
  showCreateModal.value = false
  createError.value = null
  resetNewCategory()
}

async function createCategory() {
  creating.value = true
  createError.value = null
  
  try {
    await categoriesStore.createCategory({
      name: newCategory.name,
      description: newCategory.description || null,
      markupRetail: newCategory.markupRetail,
      markupReseller: newCategory.markupReseller,
      isRetailPercentage: newCategory.isRetailPercentage,
      isResellerPercentage: newCategory.isResellerPercentage
    })
    closeCreateModal()
  } catch (error) {
    createError.value = error.response?.data?.message || 'Error al crear la categoría'
  } finally {
    creating.value = false
  }
}

async function deleteCategory(id) {
  if (confirm('¿Estás seguro de que quieres eliminar esta categoría? Los productos asociados quedarán sin categoría.')) {
    await categoriesStore.deleteCategory(id)
  }
}

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

