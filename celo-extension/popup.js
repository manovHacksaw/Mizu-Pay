/** @type {typeof chrome} */
// @ts-ignore - chrome is a global provided by Chrome Extension API
const chrome = globalThis.chrome

// CELO Pay Extension - Popup Script
// Handles popup UI interactions and communication with background script

console.log("CELO Pay Extension: Popup script loaded")

// DOM elements
const loadingEl = document.getElementById("loading")
const mainContentEl = document.getElementById("main-content")
const errorMessageEl = document.getElementById("error-message")
const checkoutInfoEl = document.getElementById("checkout-info")
const openDappBtnEl = document.getElementById("open-dapp-btn")
const refreshBtnEl = document.getElementById("refresh-btn")
const enableToggleEl = document.getElementById("enable-toggle")
const autoDetectToggleEl = document.getElementById("auto-detect-toggle")
const paymentCardEl = document.getElementById("payment-card")
const usePaymentBtnEl = document.getElementById("use-payment-btn")
const paymentSubtitleEl = document.getElementById("payment-subtitle")

// State
let currentTab = null
let settings = null
let checkoutData = null

// Initialize popup
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await initializePopup()
  } catch (error) {
    console.error("CELO Pay Extension: Popup initialization error", error)
    showError("Failed to initialize extension")
  }
})

// Initialize popup functionality
async function initializePopup() {
  // Get current tab
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  currentTab = tabs[0]

  // Load settings
  await loadSettings()

  // Check for existing checkout data
  await checkForCheckoutData()

  // Set up event listeners
  setupEventListeners()

  // Show main content
  loadingEl.classList.add("hidden")
  mainContentEl.classList.remove("hidden")

  console.log("CELO Pay Extension: Popup initialized")
}

// Load extension settings
async function loadSettings() {
  try {
    const response = await chrome.runtime.sendMessage({ type: "GET_SETTINGS" })
    settings = response
    updateSettingsUI()
  } catch (error) {
    console.error("CELO Pay Extension: Error loading settings", error)
    settings = {
      enabled: true,
      dappUrl: "http://localhost:3000",
      conversionApi: "https://api.exchangerate-api.com/v4/latest/",
      supportedCurrencies: ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "INR"],
      blacklistedDomains: [],
    }
  }
}

// Check for existing checkout data
async function checkForCheckoutData() {
  try {
    const result = await chrome.storage.local.get(["lastCheckout"])
    if (result.lastCheckout) {
      checkoutData = result.lastCheckout
      displayCheckoutInfo(checkoutData)
    }
  } catch (error) {
    console.error("CELO Pay Extension: Error checking checkout data", error)
  }
}

// Set up event listeners
function setupEventListeners() {
  // Open DApp button
  openDappBtnEl.addEventListener("click", handleOpenDApp)

  // Use Payment button
  usePaymentBtnEl.addEventListener("click", handleUsePayment)

  // Refresh button
  refreshBtnEl.addEventListener("click", handleRefresh)

  // Settings toggles
  enableToggleEl.addEventListener("click", () => toggleSetting("enabled"))
  autoDetectToggleEl.addEventListener("click", () => toggleSetting("autoDetect"))
}

// Handle open DApp button click
async function handleOpenDApp() {
  try {
    if (!checkoutData) {
      showError("No checkout data available")
      return
    }

    // Send message to background script to open DApp
    await chrome.runtime.sendMessage({
      type: "OPEN_DAPP",
      data: checkoutData,
    })

    // Close popup
    window.close()
  } catch (error) {
    console.error("CELO Pay Extension: Error opening DApp", error)
    showError("Failed to open CELO Pay DApp")
  }
}

// Handle use payment button click
async function handleUsePayment() {
  try {
    if (!checkoutData) {
      showError("No checkout data available")
      return
    }

    // Send message to background script to open DApp
    await chrome.runtime.sendMessage({
      type: "OPEN_DAPP",
      data: checkoutData,
    })

    // Close popup
    window.close()
  } catch (error) {
    console.error("CELO Pay Extension: Error opening payment", error)
    showError("Failed to open CELO Pay")
  }
}

