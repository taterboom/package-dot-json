import {
  isPackageJsonUrl,
  getPackageJsonUrl,
  getPackageJson,
  getStarsCount,
} from "../shared/githubDom"
import { fetchGithubDocument } from "../utils/github"

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
  try {
    const packageJson = await queryPackageJson()
    const starsCount = getStarsCount(document)
    chrome.runtime.sendMessage({ contentScriptQueryedPackageJson: packageJson, starsCount })
  } catch (err) {
    // console.log("4", err)
  }
}

if (document.readyState === "complete") {
  queryPackageJsonAndBroadcast()
} else {
  document.addEventListener("DOMContentLoaded", () => {
    queryPackageJsonAndBroadcast()
  })
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.contentScriptQueryPackageJson) {
    queryPackageJsonAndBroadcast()
  }
  return true
})

// @ts-ignore
window.__pdj_content_script_installed__ = true
