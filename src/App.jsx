// src/App.jsx
import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { 
  FileText, 
  Receipt, 
  Calendar, 
  Clock, 
  User, 
  X,
  ChevronRight, 
  Banknote, 
  ClipboardList, 
  FileCheck, 
  LayoutGrid,
  LogOut,
  Lock,
  AlertCircle // <--- เพิ่มไอคอนนี้เข้ามา
} from 'lucide-react'
import { Toaster, toast } from 'react-hot-toast'
import { supabase } from './supabaseClient'

// นำเข้าไฟล์หน้าต่างๆ
import ContractorForm from './ContractorForm'
import History from './History'
import ReceiptForm from './ReceiptForm'
import ReceiptPrint from './ReceiptPrint'
import FactoryPortal from './FactoryPortal'
import ReceiptVoucherForm from './ReceiptVoucherForm'
import ReceiptVoucherPrint from './ReceiptVoucherPrint'
import CompletionReportForm from './CompletionReportForm'
import CompletionReportPrint from './CompletionReportPrint'
import OperationReportForm from './OperationReportForm'
import OperationReportPrint from './OperationReportPrint'
import DashboardPanel from './DashboardPanel'
import ContractorPrint from './ContractorPrint'
import ApprovalPage from './ApprovalPage'

const LOGIN_STORAGE_KEY = 'factory-docs-login-user'

const getStoredUser = () => {
  try {
    const rawUser = window.localStorage.getItem(LOGIN_STORAGE_KEY)
    if (!rawUser) return { displayName: '', role: '' }

    const parsedUser = JSON.parse(rawUser)
    if (!parsedUser?.displayName) return { displayName: '', role: '' }

    return {
      displayName: parsedUser.displayName,
      role: parsedUser.role || '',
    }
  } catch (error) {
    console.warn('Unable to restore saved login user', error)
    return { displayName: '', role: '' }
  }
}

const saveStoredUser = (userData) => {
  window.localStorage.setItem(LOGIN_STORAGE_KEY, JSON.stringify(userData))
}

const clearStoredUser = () => {
  window.localStorage.removeItem(LOGIN_STORAGE_KEY)
}

