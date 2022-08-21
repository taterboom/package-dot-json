class FetchError extends Error {
  status?: number
}

export const advancedFetch = async (...args: Parameters<Window["fetch"]>) => {
  const res = await fetch(...args)
  if (res.ok) {
    return res.json()
  } else {
    const msg = await res.text()
    const error = new FetchError(msg)
    error.status = res.status
    throw error
  }
}

export const advancedFetchText = async (...args: Parameters<Window["fetch"]>) => {
  const res = await fetch(...args)
  if (res.ok) {
    return res.text()
  } else {
    const msg = await res.text()
    const error = new FetchError(msg)
    error.status = res.status
    throw error
  }
}

export default advancedFetch
