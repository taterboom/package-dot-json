import { useMemo } from "react"
import useSWR from "swr"
import { fetchGithubStarCount } from "../utils/github"
import {
  fetchNpmPackageDownloadsLastWeek,
  fetchNpmPackageJson,
  parseNpmPackageJsonRepository,
} from "../utils/npm"

type DependencyProps = {
  children?: React.ReactNode
  name: string
}

const Dependency = (props: DependencyProps) => {
  const { data: packageJson, error: packageJsonError } = useSWR(
    ["packageJson", props.name],
    (_, name) => fetchNpmPackageJson(name)
  )
  return (
    <div>
      {props.name}:
      {packageJsonError
        ? `Error: ${packageJsonError.message}`
        : packageJson
        ? packageJson.description
        : "Loading..."}
    </div>
  )
}

type PackageProps = {
  children?: React.ReactNode
  data: string
}

const Package = (props: PackageProps) => {
  const { data: packageJson, error: packageJsonError } = useSWR(
    ["packageJson", props.data],
    (_, name) => fetchNpmPackageJson(name)
  )
  const githubRepository = useMemo(
    () => (packageJson ? parseNpmPackageJsonRepository(packageJson.repository) : null),
    [packageJson]
  )
  const { data: downloads, error: downloadsError } = useSWR(["downloads", props.data], (_, name) =>
    fetchNpmPackageDownloadsLastWeek(name)
  )

  const { data: starCount, error: starCountError } = useSWR(
    githubRepository ? ["starCount", githubRepository.owner, githubRepository.name] : null,
    (_, owner, name) => fetchGithubStarCount(owner, name)
  )

  if (!packageJson) return <div>Loading...</div>
  if (packageJsonError) return <div>Error: {packageJsonError.message}</div>

  return (
    <div>
      <p>name: {packageJson.name}</p>
      <p>
        downloads:{" "}
        {downloadsError
          ? `Error: ${downloadsError.message}`
          : downloads === undefined
          ? "Loading..."
          : downloads}
      </p>
      <p>
        starcount:{" "}
        {starCountError
          ? `Error: ${starCountError.message}`
          : starCount === undefined
          ? "Loading..."
          : starCount}
      </p>
      <ul>
        {Object.keys(packageJson.dependencies).map((dependencyName, index) => (
          <Dependency key={index} name={dependencyName} />
        ))}
      </ul>
    </div>
  )
}

export default Package
