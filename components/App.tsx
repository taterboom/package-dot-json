import { useRef, useState } from "react"
import { SWRConfig } from "swr"
import { useRouter } from "next/router"
import { MaterialSymbolsKeyboardBackspace, MaterialSymbolsSearch } from "./icons"
import GithubPackage from "./Package/PackageOnGithubUrl"
import PackageOnName from "./Package/PackageOnName"
import clsx from "classnames"
import PackageOnGithubPage from "./Package/PackageOnGithubPage"
import { isExtension } from "../utils/env"
import Link from "next/link"

const SearchBar = () => {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const onSearch = () => {
    const searchName = inputRef.current!.value.trim()
    if (!searchName) return
    router.push(`/?name=${encodeURIComponent(searchName)}`)
  }
  return (
    <div className="">
      <input
        key={router.query.name + ""}
        ref={inputRef}
        className={clsx(
          "w-72 px-2 py-0.5 bg-neutral-700/70 text-sm hover:opacity-100 focus:opacity-100",
          !!router.query.name && "!w-40 opacity-70 focus:!w-56 transition-all"
        )}
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
    </div>
  )
}

const SearchPlaceholder = () => (
  <Link href="/?bs=1">
    <MaterialSymbolsSearch />
  </Link>
)

const NavBar = (props: { searchPlaceholder?: boolean; backable?: boolean }) => {
  const router = useRouter()
  return (
    <nav className="min-w-72 flex justify-between items-center">
      <div>
        {props.backable && (
          <button onClick={() => router.back()}>
            <MaterialSymbolsKeyboardBackspace />
          </button>
        )}
      </div>
      <div>{props.searchPlaceholder ? <SearchPlaceholder /> : <SearchBar />}</div>
    </nav>
  )
}

type PackageContainerProps = {
  data: string
}
const PackageContainer = (props: PackageContainerProps) => {
  const isGithubUrl = /^(https?:\/\/)?(www.)?github.com\//.test(props.data)
  if (isGithubUrl) return <GithubPackage path={props.data}></GithubPackage>
  return <PackageOnName data={props.data} npmDownloads githubStars></PackageOnName>
}

const Main = () => {
  const router = useRouter()
  const isBrowserType = router.query["bs"] === "1"
  const hasQueryName = typeof router.query.name === "string"
  const isExtensionGithubPageType = isExtension && !isBrowserType

  return (
    <div
      className={clsx(
        "max-w-full",
        (hasQueryName || isExtension) && "w-full flex-1",
        isExtension && "min-w-[400px]"
      )}
    >
      <NavBar
        backable={hasQueryName || isBrowserType}
        searchPlaceholder={isExtensionGithubPageType}
      />
      {hasQueryName ? (
        <PackageContainer data={router.query.name as string} />
      ) : isExtensionGithubPageType ? (
        <PackageOnGithubPage />
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
