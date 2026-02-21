import { useEffect, useState } from 'react'
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { Printer, ArrowLeft, Check, Edit3 } from 'lucide-react'

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

  // ❌ ลบ useEffect ที่มี window.print() อัตโนมัติออกไปแล้ว ❌

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'ใบรับรองแทนใบเสร็จ',
          text: `เอกสารใบรับรองเลขที่ ${doc.doc_no}`,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert('คัดลอกลิงก์แล้ว! \nกรุณานำไปเปิดใน Chrome หรือ Safari เพื่อสั่งพิมพ์/บันทึก PDF')
      }
    } catch (error) {
      console.log('Error sharing:', error)
    }
  }
  
  if (loading) return <div className="text-center p-10">กำลังโหลด...</div>
  if (!doc) return <div className="text-center p-10">ไม่พบเอกสาร</div>

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
  }

  const paymentDate = doc.transfer_date || (doc.items && doc.items.length > 0 ? doc.items[0].date : null);

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

      {/* --- Preview Area Wrapper แก้ปัญหาเลื่อนซ้ายขวาไม่ได้ --- */}
      <div className="w-full overflow-x-auto pb-4 print:overflow-visible print:pb-0">
        
        {/* เปลี่ยนจาก max-w-[210mm] เป็น w-[210mm] min-w-[210mm] บังคับขนาดไม่ให้หด */}
        <div className="print-container w-[210mm] min-w-[210mm] mx-auto bg-white p-[20mm] shadow-lg print:shadow-none font-sarabun text-[16px] leading-relaxed relative min-h-[297mm]">
          
          {/* Header */}
          <div className="mb-6">
            <div className="text-center text-2xl mb-2">
              ใบรับรองแทนใบเสร็จรับเงิน
            </div>
            <div className="flex justify-end items-center text-lg mt-2">
               <span className="mr-2">เลขที่</span>
               <span className="border-b border-black border-dotted px-4 min-w-[120px] text-center">{doc.doc_no}</span>
            </div>
          </div>

          {/* Table */}
          <table className="w-full border-collapse mb-2">
            <thead>
              <tr className="text-center h-10">
                <th className="border border-black font-normal w-[15%]">วัน เดือน ปี</th>
                <th className="border border-black font-normal w-[50%]">รายละเอียดรายจ่าย</th>
                <th className="border border-black font-normal w-[20%]">จำนวนเงิน</th>
                <th className="border border-black font-normal w-[15%]">เลขโปรเจ็ค</th>
              </tr>
            </thead>
            <tbody>
              {doc.items && doc.items.map((item, index) => (
                <tr key={index} className="align-top h-8">
                  <td className="border border-black text-center px-1">{formatDate(item.date)}</td>
                  <td className="border border-black px-2">{item.detail}</td>
                  <td className="border border-black text-right px-2">{parseFloat(item.amount).toLocaleString()}</td>
                  <td className="border border-black text-center px-1">{item.project_no}</td>
                </tr>
              ))}
              
              {[...Array(Math.max(0, 8 - (doc.items?.length || 0)))].map((_, i) => (
                <tr key={`empty-${i}`} className="h-8">
                  <td className="border border-black"></td><td className="border border-black"></td>
                  <td className="border border-black"></td><td className="border border-black"></td>
                </tr>
              ))}
            </tbody>
            
            <tfoot>
               <tr className="h-10">
                  <td colSpan="2" className="align-middle px-2 py-2">
                     <div className="flex items-center w-full justify-end gap-2 pr-2">
                        <span >รวมทั้งสิ้น (ตัวอักษร)</span>
                        <span className="border-b-2 border-dotted border-black min-w-[60%] text-center">
                          ( {doc.total_text || '-'} )
                        </span>
                     </div>
                  </td>
                  <td className="border border-black text-right px-2 align-middle text-lg">
                     {doc.total_amount?.toLocaleString()}
                  </td>
                  <td className=""></td>
               </tr>
            </tfoot>
          </table>

          {/* เนื้อหาคำรับรอง */}
          <div className="mt-8 space-y-4 px-4">
            <div className="flex flex-wrap items-end gap-2 leading-loose">
               <span>ข้าพเจ้า</span>
               <span className="border-b border-black border-dotted px-4 min-w-[200px] text-center">{doc.payer_name}</span>
               <span>(ผู้เบิกจ่าย)</span>
               
               <span className="ml-4">ตำแหน่ง</span>
               <span className="border-b border-black border-dotted px-4 min-w-[150px] text-center">{doc.position}</span>
            </div>

            <p className="indent-8 leading-loose mt-2">
              ขอรับรองว่า รายจ่ายข้างต้นนี้ไม่อาจเรียกเก็บใบเสร็จรับเงินจากผู้รับได้ และข้าพเจ้าได้จ่ายไปในงานของทางบริษัท/ห้างหุ้นส่วน/ร้าน
              <span className="mx-2">บริษัท ฮารุ ซิสเต็ม ดีเวล็อปเมนต์ (ไทยแลนด์) จำกัด</span> โดยแท้
            </p>
          </div>

          {/* ลายเซ็น */}
          <div className="flex flex-col items-end mt-12 px-8 space-y-8">
             <div className="flex flex-col items-center w-64">
                <div className="h-12 flex items-end justify-center mb-1">
                  {doc.payer_signature && <img src={doc.payer_signature} className="h-10" alt="signature" />}
                </div>
                <div className="border-t border-black border-dotted w-full"></div>
                <div className="mt-1 flex gap-2">
                   <span>ลงชื่อ</span>
                   <span>( {doc.payer_name} )</span>
                </div>
                <div className="text-sm text-black">(ผู้เบิกจ่าย)</div>
             </div>

             {/* ลายเซ็นผู้อนุมัติ */}