// --- 1. Component ใหม่: AlertModal (แจ้งเตือนตรงกลางจอ) ---
const AlertModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center transform transition-all scale-100">
        
        {/* Icon */}
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full mx-auto flex items-center justify-center mb-4">
          <Lock size={32} />
        </div>

        {/* Text */}
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          จำกัดสิทธิ์การเข้าถึง
        </h3>
        <p className="text-slate-500 mb-6 leading-relaxed">
          เมนูนี้สำหรับผู้ใช้งานที่ลงทะเบียนเท่านั้น <br/>
          กรุณาเข้าสู่ระบบก่อนใช้งาน
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-colors"
          >
            เข้าสู่ระบบ
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Component: Login Modal (เหมือนเดิม) ---
const LoginModal = ({ isOpen, onClose, onLogin, user, onLogout }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single()

      if (error || !data) {
        toast.error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
      } else {
        toast.success(`ยินดีต้อนรับคุณ ${data.username}`)
        onLogin({ displayName: data.username, role: data.role })
        onClose()
        setUsername('')
        setPassword('')
      }
    } catch (err) {
      console.error(err)
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
          <X size={24} />
        </button>
        <div className="p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4">
              {user.displayName ? <User size={32} /> : <Lock size={32} />}
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              {user.displayName ? 'ข้อมูลผู้ใช้งาน' : 'เข้าสู่ระบบ'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {user.displayName ? `Role: ${user.role || 'User'}` : 'กรุณากรอกข้อมูลเพื่อยืนยันตัวตน'}
            </p>
          </div>

          {user.displayName ? (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                <p className="text-slate-600">user, <span className="font-bold text-blue-600">{user.displayName}</span></p>
              </div>
              <button onClick={() => { onLogout(); onClose(); }} className="w-full py-3 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
                <LogOut size={20} /> ออกจากระบบ
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้ใช้ (Username)</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">รหัสผ่าน (Password)</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="" required />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all disabled:opacity-70">
                {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

const ActivityFeed = () => {
  // Mock Data: ข้อมูลสมมติ (ในอนาคตดึงจาก Supabase)
  const activities = [
    { id: 1, action: 'สร้างใบสั่งจ้าง', docId: 'PO-6702001', user: 'Haru', time: '10 นาทีที่แล้ว', type: 'create' },
    { id: 2, action: 'อนุมัติใบรับรอง', docId: 'RC-6702015', user: 'Admin AUM', time: '1 ชม. ที่แล้ว', type: 'approve' },
    { id: 3, action: 'ส่งรายงาน', docId: 'OP-6702088', user: 'Technician B', time: 'เมื่อวาน', type: 'submit' },
    { id: 4, action: 'แก้ไขเอกสาร', docId: 'PO-6701099', user: 'Haru', time: 'เมื่อวาน', type: 'edit' },
  ]

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mt-6 fade-in-up" style={{ animationDelay: '100ms' }}>
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-slate-800 font-bold text-lg flex items-center gap-2">
          <Clock size={20} className="text-blue-500" /> 
          ความเคลื่อนไหวล่าสุด
        </h4>
        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full cursor-pointer hover:bg-blue-100">ดูทั้งหมด</span>
      </div>
      
      <div className="space-y-4">
        {activities.map((item) => (
          <div key={item.id} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
            {/* Icon แยกตามประเภท action */}
            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 
              ${item.type === 'approve' ? 'bg-green-500' : 
                item.type === 'create' ? 'bg-blue-500' : 'bg-slate-300'
              }`} 
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">
                {item.action} <span className="text-slate-500 font-normal">#{item.docId}</span>
              </p>
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-slate-400">โดย {item.user}</p>
                <p className="text-xs text-slate-400">{item.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Component: การ์ดสถานะ/ประกาศ (System Status) ---
const SystemStatus = () => {
  return (
    <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-6 rounded-2xl shadow-lg shadow-indigo-500/20 mt-6 text-white fade-in-up" style={{ animationDelay: '200ms' }}>
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
          <ClipboardList size={24} className="text-white" />
        </div>
        <div>
          <h4 className="font-bold text-lg mb-1">ประกาศจากระบบ</h4>
          <p className="text-indigo-100 text-sm leading-relaxed mb-3">
            กรุณาส่งเอกสารเบิกงวดสุดท้ายภายในวันที่ 25 ของเดือนนี้ เพื่อให้ทันรอบบัญชี
          </p>
          <div className="flex items-center gap-2 text-xs font-medium bg-white/10 w-fit px-3 py-1.5 rounded-lg">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            ระบบทำงานปกติ
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Stats Widget ---
const StatWidget = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-w-[200px] flex-1 fade-in-up hover:shadow-md transition-shadow">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-white`}>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium mb-1">{label}</p>
        <h4 className="text-2xl font-bold text-slate-800">{value}</h4>
      </div>
    </div>
  </div>
)

// --- MenuCard ---
const MenuCard = ({ to, title, subtitle, icon: Icon, gradient, delay, disabled, onClick }) => {
  const CardContent = (
    <div className={`h-full rounded-3xl p-6 border relative overflow-hidden fade-in-up transition-all duration-300 ${disabled ? 'bg-slate-50 border-slate-200 opacity-70 grayscale cursor-not-allowed' : 'bg-white border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1'}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg transition-transform duration-300 ${disabled ? 'bg-slate-400 shadow-none' : `bg-gradient-to-br ${gradient} transform group-hover:rotate-6`}`}>
            <Icon size={28} />
          </div>
          <h3 className={`text-xl font-bold mb-2 transition-colors ${disabled ? 'text-slate-500' : 'text-slate-800 group-hover:text-blue-600'}`}>{title}</h3>
          <p className="text-slate-500 text-sm leading-relaxed">{subtitle}</p>
        </div>
        <div className={`mt-6 flex items-center text-sm font-semibold transition-colors ${disabled ? 'text-slate-400' : 'text-slate-400 group-hover:text-blue-600'}`}>
          <span>{disabled ? 'เร็วๆ นี้ (Coming Soon)' : 'เปิดเอกสาร'}</span>
          {!disabled && <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />}
        </div>
      </div>
    </div>
  )
  if (disabled) return <div className="block group select-none">{CardContent}</div>
  return <Link to={to} className="block group" onClick={onClick}>{CardContent}</Link>
}

// --- Home Component (แก้ไขเพิ่ม Warning Modal) ---
// --- Component: Home (ซ่อน Activity Feed ในมือถือ) ---
const Home = ({ user, onUserClick }) => {
  const [showWarning, setShowWarning] = useState(false)

  const handleRestrictedClick = (e) => {
    if (!user?.displayName) {
      e.preventDefault() 
      setShowWarning(true) 
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-10">
      
      <AlertModal 
        isOpen={showWarning}
        onClose={() => setShowWarning(false)}
        onConfirm={() => {
          setShowWarning(false)
          onUserClick()
        }}
      />

      <div className="w-full max-w-[96%] mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* --- Header --- */}
        <header className="relative pt-8 pb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
              HARU Document System
            </h1>
            <p className="text-slate-500 mt-2 text-base">
              เลือกประเภทเอกสารที่ต้องการดำเนินการ
            </p>
          </div>

          <div onClick={onUserClick} className="group cursor-pointer absolute right-0 top-7">
            <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md
              ${user?.displayName
                ? 'border-blue-100 bg-white text-blue-600 shadow-blue-100/70'
                : 'border-slate-200 bg-white text-slate-400 hover:text-blue-500 hover:border-blue-100'
              }
            `}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-300 ${user?.displayName ? 'bg-blue-50' : 'bg-slate-50 group-hover:bg-blue-50'}`}>
                <User size={19} strokeWidth={2.2} />
              </div>
            </div>
            <div className="absolute top-full right-0 mt-2 px-3 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {user?.displayName ? 'จัดการบัญชี' : 'คลิกเพื่อเข้าสู่ระบบ'}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* --- LEFT COLUMN --- */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
  <DashboardPanel onRestrictedClick={handleRestrictedClick} />
</div>

          {/* --- RIGHT COLUMN: Main Menu --- */}
          <div className="lg:col-span-8 xl:col-span-9">
            <h3 className="text-lg font-semibold text-slate-700 mb-4 hidden lg:block px-1">
               เมนูใช้งาน
            </h3>
            
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <MenuCard 
                to="/contractor-order"
                title="Technicial Record"
                subtitle="ใบสั่งจ้างผู้รับเหมา"
                icon={FileText}
                gradient="from-blue-500 to-indigo-600"
                delay="100"
              />

              <MenuCard 
                to="/receipt-form"
                title="Substitute Receipt"
                subtitle="ใบรับรองแทนใบเสร็จรับเงิน"
                icon={Receipt}
                gradient="from-emerald-500 to-teal-500"
                delay="150"
              />

              <MenuCard 
                to="/ReceiptVoucherForm"
                title="Receipt Voucher"
                subtitle="ใบสำคัญรับเงิน"
                icon={Banknote}
                gradient="from-pink-500 to-rose-500"
                delay="200"
              />

              <MenuCard 
                to="/operation-report"
                title="Operation Report"
                subtitle="รายงานการปฏิบัติงานประจำวัน"
                icon={ClipboardList}
                gradient="from-violet-500 to-purple-600"
                delay="250"
              />

              <MenuCard 
                to="/completion-report"
                title="Completion Report"
                subtitle="รายงานเสร็จสิ้นโครงการ"
                icon={FileCheck}
                gradient="from-orange-400 to-amber-500"
                delay="300"
              />

              <MenuCard 
                to="/history"
                title="History"
                subtitle="ตรวจสอบ / ย้อนดูรายการเก่า"
                icon={Calendar}
                gradient="from-cyan-500 to-blue-500"
                delay="350"
                onClick={handleRestrictedClick} 
              />

              <MenuCard 
                to="/factory-portal"
                title="Portal Application"
                subtitle="ทางเข้าสู่ระบบอื่นๆ ของบริษัท"
                icon={LayoutGrid}
                gradient="from-slate-600 to-slate-800"
                delay="350"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function App() {
  const [user, setUser] = useState(getStoredUser)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  const handleLogin = (userData) => {
    saveStoredUser(userData)
    setUser(userData)
    setIsLoginModalOpen(false)
  }

  const handleLogout = () => {
    clearStoredUser()
    setUser({ displayName: '', role: '' })
    toast.success('ออกจากระบบเรียบร้อยแล้ว')
  }

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 3000, style: { background: '#1e293b', color: '#fff', borderRadius: '12px' }, }} />
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
        onLogout={handleLogout}
        user={user}
      />

      <Router>
        <div className="min-h-screen text-slate-800 selection:bg-blue-100 selection:text-blue-600">
          <Routes>
            <Route path="/" element={<Home user={user} onUserClick={() => setIsLoginModalOpen(true)} />} />
            <Route path="/contractor-order" element={<ContractorForm />} />
            <Route path="/contractor-print" element={<ContractorPrint />} />
            <Route path="/history" element={<History />} />
            <Route path="/factory-portal" element={<FactoryPortal />} />
            <Route path="/receipt-form" element={<ReceiptForm />} />
            <Route path="/receipt-print/:id" element={<ReceiptPrint />} />
            <Route path="/receipt-voucher" element={<ReceiptVoucherForm />} />
            <Route path="/ReceiptVoucherForm" element={<ReceiptVoucherForm />} />
            <Route path="/receipt-voucher-print/:id" element={<ReceiptVoucherPrint />} />
            <Route path="/completion-report" element={<CompletionReportForm />} />
            <Route path="/completion-report-print" element={<CompletionReportPrint />} />
            <Route path="/operation-report" element={<OperationReportForm />} />
            <Route path="/operation-report-print" element={<OperationReportPrint />} />
            <Route path="/approve/:docType/:docId" element={<ApprovalPage />} />
          </Routes>
        </div>
      </Router>
    </>
  )
}

export default App
