<template>
  <div class="crm-container">
    <!-- Chat List Sidebar -->
    <aside class="chat-list">
      <div class="chat-list-header">
        <h2>Conversaciones</h2>
        <div class="header-actions">
          <button @click="syncChats" class="sync-btn" :disabled="syncing" title="Sincronizar con WhatsApp">
            <svg class="w-5 h-5" :class="{ 'animate-spin': syncing }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
          <button @click="refreshChats" class="refresh-btn" :disabled="loading" title="Actualizar conversaciones">
            <svg class="w-5 h-5" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button @click="clearRecentMessages" class="clear-btn" :disabled="loading || chats.length === 0" title="Limpiar mensajes recientes">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Search Input -->
      <div class="search-container">
        <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar conversaciones..."
          class="search-input"
        />
      </div>
      
      <div class="chat-items">
        <!-- WhatsApp Not Connected Warning -->
        <div v-if="!isWhatsAppConnected" class="disconnected-state">
          <div class="disconnected-icon">
            <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <p class="disconnected-title">WhatsApp no conectado</p>
          <span class="text-sm text-slate-400">Conecta WhatsApp en Integraciones para ver las conversaciones</span>
        </div>
        
        <div v-else-if="loading && chats.length === 0" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando conversaciones...</p>
        </div>
        
        <div v-else-if="chats.length === 0" class="empty-state">
          <svg class="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p>No hay conversaciones</p>
          <span class="text-sm text-slate-400">Presiona el botón de sincronizar</span>
          <button @click="syncChats" class="sync-cta-btn" :disabled="syncing">
            {{ syncing ? 'Sincronizando...' : 'Sincronizar WhatsApp' }}
          </button>
        </div>
        
        <div
          v-for="chat in filteredChats"
          :key="chat.id"
          class="chat-item"
          :class="{ 'active': selectedChat?.id === chat.id }"
          @click="selectChat(chat)"
        >
          <div class="chat-avatar">
            {{ getInitials(chat.name || chat.phoneNumber) }}
          </div>
          <div class="chat-info">
            <div class="chat-header-row">
              <span class="chat-name">{{ chat.name || chat.phoneNumber }}</span>
              <span class="chat-time">{{ formatTime(chat.lastMessageAt) }}</span>
            </div>
            <div class="chat-preview-row">
              <span class="chat-preview">{{ chat.lastMessage || 'Sin mensajes' }}</span>
              <span v-if="chat.unreadCount > 0" class="unread-badge">{{ chat.unreadCount }}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
    
    <!-- Chat Area -->
    <main class="chat-area">
      <template v-if="selectedChat">
        <!-- Chat Header -->
        <div class="chat-header">
          <div class="chat-header-info">
            <div class="chat-avatar-lg">
              {{ getInitials(selectedChat.name || selectedChat.phoneNumber) }}
            </div>
            <div>
              <h3>{{ selectedChat.name || selectedChat.phoneNumber }}</h3>
              <span class="phone-number">{{ selectedChat.phoneNumber }}</span>
            </div>
          </div>
        </div>
        
        <!-- Messages -->
        <div class="messages-container" ref="messagesContainer">
          <div v-if="loadingMessages" class="loading-messages">
            <div class="spinner"></div>
          </div>
          
          <div v-else-if="messages.length === 0" class="no-messages">
            <p>No hay mensajes aún</p>
          </div>
          
          <template v-else>
            <div
              v-for="message in messages"
              :key="message.id"
              class="message"
              :class="{ 'sent': message.fromMe, 'received': !message.fromMe }"
            >
              <div class="message-content">
                <p>{{ message.content }}</p>
                <span class="message-time">{{ formatMessageTime(message.timestamp) }}</span>
              </div>
            </div>
          </template>
        </div>
        
        <!-- Message Input -->
        <div class="message-input-area">
          <input
            v-model="newMessage"
            type="text"
            placeholder="Escribe un mensaje..."
            @keyup.enter="sendMessage"
            :disabled="sending"
          />
          <button @click="sendMessage" :disabled="!newMessage.trim() || sending" class="send-btn">
            <svg v-if="!sending" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <div v-else class="spinner-sm"></div>
          </button>
        </div>
      </template>
      
      <!-- No Chat Selected -->
      <div v-else class="no-chat-selected">
        <svg class="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <h2>Selecciona una conversación</h2>
        <p>Elige un chat de la lista para ver los mensajes</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { API_URL } from '@/config/api.js'

