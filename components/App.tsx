import { useRef, useState } from "react"
import { SWRConfig } from "swr"
import { fetchNpmPackageJson } from "../utils/npm"
import Package from "./Package"
import { useRouter } from "next/router"
import { MaterialSymbolsSearch } from "./icons"

type MainProps = {
  children?: React.ReactNode
}

const Main = (props: MainProps) => {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const onSearch = () => {
    const searchName = inputRef.current!.value.trim()
    if (!searchName) return
    router.push("/" + searchName)
  }
  return (
    <div>
      <input
        ref={inputRef}
        className="px-1"
        defaultValue={router.query.name}
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            onSearch()
          }
        }}
      ></input>
      <button
        className="ml-2 align-middle"
        onClick={() => {
          onSearch()
        }}
      >
        <MaterialSymbolsSearch />
      </button>
      {router.query.name ? <Package data={router.query.name as string}></Package> : null}
    </div>
  )
}

const App = () => {
  return (
    <SWRConfig
      value={{
        revalidateIfStale: false,
        revalidateOnFocus: false,
        errorRetryCount: 1,
        provider: () => {
          const LS_KEY = "pdj-app-cache"
          let localCache: Map<string, any>
          try {
            localCache = new Map(JSON.parse(localStorage.getItem(LS_KEY) || "[]"))
          } catch (err) {
            localCache = new Map()
          }

          window.addEventListener("beforeunload", () => {
            // @ts-ignore
            const appCache = JSON.stringify(Array.from(localCache.entries()).slice(-100))
            localStorage.setItem(LS_KEY, appCache)
          })

          return localCache
        },
      }}
    >
      <Main />
    </SWRConfig>
  )
}

export default App
