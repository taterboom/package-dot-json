import { useEffect, useState } from "react"
import { isGithubRepoPath } from "../../shared/githubDom"
import Package from "./Package"

type PackageOnGithubPageProps = {
  children?: React.ReactNode
}

const PackageOnGithubPage = (props: PackageOnGithubPageProps) => {
  const [packageJson, setPackageJson] = useState(null)
  const [isInGithubRepoPage, setIsInGithubRepoPage] = useState(true)
  useEffect(() => {
    const init = async () => {
      const res = await chrome.tabs.query({ active: true, currentWindow: true })
      const activeTabId = res[0]?.id
      setIsInGithubRepoPage(res[0]?.url ? isGithubRepoPath(res[0].url) : false)
      if (activeTabId) {
        const [{ result: installed }] = await chrome.scripting.executeScript({
          target: { tabId: activeTabId },
          func: () => {
            // @ts-ignore
            return window.__pdj_content_script_installed__
          },
        })
        if (installed) {
          return chrome.tabs.sendMessage(activeTabId, { contentScriptQueryPackageJson: true })
        } else {
          return chrome.scripting.executeScript({
            target: { tabId: activeTabId },
            files: ["content_script.js"],
          })
        }
      }
    }
    const onContentScriptQueryedPackageJson = (message: any) => {
      if (message.contentScriptQueryedPackageJson) {
        setPackageJson(message.contentScriptQueryedPackageJson)
      }
    }
    chrome.runtime.onMessage.addListener(onContentScriptQueryedPackageJson)
    init()
    return () => {
      chrome.runtime.onMessage.removeListener(onContentScriptQueryedPackageJson)
    }
  }, [])

  if (!isInGithubRepoPage)
    return <div>Cannot find package.json, you can click the 🔍 to search for an npm package.</div>
  if (!packageJson) return <div>Loading...</div>

  return <Package data={packageJson}></Package>
}

export default PackageOnGithubPage