// State
const chats = ref([])
const selectedChat = ref(null)
const messages = ref([])
const newMessage = ref('')
const searchQuery = ref('')
const loading = ref(false)
const loadingMessages = ref(false)
const sending = ref(false)
const syncing = ref(false)
const messagesContainer = ref(null)
const whatsappStatus = ref('INITIALIZING')
const manuallyCleared = ref(false)
let eventSource = null

// WhatsApp connection state
const isWhatsAppConnected = computed(() => 
  whatsappStatus.value === 'CONNECTED' || whatsappStatus.value === 'inChat'
)

// Filtered chats based on search
const filteredChats = computed(() => {
  if (!searchQuery.value.trim()) {
    return chats.value
  }
  const query = searchQuery.value.toLowerCase()
  return chats.value.filter(chat => 
    (chat.name || '').toLowerCase().includes(query) ||
    (chat.phoneNumber || '').includes(query) ||
    (chat.lastMessage || '').toLowerCase().includes(query)
  )
})

// Fetch all chats
async function fetchChats() {
  loading.value = true
  try {
    const response = await fetch(`${API_URL}/crm/chats`)
    const data = await response.json()
    chats.value = data.items || []
  } catch (error) {
    console.error('Error fetching chats:', error)
  } finally {
    loading.value = false
  }
}

// Refresh chats
function refreshChats() {
  manuallyCleared.value = false
  fetchChats()
}

// Clear recent messages
function clearRecentMessages() {
  chats.value = []
  messages.value = []
  selectedChat.value = null
  manuallyCleared.value = true
}

// Sync chats from WhatsApp
async function syncChats() {
  manuallyCleared.value = false
  syncing.value = true
  try {
    const response = await fetch(`${API_URL}/crm/sync`, { method: 'POST' })
    const data = await response.json()
    console.log('Sync result:', data)
    // After sync, fetch the updated chats
    await fetchChats()
  } catch (error) {
    console.error('Error syncing chats:', error)
  } finally {
    syncing.value = false
  }
}

// Select a chat
async function selectChat(chat) {
  selectedChat.value = chat
  loadingMessages.value = true
  
  try {
    // First try to fetch messages from DB
    await fetchMessagesQuiet(chat.id)
    
    // Always try to sync more messages from WhatsApp if connected
    if (isWhatsAppConnected.value) {
      try {
        console.log('Syncing messages from WhatsApp...')
        const syncResponse = await fetch(`${API_URL}/crm/chats/${chat.id}/sync-messages`, { method: 'POST' })
        const syncResult = await syncResponse.json()
        console.log('Sync result:', syncResult)
        
        // Fetch again after sync to get any new messages
        if (syncResult.synced > 0) {
          await fetchMessagesQuiet(chat.id)
        }
      } catch (error) {
        console.error('Error syncing messages:', error)
      }
    }
    
    // Mark as read
    if (chat.unreadCount > 0) {
      try {
        await fetch(`${API_URL}/crm/chats/${chat.id}/read`, { method: 'POST' })
        chat.unreadCount = 0
      } catch (error) {
        console.error('Error marking chat as read:', error)
      }
    }
  } finally {
    loadingMessages.value = false
    scrollToBottom()
  }
}

