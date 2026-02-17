import React from 'react'

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ✅ แก้ไข 1: เพิ่ม "data = {}" เพื่อกัน Error ถ้าไม่มีข้อมูลส่งมา
const VoucherContent = ({ data = {}, copyType }) => {
  // ✅ แก้ไข 2: เพิ่มการเช็ค data ก่อนดึง items
  const items = data?.items || [] 
  
  const emptyRows = Math.max(0, 4 - items.length) 

  return (
    <div className="h-[148mm] relative p-[15mm] pb-[5mm] text-[13px] leading-tight flex flex-col">
       
       {/* --- Header --- */}
       <div>
          <div className="text-right mb-2">
            <h1 className="font-bold text-lg">RECEIPT VOUCHER / ใบสำคัญรับเงิน</h1>
            {/* แสดงคำว่า ต้นฉบับ/สำเนา ถ้ามีส่งมา */}
            {copyType && <span className="text-[10px] border border-black px-2 rounded ml-2">{copyType}</span>}
          </div>

          {/* Date */}
          <div className="flex justify-end items-center gap-2 mb-2">
             <span className="font-bold">วันที่</span>
             <div className="border-b border-dotted border-black w-[100px] text-center relative h-5">
                <span className="absolute bottom-0 left-0 w-full">{formatDate(data?.created_at)}</span>
             </div>
          </div>

          {/* --- Content Rows --- */}
          <div className="space-y-1 mb-2">
             {/* Row 1: ข้าพเจ้า + บัตร ปชช. */}
             <div className="flex flex-wrap items-end gap-2">
                <span className="font-bold">ข้าพเจ้า</span>
                <div className="border-b border-dotted border-black flex-1 text-center font-bold text-blue-800 relative h-5 min-w-[100px]">
                   <span className="absolute bottom-0 left-0 w-full">{data?.receiver_name}</span>
                </div>
                <span>ผู้มีถิ่นฐานอยู่ตามบัตรประชาชนเลขที่</span>
                <div className="border-b border-dotted border-black w-[130px] text-center relative h-5">
                   <span className="absolute bottom-0 left-0 w-full">{data?.id_card_number}</span>
                </div>
             </div>

             {/* Row 2: ที่อยู่ */}
             <div className="flex flex-wrap items-end gap-2">
                <span className="font-bold">ที่อยู่</span>
                <div className="border-b border-dotted border-black flex-1 text-left px-2 relative h-5">
                   <span className="absolute bottom-0 left-0 w-full text-xs truncate">{data?.address}</span>
                </div>
             </div>

             {/* Row 3: ได้รับเงินจาก... */}
             <div className="flex flex-wrap items-end gap-1 text-[12px]">
                <span>ตามสำเนาแนบท้าย ได้รับเงินจาก</span>
                <span className="font-bold border-b border-black px-1">บจก. ฮารุ ซิสเต็ม ดีเวล็อปเมนต์ (ไทยแลนด์)</span>
                <span>เป็นจำนวนเงิน</span>
                <div className="border-b border-dotted border-black flex-1 text-center font-bold relative h-5 min-w-[50px]">
                   <span className="absolute bottom-0 left-0 w-full">{parseFloat(data?.total_amount || 0).toLocaleString()}</span>
                </div>
                <span>บาท</span>
             </div>

             {/* Row 4: วิธีรับเงิน */}
             <div className="flex flex-wrap items-center gap-3 pt-1">
                <span>ได้รับเงินเป็น</span>
                <div className="flex items-center gap-1">
                    <div className={`w-3 h-3 border border-black flex items-center justify-center text-[10px] ${data?.payment_method === 'cash' ? 'bg-black text-white' : ''}`}>
                        {data?.payment_method === 'cash' && '✓'}
                    </div>
                    <span>เงินสด</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className={`w-3 h-3 border border-black flex items-center justify-center text-[10px] ${data?.payment_method === 'transfer' ? 'bg-black text-white' : ''}`}>
                        {data?.payment_method === 'transfer' && '✓'}
                    </div>
                    <span>โอนเงิน</span>
                </div>
                <span className="ml-2">ดังรายการต่อไปนี้</span>
             </div>
          </div>

          {/* --- Table --- */}
          <table className="w-full border-collapse border border-black mb-2 text-[11px]">
             <thead>
                <tr className="bg-gray-100 text-center h-6">
                   <th className="border border-black w-[8%]">ลำดับ</th>
                   <th className="border border-black w-[45%]">รายการ</th>
                   <th className="border border-black w-[10%]">จำนวน</th>
                   <th className="border border-black w-[10%]">หน่วย</th>
                   <th className="border border-black w-[12%]">ราคา/หน่วย</th>
                   <th className="border border-black w-[15%]">รวมเป็นเงิน</th>
                </tr>
             </thead>
             <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="h-6 align-top">
                     <td className="border border-black text-center">{index + 1}</td>
                     <td className="border border-black px-2">{item.name}</td>
                     <td className="border border-black text-center">{item.quantity}</td>
                     <td className="border border-black text-center">{item.unit}</td>
                     <td className="border border-black text-right px-2">{parseFloat(item.price || 0).toLocaleString()}</td>
                     <td className="border border-black text-right px-2">{parseFloat(item.total || 0).toLocaleString()}</td>
                  </tr>
                ))}
                {[...Array(emptyRows)].map((_, i) => (
                   <tr key={`empty-${i}`} className="h-6">
                      <td className="border border-black"></td><td className="border border-black"></td>
                      <td className="border border-black"></td><td className="border border-black"></td>
                      <td className="border border-black"></td><td className="border border-black"></td>
                   </tr>
                ))}
             </tbody>
             <tfoot>
                <tr className="h-6">
                   <td colSpan="2" className="border border-black px-2 font-bold text-right align-middle">รวมเป็นเงิน / Total</td>
                   <td colSpan="4" className="border border-black px-2 font-bold text-right bg-gray-50 text-[12px] align-middle">
                      {parseFloat(data?.total_amount || 0).toLocaleString()}
                   </td>
                </tr>
                <tr className="h-6">
                   <td colSpan="6" className="border border-black px-2 text-center italic align-middle text-[10px]">
                      ( {data?.total_text || '...........................................................................'} )
                   </td>
                </tr>
             </tfoot>
          </table>

          {/* --- ข้อความรับรอง --- */}
          <div className="text-[10px] mb-2 leading-relaxed whitespace-nowrap overflow-hidden">
             <span className="font-bold mr-1">เนื่องจาก</span> 
             ข้าพเจ้าเป็นบุคคลธรรมดา ไม่ต้องจดทะเบียนการค้าและภาษีมูลค่าเพิ่ม จึงออกใบสำคัญรับเงินฉบับนี้เพื่อเป็นหลักฐานในการรับเงินแทนใบเสร็จรับเงิน
             <br/>
             <span className="indent-4 inline-block font-bold">ขอรับรองว่า ข้อความข้างต้นเป็นความจริงทุกประการ</span>
          </div>
       </div>

       {/* --- Signatures --- */}
       <div className="flex justify-between items-end px-4 mt-auto mb-2">
          <div className="text-center w-[40%]">
              <div className="border-b border-dotted border-black h-6 mb-1 flex items-end justify-center">
                  {data?.payer_signature && <img src={data.payer_signature} className="h-8 object-contain" alt="sig" />}
              </div>
              <div className="text-[10px]">ผู้จ่ายเงิน</div>
          </div>
          <div className="text-center w-[40%]">
              <div className="border-b border-dotted border-black h-6 mb-1"></div>
              <div className="text-[10px]">ผู้รับเงิน</div>
          </div>
       </div>

       {/* --- หมายเหตุล่างสุด --- */}
       <div className="text-[9px] text-gray-500 text-center border-t border-gray-200 pt-1 mt-1">
         ** เอกสารฉบับใช้ทดแทนกรณีที่ไม่สามารถออกใบเสร็จรับเงินได้ และผู้รับเงินยินยอมให้ใช้ข้อมูลบัตรประชาชน เป็นหลักฐานการรับเงิน
       </div>

    </div>
  )
}

// ✅ แก้ไข 3: เพิ่ม "data = {}" ที่ Component หลักด้วย
export default function ReceiptVoucherPreview({ data = {} }) {
  return (
    <div className="w-[210mm] min-h-[297mm] bg-white text-black font-sarabun shadow-lg flex flex-col">
      <div className="h-[148mm] border-b border-dashed border-gray-300">
        <VoucherContent data={data} copyType="ต้นฉบับ" />
      </div>
      <div className="h-[148mm]">
        <VoucherContent data={data} copyType="สำเนา" />
      </div>
    </div>
  )
}