// src/App.jsx
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { 
  FileText, 
  Receipt, 
  Calendar, 
  Clock, 
  User, 
  // Menu,  <-- ไม่ได้ใช้
  // X,     <-- ไม่ได้ใช้
  ChevronRight, 
  Banknote, 
  ClipboardList, 
  FileCheck, 
  LayoutGrid 
} from 'lucide-react'

// นำเข้าไฟล์หน้าต่างๆ
import ContractorForm from './ContractorForm'
import History from './History'
import OrderPrint from './OrderPrint'
import ReceiptForm from './ReceiptForm'
import ReceiptPrint from './ReceiptPrint'
import FactoryPortal from './FactoryPortal'
import { Toaster } from 'react-hot-toast'
import ReceiptVoucherForm from './ReceiptVoucherForm'
import ReceiptVoucherPrint from './ReceiptVoucherPrint'
import CompletionReportForm from './CompletionReportForm'
import CompletionReportPrint from './CompletionReportPrint'
import OperationReportForm from './OperationReportForm'
import OperationReportPrint from './OperationReportPrint'
// --- Component: Quick Stat Widget (ตัวเลขสรุป) ---
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

// --- Component: การ์ดเมนูแบบใหม่ (อัปเดตให้รองรับ disabled) ---
const MenuCard = ({ to, title, subtitle, icon: Icon, gradient, delay, disabled }) => {
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
      {/* Background Gradient Effect (ซ่อนถ้า disabled) */}
      {!disabled && (
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-bl-[100px] -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500`} />
      )}
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          {/* Icon Box */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg transition-transform duration-300
            ${disabled 
              ? 'bg-slate-400 shadow-none' 
              : `bg-gradient-to-br ${gradient} transform group-hover:rotate-6`
            }
          `}>
            <Icon size={28} />
          </div>

          {/* Title */}
          <h3 className={`text-xl font-bold mb-2 transition-colors
            ${disabled ? 'text-slate-500' : 'text-slate-800 group-hover:text-blue-600'}
          `}>
            {title}
          </h3>

          {/* Subtitle */}
          <p className="text-slate-500 text-sm leading-relaxed">
            {subtitle}
          </p>
        </div>
        
        {/* Footer Link */}
        <div className={`mt-6 flex items-center text-sm font-semibold transition-colors
          ${disabled ? 'text-slate-400' : 'text-slate-400 group-hover:text-blue-600'}
        `}>
          <span>{disabled ? 'เร็วๆ นี้ (Coming Soon)' : 'เข้าสู่เมนู'}</span>
          {!disabled && <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />}
        </div>
      </div>
    </div>
  )

  // ถ้า disabled ให้ return div ธรรมดา ไม่ต้องมี Link
  if (disabled) {
    return <div className="block group select-none">{CardContent}</div>
  }

  // ถ้าปกติ ให้ใช้ Link
  return (
    <Link to={to} className="block group">
      {CardContent}
    </Link>
  )
}

const Home = ({ user }) => {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-10">
      
      <div className="w-full max-w-[96%] mx-auto px-4 sm:px-6 lg:px-12">
        
        <header className="pt-8 pb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
              สวัสดี, {user?.displayName || 'User'} 👋
            </h1>
            <p className="text-slate-500 mt-2 text-base">
              ระบบจัดการเอกสารโรงงาน
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <User size={24} />
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
              
              {/* 1. ใบสั่งจ้าง */}
              <MenuCard 
                to="/contractor-order"
                title="ใบสั่งจ้างผู้รับเหมา"
                subtitle="ออกใบสั่งจ้าง / Technicial Record"
                icon={FileText}
                gradient="from-blue-500 to-indigo-600"
                delay="100"
              />

              {/* 2. ใบรับรองแทนใบเสร็จ */}
              <MenuCard 
                to="/receipt-form"
                title="ใบรับรองเเทนใบเสร็จ"
                subtitle="ใบรับรองแทนใบเสร็จรับเงิน"
                icon={Receipt}
                gradient="from-emerald-500 to-teal-500"
                delay="150"
              />

              {/* 3. ใบสำคัญรับเงิน (Disabled) */}
              <MenuCard 
                to="/ReceiptVoucherForm"
                title="ใบสำคัญรับเงิน"
                subtitle="ใบสำคัญรับเงิน / Receipt Voucher"
                icon={Banknote}
                gradient="from-pink-500 to-rose-500"
                delay="200"
              />

              {/* 4. Operation Report (Disabled) */}
              <MenuCard 
                to="/operation-report"
                title="Operation Report"
                subtitle="รายงานการปฏิบัติงานประจำวัน"
                icon={ClipboardList}
                gradient="from-violet-500 to-purple-600"
                delay="250"
              />

              {/* 5. Completion Report (Disabled) */}
              <MenuCard 
                to="/completion-report"
                title="Completion Report"
                subtitle="รายงานเสร็จสิ้นโครงการ / Completion Report"
                icon={FileCheck}
                gradient="from-orange-400 to-amber-500"
                delay="300"
              />

              {/* 6. ประวัติเอกสาร */}
              <MenuCard 
                to="/history"
                title="ประวัติเอกสาร"
                subtitle="ตรวจสอบ / ย้อนดูรายการเก่า"
                icon={Calendar}
                gradient="from-cyan-500 to-blue-500"
                delay="350"
              />

              {/* 7. รวมแอปพลิเคชัน */}
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

function App() {
  const [user, setUser] = useState({ displayName: '' })

  return (
    <>
    {/* 2. วางตัวแสดงผลไว้ตรงนี้ (บรรทัดบนสุดใน return) */}
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 2000,
          style: { background: '#333', color: '#fff' },
        }} 
      />

    <Router>
      <div className="min-h-screen text-slate-800 selection:bg-blue-100 selection:text-blue-600">
        <Routes>
          <Route path="/" element={<Home user={user} />} />
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