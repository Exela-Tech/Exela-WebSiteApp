import AsyncStorage from "@react-native-async-storage/async-storage"

// 🔧 DEVELOPMENT API - Multiple fallback options
const DEVELOPMENT_API_URLS = [
  "http://192.168.100.46:3000/api", // User's current IP address
  "http://192.168.100.1:3000/api", // Same network range fallback
  "http://localhost:3000/api", // Localhost fallback
]

let API_BASE_URL = DEVELOPMENT_API_URLS[0] // Start with first development API
let currentApiIndex = 0 // Start with first development API

const MAX_RETRIES = 3
const TIMEOUT_MS = 10000 // Reduced timeout for local development

const API_ENDPOINTS = {
  login: "/auth/signin",
  register: "/auth/signup",
  logout: "/auth/signout",
  listings: "/listing/get",
  createListing: "/listing/create",
  // Add more endpoints as needed
}

// Get API configuration
export const getApiConfig = () => ({
  baseUrl: API_BASE_URL,
  timeout: TIMEOUT_MS,
  maxRetries: MAX_RETRIES,
})

// Enhanced timeout wrapper
const withTimeout = (promise, timeoutMs) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), timeoutMs)),
  ])
}

// Get auth token
const getAuthToken = async () => {
  try {
    const userDataString = await AsyncStorage.getItem("user")
    if (userDataString) {
      const userData = JSON.parse(userDataString)
      return userData.token || userData.access_token || userData.accessToken
    }
  } catch (error) {
    console.log("No auth token found")
  }
  return null
}

// Check if server is reachable
export const checkServerHealth = async () => {
  try {
    console.log("🏥 Checking server health...")
    console.log("🎯 Target:", API_BASE_URL)

    const response = await withTimeout(
      fetch(`${API_BASE_URL}/debug/test`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      8000, // Shorter timeout for health check
    )

    if (response.ok) {
      const data = await response.json()
      console.log("✅ Server is healthy:", data)
      return { healthy: true, status: response.status, data }
    } else {
      console.log("⚠️ Server responded but not healthy:", response.status)
      return { healthy: false, status: response.status }
    }
  } catch (error) {
    console.error("❌ Server health check failed:", error.message)
    return { healthy: false, error: error.message }
  }
}

export const testMultipleIPs = async () => {
  console.log("🔍 Testing development API endpoints...")

  // Try development APIs
  for (let i = 0; i < DEVELOPMENT_API_URLS.length; i++) {
    const testUrl = DEVELOPMENT_API_URLS[i]
    try {
      console.log(`Testing development: ${testUrl}`)
      const response = await withTimeout(
        fetch(`${testUrl}/debug/test`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }),
        3000,
      )

      if (response.ok) {
        console.log(`✅ Found working development API: ${testUrl}`)
        API_BASE_URL = testUrl
        currentApiIndex = i
        return { success: true, url: testUrl, type: "development" }
      }
    } catch (error) {
      console.log(`❌ Development API ${testUrl} failed: ${error.message}`)
    }
  }

  console.log("❌ No working API endpoints found")
  return { success: false, error: "No API endpoints are reachable" }
}

export const apiCall = async (endpoint, methodOrOptions = {}, bodyData = null) => {
  let lastError
  const attemptedUrls = []

  // Try current API URL first
  try {
    return await makeApiRequest(API_BASE_URL, endpoint, methodOrOptions, bodyData)
  } catch (error) {
    lastError = error
    attemptedUrls.push(API_BASE_URL)
    console.log(`❌ Failed with ${API_BASE_URL}: ${error.message}`)
  }

  // Try development fallbacks
  for (const devUrl of DEVELOPMENT_API_URLS) {
    if (devUrl === API_BASE_URL) continue // Skip the one we already tried

    try {
      console.log(`🔄 Trying fallback: ${devUrl}`)
      const result = await makeApiRequest(devUrl, endpoint, methodOrOptions, bodyData)

      // Update current API URL if successful
      API_BASE_URL = devUrl
      currentApiIndex = DEVELOPMENT_API_URLS.indexOf(devUrl)
      console.log(`✅ Switched to working API: ${devUrl}`)
      return result
    } catch (error) {
      attemptedUrls.push(devUrl)
      console.log(`❌ Fallback ${devUrl} failed: ${error.message}`)
    }
  }

  console.error(`❌ All API endpoints failed for ${endpoint}`)
  console.error(`❌ Attempted URLs:`, attemptedUrls)
  throw new Error(`API call failed: ${lastError.message}. Tried ${attemptedUrls.length} endpoints.`)
}

