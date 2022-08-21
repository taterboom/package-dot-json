import useSWR from "swr"
import { fetchNpmPackageJson } from "../../utils/npm"
import Package from "./Package"

type PackageProps = {
  data: string
  npmDownloads?: boolean
  githubStars?: boolean
}
const PackageOnName = (props: PackageProps) => {
  const checkPropsIsPackageName = (data: PackageProps["data"]): data is string =>
    typeof props.data === "string"

  const { data: packageJsonRes, error: packageJsonError } = useSWR(
    checkPropsIsPackageName(props.data) ? ["packageJson", props.data] : null,
    ([_, name]) => fetchNpmPackageJson(name)
  )
  const packageJson = checkPropsIsPackageName(props.data) ? packageJsonRes : props.data

  if (packageJsonError)
    return <div className="mt-2 opacity-70 text-sm">Error: {packageJsonError.message}</div>
  if (!packageJson) return <div className="mt-2 opacity-70 text-sm">Loading...</div>

  return (
    <Package
      data={packageJson}
      npmDownloads={props.npmDownloads}
      githubStars={props.githubStars}
    ></Package>
  )
}

export default PackageOnName
