import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { ArrowLeft, Trash2, FileText, Calendar, Printer } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function History() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  // ฟังก์ชันดึงข้อมูลจาก Supabase
  const fetchOrders = async () => {
    try {
      setLoading(true)
      // เลือกข้อมูลทั้งหมด เรียงจากใหม่ไปเก่า
      const { data, error } = await supabase
        .from('doc_contractor_orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // ดึงข้อมูลทันทีที่เปิดหน้านี้
  useEffect(() => {
    fetchOrders()
  }, [])

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="mb-4 flex justify-between items-center">
        <Link to="/" className="text-gray-500 flex items-center gap-1 text-sm hover:text-blue-600">
          <ArrowLeft size={16} /> กลับหน้าหลัก
        </Link>
        <h1 className="font-bold text-lg text-gray-800">ประวัติการส่ง</h1>
      </div>

      {loading ? (
        <div className="text-center p-10 text-gray-400">กำลังโหลดข้อมูล...</div>
      ) : orders.length === 0 ? (
        <div className="text-center p-10 bg-white rounded-xl border border-dashed">
          <p className="text-gray-400">ยังไม่มีเอกสาร</p>
        </div>
      ) : (
        <div className="space-y-3">
         {orders.map((item) => (
  <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition relative group">
    
    {/* ส่วนหัวการ์ด */}
    <div className="flex justify-between items-start mb-2">
      
      {/* ฝั่งซ้าย: ไอคอน + ชื่อ + ค่าจ้าง */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition">
          <FileText size={20} />
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-sm">{item.contractor_name}</h3>
          <p className="text-xs text-gray-500 mt-1">
            ค่าจ้าง: <span className="font-medium text-gray-700">{item.wage_rate.toLocaleString()}</span> บาท 
            <span className="ml-1 text-[10px] bg-gray-100 px-1 rounded text-gray-500">
              ({item.payment_type === 'daily' ? 'รายวัน' : 'เหมา'})
            </span>
          </p>
        </div>
      </div>

      {/* ฝั่งขวา: ปุ่ม Print + สถานะ */}
      <div className="flex flex-col items-end gap-2">
        {/* 👇 ปุ่มไปหน้าพิมพ์เอกสาร (Link) */}
        <Link 
          to={`/print/${item.id}`} 
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
          title="พิมพ์เอกสารนี้"
        >
          <Printer size={18} />
        </Link>

        {/* ป้ายสถานะเซ็นชื่อ */}
        {item.contractor_signature ? (
          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">
            เซ็นแล้ว
          </span>
        ) : (
          <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full border border-yellow-200">
            รอเซ็น
          </span>
        )}
      </div>
    </div>
    
    {/* ส่วนท้ายการ์ด: วันที่ + ผู้คุมงาน */}
    <div className="flex justify-between items-center text-xs text-gray-400 border-t pt-3 mt-2">
      <div className="flex items-center gap-1">
        <Calendar size={14} /> 
        {new Date(item.created_at).toLocaleDateString('th-TH', {
          day: 'numeric', month: 'short', year: '2-digit'
        })}
      </div>
      <div>
        คุมงานโดย: {item.supervisor_name}
      </div>
    </div>

  </div>
))}
        </div>
      )}
    </div>
  )
}