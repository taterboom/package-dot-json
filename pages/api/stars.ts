import { NextApiHandler } from "next"
import { JSDOM } from "jsdom"
import { getStarsCount } from "../../shared/githubDom"

async function fetchGithubDom(url: string) {
  const response = await fetch(url)
  const dom = new JSDOM(await response.text())
  return dom.window.document
}

const api: NextApiHandler = async (req, res) => {
  const { owner, repo } = req.query
  const count = await fetchGithubDom(`https://github.com/${owner}/${repo}`).then(getStarsCount)
  return count !== null ? res.status(200).json({ count }) : res.status(404)
}

export default api
