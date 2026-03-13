import { useState, useEffect, useCallback } from "react"

type HealthStatus = "checking" | "connected" | "disconnected"

const RETRY_INTERVAL = 5000

export function useHealth() {
  const [status, setStatus] = useState<HealthStatus>("checking")

  const base = import.meta.env.DEV ? "/api" : ""
  const check = useCallback(async () => {
    try {
      const res = await fetch(`${base}/health`)
      setStatus(res.ok ? "connected" : "disconnected")
    } catch {
      setStatus("disconnected")
    }
  }, [])

  useEffect(() => {
    check()
  }, [check])

  useEffect(() => {
    if (status !== "disconnected") return
    const id = setInterval(check, RETRY_INTERVAL)
    return () => clearInterval(id)
  }, [status, check])

  return { status, retry: check }
}
