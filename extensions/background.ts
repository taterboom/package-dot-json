// popup on show
// content script get the package.json or the package.json url
// send to background
// background get the package.json or fetch the package.json by the url

import mem from "mem"
import advancedFetch, { advancedFetchText } from "../shared/advancedFetch"

// send to popup
console.log("-b")

chrome.runtime.onInstalled.addListener((message) => {
  console.log("oi", message)
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("b f", message)
  if (message.backgroundFetch) {
    // @ts-ignore
    bgFetch(...message.backgroundFetch)
      .then((data) => {
        sendResponse([null, data])
      })
      .catch((err) => {
        sendResponse([err, null])
      })
    return true
  } else if (message.backgroundFetchText) {
    // @ts-ignore
    bgFetchText(...message.backgroundFetchText)
      .then((data) => {
        sendResponse([null, data])
      })
      .catch((err) => {
        sendResponse([err, null])
      })
    return true
  }
})

const bgFetch = mem(advancedFetch, {
  cacheKey: JSON.stringify,
  maxAge: 8 * 60 * 60 * 1000,
})

const bgFetchText = mem(advancedFetchText, {
  cacheKey: JSON.stringify,
  maxAge: 8 * 60 * 60 * 1000,
})