<div className="flex flex-col items-center w-64">
   <div className="h-12 flex items-end justify-center mb-1">
      {/* 🟢 แสดงรูปภาพลายเซ็นผู้อนุมัติถ้ามีข้อมูลในฐานข้อมูล */}
      {doc.approver_signature ? (
         <img 
            src={doc.approver_signature} 
            className="h-10 object-contain" 
            alt="approver signature" 
         />
      ) : (
         <div className="h-10" /> // เว้นที่ว่างไว้ถ้ายังไม่มีลายเซ็น
      )}
   </div>
   <div className="border-t border-black border-dotted w-full"></div>
   <div className="mt-1 flex gap-2">
      <span>ลงชื่อ</span>
      {/* 🟢 ถ้ามีชื่อผู้อนุมัติให้แสดงชื่อ ถ้าไม่มีให้แสดงจุดไข่ปลา */}
      <span>( {doc.approver_name || '...................................................'} )</span>
   </div>
   <div className="text-sm text-black">(ผู้อนุมัติ)</div>
</div>
          </div>

          {/* ส่วนการเงินด้านล่าง */}
          <div className="absolute bottom-[20mm] left-[20mm] right-[20mm] border-t border-black pt-4 flex gap-8 text-sm">
             <div className="font-bold">สำหรับบัญชี</div>
             <div>จ่ายเงินผ่าน :</div>
             <div className="flex items-center gap-6">
                
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border border-black flex items-center justify-center">
                    {doc.payment_method === 'cash' && <Check size={18} strokeWidth={3} className="text-black" />}
                  </div> 
                  เงินสด
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border border-black flex items-center justify-center">
                    {doc.payment_method === 'transfer' && <Check size={18} strokeWidth={3} className="text-black" />}
                  </div> 
                  โอนเงิน
                </div>

                <div className="ml-2 flex items-center gap-1">
                   เมื่อวันที่ 
                   <span className="border-b border-black border-dotted min-w-[100px] text-center px-2">
                     {formatDate(paymentDate)}
                   </span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}