const makeApiRequest = async (baseUrl, endpoint, methodOrOptions, bodyData) => {
  const url = `${baseUrl}${endpoint}`

  // Handle both old and new calling patterns
  let method,
    data,
    headers = {}

  if (typeof methodOrOptions === "string") {
    method = methodOrOptions
    data = bodyData
  } else {
    method = methodOrOptions.method || "GET"
    data = methodOrOptions.body || methodOrOptions.data
    headers = methodOrOptions.headers || {}
  }

  console.log(`🌐 API Call: ${method} ${url}`)

  // Get auth token
  const token = await getAuthToken()

  // Default headers
  const defaultHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent": "EstateApp-Mobile/1.0",
  }

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`
  }

  const finalHeaders = { ...defaultHeaders, ...headers }
  const fetchOptions = { method, headers: finalHeaders }

  if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
    fetchOptions.body = typeof data === "string" ? data : JSON.stringify(data)
  }

  let lastError

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`📡 Attempt ${attempt}/${MAX_RETRIES}: ${method} ${url}`)

      const response = await withTimeout(fetch(url, fetchOptions), TIMEOUT_MS)
      console.log(`📊 Response Status: ${response.status}`)

      const contentType = response.headers.get("content-type") || ""
      if (contentType.includes("text/html")) {
        throw new Error(`❌ Server returned HTML error page. Check if API server is running at ${baseUrl}`)
      }

      let responseData
      try {
        const responseText = await response.text()
        responseData = responseText.trim() ? JSON.parse(responseText) : {}
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${parseError.message}`)
      }

      if (!response.ok) {
        const errorMessage = responseData?.message || responseData?.error || `HTTP ${response.status}`

        if (response.status === 401) {
          await AsyncStorage.removeItem("user")
          throw new Error("Authentication failed")
        } else if (response.status === 404) {
          throw new Error("API endpoint not found")
        } else if (response.status === 500) {
          throw new Error("Server internal error")
        } else {
          throw new Error(errorMessage)
        }
      }

      console.log(`✅ API Success: ${method} ${endpoint}`)
      return responseData
    } catch (error) {
      lastError = error
      console.error(`❌ API Error (Attempt ${attempt}):`, error.message)

      if (
        error.message.includes("Authentication failed") ||
        error.message.includes("not found") ||
        attempt === MAX_RETRIES
      ) {
        break
      }

      if (attempt < MAX_RETRIES) {
        const waitTime = attempt * 1000
        console.log(`⏳ Waiting ${waitTime}ms before retry...`)
        await new Promise((resolve) => setTimeout(resolve, waitTime))
      }
    }
  }

  throw lastError
}

export const switchToNextApiUrl = () => {
  if (currentApiIndex < DEVELOPMENT_API_URLS.length - 1) {
    currentApiIndex++
    API_BASE_URL = DEVELOPMENT_API_URLS[currentApiIndex]
    console.log(`🔄 Switched to API URL: ${API_BASE_URL}`)
    return API_BASE_URL
  }
  return null
}

// Test API connectivity
export const testApiConnection = async () => {
  try {
    console.log("🧪 Testing API connection...")
    console.log(`🎯 Target URL: ${API_BASE_URL}`)

    // First check health
    const healthCheck = await checkServerHealth()
    if (!healthCheck.healthy) {
      return {
        success: false,
        error: `API server not reachable: ${healthCheck.error}`,
        details: healthCheck,
      }
    }

    // Then test a real endpoint
    const response = await apiCall("/listing/stats")
    console.log("✅ API connection successful:", response)
    return { success: true, data: response }
  } catch (error) {
    console.error("❌ API connection failed:", error.message)
    return { success: false, error: error.message }
  }
}

// Specific API functions
export const login = async (credentials) => {
  return apiCall(API_ENDPOINTS.login, "POST", credentials)
}

export const register = async (userData) => {
  return apiCall(API_ENDPOINTS.register, "POST", userData)
}

export const logout = async () => {
  return apiCall(API_ENDPOINTS.logout, "GET")
}

export const getListings = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString()
  const endpoint = queryString ? `${API_ENDPOINTS.listings}?${queryString}` : API_ENDPOINTS.listings
  return apiCall(endpoint, "GET")
}

export const createListing = async (listingData) => {
  return apiCall(API_ENDPOINTS.createListing, "POST", listingData)
}

// Export API_BASE_URL for external use
export const getCurrentApiUrl = () => API_BASE_URL

// Export default
export default apiCall
