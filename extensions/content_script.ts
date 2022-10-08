import {
  getPackageJson,
  getPackageJsonUrl,
  getStarsCount,
  isPackageJsonUrl,
} from "../shared/githubDom"
import { fetchGithubDocument } from "../utils/github"

// @ts-ignore
window.__pdj_content_script_installed__ = true

let cached: {
  contentScriptQueryedPackageJson: any
  starsCount: number | null
} | null = null

async function queryPackageJson() {
  if (!isPackageJsonUrl(location.href)) {
    const packageJsonUrl = getPackageJsonUrl(document)
    if (!packageJsonUrl) throw new Error("no package.json url")
    const dom = await fetchGithubDocument(packageJsonUrl)
    return getPackageJson(dom)
  } else {
    return getPackageJson(document)
  }
}

async function queryPackageJsonAndBroadcast() {
  if (cached) {
    chrome.runtime.sendMessage(cached)
    return
  }
  try {
    const packageJson = await queryPackageJson()
    const starsCount = getStarsCount(document)
    cached = { contentScriptQueryedPackageJson: packageJson, starsCount }
    chrome.runtime.sendMessage(cached)
  } catch (err) {
    // console.log("4", err)
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    queryPackageJsonAndBroadcast()
  })
} else {
  queryPackageJsonAndBroadcast()
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.contentScriptQueryPackageJson) {
    queryPackageJsonAndBroadcast()
  }
  return true
})
