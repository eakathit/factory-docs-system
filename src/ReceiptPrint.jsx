import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { Printer, ArrowLeft, Check } from 'lucide-react'

export default function ReceiptPrint() {
  const { id } = useParams()
  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(true)

  // 1. ดึงข้อมูล
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

  // ✅ 2. เพิ่ม Auto-Print: สั่งพิมพ์อัตโนมัติเมื่อข้อมูลพร้อม
  useEffect(() => {
    if (doc) {
      const timer = setTimeout(() => {
        window.print()
      }, 1000) // รอ 1 วินาที ให้โหลดข้อมูล/รูปเซ็นเสร็จ
      return () => clearTimeout(timer)
    }
  }, [doc])

  const handleShare = async () => {
    try {
      if (navigator.share) {
        // ใช้ระบบ Share ของมือถือ (Android/iOS)
        await navigator.share({
          title: 'ใบรับรองแทนใบเสร็จ',
          text: `เอกสารใบรับรองเลขที่ ${doc.doc_no}`,
          url: window.location.href,
        })
      } else {
        // ถ้า Share ไม่ได้ ให้ Copy Link แทน
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

  // logic เลือกวันที่ที่จะแสดง
  const paymentDate = doc.transfer_date || (doc.items && doc.items.length > 0 ? doc.items[0].date : null);

  return (
    <div className="min-h-screen bg-gray-100 p-4 print:p-0 print:bg-white font-sans text-black">
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
          .font-sarabun { font-family: 'Sarabun', sans-serif; }

          @page { 
            size: A4 portrait; 
            margin: 0; 
          }
          
          @media print { 
            /* 1. สั่งซ่อนทุกอย่างใน Body ก่อน */
            body * {
              visibility: hidden;
            }

            /* 2. ดึงเฉพาะส่วนที่จะพิมพ์กลับมาแสดง */
            .print-container, .print-container * {
              visibility: visible;
            }

            /* 3. จัดตำแหน่งแบบ Absolute/Fixed เพื่อหลุดจาก Flow เดิม */
            .print-container {
                position: absolute;
                left: 0;
                top: 0;
                width: 210mm !important;
                
                /* 🔴 ลดความสูงลงเหลือ 270mm (เผื่อที่ 2.7cm สำหรับ Header/Footer ของมือถือ) */
                height: 270mm !important; 
                
                padding: 15mm 20mm !important; /* ปรับ Padding ให้เหมาะสม */
                margin: 0 !important;
                background-color: white !important;
                
                /* ตัดส่วนเกินทิ้งทันที */
                overflow: hidden !important; 
            }
            
            /* ซ่อน UI อื่นๆ */
            .no-print { display: none !important; }
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

      {/* กระดาษ A4 (Layout เดิมของคุณ) */}
      <div className="print-container max-w-[210mm] mx-auto bg-white p-[20mm] shadow-lg print:shadow-none font-sarabun text-[16px] leading-relaxed relative min-h-[297mm]">
        
        {/* Header */}
        <div className="mb-6">
          <div className="text-center font-bold text-2xl mb-2">
            ใบรับรองแทนใบเสร็จรับเงิน
          </div>
          <div className="flex justify-end items-center text-lg font-bold mt-2">
             <span className="mr-2">เลขที่</span>
             <span className="border-b border-black border-dotted px-4 min-w-[120px] text-center">{doc.doc_no}</span>
          </div>
        </div>

        {/* Table */}
        <table className="w-full border-collapse mb-2">
          <thead>
            <tr className="text-center h-10">
              <th className="border border-black w-[15%]">วัน เดือน ปี</th>
              <th className="border border-black w-[50%]">รายละเอียดรายจ่าย</th>
              <th className="border border-black w-[20%]">จำนวนเงิน</th>
              <th className="border border-black w-[15%]">เลขโปรเจ็ค</th>
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
            
            {/* เติมบรรทัดว่าง */}
            {[...Array(Math.max(0, 8 - (doc.items?.length || 0)))].map((_, i) => (
              <tr key={`empty-${i}`} className="h-8">
                <td className="border border-black"></td><td className="border border-black"></td>
                <td className="border border-black"></td><td className="border border-black"></td>
              </tr>
            ))}
          </tbody>
          
          {/* ส่วนยอดรวม (Footer) */}
          <tfoot>
             <tr className="h-10">
                <td colSpan="2" className="align-middle px-2 py-2">
                   <div className="flex items-center w-full justify-end gap-2 pr-2">
                      <span>รวมทั้งสิ้น (ตัวอักษร)</span>
                      <span className="border-b-2 border-dotted border-black min-w-[60%] text-center">
                        ( {doc.total_text || '-'} )
                      </span>
                   </div>
                </td>
                <td className="border border-black text-right px-2 align-middle bg-gray-50 text-lg">
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
              <div className="text-sm text-gray-600">(ผู้เบิกจ่าย)</div>
           </div>

           <div className="flex flex-col items-center w-64">
              <div className="h-12 flex items-end justify-center mb-1">
                 {/* เว้นว่างรอเซ็นสด */}
              </div>
              <div className="border-t border-black border-dotted w-full"></div>
              <div className="mt-1 flex gap-2">
                 <span>ลงชื่อ</span>
                 <span>(...................................................)</span>
              </div>
              <div className="text-sm text-gray-600">(ผู้อนุมัติ)</div>
           </div>
        </div>

        {/* ส่วนการเงินด้านล่าง */}
        <div className="absolute bottom-[20mm] left-[20mm] right-[20mm] border-t border-black pt-4 flex gap-8 text-sm">
           <div className="font-bold">สำหรับบัญชี</div>
           <div>จ่ายเงินผ่าน :</div>
           <div className="flex items-center gap-6">
              
              {/* ช่องเงินสด */}
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border border-black flex items-center justify-center">
                  {doc.payment_method === 'cash' && <Check size={18} strokeWidth={3} className="text-black" />}
                </div> 
                เงินสด
              </div>
              
              {/* ช่องโอนเงิน */}
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border border-black flex items-center justify-center">
                  {doc.payment_method === 'transfer' && <Check size={18} strokeWidth={3} className="text-black" />}
                </div> 
                โอนเงิน
              </div>

              {/* แสดงส่วนวันที่เสมอ และใช้ตัวแปร paymentDate ที่คำนวณไว้ */}
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
  )
}