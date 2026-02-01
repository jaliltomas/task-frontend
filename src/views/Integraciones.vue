<template>
  <div class="animate-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-lg font-semibold">Integraciones</h2>
        <p class="text-sm text-slate-500">Conecta y desconecta servicios externos</p>
      </div>
    </div>

    <!-- WhatsApp Integration Card -->
    <div class="card overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
          <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </div>
        <div>
          <h3 class="font-semibold text-slate-800">WhatsApp</h3>
          <p class="text-xs text-slate-500">Recibe mensajes de precios automáticamente</p>
        </div>
      </div>

      <div class="p-6">
        <!-- Status Indicator -->
        <div class="flex items-center gap-3 mb-6">
          <div 
            class="w-3 h-3 rounded-full"
            :class="statusColor"
          ></div>
          <span class="text-sm font-medium" :class="statusTextColor">
            {{ statusText }}
          </span>
        </div>

        <!-- Loading State -->
        <div v-if="status === 'INITIALIZING'" class="text-center py-8">
          <div class="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-slate-500">Iniciando sesión de WhatsApp...</p>
        </div>

        <!-- QR Code Display -->
        <div v-else-if="status === 'QRCODE' && qrCode" class="text-center">
          <div class="bg-white p-4 rounded-2xl shadow-lg inline-block mb-4">
            <img :src="qrCode" alt="WhatsApp QR" class="w-64 h-64" />
          </div>
          <p class="text-sm text-slate-500 mb-2">
            Escaneá este código QR con WhatsApp para conectar
          </p>
          <p class="text-xs text-slate-400">
            WhatsApp → Menú → Dispositivos vinculados → Vincular dispositivo
          </p>
        </div>

        <!-- Connected State (CONNECTED or inChat) -->
        <div v-else-if="isConnected" class="text-center py-6">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-emerald-600 mb-2">¡Conectado!</h3>
          <p class="text-sm text-slate-500 mb-6">
            Tu WhatsApp está vinculado y recibiendo mensajes de precios.
          </p>
          <button 
            @click="disconnect"
            :disabled="disconnecting"
            class="btn-secondary text-red-600 border-red-200 hover:bg-red-50"
          >
            {{ disconnecting ? 'Desconectando...' : '🔴 Desconectar' }}
          </button>
        </div>

        <!-- Disconnected State -->
        <div v-else-if="status === 'DISCONNECTED'" class="text-center py-6">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-slate-600 mb-2">Desconectado</h3>
          <p class="text-sm text-slate-500">Esperando reconexión...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="status === 'ERROR'" class="text-center py-6">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-red-600 mb-2">Error de conexión</h3>
          <p class="text-sm text-slate-500">{{ errorMessage || 'Hubo un error al conectar' }}</p>
        </div>

        <!-- Unknown State -->
        <div v-else class="text-center py-6">
          <p class="text-slate-500">Estado: {{ status }}</p>
        </div>
      </div>
    </div>

    <!-- Info Card -->
    <div class="card p-6 mt-6">
      <h3 class="font-semibold text-slate-800 mb-3">¿Cómo funciona?</h3>
      <ul class="space-y-2 text-sm text-slate-600">
        <li class="flex items-start gap-2">
          <span class="text-primary-500">1.</span>
          <span>Escaneá el código QR con tu WhatsApp</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-primary-500">2.</span>
          <span>Cuando recibas un mensaje con precios, el sistema lo procesa automáticamente</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-primary-500">3.</span>
          <span>Los productos se agregan/actualizan en el catálogo con precios sugeridos</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { API_URL } from '@/config/api.js'

const status = ref('INITIALIZING')
const qrCode = ref(null)
const errorMessage = ref('')
const disconnecting = ref(false)
let eventSource = null

const isConnected = computed(() => 
  status.value === 'CONNECTED' || status.value === 'inChat'
)

const statusColor = computed(() => {
  switch (status.value) {
    case 'CONNECTED': 
    case 'inChat': 
      return 'bg-emerald-500'
    case 'QRCODE': return 'bg-yellow-500 animate-pulse'
    case 'INITIALIZING': return 'bg-blue-400 animate-pulse'
    case 'ERROR': return 'bg-red-500'
    default: return 'bg-slate-400'
  }
})

const statusTextColor = computed(() => {
  switch (status.value) {
    case 'CONNECTED': 
    case 'inChat': 
      return 'text-emerald-600'
    case 'QRCODE': return 'text-yellow-600'
    case 'ERROR': return 'text-red-600'
    default: return 'text-slate-600'
  }
})

const statusText = computed(() => {
  switch (status.value) {
    case 'CONNECTED': 
    case 'inChat': 
      return 'Conectado'
    case 'QRCODE': return 'Esperando escaneo de QR'
    case 'INITIALIZING': return 'Iniciando...'
    case 'DISCONNECTED': return 'Desconectado'
    case 'ERROR': return 'Error'
    default: return status.value
  }
})

function connectSSE() {
  eventSource = new EventSource(`${API_URL}/whatsapp/qr-stream`)
  
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      
      if (data.status) {
        status.value = data.status
      }
      
      if (data.qr) {
        qrCode.value = data.qr
      }
      
      if (data.error) {
        errorMessage.value = data.error
      }
    } catch (e) {
      console.error('Error parsing SSE data:', e)
    }
  }
  
  eventSource.onerror = () => {
    console.error('SSE connection error')
    status.value = 'ERROR'
    errorMessage.value = 'Error de conexión con el servidor'
  }
}

async function disconnect() {
  disconnecting.value = true
  try {
    const response = await fetch(`${API_URL}/whatsapp/disconnect`, {
      method: 'POST'
    })
    const data = await response.json()
    if (!data.success) {
      alert('Error: ' + data.message)
    }
  } catch (error) {
    console.error('Error disconnecting:', error)
    alert('Error al desconectar')
  } finally {
    disconnecting.value = false
  }
}

onMounted(() => {
  connectSSE()
})

onUnmounted(() => {
  if (eventSource) {
    eventSource.close()
  }
})
</script>
