import { useEffect, useState } from "react"
import useSWR from "swr"
import Package from "./Package"

type PackageOnGithubPageProps = {
  children?: React.ReactNode
}

const PackageOnGithubPage = (props: PackageOnGithubPageProps) => {
  const [packageJson, setPackageJson] = useState(null)
  useEffect(() => {
    const init = async () => {
      const res = await chrome.tabs.query({ active: true, currentWindow: true })
      const activeTabId = res[0]?.id
      if (activeTabId) {
        const [{ result: installed }] = await chrome.scripting.executeScript({
          target: { tabId: activeTabId },
          func: () => {
            // @ts-ignore
            return window.__pdj_content_script_installed__
          },
        })
        console.log(installed)
        if (installed) {
          return chrome.tabs.sendMessage(activeTabId, { contentScriptQueryPackageJson: true })
        } else {
          console.log("inj")
          return chrome.scripting.executeScript({
            target: { tabId: activeTabId },
            files: ["content_script.js"],
          })
        }
      }
    }
    const onContentScriptQueryedPackageJson = (message: any) => {
      console.log("onContentScriptQueryedPackageJson")
      if (message.contentScriptQueryedPackageJson) {
        setPackageJson(message.contentScriptQueryedPackageJson)
      }
    }
    chrome.runtime.onMessage.addListener(onContentScriptQueryedPackageJson)
    init()
      .then((res) => {
        console.log("init", res)
      })
      .catch((err) => {
        console.log("init err", err)
      })
    return () => {
      chrome.runtime.onMessage.removeListener(onContentScriptQueryedPackageJson)
    }
  }, [])

  if (!packageJson) return <div>Loading...</div>

  return <Package data={packageJson}></Package>
}

export default PackageOnGithubPage