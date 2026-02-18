// src/App.jsx
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { 
  FileText, 
  Receipt, 
  Calendar, 
  Clock, 
  User, 
  X,            // เพิ่ม X สำหรับปุ่มปิด
  ChevronRight, 
  Banknote, 
  ClipboardList, 
  FileCheck, 
  LayoutGrid,
  LogOut,       // เพิ่มไอคอน Logout
  Lock          // เพิ่มไอคอน Lock
} from 'lucide-react'
import { Toaster, toast } from 'react-hot-toast' // Import ทีเดียวจบ

// นำเข้า Client Supabase
import { supabase } from './supabaseClient'

// นำเข้าไฟล์หน้าต่างๆ
import ContractorForm from './ContractorForm'
import History from './History'
import OrderPrint from './OrderPrint'
import ReceiptForm from './ReceiptForm'
import ReceiptPrint from './ReceiptPrint'
import FactoryPortal from './FactoryPortal'
import ReceiptVoucherForm from './ReceiptVoucherForm'
import ReceiptVoucherPrint from './ReceiptVoucherPrint'
import CompletionReportForm from './CompletionReportForm'
import CompletionReportPrint from './CompletionReportPrint'
import OperationReportForm from './OperationReportForm'
import OperationReportPrint from './OperationReportPrint'

