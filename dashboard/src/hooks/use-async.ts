import { useState, useEffect, useCallback } from "react"

type AsyncState<T> =
  | { status: "idle"; data: null; error: null }
  | { status: "loading"; data: null; error: null }
  | { status: "success"; data: T; error: null }
  | { status: "error"; data: null; error: string }

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<AsyncState<T>>({
    status: "idle",
    data: null,
    error: null,
  })

  const execute = useCallback(() => {
    setState({ status: "loading", data: null, error: null })
    fn()
      .then((data) => setState({ status: "success", data, error: null }))
      .catch((err) =>
        setState({ status: "error", data: null, error: err.message })
      )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    execute()
  }, [execute])

  return { ...state, refetch: execute }
}
