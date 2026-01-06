import { defineStore } from 'pinia'
import { ref } from 'vue'
import { categoriesApi } from '../api'

export const useCategoriesStore = defineStore('categories', () => {
  // State
  const categories = ref([])
  const currentCategory = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  // Actions
  async function fetchCategories() {
    loading.value = true
    error.value = null
    
    try {
      const response = await categoriesApi.list()
      categories.value = response.data
    } catch (err) {
      error.value = err.response?.data?.detail || 'Error loading categories'
    } finally {
      loading.value = false
    }
  }
  
  async function createCategory(data) {
    loading.value = true
    error.value = null
    
    try {
      const response = await categoriesApi.create(data)
      categories.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.detail || 'Error creating category'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function updateCategory(id, data) {
    loading.value = true
    error.value = null
    
    try {
      const response = await categoriesApi.update(id, data)
      const index = categories.value.findIndex(c => c.id === id)
      if (index !== -1) {
        categories.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.detail || 'Error updating category'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function deleteCategory(id) {
    try {
      await categoriesApi.delete(id)
      categories.value = categories.value.filter(c => c.id !== id)
      return true
    } catch (err) {
      error.value = err.response?.data?.detail || 'Error deleting category'
      return false
    }
  }
  
  async function seedCategories() {
    loading.value = true
    error.value = null
    
    try {
      const response = await categoriesApi.seed()
      // Refresh the list after seeding
      await fetchCategories()
      return response.data
    } catch (err) {
      error.value = err.response?.data?.detail || 'Error seeding categories'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // Format markup for display
  function formatMarkup(value, isFixed) {
    if (isFixed) {
      return `+$${value.toFixed(0)}`
    }
    return `+${(value * 100).toFixed(0)}%`
  }
  
  return {
    // State
    categories,
    currentCategory,
    loading,
    error,
    
    // Actions
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    seedCategories,
    
    // Helpers
    formatMarkup
  }
})