// --- Component: Login Modal ---
const LoginModal = ({ isOpen, onClose, onLogin, user, onLogout }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // ตรวจสอบข้อมูลจากตาราง users ใน Supabase
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
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
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
              {user.displayName ? `สถานะ: ${user.role || 'User'}` : 'กรุณากรอกข้อมูลเพื่อยืนยันตัวตน'}
            </p>
          </div>

          {user.displayName ? (
             /* แสดงเมื่อ Login แล้ว */
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                <p className="text-slate-600">สวัสดี, <span className="font-bold text-blue-600">{user.displayName}</span></p>
              </div>
              <button
                onClick={() => {
                  onLogout()
                  onClose()
                }}
                className="w-full py-3 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut size={20} /> ออกจากระบบ
              </button>
            </div>
          ) : (
             /* แสดงฟอร์ม Login */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้ใช้ (Username)</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="เช่น haru, AUM"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">รหัสผ่าน (Password)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// --- Component: Quick Stat Widget ---
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

// --- Component: MenuCard ---
const MenuCard = ({ to, title, subtitle, icon: Icon, gradient, delay, disabled, onClick }) => {
  const CardContent = (
    <div 
      className={`h-full rounded-3xl p-6 border relative overflow-hidden fade-in-up transition-all duration-300
        ${disabled 
          ? 'bg-slate-50 border-slate-200 opacity-70 grayscale cursor-not-allowed' 
          : 'bg-white border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1'
        }
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      {!disabled && (
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-bl-[100px] -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500`} />
      )}
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg transition-transform duration-300
            ${disabled 
              ? 'bg-slate-400 shadow-none' 
              : `bg-gradient-to-br ${gradient} transform group-hover:rotate-6`
            }
          `}>
            <Icon size={28} />
          </div>
          <h3 className={`text-xl font-bold mb-2 transition-colors
            ${disabled ? 'text-slate-500' : 'text-slate-800 group-hover:text-blue-600'}
          `}>
            {title}
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            {subtitle}
          </p>
        </div>
        <div className={`mt-6 flex items-center text-sm font-semibold transition-colors
          ${disabled ? 'text-slate-400' : 'text-slate-400 group-hover:text-blue-600'}
        `}>
          <span>{disabled ? 'เร็วๆ นี้ (Coming Soon)' : 'เข้าสู่เมนู'}</span>
          {!disabled && <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />}
        </div>
      </div>
    </div>
  )

  if (disabled) {
    return <div className="block group select-none">{CardContent}</div>
  }

  return (
    <Link to={to} className="block group" onClick={onClick}>
      {CardContent}
    </Link>
  )
}

// --- Component: Home ---
const Home = ({ user, onUserClick }) => {

  const handleRestrictedClick = (e) => {
    if (!user?.displayName) { // เช็คว่ามีชื่อผู้ใช้หรือไม่ (ถ้าไม่มี = ยังไม่ Login)
      e.preventDefault()      // ห้ามเปลี่ยนหน้า
      toast.error('กรุณาเข้าสู่ระบบก่อนใช้งานเมนูนี้', {
        icon: '🔒',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      })
      // onUserClick() // (ทางเลือก) ถ้าต้องการให้เด้งหน้า Login ทันทีให้เอา comment ออก
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-10">
      
      <div className="w-full max-w-[96%] mx-auto px-4 sm:px-6 lg:px-12">
        
        <header className="pt-8 pb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
              สวัสดี, {user?.displayName || 'Guest'} 👋
            </h1>
            <p className="text-slate-500 mt-2 text-base">
              ระบบจัดการเอกสารโรงงาน {user?.role && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full ml-2">{user.role}</span>}
            </p>
          </div>
          
          {/* ปุ่ม User Profile คลิกเพื่อ Login */}
          <div 
            onClick={onUserClick}
            className="group cursor-pointer relative"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-105
              ${user?.displayName 
                ? 'bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-blue-500/30' 
                : 'bg-slate-300 hover:bg-slate-400'
              }
            `}>
              <User size={24} />
            </div>
            {/* Tooltip */}
            <div className="absolute top-full right-0 mt-2 px-3 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {user?.displayName ? 'จัดการบัญชี' : 'คลิกเพื่อเข้าสู่ระบบ'}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Stats */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            <h3 className="text-lg font-semibold text-slate-700 hidden lg:block px-1">
              ภาพรวมเดือนนี้
            </h3>
            
            <div className="flex gap-4 overflow-x-auto pb-4 lg:pb-0 lg:overflow-visible lg:flex-col lg:gap-5">
              <StatWidget 
                icon={FileText} 
                label="ใบสั่งจ้าง" 
                value="12" 
                color="bg-blue-500" 
              />
              <StatWidget 
                icon={Receipt} 
                label="ใบรับรองฯ" 
                value="20" 
                color="bg-emerald-500" 
              />
              <StatWidget 
                icon={Clock} 
                label="รออนุมัติ" 
                value="3" 
                color="bg-orange-500" 
              />
              
              <div className="hidden lg:block bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mt-4">
                <h4 className="text-slate-800 font-medium mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500"/> ปฏิทินงาน
                </h4>
                <p className="text-sm text-slate-500">
                  วันนี้ {new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}<br/>    
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: 6 เมนูหลัก */}
          <div className="lg:col-span-8 xl:col-span-9">
            <h3 className="text-lg font-semibold text-slate-700 mb-4 hidden lg:block px-1">
               เมนูใช้งาน
            </h3>
            
            {/* Grid 3 คอลัมน์ */}
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              
              <MenuCard 
                to="/contractor-order"
                title="ใบสั่งจ้างผู้รับเหมา"
                subtitle="ออกใบสั่งจ้าง / Technicial Record"
                icon={FileText}
                gradient="from-blue-500 to-indigo-600"
                delay="100"
              />

              <MenuCard 
                to="/receipt-form"
                title="ใบรับรองเเทนใบเสร็จ"
                subtitle="ใบรับรองแทนใบเสร็จรับเงิน"
                icon={Receipt}
                gradient="from-emerald-500 to-teal-500"
                delay="150"
              />

              <MenuCard 
                to="/ReceiptVoucherForm"
                title="ใบสำคัญรับเงิน"
                subtitle="ใบสำคัญรับเงิน / Receipt Voucher"
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
                subtitle="รายงานเสร็จสิ้นโครงการ / Completion Report"
                icon={FileCheck}
                gradient="from-orange-400 to-amber-500"
                delay="300"
              />

              <MenuCard 
                to="/history"
                title="ประวัติเอกสาร"
                subtitle="ตรวจสอบ / ย้อนดูรายการเก่า"
                icon={Calendar}
                gradient="from-cyan-500 to-blue-500"
                delay="350"
                onClick={handleRestrictedClick}
              />

              <MenuCard 
                to="/factory-portal"
                title="รวมเว็บแอปฯ (Portal)"
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

// --- Main App Component ---
function App() {
  const [user, setUser] = useState({ displayName: '', role: '' })
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  const handleLogin = (userData) => {
    setUser(userData)
    setIsLoginModalOpen(false)
  }

  const handleLogout = () => {
    setUser({ displayName: '', role: '' })
    toast.success('ออกจากระบบเรียบร้อยแล้ว')
  }

  return (
    <>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: { background: '#1e293b', color: '#fff', borderRadius: '12px' },
        }} 
      />

      {/* เรียกใช้ Login Modal */}
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
            <Route path="/" element={
              <Home 
                user={user} 
                onUserClick={() => setIsLoginModalOpen(true)} 
              />
            } />
            <Route path="/contractor-order" element={<ContractorForm />} />
            <Route path="/history" element={<History />} />
            <Route path="/factory-portal" element={<FactoryPortal />} />
            <Route path="/print/:orderId" element={<OrderPrint />} />
            <Route path="/receipt-form" element={<ReceiptForm />} />
            <Route path="/receipt-print/:id" element={<ReceiptPrint />} />
            <Route path="/receipt-voucher" element={<ReceiptVoucherForm />} />
            <Route path="/ReceiptVoucherForm" element={<ReceiptVoucherForm />} />
            <Route path="/receipt-voucher-print/:id" element={<ReceiptVoucherPrint />} />
            <Route path="/completion-report" element={<CompletionReportForm />} />
            <Route path="/completion-report-print" element={<CompletionReportPrint />} />
            <Route path="/operation-report" element={<OperationReportForm />} />
            <Route path="/operation-report-print" element={<OperationReportPrint />} />
          </Routes>
        </div>
      </Router>
    </>
  )
}

export default App