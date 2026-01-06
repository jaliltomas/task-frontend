import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { productsApi } from '../api'

export const useProductsStore = defineStore('products', () => {
  // State
  const products = ref([])
  const currentProduct = ref(null)
  const priceHistory = ref([])
  const stats = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    page: 1,
    pageSize: 50,
    total: 0
  })
  
  // Filters
  const filters = ref({
    search: '',
    categoryId: null
  })
  
  // Actions
  async function fetchProducts() {
    loading.value = true
    error.value = null
    
    try {
      const params = {
        page: pagination.value.page,
        page_size: pagination.value.pageSize,
        ...filters.value.categoryId && { category_id: filters.value.categoryId },
        ...filters.value.search && { search: filters.value.search }
      }
      
      const response = await productsApi.list(params)
      products.value = response.data.items
      pagination.value.total = response.data.total
    } catch (err) {
      error.value = err.response?.data?.detail || 'Error loading products'
      console.error('Error fetching products:', err)
    } finally {
      loading.value = false
    }
  }
  
  async function fetchProduct(id) {
    loading.value = true
    error.value = null
    
    try {
      const response = await productsApi.get(id)
      currentProduct.value = response.data
    } catch (err) {
      error.value = err.response?.data?.detail || 'Error loading product'
    } finally {
      loading.value = false
    }
  }
  
  async function fetchPriceHistory(productId) {
    try {
      const response = await productsApi.getHistory(productId)
      priceHistory.value = response.data
    } catch (err) {
      console.error('Error fetching price history:', err)
    }
  }
  
  async function fetchStats() {
    try {
      const response = await productsApi.getStats()
      stats.value = response.data
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }
  
  async function deleteProduct(id) {
    try {
      await productsApi.delete(id)
      products.value = products.value.filter(p => p.id !== id)
      return true
    } catch (err) {
      error.value = err.response?.data?.detail || 'Error deleting product'
      return false
    }
  }
  
  function setPage(page) {
    pagination.value.page = page
    fetchProducts()
  }
  
  function setSearch(search) {
    filters.value.search = search
    pagination.value.page = 1
    fetchProducts()
  }
  
  function setCategory(categoryId) {
    filters.value.categoryId = categoryId
    pagination.value.page = 1
    fetchProducts()
  }
  
  // Computed
  const totalPages = computed(() => 
    Math.ceil(pagination.value.total / pagination.value.pageSize)
  )
  
  return {
    // State
    products,
    currentProduct,
    priceHistory,
    stats,
    loading,
    error,
    pagination,
    filters,
    
    // Actions
    fetchProducts,
    fetchProduct,
    fetchPriceHistory,
    fetchStats,
    deleteProduct,
    setPage,
    setSearch,
    setCategory,
    
    // Computed
    totalPages
  }
})
