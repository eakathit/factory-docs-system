import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { Printer, ArrowLeft, Share2 } from 'lucide-react'
import ReceiptVoucherPreview from './ReceiptVoucherPreview' // เรียกใช้ Preview ตัวเดิม

export default function ReceiptVoucherPrint() {
  const { id } = useParams() // รับ ID จาก URL
  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(true)

  // 1. ดึงข้อมูลจาก Database
  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const { data, error } = await supabase
          .from('doc_receipt_vouchers') // ชื่อตารางใน Supabase
          .select('*')
          .eq('id', id)
          .single()
        
        if (error) throw error
        if (data) setDoc(data)
      } catch (err) {
        console.error("Error fetching voucher:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchDoc()
  }, [id])

  // 2. Auto-Print เมื่อโหลดเสร็จ
  useEffect(() => {
    if (doc) {
      const timer = setTimeout(() => {
        window.print()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [doc])

  const handleShare = async () => {
    if (navigator.share) {
      navigator.share({
        title: 'ใบสำคัญรับเงิน',
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('คัดลอกลิงก์เรียบร้อย!')
    }
  }
  
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen text-slate-400">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      กำลังโหลดใบสำคัญรับเงิน...
    </div>
  )

  if (!doc) return (
    <div className="flex flex-col items-center justify-center min-h-screen text-slate-500">
      <p className="text-lg">ไม่พบเอกสาร</p>
      <Link to="/history" className="text-blue-600 hover:underline mt-2">กลับหน้าประวัติ</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 print:p-0 print:bg-white print:block">
      
      {/* --- Toolbar (ซ่อนตอนพิมพ์) --- */}
      <div className="w-full max-w-[210mm] flex justify-between items-center mb-6 px-4 print:hidden">
        <Link to="/history" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
          <ArrowLeft size={20} /> กลับ
        </Link>
        <div className="flex gap-3">
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-all"
          >
            <Share2 size={18} /> <span className="hidden sm:inline">แชร์</span>
          </button>
          <button 
            onClick={() => window.print()} 
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all"
          >
            <Printer size={20} /> พิมพ์เอกสาร
          </button>
        </div>
      </div>

      {/* --- Preview Area --- */}
      <div className="shadow-2xl print:shadow-none">
        {/* เรียกใช้ Component Preview ที่คุณทำไว้แล้ว ส่ง data เข้าไป */}
        <ReceiptVoucherPreview data={doc} />
      </div>

    </div>
  )
}