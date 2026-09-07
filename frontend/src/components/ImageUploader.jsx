import { useRef, useState, useCallback, useEffect } from 'react'
import { diagnoseLeaf } from '../api/client'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/bmp', 'image/webp']
const ACCEPT_STRING = 'image/jpeg,image/png,image/bmp,image/webp'
const MAX_SIZE_MB = 10

/* ── SVG icons (inline to avoid extra deps) ──────────────────────── */
const IconUpload = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
)

const IconCamera = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
  </svg>
)

const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

/* ── Component ──────────────────────────────────────────────────── */
export default function ImageUploader({ onResult, onError, setLoading, loading }) {
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [fileName, setFileName] = useState('')
  const [dragActive, setDragActive] = useState(false)

  // Revoke object URL on unmount / new preview
  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview) }
  }, [preview])

  /* ── Validation + submission ──────────────────────────────────── */
  const processFile = useCallback((file) => {
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      onError('Please select a JPG, PNG, BMP, or WebP image.')
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      onError(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is ${MAX_SIZE_MB} MB.`)
      return
    }

    setFileName(file.name)
    setPreview(URL.createObjectURL(file))
    submitFile(file)
  }, [onError])

  const submitFile = async (file) => {
    setLoading(true)
    try {
      const data = await diagnoseLeaf(file)
      onResult(data)
    } catch (err) {
      const msg = err?.response?.data?.detail || err.message || 'Upload failed. Is the server running?'
      onError(msg)
    } finally {
      setLoading(false)
    }
  }

  /* ── Drag-and-drop ────────────────────────────────────────────── */
  const handleDragEnterOver = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true) }
  const handleDragLeave   = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false) }
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false)
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0])
  }

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) processFile(e.target.files[0])
    // Reset so the same file can be re-selected
    e.target.value = ''
  }

  const clearPreview = (e) => {
    e.stopPropagation()
    setPreview(null)
    setFileName('')
  }

  /* ── Render ───────────────────────────────────────────────────── */
  return (
    <section aria-labelledby="upload-heading">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a leaf image. Click to browse files or drag and drop."
        onDragEnter={handleDragEnterOver}
        onDragOver={handleDragEnterOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click() } }}
        className={`
          relative cursor-pointer select-none rounded-2xl border-3 border-dashed
          transition-all duration-200 ease-out
          flex flex-col items-center justify-center gap-4
          p-6 sm:p-10 min-h-[220px]
          ${dragActive
            ? 'border-leaf-500 bg-leaf-50 animate-pulse-ring shadow-lg'
            : 'border-gray-300 hover:border-leaf-400 hover:shadow-md bg-white shadow-sm'}
        `}
      >
        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_STRING}
          onChange={handleFileChange}
          className="sr-only"
          aria-label="Choose an image file"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="sr-only"
          aria-label="Take a photo with your camera"
        />

        {/* Preview or empty state */}
        {preview ? (
          <div className="relative group">
            <img
              src={preview}
              alt="Preview of uploaded leaf"
              className="w-40 h-40 sm:w-48 sm:h-48 object-cover rounded-xl shadow-md ring-2 ring-leaf-200"
            />
            {/* Clear button */}
            <button
              onClick={clearPreview}
              aria-label="Remove image"
              className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md
                         text-gray-500 hover:text-red-500 hover:shadow-lg transition-all
                         opacity-80 group-hover:opacity-100"
            >
              <IconX />
            </button>
          </div>
        ) : (
          <div className="text-leaf-500">
            <IconUpload />
          </div>
        )}

        <div className="text-center space-y-1">
          <p className="text-base sm:text-lg font-semibold text-gray-800 leading-tight">
            {fileName
              ? fileName
              : 'Drop a leaf image here or tap to browse'}
          </p>
          <p className="text-sm text-gray-500">
            JPG, PNG, BMP, WebP &middot; max {MAX_SIZE_MB}&thinsp;MB
          </p>
        </div>
      </div>

      {/* Action buttons below the drop zone */}
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <button
          type="button"
          disabled={loading}
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 inline-flex items-center justify-center gap-2
                     bg-leaf-600 hover:bg-leaf-700 active:bg-leaf-800
                     disabled:bg-gray-300 disabled:cursor-not-allowed
                     text-white font-semibold text-base
                     rounded-xl px-6 py-3.5 shadow-md
                     transition-colors focus-visible:ring-2 focus-visible:ring-leaf-400"
          aria-label="Choose an image file from your device"
        >
          <IconUpload />
          <span>Choose File</span>
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => cameraInputRef.current?.click()}
          className="flex-1 inline-flex items-center justify-center gap-2
                     bg-white hover:bg-gray-50 active:bg-gray-100
                     disabled:bg-gray-100 disabled:cursor-not-allowed
                     text-leaf-700 font-semibold text-base
                     border-2 border-leaf-600
                     rounded-xl px-6 py-3.5 shadow-sm
                     transition-colors focus-visible:ring-2 focus-visible:ring-leaf-400
                     sm:hidden"
          aria-label="Open camera to take a photo of a leaf"
        >
          <IconCamera />
          <span>Take Photo</span>
        </button>
      </div>
    </section>
  )
}
