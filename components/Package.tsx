import Link from "next/link"
import { Fragment, useMemo } from "react"
import useSWR from "swr"
import { fetchGithubStarCount } from "../utils/github"
import {
  fetchNpmPackageDownloadsLastWeek,
  fetchNpmPackageJson,
  PackageJSON,
  parseNpmPackageJsonRepository,
} from "../utils/npm"
import { LogosNpmIcon, RadixIconsGithubLogo } from "./icons"

const DEPS = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "peerDependencies",
] as const

type DependencyProps = {
  children?: React.ReactNode
  name: string
}

const PackageDescription = (props: DependencyProps) => {
  const { data: packageJson, error: packageJsonError } = useSWR(
    ["packageJson", props.name],
    ([_, name]) => fetchNpmPackageJson(name)
  )
  return (
    <>
      {packageJsonError
        ? `Error: ${packageJsonError.message}`
        : packageJson
        ? packageJson.description
        : "Loading..."}
    </>
  )
}

type PackageContentProps = {
  children?: React.ReactNode
  packageJson: PackageJSON
}

const PackageContent = (props: PackageContentProps) => {
  const { packageJson } = props
  const githubRepository = useMemo(
    () => (packageJson ? parseNpmPackageJsonRepository(packageJson.repository) : null),
    [packageJson]
  )
  const { data: downloads, error: downloadsError } = useSWR(
    ["downloads", packageJson.name],
    ([_, name]) => fetchNpmPackageDownloadsLastWeek(name)
  )

  const { data: starCount, error: starCountError } = useSWR(
    githubRepository ? ["starCount", githubRepository.owner, githubRepository.name] : null,
    ([_, owner, name]) => fetchGithubStarCount(owner, name)
  )

  return (
    <div className="py-2">
      <h2 className=" text-4xl font-semibold">{packageJson.name}</h2>
      <h3 className=" text-lg opacity-75">{packageJson.description}</h3>
      <a
        className="inline-flex items-center gap-1 px-1 text-xs ring-1 rounded ring-white opacity-75"
        href={`https://www.npmjs.com/package/${packageJson.name}`}
        target="_blank"
        rel="noreferrer"
      >
        <LogosNpmIcon /> {downloadsError ? `Error` : downloads === undefined ? "..." : downloads}
      </a>
      <a
        className="ml-2 inline-flex items-center gap-1 px-1 text-xs ring-1 rounded ring-white opacity-75"
        href={githubRepository?.url}
        target="_blank"
        rel="noreferrer"
      >
        <RadixIconsGithubLogo />{" "}
        {starCountError ? `Error` : starCount === undefined ? "..." : starCount}
      </a>
      <div className="mt-2">
        <table>
          <tbody>
            {DEPS.filter((dep) => dep in packageJson).map((dep) => (
              <Fragment key={dep}>
                <tr className="opacity-40 text-lg font-medium capitalize">
                  <td className="py-2" colSpan={2}>
                    {dep}
                  </td>
                </tr>
                {Object.keys(packageJson[dep]).map((dependencyName, index) => (
                  <tr
                    key={index}
                    className="odd:bg-gray-100/5 even:bg-gray-100/10 align-top hover:bg-gray-100/20"
                  >
                    <td className="pr-2">
                      <Link href={`/${encodeURIComponent(dependencyName)}`}>{dependencyName}</Link>
                    </td>
                    <td>
                      <PackageDescription name={dependencyName} />
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

type PackageProps = {
  data: string | PackageJSON
}
const Package = (props: PackageProps) => {
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

  return <PackageContent packageJson={packageJson}></PackageContent>
}

export default Package
