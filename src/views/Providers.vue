<template>
  <div class="animate-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-lg font-semibold">Proveedores</h2>
        <p class="text-sm text-slate-500">Gestiona los números de WhatsApp autorizados</p>
      </div>
      <button @click="showAddModal = true" class="btn-primary">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Agregar Proveedor
      </button>
    </div>
    
    <!-- Providers Grid -->
    <div v-if="providersStore.loading" class="flex items-center justify-center py-12">
      <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>
    
    <div v-else-if="providersStore.providers.length === 0" class="card p-12 text-center">
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
        <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <p class="text-slate-500">No hay proveedores registrados</p>
      <button @click="showAddModal = true" class="btn-primary mt-4">
        Agregar el primero
      </button>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ProviderCard 
        v-for="provider in providersStore.providers" 
        :key="provider.id"
        :provider="provider"
        @edit="editProvider"
        @toggle="toggleProvider"
        @delete="deleteProvider"
      />
    </div>
    
    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="card w-full max-w-md p-6 m-4 animate-slide-up">
        <h3 class="text-lg font-semibold mb-4">
          {{ showEditModal ? 'Editar Proveedor' : 'Agregar Proveedor' }}
        </h3>
        
        <form @submit.prevent="saveProvider">
          <div class="space-y-4">
            <div>
              <label class="form-label">Nombre</label>
              <input 
                v-model="formData.name" 
                type="text" 
                class="form-input"
                placeholder="Ej: Proveedor Tech"
                required
              />
            </div>
            
            <div>
              <label class="form-label">Número de WhatsApp</label>
              <input 
                v-model="formData.phone_number" 
                type="text" 
                class="form-input"
                placeholder="Ej: 5491112345678"
                required
              />
              <p class="text-xs text-slate-500 mt-1">Solo números, sin espacios ni guiones</p>
            </div>
            
            <div class="flex items-center gap-2">
              <input 
                v-model="formData.is_active" 
                type="checkbox" 
                id="isActive"
                class="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <label for="isActive" class="text-sm text-slate-700">Activo</label>
            </div>
          </div>
          
          <div class="flex gap-3 mt-6">
            <button type="button" @click="closeModal" class="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" class="btn-primary flex-1" :disabled="saving">
              {{ saving ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useProvidersStore } from '../stores/providers'
import ProviderCard from '../components/ProviderCard.vue'

const providersStore = useProvidersStore()

const showAddModal = ref(false)
const showEditModal = ref(false)
const saving = ref(false)
const editingId = ref(null)

const formData = reactive({
  name: '',
  phone_number: '',
  is_active: true
})

function resetForm() {
  formData.name = ''
  formData.phone_number = ''
  formData.is_active = true
  editingId.value = null
}

function closeModal() {
  showAddModal.value = false
  showEditModal.value = false
  resetForm()
}

function editProvider(provider) {
  editingId.value = provider.id
  formData.name = provider.name
  formData.phone_number = provider.phone_number
  formData.is_active = provider.is_active
  showEditModal.value = true
}

async function saveProvider() {
  saving.value = true
  try {
    if (editingId.value) {
      await providersStore.updateProvider(editingId.value, { ...formData })
    } else {
      await providersStore.createProvider({ ...formData })
    }
    closeModal()
  } catch (error) {
    console.error('Error saving provider:', error)
  } finally {
    saving.value = false
  }
}

async function toggleProvider(provider) {
  await providersStore.toggleActive(provider.id)
}

async function deleteProvider(provider) {
  if (confirm(`¿Eliminar al proveedor "${provider.name}"?`)) {
    await providersStore.deleteProvider(provider.id)
  }
}

onMounted(() => {
  providersStore.fetchProviders()
})
</script>
