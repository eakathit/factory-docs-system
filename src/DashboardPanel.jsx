// src/DashboardPanel.jsx
// แทนที่ StatWidget + ActivityFeed ใน Home.jsx
// ดึงข้อมูลจริงจาก Supabase: จำนวนเอกสาร + 5 รายการล่าสุด

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from './supabaseClient'
import {
  FileText, Receipt, Banknote, ClipboardList,
  FileCheck, ChevronRight, Loader2, RefreshCw,
  TrendingUp, Clock
} from 'lucide-react'

// ---- Config: ประเภทเอกสารทั้งหมด ----
const DOC_CONFIGS = [
  {
    key: 'order',
    table: 'doc_contractor_orders',
    label: 'Technicial Record',
    labelEn: 'Orders',
    icon: FileText,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    ring: 'ring-blue-200',
    gradient: 'from-blue-500 to-indigo-600',
    printPath: (id) => `/print/${id}`,
    titleField: 'contractor_name',
    subtitleFn: (item) => item.payment_type === 'daily' ? 'รายวัน' : 'เหมา',
  },
  {
    key: 'receipt',
    table: 'doc_substitute_receipts',
    label: 'Substitute Receipt',
    labelEn: 'Receipts',
    icon: Receipt,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    ring: 'ring-emerald-200',
    gradient: 'from-emerald-500 to-teal-500',
    printPath: (id) => `/receipt-print/${id}`,
    titleField: 'payer_name',
    subtitleFn: (item) => `เลขที่ ${item.doc_no || '-'}`,
  },
  {
    key: 'voucher',
    table: 'doc_receipt_vouchers',
    label: 'Receipt Voucher',
    labelEn: 'Vouchers',
    icon: Banknote,
    color: 'text-pink-600',
    bg: 'bg-pink-50',
    ring: 'ring-pink-200',
    gradient: 'from-pink-500 to-rose-500',
    printPath: (id) => `/receipt-voucher-print/${id}`,
    titleField: 'receiver_name',
    subtitleFn: () => 'ใบสำคัญรับเงิน',
  },
  {
    key: 'operation',
    table: 'doc_operation_reports',
    label: 'Operation Report',
    labelEn: 'Operations',
    icon: ClipboardList,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    ring: 'ring-violet-200',
    gradient: 'from-violet-500 to-purple-600',
    printPath: () => `/operation-report-print`,
    titleField: 'customer_name',
    subtitleFn: (item) => `Job No: ${item.job_no || '-'}`,
  },
  {
    key: 'completion',
    table: 'doc_completion_reports',
    label: 'Completion Report',
    labelEn: 'Completions',
    icon: FileCheck,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    ring: 'ring-orange-200',
    gradient: 'from-orange-400 to-amber-500',
    printPath: () => `/completion-report-print`,
    titleField: 'project_name',
    subtitleFn: (item) => `Project: ${item.project_no || '-'}`,
  },
]

// ---- ฟังก์ชัน format วันที่ภาษาไทย ----
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('th-TH', {
    day: '2-digit', month: 'short', year: '2-digit'
  })
}

// ---- ฟังก์ชัน relative time ----
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(mins / 60)
  const days = Math.floor(hrs / 24)
  if (mins < 60) return `${mins} นาทีที่แล้ว`
  if (hrs < 24) return `${hrs} ชม. ที่แล้ว`
  if (days === 1) return 'เมื่อวาน'
  return `${days} วันที่แล้ว`
}

// ============================================================
// StatCard — การ์ดจำนวนเอกสารแต่ละประเภท
// ============================================================
const StatCard = ({ config, count, loading }) => {
  const Icon = config.icon
  return (
    <div className={`
      flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300
      bg-white hover:shadow-md hover:-translate-y-0.5 cursor-default
      ring-1 ${config.ring} border-transparent
    `}>
      <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={20} className={config.color} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-400 truncate">{config.label}</p>
        {loading ? (
          <div className="h-5 w-8 bg-slate-100 animate-pulse rounded mt-0.5" />
        ) : (
          <p className="text-xl font-black text-slate-800 leading-none mt-0.5">{count}</p>
        )}
      </div>
    </div>
  )
}

