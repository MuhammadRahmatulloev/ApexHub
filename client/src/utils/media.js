export const MEDIA_URL = 'http://127.0.0.1:8000'

export const getMediaUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${MEDIA_URL}${path}`
}