// Fetch messages without setting loading state (for internal use)
async function fetchMessagesQuiet(chatId) {
  try {
    const response = await fetch(`${API_URL}/crm/chats/${chatId}/messages`)
    const data = await response.json()
    messages.value = data.items || []
  } catch (error) {
    console.error('Error fetching messages:', error)
  }
}

// Fetch messages for a chat
async function fetchMessages(chatId) {
  loadingMessages.value = true
  try {
    const response = await fetch(`${API_URL}/crm/chats/${chatId}/messages`)
    const data = await response.json()
    messages.value = data.items || []
    scrollToBottom()
  } catch (error) {
    console.error('Error fetching messages:', error)
  } finally {
    loadingMessages.value = false
  }
}

// Send a message
async function sendMessage() {
  if (!newMessage.value.trim() || !selectedChat.value || sending.value) return
  
  const messageText = newMessage.value.trim()
  newMessage.value = ''
  sending.value = true
  
  try {
    const response = await fetch(`${API_URL}/crm/chats/${selectedChat.value.id}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: messageText })
    })
    
    const data = await response.json()
    
    if (data.success) {
      // Add message to list
      messages.value.push(data.message)
      scrollToBottom()
      
      // Update chat preview
      selectedChat.value.lastMessage = messageText
      selectedChat.value.lastMessageAt = new Date().toISOString()
    } else {
      console.error('Error sending message:', data.error)
      // Restore message on error
      newMessage.value = messageText
    }
  } catch (error) {
    console.error('Error sending message:', error)
    newMessage.value = messageText
  } finally {
    sending.value = false
  }
}

// Scroll to bottom of messages
function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// Get initials from name
function getInitials(name) {
  if (!name) return '?'
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

// Format time for chat list
function formatTime(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  
  // Less than 24 hours - show time
  if (diff < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  }
  
  // Less than 7 days - show day name
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString('es-AR', { weekday: 'short' })
  }
  
  // Older - show date
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
}

// Format time for messages
function formatMessageTime(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

// Connect to WhatsApp status SSE
function connectWhatsAppSSE() {
  eventSource = new EventSource(`${API_URL}/whatsapp/qr-stream`)
  
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      
      if (data.status) {
        const wasConnected = isWhatsAppConnected.value
        whatsappStatus.value = data.status
        
        // If just connected, sync chats
        if (!wasConnected && isWhatsAppConnected.value) {
          console.log('WhatsApp reconnected, syncing chats...')
          syncChats()
        }
        
        // If disconnected, clear local data
        if (wasConnected && !isWhatsAppConnected.value) {
          console.log('WhatsApp disconnected, clearing local data...')
          chats.value = []
          messages.value = []
          selectedChat.value = null
        }
      }
    } catch (e) {
      console.error('Error parsing SSE data:', e)
    }
  }
  
  eventSource.onerror = () => {
    console.error('SSE connection error')
  }
}

// Auto-refresh every 30 seconds
let refreshInterval
onMounted(async () => {
  // Connect to WhatsApp status
  connectWhatsAppSSE()
  
  // First sync from WhatsApp if no chats exist
  await fetchChats()
  if (chats.value.length === 0 && isWhatsAppConnected.value) {
    await syncChats()
  }
  refreshInterval = setInterval(() => {
    if (isWhatsAppConnected.value && !manuallyCleared.value) {
      fetchChats()
    }
  }, 30000)
})

onUnmounted(() => {
  if (eventSource) {
    eventSource.close()
  }
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})

// Watch for selected chat changes to refresh messages
watch(selectedChat, (newChat) => {
  if (newChat && isWhatsAppConnected.value) {
    // Set up message refresh for selected chat
    const messageRefresh = setInterval(() => {
      if (selectedChat.value?.id === newChat.id && isWhatsAppConnected.value) {
        fetchMessages(newChat.id)
      } else {
        clearInterval(messageRefresh)
      }
    }, 10000)
  }
})
</script>

<style scoped>
.crm-container {
  display: flex;
  height: calc(100vh - 8rem);
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

/* Chat List Sidebar */
.chat-list {
  width: 320px;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.chat-list-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
}

.chat-list-header h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.25rem;
}

.search-container {
  padding: 0.75rem 1rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: #94a3b8;
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: #f8fafc;
  outline: none;
  transition: border-color 0.15s, background 0.15s;
}

.search-input:focus {
  border-color: #3b82f6;
  background: white;
}

.search-input::placeholder {
  color: #94a3b8;
}

.sync-btn,
.refresh-btn {
  padding: 0.5rem;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.sync-btn:hover:not(:disabled),
.refresh-btn:hover:not(:disabled) {
  background: #f1f5f9;
  color: #3b82f6;
}

.sync-btn:disabled,
.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sync-cta-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.15s, opacity 0.15s;
}

.sync-cta-btn:hover:not(:disabled) {
  transform: scale(1.02);
}

.sync-cta-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}


.refresh-btn {
  padding: 0.5rem;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: #f1f5f9;
  color: #3b82f6;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.clear-btn {
  padding: 0.5rem;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.clear-btn:hover:not(:disabled) {
  background: #fef2f2;
  color: #ef4444;
}

.clear-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chat-items {
  flex: 1;
  overflow-y: auto;
}

.loading-state,
.empty-state,
.disconnected-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: #64748b;
}

.chat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f1f5f9;
}

.chat-item:hover {
  background: #f1f5f9;
}

.chat-item.active {
  background: #e0f2fe;
  border-left: 3px solid #3b82f6;
}

.chat-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.chat-header-row,
.chat-preview-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.chat-name {
  font-weight: 500;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-time {
  font-size: 0.75rem;
  color: #94a3b8;
  flex-shrink: 0;
}

.chat-preview {
  font-size: 0.875rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 0.125rem;
}

.unread-badge {
  background: #3b82f6;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  flex-shrink: 0;
}

/* Chat Area */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.chat-header {
  padding: 1rem 1.5rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

.chat-header-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.chat-avatar-lg {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.chat-header-info h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.phone-number {
  font-size: 0.875rem;
  color: #64748b;
}

/* Messages Container */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.loading-messages,
.no-messages {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #94a3b8;
}

.message {
  display: flex;
  max-width: 70%;
}

.message.sent {
  align-self: flex-end;
}

.message.received {
  align-self: flex-start;
}

.message-content {
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  position: relative;
}

.message.sent .message-content {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-bottom-right-radius: 0.25rem;
}

.message.received .message-content {
  background: white;
  color: #1e293b;
  border-bottom-left-radius: 0.25rem;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
}

.message-content p {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.message-time {
  display: block;
  font-size: 0.6875rem;
  margin-top: 0.25rem;
  opacity: 0.7;
}

.message.sent .message-time {
  text-align: right;
}

/* Message Input */
.message-input-area {
  padding: 1rem 1.5rem;
  background: white;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 0.75rem;
}

.message-input-area input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 9999px;
  font-size: 0.9375rem;
  outline: none;
  transition: border-color 0.15s;
}

.message-input-area input:focus {
  border-color: #3b82f6;
}

.message-input-area input:disabled {
  background: #f8fafc;
}

.send-btn {
  width: 44px;
  height: 44px;
  border: none;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s, opacity 0.15s;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* No Chat Selected */
.no-chat-selected {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #64748b;
  text-align: center;
  padding: 2rem;
}

.no-chat-selected h2 {
  margin: 1rem 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.no-chat-selected p {
  margin: 0;
  color: #94a3b8;
}

/* Spinner */
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-sm {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.w-5 { width: 1.25rem; }
.h-5 { height: 1.25rem; }
.w-12 { width: 3rem; }
.h-12 { height: 3rem; }
.w-16 { width: 4rem; }
.h-16 { height: 4rem; }
</style>
