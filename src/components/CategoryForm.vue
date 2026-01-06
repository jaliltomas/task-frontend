<template>
  <div class="card p-5">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold text-slate-800">{{ category.name }}</h3>
      <span v-if="saving" class="text-xs text-primary-600">Guardando...</span>
    </div>
    
    <div class="space-y-4">
      <!-- Description for LLM -->
      <div>
        <label class="form-label">Descripción (para IA)</label>
        <input
          v-model="localData.description"
          type="text"
          placeholder="Ej: iPhones nuevos sellados de cualquier modelo"
          class="form-input text-sm"
          @input="debouncedSave"
        />
        <p class="text-xs text-slate-400 mt-1">Ayuda a la IA a categorizar productos</p>
      </div>

      <!-- Retail Markup (TOGGLEABLE) -->
      <div class="p-3 bg-primary-50 rounded-xl">
        <label class="form-label flex items-center justify-between mb-2">
          <span>Margen Consumidor Final</span>
          <span class="text-primary-600 font-medium">{{ formattedRetail }}</span>
        </label>
        
        <!-- Toggle % vs $ -->
        <div class="flex items-center gap-3 mb-2">
          <button
            type="button"
            @click="toggleRetailMode"
            class="w-11 h-6 rounded-full transition-colors relative"
            :class="localData.isRetailPercentage ? 'bg-primary-500' : 'bg-slate-400'"
          >
            <span 
              class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform"
              :class="localData.isRetailPercentage ? 'translate-x-[18px]' : 'translate-x-0'"
            ></span>
          </button>
          <span class="text-sm text-slate-600">
            {{ localData.isRetailPercentage ? 'Porcentaje (%)' : 'Suma Fija ($)' }}
          </span>
        </div>
        
        <div class="flex items-center gap-2">
          <span class="text-sm text-slate-500">{{ localData.isRetailPercentage ? '%' : '$' }}</span>
          <input
            v-model.number="localData.markupRetail"
            type="number"
            :step="localData.isRetailPercentage ? 0.01 : 1"
            min="0"
            class="form-input flex-1"
            @input="debouncedSave"
          />
        </div>
      </div>
      
      <!-- Reseller Markup (TOGGLEABLE) -->
      <div class="p-3 bg-emerald-50 rounded-xl">
        <label class="form-label flex items-center justify-between mb-2">
          <span>Margen Revendedor</span>
          <span class="text-emerald-600 font-medium">{{ formattedReseller }}</span>
        </label>
        
        <!-- Toggle % vs $ -->
        <div class="flex items-center gap-3 mb-2">
          <button
            type="button"
            @click="toggleResellerMode"
            class="w-11 h-6 rounded-full transition-colors relative"
            :class="localData.isResellerPercentage ? 'bg-emerald-500' : 'bg-slate-400'"
          >
            <span 
              class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform"
              :class="localData.isResellerPercentage ? 'translate-x-[18px]' : 'translate-x-0'"
            ></span>
          </button>
          <span class="text-sm text-slate-600">
            {{ localData.isResellerPercentage ? 'Porcentaje (%)' : 'Suma Fija ($)' }}
          </span>
        </div>
        
        <div class="flex items-center gap-2">
          <span class="text-sm text-slate-500">{{ localData.isResellerPercentage ? '%' : '$' }}</span>
          <input
            v-model.number="localData.markupReseller"
            type="number"
            :step="localData.isResellerPercentage ? 0.01 : 1"
            min="0"
            class="form-input flex-1"
            @input="debouncedSave"
          />
        </div>
      </div>
      
      <!-- Example Calculation -->
      <div class="p-3 bg-gradient-to-r from-primary-50 to-emerald-50 rounded-xl">
        <p class="text-xs text-slate-600">
          <strong>Ejemplo:</strong> Costo $100
        </p>
        <p class="text-xs text-slate-600">
          → CF: ${{ exampleRetail }} | RV: ${{ exampleReseller }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onUnmounted } from 'vue'

const props = defineProps({
  category: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update'])

const saving = ref(false)
let saveTimeout = null

const localData = reactive({
  description: props.category.description || '',
  markupRetail: props.category.markupRetail ?? 0.15,
  markupReseller: props.category.markupReseller ?? 0.05,
  isRetailPercentage: props.category.isRetailPercentage ?? true,
  isResellerPercentage: props.category.isResellerPercentage ?? true
})

// Update local data when prop changes
watch(() => props.category, (newVal) => {
  localData.description = newVal.description || ''
  localData.markupRetail = newVal.markupRetail ?? 0.15
  localData.markupReseller = newVal.markupReseller ?? 0.05
  localData.isRetailPercentage = newVal.isRetailPercentage ?? true
  localData.isResellerPercentage = newVal.isResellerPercentage ?? true
}, { deep: true })

const formattedRetail = computed(() => {
  if (localData.isRetailPercentage) {
    return `+${((localData.markupRetail || 0) * 100).toFixed(0)}%`
  }
  return `+$${(localData.markupRetail || 0).toFixed(0)}`
})

const formattedReseller = computed(() => {
  if (localData.isResellerPercentage) {
    return `+${((localData.markupReseller || 0) * 100).toFixed(0)}%`
  }
  return `+$${(localData.markupReseller || 0).toFixed(0)}`
})

const exampleRetail = computed(() => {
  const cost = 100
  if (localData.isRetailPercentage) {
    return (cost * (1 + (localData.markupRetail || 0))).toFixed(0)
  }
  return (cost + (localData.markupRetail || 0)).toFixed(0)
})

const exampleReseller = computed(() => {
  const cost = 100
  if (localData.isResellerPercentage) {
    return (cost * (1 + (localData.markupReseller || 0))).toFixed(0)
  }
  return (cost + (localData.markupReseller || 0)).toFixed(0)
})

function toggleRetailMode() {
  localData.isRetailPercentage = !localData.isRetailPercentage
  // Convert value when switching modes
  if (localData.isRetailPercentage) {
    localData.markupRetail = 0.15
  } else {
    localData.markupRetail = 15
  }
  saveChanges()
}

function toggleResellerMode() {
  localData.isResellerPercentage = !localData.isResellerPercentage
  // Convert value when switching modes
  if (localData.isResellerPercentage) {
    localData.markupReseller = 0.05
  } else {
    localData.markupReseller = 5
  }
  saveChanges()
}

function debouncedSave() {
  clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    saveChanges()
  }, 500)
}

async function saveChanges() {
  saving.value = true
  try {
    emit('update', props.category.id, {
      description: localData.description || null,
      markupRetail: localData.markupRetail,
      markupReseller: localData.markupReseller,
      isRetailPercentage: localData.isRetailPercentage,
      isResellerPercentage: localData.isResellerPercentage
    })
  } finally {
    setTimeout(() => {
      saving.value = false
    }, 300)
  }
}

onUnmounted(() => {
  clearTimeout(saveTimeout)
})
</script>
