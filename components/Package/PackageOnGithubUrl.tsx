import useSWR from "swr"
import { fetchGithubPackageJson } from "../../utils/github"
import Package from "./Package"

type PackageOnGithubUrlProps = {
  children?: React.ReactNode
  path: string
}

const PackageOnGithubUrl = (props: PackageOnGithubUrlProps) => {
  const { data, error } = useSWR(props.path, (path) => fetchGithubPackageJson(path))
  if (error) return <div>Error: ${error.message}</div>
  if (!data) return <div>Loading...</div>
  return <Package data={data}></Package>
}

export default PackageOnGithubUrl
