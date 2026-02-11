// src/App.jsx
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { 
  FileText, 
  Receipt, 
  Calendar, 
  Clock, 
  User, 
  Menu, 
  X, 
  ChevronRight, 
  Banknote, // ไอคอนใหม่: ใบสำคัญรับเงิน
  ClipboardList, // ไอคอนใหม่: Op Report
  FileCheck, // ไอคอนใหม่: Completion Report
  LayoutGrid // ไอคอนใหม่: รวม App
} from 'lucide-react'

// นำเข้าไฟล์หน้าต่างๆ (คงเดิมไว้)
import ContractorForm from './ContractorForm'
import History from './History'
import OrderPrint from './OrderPrint'
import ReceiptForm from './ReceiptForm'
import ReceiptPrint from './ReceiptPrint'
import FactoryPortal from './FactoryPortal'

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
// --- Component: การ์ดเมนูแบบใหม่ ---
const MenuCard = ({ to, title, subtitle, icon: Icon, gradient, delay }) => (
  <Link to={to} className="block group">
    <div 
      className={`h-full bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden fade-in-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-bl-[100px] -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500`} />
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-6 shadow-lg transform group-hover:rotate-6 transition-transform duration-300`}>
            <Icon size={28} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            {subtitle}
          </p>
        </div>
        
        <div className="mt-6 flex items-center text-sm font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">
          <span>เข้าสู่เมนู</span>
          <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  </Link>
)

const Home = ({ user }) => {
  const [greeting, setGreeting] = useState('สวัสดี')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('สวัสดีตอนเช้า ☀️')
    else if (hour < 17) setGreeting('สวัสดีตอนบ่าย 🌤️')
    else setGreeting('สวัสดีตอนเย็น 🌙')
  }, [])

  // ใน src/App.jsx (Component Home)

return (
    <div className="min-h-screen bg-slate-50/50 pb-10">
      
      <div className="w-full max-w-[96%] mx-auto px-4 sm:px-6 lg:px-12">
        
        <header className="pt-8 pb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
              สวัสดี, {user?.email?.split('@')[0] || 'User'} 👋
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
              
              {/* Card เพิ่มเติมสำหรับ Desktop */}
              <div className="hidden lg:block bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mt-4">
                <h4 className="text-slate-800 font-medium mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500"/> ปฏิทินงาน
                </h4>
                <p className="text-sm text-slate-500">
                  วันนี้ 11 ก.พ. 2026<br/>    
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: 6 เมนูหลัก */}
          <div className="lg:col-span-8 xl:col-span-9">
            <h3 className="text-lg font-semibold text-slate-700 mb-4 hidden lg:block px-1">
               เมนูใช้งาน
            </h3>
            
            {/* Grid 3 คอลัมน์ (วาง 6 เมนู = 2 แถวพอดี) */}
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              
              {/* 1. ใบสั่งจ้าง (เดิม) */}
              <MenuCard 
                to="/contractor-order"
                title="ใบสั่งจ้างผู้รับเหมา"
                subtitle="ออกใบสั่งจ้าง / Technicial Record"
                icon={FileText}
                gradient="from-blue-500 to-indigo-600"
                delay="100"
              />

              {/* 2. ใบรับรองแทนใบเสร็จ (เดิม) */}
              <MenuCard 
                to="/receipt-form"
                title="ใบรับรองเเทนใบเสร็จ"
                subtitle="ใบรับรองแทนใบเสร็จรับเงิน"
                icon={Receipt}
                gradient="from-emerald-500 to-teal-500"
                delay="150"
              />

              {/* 3. ใบสำคัญรับเงิน (ใหม่) */}
              <MenuCard 
                to="/payment-voucher"
                title="ใบสำคัญรับเงิน"
                subtitle="ใบสำคัญรับเงิน / Receipt Voucher"
                icon={Banknote}
                gradient="from-pink-500 to-rose-500"
                delay="200"
              />

              {/* 4. Operation Report (ใหม่) */}
              <MenuCard 
                to="/operation-report"
                title="Operation Report"
                subtitle="รายงานการปฏิบัติงานประจำวัน"
                icon={ClipboardList}
                gradient="from-violet-500 to-purple-600"
                delay="250"
              />

              {/* 5. Completion Report (ใหม่) */}
              <MenuCard 
                to="/completion-report"
                title="Completion Report"
                subtitle="รายงานเสร็จสิ้นโครงการ / Completion Report"
                icon={FileCheck}
                gradient="from-orange-400 to-amber-500"
                delay="300"
              />

              {/* history document */}
              <MenuCard 
              to="/history"
              title="ประวัติเอกสาร"
              subtitle="ตรวจสอบ / ย้อนดูรายการเก่า"
              icon={Calendar}
              gradient="from-cyan-500 to-blue-500"
              delay="350"
              />

              {/* 6. รวมแอปพลิเคชัน (ใหม่) */}
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
  const [user, setUser] = useState({ displayName: 'คุณเอกอาทิตย์' }) // จำลองข้อมูล

  return (
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
        </Routes>
      </div>
    </Router>
  )
}

export default App