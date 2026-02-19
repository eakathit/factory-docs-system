import { useEffect, useState } from 'react'
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { Printer, ArrowLeft, Share2, Edit3 } from 'lucide-react'
import ReceiptVoucherPreview from './ReceiptVoucherPreview' 

export default function ReceiptVoucherPrint() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  
  // ใช้ข้อมูลจาก state ถ้าส่งมาจากหน้าฟอร์ม (จะได้ไม่ต้องโหลด DB ใหม่)
  const [doc, setDoc] = useState(location.state || null)
  const [loading, setLoading] = useState(!location.state)

  useEffect(() => {
    // ถ้าไม่มี doc (เช่น เข้าผ่านลิงก์ตรงๆ จาก History) ค่อยให้ดึงข้อมูล
    if (!doc) {
      const fetchDoc = async () => {
        try {
          const { data, error } = await supabase
            .from('doc_receipt_vouchers')
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
    }
  }, [id, doc])

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-500">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      กำลังโหลดข้อมูล...
    </div>
  )

  if (!doc) return (
    <div className="flex flex-col items-center justify-center min-h-screen text-slate-500">
      <p className="text-lg">ไม่พบเอกสาร</p>
      <Link to="/history" className="text-blue-600 hover:underline mt-2">กลับหน้าประวัติ</Link>
    </div>
  )

  return (
    // 1. เพิ่ม print:min-h-0 print:h-auto print:block แก้หน้าว่างแผ่นที่ 2
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-6 sm:py-8 print:p-0 print:bg-white print:block print:min-h-0 print:h-auto">
      
      {/* --- Toolbar --- */}
      <div className="w-full max-w-[210mm] flex flex-col sm:flex-row justify-between items-center mb-6 px-4 print:hidden gap-4">
        
        {/* ปุ่มกลับไปแก้ไข */}
        <button 
          onClick={() => navigate('/receipt-voucher', { state: doc })}
          className="flex items-center justify-center w-full sm:w-auto gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-all font-medium"
        >
          <Edit3 size={18} /> กลับไปแก้ไข
        </button>

        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={handleShare}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-all"
          >
            <Share2 size={18} /> <span>แชร์</span>
          </button>
          <button 
            onClick={() => window.print()} 
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-all"
          >
            <Printer size={18} /> สั่งพิมพ์
          </button>
        </div>
      </div>

      {/* --- Preview Area Wrapper (แก้การบีบหน้าจอในมือถือ) --- */}
      <div className="w-full overflow-x-auto pb-4 print:overflow-visible print:pb-0 flex justify-center">
        {/* Component ReceiptVoucherPreview.jsx ถูกล็อคขนาด w-[210mm] ไว้แล้วในตัวมันเอง */}
        <div className="shadow-2xl print:shadow-none bg-white">
          <ReceiptVoucherPreview data={doc} />
        </div>
      </div>

      {/* CSS สำหรับแก้หน้าว่างแผ่นที่ 2 */}
      <style type="text/css">
        {`
          @media print {
            @page { size: A4; margin: 0; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            html, body { height: auto !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; }
          }
        `}
      </style>

    </div>
  )
}