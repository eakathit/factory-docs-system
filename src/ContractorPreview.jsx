import React from 'react'
import { FileText } from 'lucide-react'

// ฟังก์ชันจัดรูปแบบวันที่
const formatDate = (dateStr) => {
  if (!dateStr) return '....................'
  return new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
}

export default function ContractorPreview({ data }) {
  // คำนวณยอดรวม (ถ้าต้องการ)
  const totalNormal = (data.daily_items || []).length
  
  return (
    <div className="w-[210mm] min-h-[297mm] bg-white text-black font-sarabun text-[12pt] leading-tight p-[15mm] relative shadow-lg">
      
      {/* Header บริษัท */}
      <div className="mb-4">
        <h1 className="font-bold text-lg">HARU SYSTEM DEVELOPMENT (THAILAND) CO.,LTD.</h1>
        <p className="text-sm text-gray-600">47/20 M.1, KLONGPRAWET, BANPHO, CHACHOENGSAO 24140</p>
      </div>

      <div className="text-center font-bold text-xl mb-6 border-b-2 border-black pb-2">
        ใบสั่งจ้างผู้รับเหมา / Technician supporter record
      </div>

      {/* 1. ข้อมูลทั่วไป */}
      <div className="flex justify-between items-end mb-4">
        <div className="flex items-center gap-2">
           <span>วันที่ / Date</span>
           <span className="border-b border-dotted border-black min-w-[120px] text-center">{formatDate(data.created_at)}</span>
        </div>
      </div>

      <div className="space-y-3 mb-4">
         <div className="flex flex-wrap items-end gap-2">
            <span className="font-bold">1. ผู้รับเหมาชื่อ (นาย/นาง/นางสาว)</span>
            <span className="border-b border-dotted border-black flex-1 min-w-[200px] text-center text-blue-800 font-bold">{data.contractor_name}</span>
            <span>จ้างทำงานโปรเจ็คเลขที่</span>
            <span className="border-b border-dotted border-black min-w-[100px] text-center font-bold">{data.doc_no}</span>
         </div>
         
         <div className="flex flex-wrap items-end gap-2">
            <span>เลขบัตรประชาชน</span>
            <span className="border-b border-dotted border-black flex-1 text-center">{data.id_card}</span>
            <span>โดยมีผู้รับผิดชอบดูแลผู้รับเหมา คือ</span>
            <span className="border-b border-dotted border-black flex-1 text-center">{data.supervisor_name}</span>
         </div>
      </div>

      {/* 2. ค่าจ้าง */}
      <div className="border border-black p-3 mb-4">
         <div className="font-bold mb-2">2. ค่าจ้างเป็นแบบ</div>
         <div className="grid grid-cols-2 gap-4">
            {/* Row 1 */}
            <div className="flex items-center gap-2">
               <div className={`w-4 h-4 border border-black flex items-center justify-center ${data.wage_type === 'daily' ? 'bg-black text-white' : ''}`}>
                 {data.wage_type === 'daily' && '✓'}
               </div> 
               <span>รายวัน</span>
            </div>
            <div className="flex items-center gap-2">
                <div className={`w-4 h-4 border border-black flex items-center justify-center ${data.wage_type === 'project' ? 'bg-black text-white' : ''}`}>
                 {data.wage_type === 'project' && '✓'}
               </div> 
               <span>ต่อโปรเจ็ค</span>
            </div>

            {/* Row 2 */}
            <div className="col-span-2 flex items-center gap-2 flex-wrap">
               <span>เป็นจำนวนเงิน (เรทปกติ)</span>
               <span className="border-b border-black px-2 font-bold">{data.wage_rate || '-'}</span>
               <span>บาท ต่อ</span>
               <span className={data.wage_type === 'daily' ? 'font-bold underline' : ''}>วัน</span> / 
               <span className={data.wage_type === 'project' ? 'font-bold underline' : ''}>งาน</span>
            </div>

            {/* Row 3 */}
            <div className="col-span-2 flex items-center gap-6">
               <span>โอที:</span>
               <div className="flex items-center gap-1">
                  <div className={`w-4 h-4 border border-black ${data.has_ot === 'yes' ? 'bg-black' : ''}`}></div> มี
               </div>
               <div className="flex items-center gap-1">
                  <div className={`w-4 h-4 border border-black ${data.has_ot === 'no' ? 'bg-black' : ''}`}></div> ไม่มี
               </div>
            </div>
            
            {/* Duration */}
            <div className="col-span-2 flex items-end gap-2">
                <span>ระยะเวลาตั้งแต่วันที่</span>
                <span className="border-b border-dotted border-black px-2">{formatDate(data.start_date)}</span>
                <span>จนถึงวันที่</span>
                <span className="border-b border-dotted border-black px-2">{formatDate(data.end_date)}</span>
            </div>
         </div>
      </div>

      {/* 3. ตารางลงเวลา */}
      <div className="mb-4">
         <div className="font-bold mb-1">3. ตารางลงเวลา กรณีจ้างแบบรายวัน</div>
         <table className="w-full border-collapse border border-black text-[10pt]">
            <thead>
               <tr className="bg-gray-100 text-center">
                  <th className="border border-black w-[12%]">วันที่</th>
                  <th className="border border-black w-[8%]">เริ่ม</th>
                  <th className="border border-black w-[8%]">สิ้นสุด</th>
                  <th className="border border-black w-[8%]">OT เริ่ม</th>
                  <th className="border border-black w-[8%]">OT จบ</th>
                  <th className="border border-black">รายละเอียดงาน</th>
                  <th className="border border-black w-[15%]">ผู้รับผิดชอบ</th>
               </tr>
            </thead>
            <tbody>
               {(data.daily_items || []).map((item, index) => (
                 <tr key={index} className="h-8 align-middle">
                    <td className="border border-black text-center">{formatDate(item.date).split(' ')[0] + ' ' + formatDate(item.date).split(' ')[1]}</td>
                    <td className="border border-black text-center">{item.start_time}</td>
                    <td className="border border-black text-center">{item.end_time}</td>
                    <td className="border border-black text-center">{item.ot_start}</td>
                    <td className="border border-black text-center">{item.ot_end}</td>
                    <td className="border border-black px-1">{item.detail}</td>
                    <td className="border border-black text-center text-xs text-gray-400"></td>
                 </tr>
               ))}
               {/* เติมบรรทัดว่างให้เต็มกระดาษถ้าข้อมูลน้อย */}
               {[...Array(Math.max(0, 8 - (data.daily_items?.length || 0)))].map((_, i) => (
                  <tr key={`empty-${i}`} className="h-8">
                     <td className="border border-black"></td><td className="border border-black"></td>
                     <td className="border border-black"></td><td className="border border-black"></td>
                     <td className="border border-black"></td><td className="border border-black"></td>
                     <td className="border border-black"></td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      {/* 4. ค่าใช้จ่ายอื่นๆ */}
      <div className="flex gap-4 mb-4 text-sm">
         <div className="font-bold">4. ค่าใช้จ่ายนอกจากค่าจ้าง</div>
         
         <div className="flex items-center gap-1">
            <div className={`w-4 h-4 border border-black ${data.deduct_tax ? 'bg-black' : ''}`}></div> หัก ณ ที่จ่าย 3%
         </div>

         <div className="flex items-center gap-1 ml-4">
            <div className={`w-4 h-4 border border-black ${Number(data.accom_cost) > 0 ? 'bg-black' : ''}`}></div> 
            ค่าที่พัก: <span className="border-b border-black px-2">{data.accom_cost || '-'}</span> บาท
         </div>
         
         <div className="flex items-center gap-1 ml-4">
            <div className={`w-4 h-4 border border-black ${Number(data.travel_cost) > 0 ? 'bg-black' : ''}`}></div> 
            ค่าเดินทาง: <span className="border-b border-black px-2">{data.travel_cost || '-'}</span> บาท
         </div>
      </div>

      {/* สรุป & ลายเซ็น */}
      <div className="grid grid-cols-2 gap-4 mt-8">
         {/* ฝั่งซ้าย: สรุปยอด */}
         <div className="border border-black p-2 text-sm">
            <div className="font-bold underline mb-2 text-center">ตารางสรุปค่าจ้างงาน</div>
            <div className="grid grid-cols-2 gap-y-2">
               <span>วันทำงานปกติ:</span>
               <div className="text-right"><span className="font-bold">{totalNormal}</span> วัน</div>
               
               <span>วันหยุด (x2):</span>
               <div className="text-right"><span className="font-bold">{data.summary_holiday || 0}</span> วัน</div>
               
               <span>OT (x1.5):</span>
               <div className="text-right"><span className="font-bold">{data.summary_ot || 0}</span> ชม.</div>
               
               <div className="col-span-2 border-t border-black my-1"></div>
               <span className="font-bold">รวมเป็นเงินทั้งสิ้น:</span>
               <div className="text-right font-bold text-lg underline">{Number(data.grand_total || 0).toLocaleString()} บาท</div>
            </div>
         </div>

         {/* ฝั่งขวา: ลายเซ็น */}
         <div className="flex flex-col justify-between items-center px-4">
            <div className="w-full text-center mt-4">
               <div className="border-b border-dotted border-black h-8 mb-1"></div>
               <div>ผู้รับเหมา</div>
            </div>
            <div className="w-full text-center mt-8">
               <div className="border-b border-dotted border-black h-8 mb-1"></div>
               <div>ผู้รับผิดชอบโปรเจ็ค</div>
            </div>
         </div>
      </div>

    </div>
  )
}