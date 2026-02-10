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
    const fetchOrder = async () => {
      const { data } = await supabase.from('doc_contractor_orders').select('*').eq('id', orderId).single()
      if (data) setOrder(data)
      setLoading(false)
    }
    fetchOrder()
  }, [orderId])

  if (loading) return <div className="text-center p-10">กำลังโหลด...</div>
  if (!order) return <div className="text-center p-10">ไม่พบข้อมูล</div>

  const formatDate = (dateString) => {
    if (!dateString) return '..........................'
    return new Date(dateString).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 print:p-0 print:bg-white font-sans text-black">
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
          .font-sarabun { font-family: 'Sarabun', sans-serif; }
          
          /* 1. สั่ง Browser ว่าไม่ต้องมีขอบ */
          @page { 
            size: auto;   /* ให้ปรับตามกระดาษ */
            margin: 0mm;  /* ขอบ 0 */
          }
          
          @media print { 
            body { margin: 0; padding: 0; }
            .no-print { display: none !important; }

            /* 2. บังคับให้เนื้อหา กว้าง 100% ของพื้นที่ที่ปริ้นท์ได้ */
            .print-container {
                width: 100% !important; 
                max-width: none !important;
                padding: 15mm 20mm !important; /* เว้นขอบด้วย Padding แทน */
                margin: 0 !important;
            }
          }
        `}
      </style>

      {/* ปุ่มกด (ซ่อนตอนปริ้นท์) */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center no-print">
        <Link to="/history" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
          <ArrowLeft size={20} /> กลับ
        </Link>
        <div className="text-sm text-gray-500">
            *ตั้งค่า Margins: <b>None</b> | Scale: <b>100 (หรือปรับเพิ่มตามชอบ)</b>
        </div>
        <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-2 rounded shadow flex gap-2 hover:bg-blue-700 font-bold">
          <Printer size={20} /> พิมพ์เอกสาร
        </button>
      </div>

      {/* เนื้อหาเอกสาร */}
      <div className="print-container max-w-[210mm] mx-auto bg-white p-[20mm] shadow-lg print:shadow-none font-sarabun text-sm leading-normal">
        
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
  )
}