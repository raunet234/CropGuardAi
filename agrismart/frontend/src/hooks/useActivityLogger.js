import { useAuth } from '../contexts/AuthContext'
import { saveHistory } from '../services/api'

export function useActivityLogger() {
  const { currentUser } = useAuth()

  async function logActivity(type, title, cropName = '', data = {}) {
    if (!currentUser) return
    try {
      await saveHistory({
        userId: currentUser.uid,
        type,
        title,
        cropName,
        data,
      })
    } catch (err) {
      console.warn('Activity log failed:', err.message)
    }
  }

  return { logActivity }
}
