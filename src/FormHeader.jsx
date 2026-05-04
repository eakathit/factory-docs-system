import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, FileText, Home, Eye } from 'lucide-react'

export default function FormHeader({
  title,
  isEditing = false,
  activeTab,
  setActiveTab,
  accent = 'blue',
}) {
  const accentClass = {
    blue: 'hover:text-blue-600',
    emerald: 'hover:text-emerald-600',
    rose: 'hover:text-rose-600',
    violet: 'hover:text-violet-600',
    orange: 'hover:text-orange-600',
  }[accent] || 'hover:text-blue-600'

  const tabClass = (tab) =>
    `flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition-all ${
      activeTab === tab
        ? 'bg-white text-stone-900 shadow-sm ring-1 ring-stone-200/60'
        : 'text-stone-400 hover:text-stone-600'
    }`

  return (
    <nav className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/90 backdrop-blur-xl">
      <div className="w-full px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <Link
            to="/"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-stone-400 transition-all hover:bg-stone-100 hover:text-stone-700"
            aria-label="กลับหน้าแรก"
          >
            <ChevronLeft size={18} />
          </Link>

          <div className="hidden h-6 w-px bg-stone-200 sm:block" />

          <div className="flex min-w-0 items-center gap-1.5 text-[13px] sm:text-sm font-medium">
            <Link
              to="/"
              className={`hidden shrink-0 items-center gap-1 text-stone-400 transition-colors sm:flex ${accentClass}`}
            >
              <Home size={14} />
              <span>หน้าแรก</span>
            </Link>
            <ChevronRight size={12} className="hidden shrink-0 text-stone-300 sm:block" />
            <span className="truncate font-bold text-stone-900">
              {title} {isEditing && <span className="font-semibold text-stone-400">(แก้ไข)</span>}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 rounded-full bg-stone-100/90 p-1">
          <button type="button" onClick={() => setActiveTab('form')} className={tabClass('form')}>
            <FileText size={13} />
            <span className="hidden min-[430px]:inline">กรอกข้อมูล</span>
          </button>
          <button type="button" onClick={() => setActiveTab('preview')} className={tabClass('preview')}>
            <Eye size={13} />
            <span className="hidden min-[430px]:inline">ดูตัวอย่าง</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