// Handle refresh button click
async function handleRefresh() {
  try {
    // Send message to content script to re-evaluate page
    await chrome.tabs.sendMessage(currentTab.id, { type: "REEVALUATE_PAGE" })

    // Check for new checkout data after a short delay
    setTimeout(async () => {
      await checkForCheckoutData()
    }, 1000)

    console.log("CELO Pay Extension: Page re-evaluation requested")
  } catch (error) {
    console.error("CELO Pay Extension: Error refreshing detection", error)
    showError("Failed to refresh checkout detection")
  }
}

// Toggle setting
async function toggleSetting(settingName) {
  try {
    const newValue = !settings[settingName]
    settings[settingName] = newValue

    // Update settings in background script
    await chrome.runtime.sendMessage({
      type: "UPDATE_SETTINGS",
      settings: { [settingName]: newValue },
    })

    // Update UI
    updateSettingsUI()

    console.log(`CELO Pay Extension: Setting ${settingName} toggled to ${newValue}`)
  } catch (error) {
    console.error("CELO Pay Extension: Error toggling setting", error)
    showError("Failed to update setting")
  }
}

// Update settings UI
function updateSettingsUI() {
  if (!settings) return

  // Update enable toggle
  if (settings.enabled) {
    enableToggleEl.classList.add("active")
  } else {
    enableToggleEl.classList.remove("active")
  }

  // Update auto-detect toggle
  if (settings.autoDetect) {
    autoDetectToggleEl.classList.add("active")
  } else {
    autoDetectToggleEl.classList.remove("active")
  }
}

// Display checkout information
function displayCheckoutInfo(data) {
  if (!data) return

  // Update payment card subtitle
  const storeName = data.store || "Unknown Store"
  paymentSubtitleEl.textContent = `Payment option detected at ${storeName}!`

  // Update checkout info display
  document.getElementById("store-name").textContent = data.store || "Unknown Store"
  document.getElementById("checkout-amount").textContent = data.amount || "0"
  document.getElementById("checkout-currency").textContent = data.currency || "USD"
  document.getElementById("checkout-product").textContent = data.product_name || "Purchase"

  // Show conversion info if available
  if (data.conversion) {
    document.getElementById("cusd-amount").textContent = `${data.conversion.cusdAmount} cUSD`
    document.getElementById("conversion-info").classList.remove("hidden")
  }

  // Show payment card and checkout info
  paymentCardEl.classList.remove("hidden")
  checkoutInfoEl.classList.remove("hidden")
  openDappBtnEl.classList.remove("hidden")

  console.log("CELO Pay Extension: Checkout info displayed", data)
}

// Show error message
function showError(message) {
  errorMessageEl.textContent = message
  errorMessageEl.classList.remove("hidden")

  // Hide error after 5 seconds
  setTimeout(() => {
    errorMessageEl.classList.add("hidden")
  }, 5000)
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("CELO Pay Extension: Popup received message", message)

  switch (message.type) {
    case "CHECKOUT_DETECTED":
      checkoutData = message.data
      displayCheckoutInfo(checkoutData)
      break

    case "CHECKOUT_CLEARED":
      checkoutData = null
      paymentCardEl.classList.add("hidden")
      checkoutInfoEl.classList.add("hidden")
      openDappBtnEl.classList.add("hidden")
      break

    default:
      console.log("CELO Pay Extension: Unknown message type in popup", message.type)
  }
})

// Handle popup visibility changes
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    // Popup became visible, refresh data
    checkForCheckoutData()
  }
})

// Handle window focus
window.addEventListener("focus", () => {
  checkForCheckoutData()
})

console.log("CELO Pay Extension: Popup script ready")
