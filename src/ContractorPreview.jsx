import React from 'react'

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'numeric', year: '2-digit' })
}

export default function ContractorPreview({ data }) {
  // คำนวณยอดเบื้องต้นสำหรับตารางสรุป
  const wage = parseFloat(data.wage_rate) || 0
  const totalNormalDays = (data.daily_items || []).length // สมมติว่านับตามจำนวนแถวไปก่อน
  const totalNormalAmount = totalNormalDays * wage

  // ส่วนนี้ต้องรอ Logic คำนวณจริง แต่ใส่โครงไว้ก่อน
  const holidayDays = 0 
  const holidayAmount = 0 
  const otHours = 0
  const otAmount = 0

  return (
    <div className="w-[210mm] min-h-[297mm] bg-white text-black font-sarabun text-[13px] leading-tight p-[15mm] relative shadow-lg">
      
      {/* --- Header --- */}
      <div className="mb-4">
        <h1 className="font-bold text-lg">HARU SYSTEM DEVELOPMENT (THAILAND) CO.,LTD.</h1>
        <p className="text-xs text-gray-600">47/20 M.1, KLONGPRAWET, BANPHO, CHACHOENGSAO 24140</p>
      </div>

      <div className="text-center font-bold text-xl mb-2">
        ใบสั่งจ้างผู้รับเหมา / Technician supporter record
      </div>

      {/* --- Date --- */}
      <div className="flex justify-end items-end gap-2 mb-4">
         <span className="font-bold">วันที่ / Date</span>
         <div className="border-b border-dotted border-black w-[120px] text-center relative h-6">
            <span className="absolute bottom-0 left-0 w-full">{formatDate(data.created_at)}</span>
         </div>
      </div>

      {/* --- Section 1: ข้อมูลผู้รับเหมา --- */}
      <div className="space-y-2 mb-4">
         <div className="flex items-end gap-2">
            <span className="font-bold">ผู้รับเหมาชื่อ (นาย/นาง/นางสาว)</span>
            <div className="border-b border-dotted border-black flex-1 text-center text-blue-800 font-bold relative h-6">
               <span className="absolute bottom-0 left-0 w-full">{data.contractor_name}</span>
            </div>
         </div>

         <div className="flex flex-wrap items-end gap-2">
            <span className="font-bold">1. จ้างทำงานโปรเจ็คเลขที่</span>
            <div className="border-b border-dotted border-black w-[150px] text-center font-bold relative h-6">
               <span className="absolute bottom-0 left-0 w-full">{data.doc_no}</span>
            </div>
            
            <span>เลขบัตรประชาชน</span>
            <div className="border-b border-dotted border-black w-[180px] text-center relative h-6">
               <span className="absolute bottom-0 left-0 w-full">{data.id_card}</span>
            </div>
         </div>

         <div className="flex items-end gap-2">
            <span>โดยมีผู้รับผิดชอบดูแลผู้รับเหมา คือ</span>
            <div className="border-b border-dotted border-black flex-1 text-center relative h-6">
               <span className="absolute bottom-0 left-0 w-full">{data.supervisor_name}</span>
            </div>
         </div>
      </div>

      {/* --- Section 2: ค่าจ้าง --- */}
      <div className="mb-4">
         <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-bold">2. ค่าจ้างเป็นแบบ</span>
            
            <div className="flex items-center gap-1 ml-2">
               <div className={`w-4 h-4 border border-black flex items-center justify-center text-xs ${data.wage_type === 'daily' ? 'bg-black text-white' : ''}`}>
                  {data.wage_type === 'daily' && '✓'}
               </div>
               <span>รายวัน</span>
            </div>

            <div className="flex items-center gap-1 ml-2">
               <div className={`w-4 h-4 border border-black flex items-center justify-center text-xs ${data.wage_type === 'project' ? 'bg-black text-white' : ''}`}>
                  {data.wage_type === 'project' && '✓'}
               </div>
               <span>ต่อโปรเจ็ค</span>
            </div>

            <span className="ml-4">เป็นจำนวนเงิน (เรทปกติ)</span>
            <div className="border-b border-dotted border-black w-[80px] text-center font-bold relative h-6">
                 <span className="absolute bottom-0 left-0 w-full">{data.wage_rate}</span>
            </div>
            <span>บาท ต่อ</span>
            <span className={data.wage_type === 'daily' ? 'font-bold underline' : ''}>วัน</span> / 
            <span className={data.wage_type === 'project' ? 'font-bold underline' : ''}>งาน</span>
         </div>

         <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold">โอที:</span>
            <div className="flex items-center gap-1">
               <div className={`w-4 h-4 border border-black flex items-center justify-center text-xs ${data.has_ot === 'yes' ? 'bg-black text-white' : ''}`}>
                  {data.has_ot === 'yes' && '✓'}
               </div> 
               <span>มี</span>
            </div>
            <div className="flex items-center gap-1">
               <div className={`w-4 h-4 border border-black flex items-center justify-center text-xs ${data.has_ot === 'no' ? 'bg-black text-white' : ''}`}>
                  {data.has_ot === 'no' && '✓'}
               </div> 
               <span>ไม่มี</span>
            </div>

            <span className="ml-4">โดยมีระยะเวลาตั้งแต่วันที่</span>
            <div className="border-b border-dotted border-black w-[100px] text-center relative h-6">
                <span className="absolute bottom-0 left-0 w-full">{formatDate(data.start_date)}</span>
            </div>
            <span>จนถึงวันที่</span>
            <div className="border-b border-dotted border-black w-[100px] text-center relative h-6">
                 <span className="absolute bottom-0 left-0 w-full">{formatDate(data.end_date)}</span>
            </div>
         </div>
      </div>

      {/* --- Section 3: ตารางลงเวลา (10 Columns ตามต้นฉบับ) --- */}
      <div className="mb-4">
         <div className="font-bold mb-1">3. ตารางลงเวลา กรณีจ้างแบบรายวัน</div>
         <table className="w-full border-collapse border border-black text-[11px]">
            <thead>
               <tr className="bg-gray-100 text-center h-10 align-middle">
                  <th className="border border-black w-[10%]">วันที่ทำงาน</th>
                  <th className="border border-black w-[8%]">เริ่ม</th>
                  <th className="border border-black w-[8%]">สิ้นสุด</th>
                  <th className="border border-black w-[6%]">รวม<br/>(ชม.)</th>
                  <th className="border border-black w-[8%]">โอที<br/>เริ่ม</th>
                  <th className="border border-black w-[8%]">โอที<br/>สิ้นสุด</th>
                  <th className="border border-black w-[6%]">รวม<br/>โอที</th>
                  <th className="border border-black w-[10%]">ลงชื่อ</th>
                  <th className="border border-black">รายละเอียดงาน</th>
                  <th className="border border-black w-[10%]">ผู้รับผิดชอบ</th>
               </tr>
            </thead>
            <tbody>
               {(data.daily_items || []).map((item, index) => (
                 <tr key={index} className="h-7 align-middle">
                    <td className="border border-black text-center">{formatDate(item.date)}</td>
                    <td className="border border-black text-center">{item.start_time}</td>
                    <td className="border border-black text-center">{item.end_time}</td>
                    <td className="border border-black text-center">
                        {/* คำนวณชั่วโมงงานปกติ */}
                    </td>
                    <td className="border border-black text-center"></td>
                    <td className="border border-black text-center"></td>
                    <td className="border border-black text-center"></td>
                    <td className="border border-black text-center"></td>
                    <td className="border border-black px-1">{item.detail}</td>
                    <td className="border border-black text-center"></td>
                 </tr>
               ))}
               
               {/* เติมบรรทัดว่างให้ครบ 10 บรรทัด (ตามฟอร์มจริงที่มีเยอะ) */}
               {[...Array(Math.max(0, 10 - (data.daily_items?.length || 0)))].map((_, i) => (
                  <tr key={`empty-${i}`} className="h-7">
                     <td className="border border-black"></td><td className="border border-black"></td>
                     <td className="border border-black"></td><td className="border border-black"></td>
                     <td className="border border-black"></td><td className="border border-black"></td>
                     <td className="border border-black"></td><td className="border border-black"></td>
                     <td className="border border-black"></td><td className="border border-black"></td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      {/* --- Section 4: ค่าใช้จ่ายอื่น --- */}
      <div className="mb-6 text-[12px]">
         <div className="font-bold mb-2">4. ค่าใช้จ่ายนอกจาก ค่าจ้าง</div>
         <div className="flex flex-wrap gap-y-2">
            
            {/* หัก 3% */}
            <div className="flex items-center gap-1 w-full sm:w-auto mr-8">
                <div className={`w-4 h-4 border border-black flex items-center justify-center ${data.deduct_tax ? 'bg-black text-white' : ''}`}>
                    {data.deduct_tax && '✓'}
                </div> 
                <span>หัก ณ ที่จ่าย 3%</span>
            </div>

            {/* ค่าที่พัก */}
            <div className="flex items-center gap-1 w-full sm:w-auto mr-4">
                <div className={`w-4 h-4 border border-black flex items-center justify-center ${data.accom_cost > 0 ? 'bg-black text-white' : ''}`}>
                     {data.accom_cost > 0 && '✓'}
                </div>
                <span>ค่าที่พัก เป็นเงิน</span>
                <span className="border-b border-black px-2 min-w-[50px] text-center">{data.accom_cost || ''}</span>
                <span>บาท ต่อวัน / งาน</span>
            </div>
            <div className="flex items-center gap-1 mr-8">
                <div className={`w-4 h-4 border border-black flex items-center justify-center ${!data.accom_cost ? 'bg-black text-white' : ''}`}>
                    {!data.accom_cost && '✓'}
                </div>
                <span>ไม่มี</span>
            </div>

            {/* ค่าเดินทาง */}
            <div className="flex items-center gap-1 w-full sm:w-auto mr-4">
                <div className={`w-4 h-4 border border-black flex items-center justify-center ${data.travel_cost > 0 ? 'bg-black text-white' : ''}`}>
                    {data.travel_cost > 0 && '✓'}
                </div>
                <span>ค่าเดินทาง เป็นเงิน</span>
                <span className="border-b border-black px-2 min-w-[50px] text-center">{data.travel_cost || ''}</span>
                <span>บาท ต่อวัน / งาน</span>
            </div>
            <div className="flex items-center gap-1">
                <div className={`w-4 h-4 border border-black flex items-center justify-center ${!data.travel_cost ? 'bg-black text-white' : ''}`}>
                    {!data.travel_cost && '✓'}
                </div>
                <span>ไม่มี</span>
            </div>
         </div>
      </div>

      {/* --- Footer: ลายเซ็น & ตารางสรุป --- */}
      <div className="flex flex-row justify-between items-start gap-4 mt-auto">
         
         {/* ลายเซ็น (ซ้าย) */}
         <div className="flex flex-col gap-8 w-[40%] text-center pt-4">
            <div>
               <div className="border-b border-dotted border-black h-8 mb-1"></div>
               <div>ผู้รับเหมา</div>
            </div>
            <div>
               <div className="border-b border-dotted border-black h-8 mb-1"></div>
               <div>ผู้รับผิดชอบโปรเจ็ค</div>
            </div>
         </div>

         {/* ตารางสรุป (ขวา) */}
         <div className="w-[55%] border border-black p-2">
            <div className="font-bold underline text-center mb-2">ตารางสรุปค่าจ้างงาน</div>
            
            {/* Row 1: วันธรรมดา */}
            <div className="flex justify-between items-center mb-1 text-[12px]">
               <span>จำนวนวันทำงาน <br/>(วันธรรมดา)</span>
               <div className="flex items-center gap-1">
                  <span className="border-b border-dotted border-black min-w-[30px] text-center">{totalNormalDays}</span>
                  <span>วันๆละ</span>
               </div>
               <div className="flex items-center gap-1">
                   <span className="border-b border-dotted border-black min-w-[50px] text-right">{wage}</span>
                   <span>บาท</span>
               </div>
            </div>

            {/* Row 2: วันหยุด */}
            <div className="flex justify-between items-center mb-1 text-[12px]">
               <span>วันหยุด</span>
               <div className="flex items-center gap-1">
                  <span className="border-b border-dotted border-black min-w-[30px] text-center">{holidayDays || '-'}</span>
                  <span>วันๆละ</span>
               </div>
               <div className="flex items-center gap-1">
                   <span className="border-b border-dotted border-black min-w-[50px] text-right">
                      {wage ? wage * 2 : ''}
                   </span>
                   <span>บาท (*2)</span>
               </div>
            </div>

             {/* Row 3: OT */}
             <div className="flex justify-between items-center mb-2 text-[12px]">
               <span>ชม.ล่วงเวลา</span>
               <div className="flex items-center gap-1">
                  <span className="border-b border-dotted border-black min-w-[30px] text-center">{otHours || '-'}</span>
                  <span>ชม.ๆละ</span>
               </div>
               <div className="flex items-center gap-1">
                   <span className="border-b border-dotted border-black min-w-[50px] text-right">
                       {wage ? (wage / 8 * 1.5).toFixed(0) : ''}
                   </span>
                   <span>บาท (*1.5)</span>
               </div>
            </div>
            
            {/* Total */}
            <div className="border-t border-black pt-1 flex justify-between items-center font-bold">
               <span>รวมเป็นเงินทั้งสิ้น</span>
               <span className="text-lg underline">{totalNormalAmount.toLocaleString()} บาท</span>
            </div>
         </div>

      </div>

    </div>
  )
}