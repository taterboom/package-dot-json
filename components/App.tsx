import { useRef, useState } from "react"
import { SWRConfig } from "swr"
import { fetchNpmPackageJson } from "../utils/npm"
import Package from "./Package"
import { useRouter } from "next/router"
import { MaterialSymbolsSearch } from "./icons"
import GithubPackage from "./GithubPackage"

type PackageContainerProps = {
  data: string
}
const PackageContainer = (props: PackageContainerProps) => {
  const isGithubUrl = /^(https?:\/\/)?(www.)?github.com\//.test(props.data)
  if (isGithubUrl) return <GithubPackage path={props.data}></GithubPackage>
  return <Package data={props.data} npmDownloads githubStars></Package>
}

type MainProps = {
  children?: React.ReactNode
}

const Main = (props: MainProps) => {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const onSearch = () => {
    const searchName = inputRef.current!.value.trim()
    if (!searchName) return
    router.push(`/?name=${encodeURIComponent(searchName)}`)
  }
  return (
    <div className="max-w-full">
      <input
        ref={inputRef}
        className="w-72 px-2 py-0.5 bg-neutral-700/70 text-sm"
        placeholder="npm package name or it's github url "
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
      {typeof router.query.name === "string" ? (
        <PackageContainer data={router.query.name}></PackageContainer>
      ) : null}
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
