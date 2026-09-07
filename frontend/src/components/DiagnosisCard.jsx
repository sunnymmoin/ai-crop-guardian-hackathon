/* ── Diagnosis Card ──────────────────────────────────────────────── *
 *  Displays the result from /api/diagnose in a high-contrast,       *
 *  color-coded layout optimised for outdoor readability.            *
 * ────────────────────────────────────────────────────────────────── */

const CONFIDENCE_BANDS = [
  { min: 0.90, label: 'High',    bar: 'bg-green-500',  badge: 'bg-green-100 text-green-800'  },
  { min: 0.70, label: 'Medium',  bar: 'bg-amber-500',  badge: 'bg-amber-100 text-amber-800'  },
  { min: 0,    label: 'Low',     bar: 'bg-red-500',    badge: 'bg-red-100 text-red-800'      },
]

function confidenceBand(score) {
  return CONFIDENCE_BANDS.find((b) => score >= b.min)
}

/* ── Small inline SVG icons ─────────────────────────────────────── */
const IconLeaf     = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4-4-8-7.582-8-12a8 8 0 0116 0c0 4.418-4 8-8 12z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V11" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l3-3 3 3" />
  </svg>
)
const IconBug      = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
    <circle cx="12" cy="12" r="9" />
  </svg>
)
const IconShield   = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
)
const IconFlask    = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
  </svg>
)
const IconCheck    = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)
const IconWarning  = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
)

/* ── Component ──────────────────────────────────────────────────── */
export default function DiagnosisCard({ result }) {
  const { disease, confidence, pesticide, dosage, filename } = result
  const pct = (confidence * 100).toFixed(1)
  const band = confidenceBand(confidence)
  const isHealthy = disease.toLowerCase() === 'healthy'

  return (
    <article
      aria-label="Diagnosis result"
      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
    >
      {/* ── Severity banner ──────────────────────────────────── */}
      <div
        className={`
          flex items-center gap-3 px-5 py-4 text-white font-bold text-lg tracking-wide
          ${isHealthy ? 'bg-green-600' : 'bg-red-600'}
        `}
      >
        {isHealthy
          ? <IconCheck className="w-7 h-7 flex-shrink-0" />
          : <IconWarning className="w-7 h-7 flex-shrink-0" />}
        <span>{isHealthy ? 'No Disease Detected' : 'Disease Detected'}</span>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* ── Disease name ─────────────────────────────────────── */}
        <div className="flex items-start gap-3">
          <IconLeaf className={`w-6 h-6 mt-0.5 flex-shrink-0 ${isHealthy ? 'text-green-600' : 'text-red-600'}`} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Disease</p>
            <p className={`text-xl sm:text-2xl font-extrabold leading-tight ${isHealthy ? 'text-green-800' : 'text-red-800'}`}>
              {disease}
            </p>
          </div>
        </div>

        {/* ── Confidence ───────────────────────────────────────── */}
        <div className="flex items-start gap-3">
          <IconBug className="w-6 h-6 mt-0.5 flex-shrink-0 text-amber-600" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Confidence</p>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${band.badge}`}>
                {band.label}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {/* Progress bar */}
              <div
                className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Confidence ${pct}%`}
              >
                <div
                  className={`h-full rounded-full animate-grow ${band.bar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-lg font-bold text-gray-800 tabular-nums min-w-[3.5rem] text-right">
                {pct}%
              </span>
            </div>
          </div>
        </div>

        {/* ── Divider ──────────────────────────────────────────── */}
        <hr className="border-gray-100" />

        {/* ── Treatment Recommendation ─────────────────────────── */}
        <div className={`rounded-xl p-4 ${isHealthy ? 'bg-green-50' : 'bg-amber-50'}`}>
          <p className={`text-sm font-bold uppercase tracking-wider mb-3 ${isHealthy ? 'text-green-700' : 'text-amber-700'}`}>
            Treatment Recommendation
          </p>

          {/* Pesticide */}
          <div className="flex items-start gap-3 mb-3">
            <IconShield className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isHealthy ? 'text-green-600' : 'text-amber-600'}`} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Pesticide</p>
              <p className="text-base sm:text-lg font-bold text-gray-900 leading-snug">{pesticide}</p>
            </div>
          </div>

          {/* Dosage */}
          <div className="flex items-start gap-3">
            <IconFlask className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isHealthy ? 'text-green-600' : 'text-amber-600'}`} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Dosage</p>
              <p className="text-base sm:text-lg font-semibold text-gray-800 leading-relaxed">{dosage}</p>
            </div>
          </div>
        </div>

        {/* ── Filename ─────────────────────────────────────────── */}
        <p className="text-xs text-gray-400 truncate text-right" title={filename}>
          {filename}
        </p>
      </div>
    </article>
  )
}
