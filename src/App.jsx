import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { FileText, User, Calendar, Receipt, ChevronRight, LayoutGrid, Clock, LogOut } from 'lucide-react'

// นำเข้าไฟล์หน้าต่างๆ
import ContractorForm from './ContractorForm'
import History from './History'
import OrderPrint from './OrderPrint'
import ReceiptForm from './ReceiptForm'
import ReceiptPrint from './ReceiptPrint'

// --- Component: การ์ดเมนูสวยๆ ---
const MenuCard = ({ to, title, subtitle, icon: Icon, colorClass, iconBgClass }) => (
  <Link to={to} className="group relative bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 btn-press overflow-hidden">
    {/* Background Pattern ตกแต่ง */}
    <div className={`absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 -mr-6 -mt-6 transition-transform group-hover:scale-150 ${iconBgClass}`}></div>
    
    <div className="relative z-10 flex items-start justify-between">
      <div className="flex flex-col gap-3">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${colorClass}`}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
        
        {/* Text */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{title}</h3>
          <p className="text-sm text-slate-400 font-light">{subtitle}</p>
        </div>
      </div>

      {/* Arrow Icon */}
      <div className="text-slate-300 group-hover:text-blue-500 transition-colors">
        <ChevronRight size={24} />
      </div>
    </div>
  </Link>
)

// --- หน้าหลัก (Dashboard) ดีไซน์ใหม่ ---
const Home = ({ user }) => (
  <div className="pb-20">
    {/* Header Section พร้อมพื้นหลัง Gradient */}
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-8 rounded-b-[2.5rem] shadow-xl mb-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-slate-400 text-sm mb-1">ยินดีต้อนรับ,</p>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-white">
              {user?.displayName || 'พนักงาน'}
            </h1>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20">
            <User size={24} className="text-blue-200" />
          </div>
        </div>

        {/* Quick Stats (ตัวอย่างตัวเลข) */}
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
           <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 min-w-[100px] border border-white/10">
              <div className="text-slate-400 text-xs mb-1 flex items-center gap-1"><Clock size={12}/> วันนี้</div>
              <div className="text-xl font-bold">12 <span className="text-xs font-normal opacity-70">รายการ</span></div>
           </div>
           <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 min-w-[100px] border border-white/10">
              <div className="text-slate-400 text-xs mb-1 flex items-center gap-1"><LayoutGrid size={12}/> เดือนนี้</div>
              <div className="text-xl font-bold">45 <span className="text-xs font-normal opacity-70">รายการ</span></div>
           </div>
        </div>
      </div>
    </div>

    {/* Menu Grid */}
    <div className="px-6">
      <h2 className="text-slate-800 font-bold mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-blue-600 rounded-full block"></span>
        เมนูหลัก
      </h2>
      
      <div className="grid gap-4 md:grid-cols-2">
        {/* 1. ใบสั่งจ้าง (สีน้ำเงิน) */}
        <MenuCard 
          to="/contractor-order"
          title="ใบสั่งจ้างผู้รับเหมา"
          subtitle="สร้างเอกสารจ้างงานใหม่"
          icon={FileText}
          colorClass="bg-gradient-to-br from-blue-500 to-blue-600"
          iconBgClass="bg-blue-500"
        />

        {/* 2. ใบรับรองแทนใบเสร็จ (สีเขียว) */}
        <MenuCard 
          to="/receipt-form"
          title="ใบรับรองแทนใบเสร็จ"
          subtitle="เบิกค่าใช้จ่าย (ไม่มีบิล)"
          icon={Receipt}
          colorClass="bg-gradient-to-br from-emerald-500 to-emerald-600"
          iconBgClass="bg-emerald-500"
        />

        {/* 3. ประวัติ (สีส้ม) */}
        <MenuCard 
          to="/history"
          title="ประวัติเอกสาร"
          subtitle="ตรวจสอบสถานะย้อนหลัง"
          icon={Calendar}
          colorClass="bg-gradient-to-br from-orange-400 to-orange-500"
          iconBgClass="bg-orange-400"
        />
      </div>

      <div className="mt-8 text-center text-xs text-slate-400 font-light">
        Haru System Development (Thailand) Co.,Ltd. <br/> v1.0.0
      </div>
    </div>
  </div>
)

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // จำลอง User (เดี๋ยวอนาคตดึงจาก LIFF)
    setUser({ displayName: 'คุณเอกอาทิตย์' })
  }, [])

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/contractor-order" element={<ContractorForm />} />
          <Route path="/history" element={<History />} />
          <Route path="/print/:orderId" element={<OrderPrint />} />
          <Route path="/receipt-form" element={<ReceiptForm />} />
          <Route path="/receipt-print/:id" element={<ReceiptPrint />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App