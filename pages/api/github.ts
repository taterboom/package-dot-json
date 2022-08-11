import { createServer } from "@graphql-yoga/node"
import type { NextApiRequest, NextApiResponse } from "next"

const typeDefs = /* GraphQL */ `
  type Query {
    package(packageJsonFile: PackageJsonFile): [Package!]!
    githubPackageJsonFile(path: String!): PackageJsonFile
  }
  type Package {
    name: String
    version: String
    description: String
    keywords: [String]
    homepage: String
    repository: String
    license: String
    dependencies: [Package]
    devDependencies: [Package]
    peerDependencies: [Package]
    optionalDependencies: [Package]
  }
  type PackageJsonFile {
    name: String
    version: String
    description: String
    keywords: [String]
    homepage: String
    repository: String
    license: String
    dependencies: [Dependency]
    devDependencies: [Dependency]
    peerDependencies: [Dependency]
    optionalDependencies: [Dependency]
  }
  type Dependency {
    name: String
    version: String
  }
`

type PackageJsonFile = {}

const resolvers = {
  Query: {
    githubPackageJsonFile(path: string) {},
    package(packageJson: string[]) {
      return [{ name: "Nextjs" }]
    },
  },
}

export default createServer<{
  req: NextApiRequest
  res: NextApiResponse
}>({
  schema: {
    typeDefs,
    resolvers,
  },
  endpoint: "/api/github",
})
