import { defineStore } from 'pinia'
import { ref } from 'vue'
import { providersApi } from '../api'

export const useProvidersStore = defineStore('providers', () => {
  // State
  const providers = ref([])
  const currentProvider = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  // Actions
  async function fetchProviders(activeOnly = false) {
    loading.value = true
    error.value = null
    
    try {
      const params = activeOnly ? { is_active: true } : {}
      const response = await providersApi.list(params)
      providers.value = response.data
    } catch (err) {
      error.value = err.response?.data?.detail || 'Error loading providers'
    } finally {
      loading.value = false
    }
  }
  
  async function fetchProvider(id) {
    loading.value = true
    error.value = null
    
    try {
      const response = await providersApi.get(id)
      currentProvider.value = response.data
    } catch (err) {
      error.value = err.response?.data?.detail || 'Error loading provider'
    } finally {
      loading.value = false
    }
  }
  
  async function createProvider(data) {
    loading.value = true
    error.value = null
    
    try {
      const response = await providersApi.create(data)
      providers.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.detail || 'Error creating provider'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function updateProvider(id, data) {
    loading.value = true
    error.value = null
    
    try {
      const response = await providersApi.update(id, data)
      const index = providers.value.findIndex(p => p.id === id)
      if (index !== -1) {
        providers.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.detail || 'Error updating provider'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function deleteProvider(id) {
    try {
      await providersApi.delete(id)
      providers.value = providers.value.filter(p => p.id !== id)
      return true
    } catch (err) {
      error.value = err.response?.data?.detail || 'Error deleting provider'
      return false
    }
  }
  
  async function toggleActive(id) {
    const provider = providers.value.find(p => p.id === id)
    if (provider) {
      return updateProvider(id, { is_active: !provider.is_active })
    }
  }
  
  return {
    // State
    providers,
    currentProvider,
    loading,
    error,
    
    // Actions
    fetchProviders,
    fetchProvider,
    createProvider,
    updateProvider,
    deleteProvider,
    toggleActive
  }
})
