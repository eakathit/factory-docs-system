// src/Home.jsx (REDESIGNED)
// Mobile-first: เมนูอยู่บนสุด, Dashboard ด้านล่าง
// Desktop: Dashboard ซ้าย sticky, เมนูขวา
// ใช้แทน Home component ใน App.jsx

import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from './supabaseClient'
import {
  FileText, Receipt, Banknote, ClipboardList, FileCheck,
  LayoutGrid, Calendar, ChevronRight, User, Lock,
  RefreshCw, Clock, TrendingUp, Loader2, X
} from 'lucide-react'
import { toast } from 'react-hot-toast'

// ─────────────────────────────────────────────
// AlertModal (เหมือนเดิม)
// ─────────────────────────────────────────────
const AlertModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-14 h-14 bg-red-100 text-red-500 rounded-full mx-auto flex items-center justify-center mb-4">
          <Lock size={28} />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">จำกัดสิทธิ์การเข้าถึง</h3>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          เมนูนี้สำหรับผู้ใช้งานที่ลงทะเบียนเท่านั้น
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors text-sm">ยกเลิก</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors text-sm">เข้าสู่ระบบ</button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// เมนูทั้งหมด
// ─────────────────────────────────────────────
const MENUS = [
  { to: '/contractor-order',   title: 'ใบสั่งจ้าง',          titleEn: 'Contractor Order',    icon: FileText,     gradient: 'from-blue-500 to-indigo-600',    restricted: false },
  { to: '/receipt-form',       title: 'ใบรับรองแทนใบเสร็จ',  titleEn: 'Substitute Receipt',  icon: Receipt,      gradient: 'from-emerald-500 to-teal-500',   restricted: false },
  { to: '/ReceiptVoucherForm', title: 'ใบสำคัญรับเงิน',      titleEn: 'Receipt Voucher',     icon: Banknote,     gradient: 'from-pink-500 to-rose-500',      restricted: false },
  { to: '/operation-report',   title: 'Operation Report',    titleEn: 'Daily Operation',     icon: ClipboardList,gradient: 'from-violet-500 to-purple-600',   restricted: false },
  { to: '/completion-report',  title: 'Completion Report',   titleEn: 'Project Completion',  icon: FileCheck,    gradient: 'from-orange-400 to-amber-500',   restricted: false },
  { to: '/history',            title: 'ประวัติเอกสาร',        titleEn: 'Document History',    icon: Calendar,     gradient: 'from-cyan-500 to-blue-500',      restricted: true  },
  { to: '/factory-portal',     title: 'รวมเว็บแอปฯ',          titleEn: 'App Portal',          icon: LayoutGrid,   gradient: 'from-slate-600 to-slate-800',    restricted: false },
]

// ─────────────────────────────────────────────
// Dashboard configs
// ─────────────────────────────────────────────
const DOC_CONFIGS = [
  { key: 'order',      table: 'doc_contractor_orders',   label: 'ใบสั่งจ้าง',          icon: FileText,      color: '#3b82f6', printPath: (id) => `/print/${id}`,                  titleField: 'contractor_name', subtitleFn: i => i.payment_type === 'daily' ? 'รายวัน' : 'เหมา' },
  { key: 'receipt',    table: 'doc_substitute_receipts', label: 'ใบรับรองฯ',           icon: Receipt,       color: '#10b981', printPath: (id) => `/receipt-print/${id}`,           titleField: 'payer_name',      subtitleFn: i => `เลขที่ ${i.doc_no || '-'}` },
  { key: 'voucher',    table: 'doc_receipt_vouchers',    label: 'ใบสำคัญรับเงิน',     icon: Banknote,      color: '#ec4899', printPath: (id) => `/receipt-voucher-print/${id}`,   titleField: 'receiver_name',   subtitleFn: () => 'ใบสำคัญรับเงิน' },
  { key: 'operation',  table: 'doc_operation_reports',   label: 'Operation',           icon: ClipboardList, color: '#8b5cf6', printPath: () => `/operation-report-print`,           titleField: 'customer_name',   subtitleFn: i => `Job: ${i.job_no || '-'}` },
  { key: 'completion', table: 'doc_completion_reports',  label: 'Completion',          icon: FileCheck,     color: '#f97316', printPath: () => `/completion-report-print`,          titleField: 'project_name',    subtitleFn: i => `Project: ${i.project_no || '-'}` },
]

