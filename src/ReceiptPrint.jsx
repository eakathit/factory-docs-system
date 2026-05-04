import { useEffect, useState } from 'react'
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { Printer, ArrowLeft, Edit3 } from 'lucide-react'
import ReceiptDocumentView from './ReceiptDocumentView'

export default function ReceiptPrint() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  
  const [doc, setDoc] = useState(location.state || null)
  const [loading, setLoading] = useState(!location.state)

  useEffect(() => {
    if (!doc) {
      const fetchDoc = async () => {
        const { data, error } = await supabase
          .from('doc_substitute_receipts')
          .select('*')
          .eq('id', id)
          .single()
        
        if (data) setDoc(data)
        setLoading(false)
      }
      fetchDoc()
    }
  }, [id, doc])

  if (loading) return <div className="text-center p-10">กำลังโหลด...</div>
  if (!doc) return <div className="text-center p-10">ไม่พบเอกสาร</div>

  return (
    // ปรับ padding ให้ดูโปร่งขึ้น
    <div className="min-h-screen bg-gray-100 py-6 sm:py-8 print:p-0 print:bg-white print:min-h-0 print:overflow-hidden font-sarabun text-black flex flex-col items-center">
      <style>
{`
  @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
  .font-sarabun { font-family: 'Sarabun', sans-serif; }
  
  @page { 
    size: A4 portrait; 
    margin: 0; 
  }
  
  @media print { 
    body, html {
      width: 210mm;
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden; 
    }
    .no-print { display: none !important; }
    .print-container {
        width: 210mm !important;
        height: 296mm !important; 
        padding: 20mm !important;
        margin: 0 !important;
        background-color: white !important;
        position: relative;
        page-break-after: avoid; 
    }
  }
`}
      </style>

      {/* --- Toolbar --- */}
      <div className="w-full max-w-[210mm] mx-auto mb-6 print:hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4">
          <Link 
            to="/history" 
            className="inline-flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 rounded-lg transition-all font-medium text-sm sm:text-base"
          >
            <ArrowLeft size={18} /> 
            <span>กลับหน้าประวัติ</span>
          </Link>

          <div className="grid grid-cols-2 sm:flex gap-3 w-full sm:w-auto">
            <button 
              onClick={() => navigate('/receipt-form', { state: doc })}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-all font-medium text-sm"
            >
              <Edit3 size={18} /> 
              <span>แก้ไขข้อมูล</span>
            </button>
            <button 
              onClick={() => window.print()} 
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all text-sm"
            >
              <Printer size={18} /> 
              <span>สั่งพิมพ์</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- Preview Area --- */}
      <div className="w-full overflow-x-auto pb-4 print:overflow-visible print:pb-0">
        <ReceiptDocumentView doc={doc} />
      </div>
    </div>
  )
}