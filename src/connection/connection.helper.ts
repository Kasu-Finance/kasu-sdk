import { ConnectionType, RecentConnection } from '@/types/connectors'

const RECENT_CONNECTION_KEY = 'last_connection_info'

const isRecentWeb3Connection = (value: any): value is RecentConnection => {
  const recentConnection: RecentConnection = { type: value.type }

  return Boolean(recentConnection.type && ConnectionType[recentConnection.type])
}

export const getRecentWeb3Connection = (): RecentConnection | undefined => {
  const recentConnectionJson = localStorage.getItem(RECENT_CONNECTION_KEY)

  if (!recentConnectionJson) return

  try {
    const recentConnection = JSON.parse(recentConnectionJson)

    if (isRecentWeb3Connection(recentConnection)) return recentConnection
  } catch (error) {
    console.warn(error)
  }
}

export const setRecentWeb3ConnectionDisconnected = () => {
  const recentConnection = getRecentWeb3Connection()

  if (!recentConnection) return

  setRecentWeb3Connection({ ...recentConnection, disconnected: true })
}

export const setRecentWeb3Connection = (
  connection: RecentConnection | undefined
) => {
  if (!connection) return localStorage.removeItem(RECENT_CONNECTION_KEY)

  localStorage.setItem(RECENT_CONNECTION_KEY, JSON.stringify(connection))
}
