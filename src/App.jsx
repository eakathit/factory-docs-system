import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { FileText, User, Calendar, Receipt } from 'lucide-react' // เพิ่มไอคอน Receipt

// นำเข้าไฟล์หน้าต่างๆ
import ContractorForm from './ContractorForm'
import History from './History'
import OrderPrint from './OrderPrint'
import ReceiptForm from './ReceiptForm' // <--- 1. นำเข้าไฟล์ใหม่ที่เพิ่งสร้าง
import ReceiptPrint from './ReceiptPrint'

// หน้าหลัก (Dashboard)
const Home = () => (
  <div className="p-4 space-y-4 max-w-lg mx-auto">
    <div className="flex justify-between items-center mb-2">
      <h2 className="text-xl font-bold text-gray-800">เลือกเมนูทำรายการ</h2>
    </div>

    <div className="grid gap-4">
      {/* 1. ปุ่มใบสั่งจ้างผู้รับเหมา (สีฟ้า) */}
      <Link to="/contractor-order" className="block p-5 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition group">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-600 group-hover:text-white transition">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-800">ใบสั่งจ้างผู้รับเหมา</h3>
            <p className="text-sm text-gray-500">สร้างเอกสารจ้างงานใหม่</p>
          </div>
        </div>
      </Link>
      
      {/* 2. ปุ่มใบรับรองแทนใบเสร็จ (สีเขียว - เพิ่มใหม่) */}
      <Link to="/receipt-form" className="block p-5 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-green-500 hover:shadow-md transition group">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-full group-hover:bg-green-600 group-hover:text-white transition">
            <Receipt size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-800">ใบรับรองแทนใบเสร็จ</h3>
            <p className="text-sm text-gray-500">เบิกค่าใช้จ่าย (ไม่มีบิล)</p>
          </div>
        </div>
      </Link>

      {/* 3. ปุ่มดูประวัติ (สีส้ม) */}
      <Link to="/history" className="block p-5 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-orange-500 hover:shadow-md transition group">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-full group-hover:bg-orange-600 group-hover:text-white transition">
            <Calendar size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-800">ประวัติเอกสาร</h3>
            <p className="text-sm text-gray-500">ดูรายการย้อนหลังทั้งหมด</p>
          </div>
        </div>
      </Link>
    </div>
  </div>
)

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // จำลอง User (ในอนาคตอาจจะดึงจาก LIFF)
    setUser({ displayName: 'Dev Mode' })
  }, [])

  if (!user) return <div className="p-10 text-center text-gray-500">กำลังโหลดระบบ...</div>

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-10">
        {/* Navbar */}
        <nav className="bg-white px-4 py-3 shadow-sm border-b sticky top-0 z-10 flex justify-between items-center print:hidden">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <FileText size={20} />
            </div>
            <h1 className="font-bold text-lg text-gray-800">Factory Docs</h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
            <User size={14} />
            {user.displayName}
          </div>
        </nav>

        {/* Content Area */}
        <div className="mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            
            {/* Route เดิม */}
            <Route path="/contractor-order" element={<ContractorForm />} />
            <Route path="/history" element={<History />} />
            <Route path="/print/:orderId" element={<OrderPrint />} />
            <Route path="/receipt-form" element={<ReceiptForm />} />
            <Route path="/receipt-print/:id" element={<ReceiptPrint />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App