import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { Printer, ArrowLeft } from 'lucide-react'

const CheckBox = ({ checked, label }) => (
  <div className="flex items-center gap-2 mr-4">
    <div className="w-4 h-4 border border-black flex items-center justify-center text-xs font-bold leading-none">
      {checked ? '✓' : ''}
    </div>
    <span className="whitespace-nowrap pt-0.5">{label}</span>
  </div>
)

export default function OrderPrint() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (order) { // ถ้าโหลดข้อมูลเสร็จแล้ว (มี order)
      const timer = setTimeout(() => {
        window.print() // สั่งพิมพ์ทันที
      }, 800) // รอ 0.8 วินาที ให้รูป/ฟอนต์โหลดครบ
      return () => clearTimeout(timer)
    }
  }, [order])

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
  if (!order) return <div className="text-center p-10">ไม่พบข้อมูล</div>

  const formatDate = (dateString) => {
    if (!dateString) return '..........................'
    return new Date(dateString).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 print:p-0 print:bg-white print:block overflow-x-auto">
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
          .font-sarabun { font-family: 'Sarabun', sans-serif; }
          
          /* บังคับตั้งค่าหน้ากระดาษ A4 ขอบ 0 */
          @page { 
            size: A4;
            margin: 0mm; 
          }
          
          @media print { 
            html, body {
              width: 210mm;
              height: 297mm;
              background: white;
              margin: 0 !important;
              padding: 0 !important;
            }
            
            .no-print { display: none !important; }

            /* บังคับ Container ให้พอดีกระดาษเป๊ะๆ */
            .print-container {
                width: 210mm !important;
                height: 297mm !important; /* บังคับความสูงเต็มหน้า */
                padding: 15mm 20mm !important; /* ระยะขอบกระดาษจริง */
                margin: 0 !important;
                box-shadow: none !important;
                border: none !important;
                overflow: hidden !important; /* ตัดส่วนเกินป้องกันหน้า 2 */
            }
          }
        `}
      </style>

      {/* ปุ่มกด (ซ่อนตอนปริ้นท์) */}
      <div className="w-[210mm] mb-6 flex flex-wrap justify-between items-center gap-4 no-print px-4 md:px-0 sticky left-0 z-50">
        
        {/* ปุ่มย้อนกลับ */}
        <Link to="/history" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 transition-colors">
          <ArrowLeft size={20} /> กลับ
        </Link>
        
        {/* คำแนะนำ (ซ่อนในมือถือ) */}
        <div className="text-xs text-gray-500 hidden lg:block">
            *ตั้งค่า Margins: <b>None</b> | Scale: <b>100</b>
        </div>

        {/* กลุ่มปุ่มด้านขวา (แชร์ + พิมพ์) */}
        <div className="flex gap-2">
          {/* ✅ ปุ่มแชร์ / คัดลอกลิงก์ (เพิ่มใหม่) */}
          <button 
            onClick={async () => {
              try {
                if (navigator.share) {
                  await navigator.share({
                    title: 'เอกสารออนไลน์',
                    text: 'ลิงก์เอกสารสำหรับพิมพ์',
                    url: window.location.href,
                  })
                } else {
                  await navigator.clipboard.writeText(window.location.href)
                  alert('คัดลอกลิงก์เรียบร้อย! \nนำไปเปิดใน Chrome/Safari เพื่อบันทึก PDF')
                }
              } catch (err) {
                console.error('Share failed:', err)
              }
            }}
            className="bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg flex gap-2 hover:bg-orange-600 font-bold items-center transition-transform active:scale-95"
            title="แชร์ หรือ คัดลอกลิงก์ไปเปิดใน Browser อื่น"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            <span className="hidden sm:inline">แชร์</span>
          </button>

          {/* ปุ่มพิมพ์เดิม */}
          <button 
            onClick={() => window.print()} 
            className="bg-blue-600 text-white px-6 py-2 rounded-full shadow-lg flex gap-2 hover:bg-blue-700 font-bold items-center transition-transform active:scale-95"
          >
            <Printer size={20} /> 
            <span className="hidden sm:inline">พิมพ์</span>
          </button>
        </div>

      </div>

      {/* เนื้อหาเอกสาร (Wrapper) */}
      <div className="print:w-auto print:block">
        {/* ตัวกระดาษ A4 (Fixed Size) */}
        <div 
          className="print-container bg-white shadow-2xl print:shadow-none font-sarabun text-sm leading-normal relative"
          style={{
            width: '210mm',      // บังคับกว้างเท่า A4
            minWidth: '210mm',   // ห้ามหดในมือถือ (ทำให้ Scroll ได้)
            minHeight: '297mm',  // สูงเท่า A4
            padding: '20mm',     // Padding สำหรับดูในจอ
            margin: '0 auto'
          }}
        >
          
          {/* HEADER */}
          <div className="text-center mb-6">
            <h1 className="font-bold text-lg">HARU SYSTEM DEVELOPMENT (THAILAND) CO.,LTD.</h1>
            <p className="text-xs text-gray-600">47/20 M.1, KLONGPRAWET, BANPHO, CHACHOENGSAO 24140</p>
            <div className="mt-3 border-2 border-black p-2 relative mx-auto w-full">
              <h2 className="text-xl font-bold">ใบสั่งจ้างผู้รับเหมา / Technician supporter record</h2>
              <div className="absolute top-2 right-2 text-xs font-normal">
                วันที่ {formatDate(order.created_at)}
              </div>
            </div>
          </div>

          {/* SECTION 1: ข้อมูล */}
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <div className="w-[60%]">
                ผู้รับเหมาชื่อ (นาย/นาง/นางสาว): <span className="font-bold underline decoration-dotted ml-2 text-lg">{order.contractor_name}</span>
            </div>
            <div className="w-[40%] text-right">
                เลขบัตรประชาชน: <span className="font-bold underline decoration-dotted ml-2">{order.id_card_number}</span>
            </div>
          </div>
          
          <div className="flex items-center mb-2">
            <span className="mr-2 font-bold">1. จ้างทำงานโปรเจ็คเลขที่:</span>
            <span className="border-b border-black border-dotted w-32 inline-block mr-4"></span>
            <span>โดยมีผู้รับผิดชอบดูแลผู้รับเหมา คือ:</span>
            <span className="font-bold underline decoration-dotted ml-2">{order.supervisor_name}</span>
          </div>
        </div>

        {/* SECTION 2: ค่าจ้าง */}
        <div className="mb-4 border-t border-dotted border-gray-300 pt-2">
          <div className="flex items-center gap-1 mb-2 flex-wrap">
            <span className="mr-2 font-bold">2. ค่าจ้างเป็นแบบ:</span>
            <CheckBox checked={order.payment_type === 'daily'} label="รายวัน" />
            <CheckBox checked={order.payment_type === 'project'} label="ต่อโปรเจ็ค" />
            <span className="ml-4">เป็นจำนวนเงิน (เรทปกติ):</span>
            <span className="border-b border-black w-24 text-center inline-block font-bold text-lg">{order.wage_rate.toLocaleString()}</span>
            <span>บาท ต่อ ( วัน / งาน )</span>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="mr-2 font-bold">โอที:</span>
            <CheckBox checked={false} label="มี" />
            <CheckBox checked={true} label="ไม่มี" />
            <span className="ml-6">ระยะเวลา ตั้งแต่วันที่:</span>
            <span className="font-bold underline decoration-dotted mx-2">{formatDate(order.start_date)}</span>
            <span>ถึงวันที่:</span>
            <span className="font-bold underline decoration-dotted mx-2">{formatDate(order.end_date)}</span>
          </div>
        </div>

        {/* SECTION 3: ตาราง */}
        <div className="mb-4">
          <div className="font-bold mb-1">3. ตารางลงเวลา กรณีจ้างแบบรายวัน</div>
          <table className="w-full border-collapse border border-black text-center text-xs">
            <thead>
              <tr className="bg-gray-200 h-8">
                <th className="border border-black w-[12%]">วันที่ทำงาน</th>
                <th className="border border-black w-[8%]">เริ่ม</th>
                <th className="border border-black w-[8%]">สิ้นสุด</th>
                <th className="border border-black w-[6%]">รวม(วัน)</th>
                <th className="border border-black w-[8%]">OT เริ่ม</th>
                <th className="border border-black w-[8%]">OT สิ้นสุด</th>
                <th className="border border-black w-[6%]">รวม OT</th>
                <th className="border border-black">ลงชื่อ / รายละเอียดงาน</th>
                <th className="border border-black w-[12%]">ผู้รับผิดชอบ</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(12)].map((_, i) => (
                <tr key={i} className="h-7"> 
                  <td className="border border-black"></td><td className="border border-black"></td>
                  <td className="border border-black"></td><td className="border border-black"></td>
                  <td className="border border-black"></td><td className="border border-black"></td>
                  <td className="border border-black"></td><td className="border border-black"></td>
                  <td className="border border-black"></td>
                </tr>
              ))}
              <tr className="bg-gray-100 h-8 font-bold">
                <td className="border border-black" colSpan={3}>รวม</td>
                <td className="border border-black"></td>
                <td className="border border-black" colSpan={2}></td>
                <td className="border border-black"></td>
                <td className="border border-black text-left pl-2 text-[10px]" colSpan={2}>
                  หมายเหตุ : ค่าจ้างและค่าใช้จ่ายทั้งหมด จะถูกหัก ณ ที่จ่าย 3%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SECTION 4: ค่าใช้จ่ายอื่น */}
        <div className="mb-6">
          <div className="font-bold mb-1">4. ค่าใช้จ่ายนอกจาก ค่าจ้าง</div>
          <div className="border border-black p-2 flex justify-between px-4">
            <div className="flex flex-col gap-2 w-1/2">
              <div className="flex items-center"><CheckBox checked={false} label="" /> <span>ค่าที่พัก เป็นเงิน ......... บาท ต่อ ( วัน / งาน )</span></div>
              <div className="flex items-center"><CheckBox checked={false} label="" /> <span>ค่าเดินทาง เป็นเงิน ....... บาท ต่อ ( วัน / งาน )</span></div>
            </div>
            <div className="flex flex-col gap-2 w-1/4 pt-1">
               <CheckBox checked={true} label="ไม่มี" />
               <CheckBox checked={true} label="ไม่มี" />
            </div>
          </div>
        </div>

        {/* FOOTER: สรุปยอดเงิน */}
        <div className="flex border border-black h-[180px]">
          
          {/* ลายเซ็นซ้าย */}
          <div className="w-[30%] border-r border-black p-2 flex flex-col items-center text-center relative">
             <div className="w-full text-left font-bold text-xs">ผู้รับเหมา</div>
             <div className="mt-4 flex-grow flex items-center justify-center">
                {order.contractor_signature ? (
                   <img src={order.contractor_signature} className="h-20 object-contain" alt="signature" />
                ) : <div className="h-20"></div>}
             </div>
             <div className="w-full mb-2">
                <div className="border-t border-black border-dotted w-3/4 mx-auto"></div>
                <div className="mt-1">({order.contractor_name})</div>
                <div className="text-[10px] text-gray-500">ผู้รับจ้าง</div>
             </div>
          </div>

          {/* ลายเซ็นกลาง */}
          <div className="w-[30%] border-r border-black p-2 flex flex-col items-center text-center relative">
             <div className="w-full text-left font-bold text-xs">ผู้รับผิดชอบโปรเจ็ค</div>
             <div className="mt-4 flex-grow"></div>
             <div className="w-full mb-2">
                <div className="border-t border-black border-dotted w-3/4 mx-auto"></div>
                <div className="mt-1">(............................................)</div>
                <div className="text-[10px] text-gray-500">หัวหน้างาน / PM</div>
             </div>
          </div>

          {/* สรุปขวา */}
          <div className="w-[40%] text-xs">
            <div className="flex border-b border-black h-6 bg-gray-200 font-bold text-center items-center">
               <div className="w-[45%] border-r border-black">ตารางสรุป</div>
               <div className="w-[20%] border-r border-black">จำนวน</div>
               <div className="w-[35%]">บาท</div>
            </div>
            
            {[
              ['วันธรรมดา', 'วัน', ''],
              ['วันหยุด (x2)', 'วัน', ''],
              ['ล่วงเวลา (x1.5)', 'ชม.', ''],
              ['ล่วงเวลา (x3)', 'ชม.', ''],
            ].map((row, i) => (
              <div key={i} className="flex border-b border-black h-[22px] items-center">
                 <div className="w-[45%] px-2 border-r border-black">{row[0]}</div>
                 <div className="w-[20%] px-2 border-r border-black text-right">{row[1]}</div>
                 <div className="w-[35%] px-2 text-right">{row[2]}</div>
              </div>
            ))}

            <div className="flex border-b border-black h-[22px] bg-gray-50 font-bold items-center">
               <div className="w-[65%] px-2 border-r border-black text-right">รวมทั้งสิ้น</div>
               <div className="w-[35%] px-2 text-right"></div>
            </div>
            <div className="flex border-b border-black h-[22px] items-center">
               <div className="w-[65%] px-2 border-r border-black text-right">หัก ณ ที่จ่าย 3%</div>
               <div className="w-[35%] px-2 text-right"></div>
            </div>
            <div className="flex h-[24px] font-bold items-center bg-gray-100">
               <div className="w-[65%] px-2 border-r border-black text-right">ยอดสุทธิ</div>
               <div className="w-[35%] px-2 text-right"></div>
            </div>
          </div>
        </div>
        
        <div className="mt-2 text-right text-xs flex justify-end items-end h-6">
           <span className="font-bold mr-2">การเงิน:</span>
           <span className="inline-block w-40 border-b border-black border-dotted mb-1"></span>
        </div>

      </div>
    </div>
    </div>
  )
}