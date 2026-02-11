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

  // ใน src/App.jsx (Component Home)

return (
  <div className="min-h-screen bg-slate-50/50 pb-10"> {/* เพิ่มสีพื้นหลังจางๆ ให้ดูมีมิติ */}
    
    {/* เปลี่ยน max-w-7xl เป็น max-w-screen-2xl และเพิ่ม padding ด้านข้างอีกนิด (lg:px-12) */}
  <div className="w-full max-w-[96%] mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* 1. Header (แสดงเต็มความกว้างเหมือนเดิม) */}
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

      {/* --- ส่วนที่ปรับปรุงใหม่: แบ่ง Grid ซ้าย-ขวา --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: สถิติ (จะไปอยู่ด้านซ้ายเมื่อจอใหญ่) */}
        {/* ใช้ lg:col-span-4 แปลว่ากินพื้นที่ 4/12 หรือ 1 ใน 3 ของจอ */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="text-lg font-semibold text-slate-700 hidden lg:block px-1">
            ภาพรวมเดือนนี้
          </h3>
          
          {/* ในมือถือ: เลื่อนแนวนอน (overflow-x-auto) */}
          {/* ใน Desktop: เรียงลงมาแนวตั้ง (lg:flex-col) */}
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
            
            {/* เพิ่ม Card พิเศษสำหรับ Desktop เพื่อให้ฝั่งซ้ายดูไม่โล่งเกินไป */}
            <div className="hidden lg:block bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mt-4">
               <h4 className="text-slate-800 font-medium mb-2 flex items-center gap-2">
                 <Calendar className="w-4 h-4 text-blue-500"/> ปฏิทินงาน
               </h4>
               <p className="text-sm text-slate-500">
                 วันนี้ 11 ก.พ. 2026<br/>
                 ไม่มีนัดหมายเร่งด่วน
               </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: เมนูหลัก (จะไปอยู่ด้านขวาเมื่อจอใหญ่) */}
        {/* ใช้ lg:col-span-8 แปลว่ากินพื้นที่ 8/12 หรือ 2 ใน 3 ของจอ */}
        <div className="lg:col-span-8">
           <h3 className="text-lg font-semibold text-slate-700 mb-4 hidden lg:block px-1">
             เมนูใช้งาน
           </h3>
           
           {/* ปรับ Grid ของเมนูให้ใหญ่ขึ้น */}
           <div className="grid gap-5 sm:grid-cols-2">
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
            
            <button className="group h-full min-h-[120px] relative overflow-hidden bg-white/50 rounded-3xl p-6 hover:bg-white transition-all duration-300 border-2 border-dashed border-slate-200 hover:border-blue-300 flex flex-col items-center justify-center gap-3 fade-in-up shadow-sm hover:shadow-md" style={{animationDelay: '400ms'}}>
               <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                  <span className="text-2xl text-slate-400 group-hover:text-blue-500">+</span>
               </div>
               <span className="text-slate-400 font-medium group-hover:text-slate-600">
                 เพิ่มเมนูใหม่
               </span>
            </button>
          </div>

          {/* Tips: ส่วนเสริมสำหรับ Desktop */}
          <div className="mt-8 hidden lg:block p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-4">
             <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <FileText size={20}/>
             </div>
             <div>
                <h4 className="font-medium text-blue-900">เคล็ดลับการใช้งาน</h4>
                <p className="text-sm text-blue-700/80 mt-1">
                  คุณสามารถดูประวัติเอกสารย้อนหลังได้สูงสุด 30 วัน หากต้องการข้อมูลเก่ากว่านั้นให้ติดต่อแผนก IT
                </p>
             </div>
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
          <Route path="/print/:orderId" element={<OrderPrint />} />
          <Route path="/receipt-form" element={<ReceiptForm />} />
          <Route path="/receipt-print/:id" element={<ReceiptPrint />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App