const timeAgo = (d) => {
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff / 60000), h = Math.floor(m / 60), day = Math.floor(h / 24)
  if (m < 60) return `${m}น.`
  if (h < 24) return `${h}ชม.`
  if (day === 1) return 'เมื่อวาน'
  return `${day}ว.`
}

// ─────────────────────────────────────────────
// MenuGrid — กริดเมนูหลัก (Mobile-first)
// ─────────────────────────────────────────────
const MenuGrid = ({ user, onRestrictedClick }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
    {MENUS.map((menu, i) => {
      const Icon = menu.icon
      const isRestricted = menu.restricted && !user?.displayName

      return (
        <Link
          key={menu.to}
          to={menu.to}
          onClick={isRestricted ? (e) => { e.preventDefault(); onRestrictedClick() } : undefined}
          className="group relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          {/* gradient accent top-right */}
          <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${menu.gradient} opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-300`} />

          <div className="relative p-4 flex flex-col gap-3">
            {/* Icon */}
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${menu.gradient} flex items-center justify-center text-white shadow-md group-hover:rotate-3 transition-transform duration-300`}>
              <Icon size={20} />
            </div>

            {/* Text */}
            <div>
              <p className="text-[13px] font-bold text-slate-800 leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
                {menu.title}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium tracking-wide">
                {menu.titleEn}
              </p>
            </div>

            {/* Arrow */}
            <ChevronRight
              size={14}
              className="absolute bottom-3 right-3 text-slate-200 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all"
            />
          </div>
        </Link>
      )
    })}
  </div>
)

