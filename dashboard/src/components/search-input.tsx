import { Search, X } from "lucide-react"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onClear?: () => void
  placeholder?: string
  submitLabel?: string
  loading?: boolean
  type?: string
  autoFocus?: boolean
}

export function SearchInput({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder = "Search...",
  submitLabel = "Search",
  loading = false,
  type = "text",
  autoFocus = false,
}: SearchInputProps) {
  const showClear = onClear && value.length > 0

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        autoFocus={autoFocus}
        className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-24 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {showClear && (
          <button
            onClick={onClear}
            className="flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="size-3.5" />
          </button>
        )}
        <button
          onClick={onSubmit}
          disabled={loading || !value.trim()}
          className="flex items-center justify-center h-7 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-colors"
        >
          {loading ? <span className="animate-pulse">...</span> : submitLabel}
        </button>
      </div>
    </div>
  )
}
