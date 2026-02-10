// src/App.jsx
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { 
  FileText, User, Calendar, Receipt, ChevronRight, 
  LayoutGrid, Clock, Sparkles, TrendingUp 
} from 'lucide-react'

// นำเข้าไฟล์หน้าต่างๆ (คงเดิมไว้)
import ContractorForm from './ContractorForm'
import History from './History'
import OrderPrint from './OrderPrint'
import ReceiptForm from './ReceiptForm'
import ReceiptPrint from './ReceiptPrint'

// --- Component: Quick Stat Widget (ตัวเลขสรุป) ---
const StatWidget = ({ icon: Icon, label, value, trend, color }) => (
  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-slate-100 flex-1 min-w-[140px]">
    <div className="flex items-start justify-between mb-2">
      <div className={`p-2 rounded-xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
        <Icon size={18} />
      </div>
      {trend && (
        <span className="text-xs font-medium text-emerald-600 flex items-center bg-emerald-50 px-2 py-0.5 rounded-full">
          +{trend}% <TrendingUp size={10} className="ml-1" />
        </span>
      )}
    </div>
    <div className="text-2xl font-bold text-slate-800">{value}</div>
    <div className="text-xs text-slate-500 font-medium">{label}</div>
  </div>
)

// --- Component: การ์ดเมนูแบบใหม่ ---
const MenuCard = ({ to, title, subtitle, icon: Icon, gradient, delay }) => (
  <Link 
    to={to} 
    className="group relative overflow-hidden bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-blue-200/50 transition-all duration-300 transform hover:-translate-y-1 border border-slate-50 fade-in-up"
    style={{ animationDelay: `${delay}ms` }}
  >
    {/* พื้นหลัง Gradient จางๆ เวลา Hover */}
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br ${gradient}`}></div>
    
    <div className="relative z-10 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Icon Box */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br ${gradient} group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={28} strokeWidth={2} />
        </div>
        
        {/* Text */}
        <div className="flex flex-col">
          <h3 className="text-lg font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-slate-400 group-hover:text-slate-500 font-light">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Arrow */}
      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
        <ChevronRight size={18} />
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

  return (
    <div className="pb-10 max-w-lg mx-auto md:max-w-4xl">
      {/* Header Profile Section */}
      <header className="pt-8 pb-6 px-6 flex justify-between items-end">
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1 flex items-center gap-1">
             {greeting}
          </p>
          <h1 className="text-3xl font-bold text-slate-800">
            {user?.displayName || 'คุณเอกอาทิตย์'}
          </h1>
          <p className="text-xs text-blue-500 font-medium mt-1 bg-blue-50 inline-block px-2 py-0.5 rounded-md">
            Developer & Admin
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 p-[2px] shadow-lg shadow-blue-200">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
             <User className="text-slate-400" size={24} />
             {/* <img src="URL_รูปโปรไฟล์" alt="Profile" className="w-full h-full object-cover" /> */}
          </div>
        </div>
      </header>

      {/* Stats Area */}
      <section className="px-6 mb-8 flex gap-4 overflow-x-auto pb-4 no-scrollbar fade-in-up">
        <StatWidget 
          icon={FileText} 
          label="ใบสั่งจ้างเดือนนี้" 
          value="12" 
          trend="8.5"
          color="bg-blue-500" 
        />
        <StatWidget 
          icon={Receipt} 
          label="ยอดเบิกจ่ายรวม" 
          value="฿45k" 
          color="bg-emerald-500" 
        />
        <StatWidget 
          icon={Clock} 
          label="รออนุมัติ" 
          value="3" 
          color="bg-orange-500" 
        />
      </section>

      {/* Main Menu */}
      <section className="px-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
            <LayoutGrid size={20} className="text-blue-500" />
            เมนูการจัดการ
          </h2>
          <span className="text-xs text-slate-400">เข้าถึงด่วน</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <MenuCard 
            to="/contractor-order"
            title="สั่งจ้างผู้รับเหมา"
            subtitle="ออกใบสั่งจ้าง / Technicial Record"
            icon={FileText}
            gradient="from-blue-500 to-indigo-600"
            delay="100"
          />

          <MenuCard 
            to="/receipt-form"
            title="เบิกค่าใช้จ่าย"
            subtitle="ใบรับรองแทนใบเสร็จ (ไม่มีบิล)"
            icon={Receipt}
            gradient="from-emerald-500 to-teal-500"
            delay="200"
          />

          <MenuCard 
            to="/history"
            title="ประวัติเอกสาร"
            subtitle="ดูรายการย้อนหลัง / สถานะ"
            icon={Calendar}
            gradient="from-orange-400 to-pink-500"
            delay="300"
          />
          
          {/* ปุ่มเสริม (ถ้ามี) */}
          <button className="group relative overflow-hidden bg-slate-100 rounded-3xl p-6 shadow-inner hover:bg-slate-200 transition-colors duration-300 border border-dashed border-slate-300 flex items-center justify-center gap-2 fade-in-up" style={{animationDelay: '400ms'}}>
             <span className="text-slate-400 font-medium group-hover:text-slate-600">
               + เพิ่มเมนูใหม่เร็วๆ นี้
             </span>
          </button>
        </div>
      </section>

      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm text-xs text-slate-400">
          HARU SYSTEM DEVELOPMENT (THAILAND) CO.,LTD.
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
          <Route path="/print/:orderId" element={<OrderPrint />} />
          <Route path="/receipt-form" element={<ReceiptForm />} />
          <Route path="/receipt-print/:id" element={<ReceiptPrint />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App