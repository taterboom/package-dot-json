import { useRef, useState } from "react"
import { fetchNpmPackageJson } from "../utils/npm"
import Package from "./Package"

type AppProps = {
  children?: React.ReactNode
}

const App = (props: AppProps) => {
  const [searchValue, setSearchValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const onSearch = async (path: string) => {
    setSearchValue(path)
  }
  return (
    <div>
      <input ref={inputRef}></input>
      <button
        onClick={() => {
          onSearch(inputRef.current!.value)
        }}
      >
        search
      </button>
      {searchValue ? <Package data={searchValue}></Package> : null}
    </div>
  )
}

export default App