// ─────────────────────────────────────────────
// DashboardPanel — ดึงข้อมูลจริงจาก Supabase
// ─────────────────────────────────────────────
const DashboardPanel = () => {
  const [counts, setCounts] = useState({})
  const [recentDocs, setRecentDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchData = async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true)
    try {
      const results = await Promise.all(
        DOC_CONFIGS.map(async (cfg) => {
          const [countRes, recentRes] = await Promise.all([
            supabase.from(cfg.table).select('*', { count: 'exact', head: true }),
            supabase.from(cfg.table).select('*').order('created_at', { ascending: false }).limit(5)
          ])
          return { cfg, count: countRes.count || 0, items: recentRes.data || [] }
        })
      )
      const newCounts = {}
      const allRecent = []
      results.forEach(({ cfg, count, items }) => {
        newCounts[cfg.key] = count
        items.forEach(item => allRecent.push({
          ...item, _cfg: cfg,
          _title: item[cfg.titleField] || 'ไม่ระบุ',
          _subtitle: cfg.subtitleFn(item),
        }))
      })
      setCounts(newCounts)
      allRecent.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      setRecentDocs(allRecent.slice(0, 5))
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp size={15} className="text-blue-500" /> ภาพรวม
          </h3>
          {lastUpdated && <p className="text-[10px] text-slate-400 mt-0.5">อัปเดต {timeAgo(lastUpdated)}</p>}
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="p-1.5 rounded-lg text-slate-300 hover:text-blue-500 hover:bg-blue-50 transition-all active:scale-90"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stat Pills */}
      <div className="grid grid-cols-1 gap-2">
        {DOC_CONFIGS.map(cfg => {
          const Icon = cfg.icon
          const count = counts[cfg.key] ?? 0
          return (
            <div key={cfg.key} className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-slate-100 shadow-sm">
              <Icon size={16} style={{ color: cfg.color }} className="flex-shrink-0" />
              <span className="text-[13px] text-slate-600 font-medium flex-1">{cfg.label}</span>
              {loading
                ? <div className="w-6 h-4 bg-slate-100 animate-pulse rounded" />
                : <span className="text-base font-black text-slate-800">{count}</span>
              }
            </div>
          )
        })}
        {/* Total */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800 rounded-xl mt-1">
          <span className="text-xs font-semibold text-slate-400">ทั้งหมด</span>
          {loading
            ? <div className="w-8 h-5 bg-slate-700 animate-pulse rounded" />
            : <span className="text-xl font-black text-white">{total.toLocaleString()}</span>
          }
        </div>
      </div>

      {/* Recent 5 Docs */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
          <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Clock size={13} className="text-blue-400" /> ล่าสุด 5 รายการ
          </h4>
          <Link to="/history" className="text-[11px] text-blue-600 font-bold hover:underline">ดูทั้งหมด →</Link>
        </div>

        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex-shrink-0" />
                <div className="flex-1 space-y-1.5 pt-0.5">
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                  <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : recentDocs.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">ยังไม่มีเอกสาร</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentDocs.map((doc, i) => {
              const Icon = doc._cfg.icon
              return (
                <Link
                  key={`${doc._cfg.key}-${doc.id}-${i}`}
                  to={doc._cfg.printPath(doc.id)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: doc._cfg.color + '18' }}>
                    <Icon size={15} style={{ color: doc._cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">{doc._title}</p>
                    <p className="text-[11px] text-slate-400 truncate">{doc._subtitle}</p>
                  </div>
                  <span className="text-[10px] text-slate-300 flex-shrink-0">{timeAgo(doc.created_at)}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}

// ─────────────────────────────────────────────
// Home — Main component (Mobile-first redesign)
// ─────────────────────────────────────────────
const Home = ({ user, onUserClick }) => {
  const [showWarning, setShowWarning] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      <AlertModal
        isOpen={showWarning}
        onClose={() => setShowWarning(false)}
        onConfirm={() => { setShowWarning(false); onUserClick() }}
      />

      {/* ── Top Header bar ── */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Logo / Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              <FileText size={14} className="text-white" />
            </div>
            <div>
              <span className="text-sm font-black text-slate-800 tracking-tight">DocSystem</span>
              <span className="hidden sm:inline text-xs text-slate-400 ml-2 font-medium">โรงงาน</span>
            </div>
          </div>

          {/* User Avatar */}
          <button
            onClick={onUserClick}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${user?.displayName ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-slate-300'}`}>
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <User size={13} />}
            </div>
            <span className="text-xs font-semibold text-slate-600 group-hover:text-blue-700 transition-colors max-w-[80px] truncate">
              {user?.displayName || 'Guest'}
            </span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ════════════════════════════════════════
            MOBILE LAYOUT  (< lg)
            เมนูก่อน → Dashboard ด้านล่าง
            ════════════════════════════════════════ */}
        <div className="lg:hidden flex flex-col gap-6">

          {/* Greeting strip */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-slate-800">
                สวัสดี, {user?.displayName || 'Guest'} 👋
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">ระบบเอกสารโรงงาน</p>
            </div>
            {user?.role && (
              <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                {user.role}
              </span>
            )}
          </div>

          {/* ★ เมนูก่อนเลย ★ */}
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">เมนูหลัก</p>
            <MenuGrid user={user} onRestrictedClick={() => setShowWarning(true)} />
          </div>

          {/* Dashboard ด้านล่าง (scroll ลงมา) */}
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">ภาพรวมระบบ</p>
            <DashboardPanel />
          </div>

        </div>

        {/* ════════════════════════════════════════
            DESKTOP LAYOUT  (>= lg)
            Dashboard sticky ซ้าย | เมนูขวา
            ════════════════════════════════════════ */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-8 items-start">

          {/* LEFT: Dashboard (sticky) */}
          <div className="lg:col-span-4 xl:col-span-3 sticky top-20">
            {/* Greeting */}
            <div className="mb-6">
              <h1 className="text-2xl font-black text-slate-800 leading-tight">
                สวัสดี,<br />
                <span className="text-blue-600">{user?.displayName || 'Guest'}</span> 👋
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                ระบบจัดการเอกสารโรงงาน
                {user?.role && <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">{user.role}</span>}
              </p>
            </div>
            <DashboardPanel />
          </div>

          {/* RIGHT: Menus */}
          <div className="lg:col-span-8 xl:col-span-9">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">เมนูหลัก</p>
            <MenuGrid user={user} onRestrictedClick={() => setShowWarning(true)} />
          </div>

        </div>
      </div>
    </div>
  )
}

export default Home