import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { ArrowLeft, FileText, Calendar, Printer, Receipt } from 'lucide-react' // เพิ่มไอคอน Receipt
import { Link } from 'react-router-dom'

export default function History() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      
      // 1. ดึงใบสั่งจ้าง
      const { data: orders, error: errorOrders } = await supabase
        .from('doc_contractor_orders')
        .select('*')
      
      // 2. ดึงใบรับรองแทนใบเสร็จ
      const { data: receipts, error: errorReceipts } = await supabase
        .from('doc_substitute_receipts')
        .select('*')

      if (errorOrders || errorReceipts) throw new Error('Error fetching data')

      // 3. แปลงร่างข้อมูลให้มีหน้าตาเหมือนกัน (Standardize) เพื่อเอามาแสดงผลรวมกัน
      const formattedOrders = (orders || []).map(item => ({
        id: item.id,
        type: 'order', // ระบุประเภท
        title: `จ้างเหมา: ${item.contractor_name}`,
        subtitle: `ค่าจ้าง: ${item.wage_rate?.toLocaleString()} บาท`,
        date: item.created_at,
        status: item.contractor_signature ? 'เซ็นแล้ว' : 'รอเซ็น',
        link: `/print/${item.id}` // ลิงก์ไปหน้า Print (ของใครของมัน)
      }))

      const formattedReceipts = (receipts || []).map(item => ({
        id: item.id,
        type: 'receipt', // ระบุประเภท
        title: `ใบรับรอง: ${item.payer_name}`,
        subtitle: `ยอดรวม: ${item.total_amount?.toLocaleString()} บาท`,
        date: item.created_at,
        status: item.payer_signature ? 'อนุมัติแล้ว' : 'รอนุมัติ',
        link: `/receipt-print/${item.id}` // ⚠️ เดี๋ยวเราต้องไปสร้างหน้านี้เพิ่ม
      }))

      // 4. เอามารวมกันแล้วเรียงตามวันที่ (ใหม่สุดขึ้นก่อน)
      const allDocs = [...formattedOrders, ...formattedReceipts].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      )

      setDocuments(allDocs)

    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="mb-4 flex justify-between items-center">
        <Link to="/" className="text-gray-500 flex items-center gap-1 text-sm hover:text-blue-600">
          <ArrowLeft size={16} /> กลับหน้าหลัก
        </Link>
        <h1 className="font-bold text-lg text-gray-800">ประวัติเอกสารทั้งหมด</h1>
      </div>

      {loading ? (
        <div className="text-center p-10 text-gray-400">กำลังโหลดข้อมูล...</div>
      ) : documents.length === 0 ? (
        <div className="text-center p-10 bg-white rounded-xl border border-dashed">
          <p className="text-gray-400">ไม่พบประวัติเอกสาร</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={`${doc.type}-${doc.id}`} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition relative group">
              
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  {/* แยกสีไอคอนตามประเภทเอกสาร */}
                  <div className={`p-3 rounded-lg transition ${
                    doc.type === 'order' 
                      ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' 
                      : 'bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white'
                  }`}>
                    {doc.type === 'order' ? <FileText size={20} /> : <Receipt size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">{doc.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{doc.subtitle}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {/* ปุ่ม Print */}
                  {doc.type === 'order' ? (
                     <Link to={doc.link} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition">
                       <Printer size={18} />
                     </Link>
                  ) : (
                     // ถ้าเป็นใบรับรอง เดี๋ยวเราค่อยมาทำปุ่ม Print ทีหลัง
                    <Link to={doc.link} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition">
                      <Printer size={18} />
                  </Link>
                  )}

                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                    doc.status.includes('แล้ว') 
                      ? 'bg-green-100 text-green-700 border-green-200' 
                      : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                  }`}>
                    {doc.status}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-xs text-gray-400 border-t pt-3 mt-2">
                <div className="flex items-center gap-1">
                  <Calendar size={14} /> 
                  {new Date(doc.date).toLocaleDateString('th-TH', {
                    day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute:'2-digit'
                  })}
                </div>
                <div className="uppercase text-[10px] tracking-wide font-semibold text-gray-300">
                  {doc.type === 'order' ? 'ใบสั่งจ้าง' : 'ใบรับรอง'}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}