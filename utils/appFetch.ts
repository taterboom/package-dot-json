import advancedFetch, { advancedFetchText } from "../shared/advancedFetch"
import { isExtension } from "./env"

const $fetch = async (...args: Parameters<Window["fetch"]>) => {
  if (isExtension()) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          backgroundFetch: args,
        },
        ([err, data]) => {
          if (err) {
            reject(err)
          } else {
            resolve(data)
          }
        }
      )
    })
  }
  return advancedFetch(...args)
}

export const $fetchText = async (...args: Parameters<Window["fetch"]>) => {
  if (isExtension()) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          backgroundFetchText: args,
        },
        ([err, data]) => {
          if (err) {
            reject(err)
          } else {
            resolve(data)
          }
        }
      )
    })
  }
  return advancedFetchText(...args)
}

export default $fetch