// ============================================================
// RecentDocRow — แถวเอกสารล่าสุด
// ============================================================
const RecentDocRow = ({ doc, config, onRestrictedClick }) => {
  const Icon = config.icon
  return (
    <Link
      to={config.printPath(doc.id)}
      state={doc._state}
      onClick={onRestrictedClick}
      className="flex items-center gap-3 py-3 px-1 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
    >
      {/* Icon */}
      <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={16} className={config.color} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
          {doc._title || 'ไม่ระบุชื่อ'}
        </p>
        <p className="text-xs text-slate-400 truncate">{doc._subtitle}</p>
      </div>

      {/* Time + Arrow */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-xs text-slate-400 hidden sm:block">{timeAgo(doc.created_at)}</span>
        <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  )
}

// ============================================================
// DashboardPanel — Main Component (แทนที่ StatWidget + ActivityFeed)
// ============================================================
const DashboardPanel = ({ onRestrictedClick }) => {
  const [counts, setCounts] = useState({})
  const [recentDocs, setRecentDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      // ดึง count + 5 รายการล่าสุดจากทุกตาราง พร้อมกัน
      const promises = DOC_CONFIGS.map(async (cfg) => {
        const [countRes, recentRes] = await Promise.all([
          supabase.from(cfg.table).select('*', { count: 'exact', head: true }),
          supabase.from(cfg.table).select('*').order('created_at', { ascending: false }).limit(5)
        ])
        return { cfg, count: countRes.count || 0, items: recentRes.data || [] }
      })

      const results = await Promise.all(promises)

      // รวม counts
      const newCounts = {}
      results.forEach(({ cfg, count }) => { newCounts[cfg.key] = count })
      setCounts(newCounts)

      // รวม recent docs แล้วแมป field
      const allRecent = []
      results.forEach(({ cfg, items }) => {
        items.forEach(item => {
          allRecent.push({
            ...item,
            _docType: cfg.key,
            _config: cfg,
            _title: item[cfg.titleField] || 'ไม่ระบุ',
            _subtitle: cfg.subtitleFn(item),
            _state: cfg.key === 'completion' ? {
              date: item.date, projectName: item.project_name,
              projectNo: item.project_no, location: item.location,
              finishTime: item.finish_time, isComplete: item.is_complete, remark: item.remark
            } : cfg.key === 'operation' ? {
              jobNo: item.job_no, issuedDate: item.issued_date,
              customerName: item.customer_name, contactName: item.contact_name,
              problem: item.problem, solution: item.solution,
              startTime: item.start_time, finishTime: item.finish_time,
              operationPerson: item.operation_person, reason: item.reason,
              comment: item.comment, place: item.place, project: item.project,
              expense: item.expense,
              isWarranty: item.service_type?.warranty,
              isUrgent: item.service_type?.urgent,
              isAfterService: item.service_type?.after_service,
              isOther: item.service_type?.other,
            } : null
          })
        })
      })

      // เรียงตาม created_at ล่าสุด แล้วเอา 5 อันแรก
      allRecent.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      setRecentDocs(allRecent.slice(0, 5))
      setLastUpdated(new Date())

    } catch (err) {
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const totalDocs = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div className="flex flex-col gap-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-500" />
            ภาพรวมเอกสาร
          </h3>
          {lastUpdated && (
            <p className="text-xs text-slate-400 mt-0.5">
              อัปเดต {timeAgo(lastUpdated)}
            </p>
          )}
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-90"
          title="รีเฟรช"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 gap-3">
        {DOC_CONFIGS.map(cfg => (
          <StatCard key={cfg.key} config={cfg} count={counts[cfg.key] ?? 0} loading={loading} />
        ))}
      </div>

      {/* ── Total Badge ── */}

      {/* ── Recent 5 Docs ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <Clock size={16} className="text-blue-500" />
            ล่าสุด 5 รายการ
          </h4>
          <Link
            to="/history"
            onClick={onRestrictedClick}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-full transition-colors"
          >
            ดูทั้งหมด
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-xl bg-slate-100" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-slate-100 rounded w-3/4" />
                  <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : recentDocs.length === 0 ? (
          <div className="text-center py-6 text-slate-400">
            <FileText size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">ยังไม่มีเอกสาร</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentDocs.map((doc) => (
              <RecentDocRow
                key={`${doc._docType}-${doc.id}`}
                doc={doc}
                config={doc._config}
                onRestrictedClick={onRestrictedClick}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default DashboardPanel