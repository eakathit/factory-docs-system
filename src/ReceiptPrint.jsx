import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { Printer, ArrowLeft } from 'lucide-react'

export default function ReceiptPrint() {
  const { id } = useParams()
  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
  }, [id])

  if (loading) return <div className="text-center p-10">กำลังโหลด...</div>
  if (!doc) return <div className="text-center p-10">ไม่พบเอกสาร</div>

  // ฟังก์ชันแปลงวันที่
  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 print:p-0 print:bg-white font-sans text-black">
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
          .font-sarabun { font-family: 'Sarabun', sans-serif; }
          
          @page { size: A4; margin: 0; }
          @media print { 
            body { margin: 0; padding: 0; }
            .no-print { display: none !important; }
            .print-container {
                width: 100% !important; 
                height: 100vh;
                padding: 20mm !important;
                margin: 0 !important;
            }
          }
        `}
      </style>

      {/* ปุ่มควบคุม */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center no-print">
        <Link to="/history" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
          <ArrowLeft size={20} /> กลับ
        </Link>
        <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-2 rounded shadow flex gap-2 hover:bg-blue-700 font-bold">
          <Printer size={20} /> พิมพ์ใบรับรอง
        </button>
      </div>

      {/* กระดาษ A4 */}
      <div className="print-container max-w-[210mm] mx-auto bg-white p-[20mm] shadow-lg print:shadow-none font-sarabun text-[14px] leading-relaxed relative min-h-[297mm]">
        
        {/* Header */}
        <div className="text-center font-bold text-xl mb-8">
          ใบรับรองแทนใบเสร็จรับเงิน
        </div>
        
        <div className="absolute top-[20mm] right-[20mm]">
           เลขที่ <span className="border-b border-black border-dotted px-2">{doc.doc_no}</span>
        </div>

        {/* Table */}
        <table className="w-full border-collapse border border-black mb-4">
          <thead>
            <tr className="text-center h-10">
              <th className="border border-black w-[15%]">วัน เดือน ปี</th>
              <th className="border border-black w-[50%]">รายละเอียดรายจ่าย</th>
              <th className="border border-black w-[20%]">จำนวนเงิน</th>
              <th className="border border-black w-[15%]">เลขโปรเจ็ค</th>
            </tr>
          </thead>
          <tbody>
            {/* รายการจาก Database */}
            {doc.items && doc.items.map((item, index) => (
              <tr key={index} className="align-top h-8">
                <td className="border border-black text-center px-1">{formatDate(item.date)}</td>
                <td className="border border-black px-2">{item.detail}</td>
                <td className="border border-black text-right px-2">{parseFloat(item.amount).toLocaleString()}</td>
                <td className="border border-black text-center px-1">{item.project_no}</td>
              </tr>
            ))}
            
            {/* เติมบรรทัดว่างให้เต็ม (ถ้าต้องการ) */}
            {[...Array(Math.max(0, 8 - (doc.items?.length || 0)))].map((_, i) => (
              <tr key={`empty-${i}`} className="h-8">
                <td className="border border-black"></td><td className="border border-black"></td>
                <td className="border border-black"></td><td className="border border-black"></td>
              </tr>
            ))}

            {/* ยอดรวม */}
            <tr className="h-10 font-bold bg-gray-50">
               <td className="border border-black text-center">รวมทั้งสิ้น</td>
               <td className="border border-black text-center px-2">
                 ( {doc.total_text || '-'} )
               </td>
               <td className="border border-black text-right px-2">{doc.total_amount?.toLocaleString()}</td>
               <td className="border border-black bg-gray-200"></td>
            </tr>
          </tbody>
        </table>

        {/* เนื้อหาคำรับรอง */}
        <div className="mt-6 space-y-4 px-4">
          <div className="flex gap-2">
            <span className="w-20">ข้าพเจ้า</span>
            <span className="border-b border-black border-dotted flex-grow text-center font-bold">{doc.payer_name}</span>
            <span className="w-24 text-right">(ผู้เบิกจ่าย)</span>
          </div>
          
          <div className="flex gap-2">
            <span className="w-20">ตำแหน่ง</span>
            <span className="border-b border-black border-dotted flex-grow text-center">{doc.position}</span>
            <span className="w-24"></span>
          </div>

          <p className="indent-8 leading-loose mt-4">
            ขอรับรองว่า รายจ่ายข้างต้นนี้ไม่อาจเรียกเก็บใบเสร็จรับเงินจากผู้รับได้ และข้าพเจ้าได้จ่ายไปในงานของทาง 
            <span className="font-bold mx-2">บริษัท ฮารุ ซิสเต็ม ดีเวลลอปเม้นท์ (ประเทศไทย) จำกัด</span> โดยแท้
          </p>
        </div>

        {/* ลายเซ็น */}
        <div className="flex justify-around mt-12 text-center">
           {/* ผู้เบิก */}
           <div className="flex flex-col items-center">
              <div className="h-16 flex items-end justify-center mb-2">
                {doc.payer_signature && <img src={doc.payer_signature} className="h-14" alt="signature" />}
              </div>
              <div className="border-t border-black border-dotted w-48 mt-1"></div>
              <div className="mt-1">( {doc.payer_name} )</div>
              <div className="text-sm">ผู้เบิกจ่าย</div>
           </div>

           {/* ผู้อนุมัติ */}
           <div className="flex flex-col items-center">
              <div className="h-16 flex items-end justify-center mb-2">
                 {/* เว้นว่างรอเซ็นสด */}
              </div>
              <div className="border-t border-black border-dotted w-48 mt-1"></div>
              <div className="mt-1">(...................................................)</div>
              <div className="text-sm">ผู้อนุมัติ</div>
           </div>
        </div>

        {/* ส่วนการเงินด้านล่าง */}
        <div className="mt-12 border-t border-black pt-4 flex gap-8 text-sm">
           <div className="font-bold">สำหรับบัญชี</div>
           <div>จ่ายเงินผ่าน :</div>
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 border border-black flex items-center justify-center ${doc.payment_method === 'cash' ? 'bg-black text-white' : ''}`}>
                  {doc.payment_method === 'cash' && '✓'}
                </div> 
                เงินสด
              </div>
              
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 border border-black flex items-center justify-center ${doc.payment_method === 'transfer' ? 'bg-black text-white' : ''}`}>
                  {doc.payment_method === 'transfer' && '✓'}
                </div> 
                โอนเงิน
                {doc.payment_method === 'transfer' && doc.transfer_date && (
                   <span className="ml-2">
                     เมื่อวันที่ <span className="underline decoration-dotted">{formatDate(doc.transfer_date)}</span>
                   </span>
                )}
              </div>
           </div>
        </div>

      </div>
    </div>
  )
}