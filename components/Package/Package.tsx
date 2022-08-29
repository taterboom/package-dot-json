import Link from "next/link"
import { Fragment, useEffect, useMemo } from "react"
import useSWR from "swr"
import {
  fetchGithubDocument,
  fetchGithubStarsCount,
  fetchGithubStarsCountProxy,
} from "../../utils/github"
import {
  fetchNpmPackageDownloadsLastWeek,
  fetchNpmPackageJson,
  parseNpmPackageJsonRepository,
} from "../../utils/npm"
import { LogosNpmIcon, RadixIconsGithubLogo } from "../icons"
import clsx from "classnames"
import { getStarsCount } from "../../shared/githubDom"
import { isExtension } from "../../utils/env"

export type Dependencies = {
  [x in string]: string
}

export type PackageJSON = {
  name: string
  version?: string
  description?: string
  homepage?: string
  repository?: {
    type: string // "git"
    url: string // "git+https://github.com/vercel/next.js.git"
  }
  dependencies?: Dependencies
  devDependencies?: Dependencies
  peerDependencies?: Dependencies
  optionalDependencies?: Dependencies
}

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

type NpmDownloadsProps = {
  children?: React.ReactNode
  name: string
}

const NpmDownloads = (props: NpmDownloadsProps) => {
  const { data: downloads, error: downloadsError } = useSWR(
    ["downloads", props.name],
    ([_, name]) => fetchNpmPackageDownloadsLastWeek(name)
  )
  return (
    <a
      className="inline-flex items-center gap-1 px-1 text-xs ring-1 rounded ring-white opacity-75"
      href={`https://www.npmjs.com/package/${props.name}`}
      target="_blank"
      rel="noreferrer"
    >
      <LogosNpmIcon /> {downloadsError ? `Error` : downloads === undefined ? "..." : downloads}
    </a>
  )
}

type GithubStarCountProps = {
  children?: React.ReactNode
  repository: {
    url: string
    owner: string
    name: string
  }
}

const GithubStarCount = (props: GithubStarCountProps) => {
  const { data: starCount, error: starCountError } = useSWR(
    ["starCount", props.repository.owner, props.repository.name],
    ([_, owner, name]) =>
      isExtension
        ? fetchGithubDocument(
            `https://github.com/${props.repository.owner}/${props.repository.name}`
          ).then(getStarsCount)
        : fetchGithubStarsCount(owner, name).catch(() =>
            fetchGithubStarsCountProxy(props.repository.owner, props.repository.name).then(
              (res) => res.count
            )
          )
  )
  return (
    <a
      className="ml-2 inline-flex items-center gap-1 px-1 text-xs ring-1 rounded ring-white opacity-75"
      href={props.repository.url}
      target="_blank"
      rel="noreferrer"
    >
      <RadixIconsGithubLogo />{" "}
      {starCountError ? `Error` : starCount === undefined ? "..." : starCount}
    </a>
  )
}

type PackageProps = {
  children?: React.ReactNode
  data: PackageJSON
  npmDownloads?: boolean
  githubStars?: boolean
  className?: string
}

const Package = (props: PackageProps) => {
  const packageJson = props.data
  const githubRepository = useMemo(
    () => (packageJson ? parseNpmPackageJsonRepository(packageJson.repository) : null),
    [packageJson]
  )
  return (
    <div className={clsx("py-2", props.className)}>
      <h2 className=" text-4xl font-semibold">{packageJson.name}</h2>
      <h3 className=" text-lg opacity-75">{packageJson.description}</h3>
      {props.npmDownloads ? <NpmDownloads name={packageJson.name}></NpmDownloads> : null}
      {props.githubStars && githubRepository ? (
        <GithubStarCount repository={githubRepository}></GithubStarCount>
      ) : null}
      <div className="mt-2">
        <table className="w-full">
          <tbody>
            {DEPS.filter((dep) => dep in packageJson).map((dep) => (
              <Fragment key={dep}>
                <tr className="opacity-40 text-lg font-medium capitalize">
                  <td className="py-2" colSpan={2}>
                    {dep}
                  </td>
                </tr>
                {Object.keys(packageJson[dep]!).map((dependencyName, index) => (
                  <tr
                    key={index}
                    className="odd:bg-gray-100/5 even:bg-gray-100/10 align-top hover:bg-gray-100/20"
                  >
                    <td className="px-1">
                      <Link href={`/?name=${encodeURIComponent(dependencyName)}`}>
                        {dependencyName}
                      </Link>
                    </td>
                    <td className="px-1">
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

export default Package
