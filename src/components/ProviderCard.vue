<template>
  <div class="card p-5 hover:shadow-lg transition-shadow">
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center gap-3">
        <div 
          class="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold"
          :class="isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'"
        >
          {{ initials }}
        </div>
        <div>
          <h3 class="font-semibold text-slate-800">{{ provider.name }}</h3>
          <p class="text-sm text-slate-500">{{ formattedPhone }}</p>
        </div>
      </div>
      
      <span :class="isActive ? 'badge badge-success' : 'badge bg-slate-100 text-slate-500'">
        {{ isActive ? 'Activo' : 'Inactivo' }}
      </span>
    </div>
    
    <div class="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
      <button 
        @click="$emit('toggle', provider)"
        class="btn-secondary flex-1 text-sm py-2"
      >
        {{ isActive ? 'Desactivar' : 'Activar' }}
      </button>
      <button 
        @click="$emit('edit', provider)"
        class="btn-secondary py-2 px-3"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <button 
        @click="$emit('delete', provider)"
        class="btn-danger py-2 px-3"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  provider: {
    type: Object,
    required: true
  }
})

defineEmits(['edit', 'toggle', 'delete'])

const initials = computed(() => {
  const name = props.provider?.name || ''
  return name
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
})

const formattedPhone = computed(() => {
  // Support both camelCase (from Prisma) and snake_case
  const phone = props.provider?.phone_number || props.provider?.phoneNumber || ''
  if (phone.length > 10) {
    return `+${phone.slice(0, 2)} ${phone.slice(2, 4)} ${phone.slice(4, 8)}-${phone.slice(8)}`
  }
  return phone
})

// Support both camelCase (from Prisma) and snake_case
const isActive = computed(() => {
  return props.provider?.is_active ?? props.provider?.isActive ?? false
})
</script>

