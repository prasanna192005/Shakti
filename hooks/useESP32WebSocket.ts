// hooks/useESP32WebSocket.ts
import { useEffect, useState, useCallback, useRef } from 'react'

export interface ESP32Data {
  timestamp: number
  activeSource: number
  pzem1: {
    voltage: number
    current: number
    power: number
    energy: number
    frequency: number
    powerFactor: number
  }
  pzem2: {
    voltage: number
    current: number
    power: number
    energy: number
    frequency: number
    powerFactor: number
  }
}

interface UseESP32WebSocketReturn {
  data: ESP32Data | null
  isConnected: boolean
  error: string | null
  sendCommand: (command: string) => void
  reconnect: () => void
}

export function useESP32WebSocket(esp32Ip: string): UseESP32WebSocketReturn {
  const [data, setData] = useState<ESP32Data | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 10

  const connect = useCallback(() => {
    try {
      // Close existing connection
      if (wsRef.current) {
        wsRef.current.close()
      }

      const wsUrl = `ws://${esp32Ip}/ws`
      console.log('Connecting to ESP32 WebSocket:', wsUrl)
      
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        setError(null)
        reconnectAttemptsRef.current = 0
        
        // Request initial data
        ws.send('getData')
      }

      ws.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data) as ESP32Data
          setData(parsedData)
          setError(null)
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err)
          setError('Failed to parse data from ESP32')
        }
      }

      ws.onerror = (event) => {
        console.error('WebSocket error:', event)
        setError('WebSocket connection error')
      }

      ws.onclose = () => {
        console.log('WebSocket disconnected')
        setIsConnected(false)
        wsRef.current = null

        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)
          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})...`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, delay)
        } else {
          setError('Failed to connect after multiple attempts')
        }
      }

    } catch (err) {
      console.error('Failed to create WebSocket:', err)
      setError('Failed to create WebSocket connection')
    }
  }, [esp32Ip])

  const sendCommand = useCallback((command: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(command)
    } else {
      console.warn('WebSocket is not connected')
      setError('Cannot send command: WebSocket not connected')
    }
  }, [])

  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0
    connect()
  }, [connect])

  useEffect(() => {
    connect()

    // Cleanup
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [connect])

  return {
    data,
    isConnected,
    error,
    sendCommand,
    reconnect
  }
}