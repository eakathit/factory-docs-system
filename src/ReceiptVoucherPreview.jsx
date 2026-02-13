import React from 'react'

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function ReceiptVoucherPreview({ data }) {
  // สร้างแถวเปล่าๆ ให้ครบ 5 แถว เพื่อความสวยงาม
  const items = data.items || []
  const emptyRows = Math.max(0, 5 - items.length)

  return (
    <div className="w-[210mm] min-h-[297mm] bg-white text-black font-sarabun text-[14px] leading-relaxed p-[20mm] relative shadow-lg">
      
      {/* Header */}
      <div className="text-right mb-8">
        <h1 className="font-bold text-center text-xl">RECEIPT VOUCHER / ใบสำคัญรับเงิน</h1>
      </div>

      {/* Date */}
      <div className="flex justify-end items-center gap-2 mb-8">
         <span>วันที่</span>
         <div className="border-b border-dotted border-black w-[150px] text-center relative h-6">
            <span className="absolute bottom-0 left-0 w-full">{formatDate(data.created_at)}</span>
         </div>
      </div>

      {/* Content */}
      <div className="space-y-4 mb-6">
         {/* Row 1 */}
         <div className="flex flex-wrap items-end gap-2">
            <span>ข้าพเจ้า</span>
            <div className="border-b border-dotted border-black flex-1 text-center font-bold text-blue-800 relative h-6 min-w-[200px]">
               <span className="absolute bottom-0 left-0 w-full">{data.receiver_name}</span>
            </div>
            <span>ผู้มีถิ่นฐานอยู่ตามบัตรประชาชนเลขที่</span>
            <div className="border-b border-dotted border-black w-[180px] text-center relative h-6">
               <span className="absolute bottom-0 left-0 w-full">{data.id_card_number}</span>
            </div>
         </div>

         {/* Row 2: Address */}
         <div className="flex flex-wrap items-end gap-2">
            <span>ที่อยู่</span>
            <div className="border-b border-dotted border-black flex-1 text-left px-2 relative h-6">
               <span className="absolute bottom-0 left-0 w-full">{data.address}</span>
            </div>
         </div>

         {/* Row 3: Company */}
         <div className="flex flex-wrap items-end gap-2">
            <span>ตามสำเนาแนบท้าย ได้รับเงินจาก</span>
            <span className="px-2">บริษัท ฮารุ ซิสเต็ม ดีเวล็อปเมนต์ (ไทยแลนด์) จำกัด</span>
         </div>

         {/* Row 4: Amount */}
         <div className="flex flex-wrap items-end gap-2">
            <span>เป็นจำนวนเงิน</span>
            <div className="border-b border-dotted border-black flex-1 text-center font-bold relative h-6">
               <span className="absolute bottom-0 left-0 w-full">{parseFloat(data.total_amount || 0).toLocaleString()}</span>
            </div>
            <span>บาท</span>
         </div>

         {/* Row 5: Payment Method */}
         <div className="flex flex-wrap items-center gap-4 mt-2">
            <span>ได้รับเงินเป็น</span>
            <div className="flex items-center gap-2">
                <div className={`w-5 h-5 border border-black flex items-center justify-center ${data.payment_method === 'cash' ? 'bg-black text-white' : ''}`}>
                    {data.payment_method === 'cash' && '✓'}
                </div>
                <span>เงินสด</span>
            </div>
            <div className="flex items-center gap-2">
                <div className={`w-5 h-5 border border-black flex items-center justify-center ${data.payment_method === 'transfer' ? 'bg-black text-white' : ''}`}>
                    {data.payment_method === 'transfer' && '✓'}
                </div>
                <span>โอนเงิน</span>
            </div>
            <span>ดังรายการต่อไปนี้</span>
         </div>
      </div>

      {/* Table */}
      <table className="w-full border-collapse border border-black mb-6">
         <thead>
            <tr className="text-center h-10">
               <th className="border border-black w-[10%]">ลำดับ</th>
               <th className="border border-black w-[40%]">รายการ</th>
               <th className="border border-black w-[10%]">จำนวน</th>
               <th className="border border-black w-[10%]">หน่วย</th>
               <th className="border border-black w-[15%]">ราคาต่อหน่วย</th>
               <th className="border border-black w-[15%]">รวมเป็นเงิน</th>
            </tr>
         </thead>
         <tbody>
            {items.map((item, index) => (
              <tr key={index} className="h-8 align-top">
                 <td className="border border-black text-center">{index + 1}</td>
                 <td className="border border-black px-2">{item.name}</td>
                 <td className="border border-black text-center">{item.quantity}</td>
                 <td className="border border-black text-center">{item.unit}</td>
                 <td className="border border-black text-right px-2">{parseFloat(item.price || 0).toLocaleString()}</td>
                 <td className="border border-black text-right px-2">{parseFloat(item.total || 0).toLocaleString()}</td>
              </tr>
            ))}
            {/* Empty Rows */}
            {[...Array(emptyRows)].map((_, i) => (
               <tr key={`empty-${i}`} className="h-8">
                  <td className="border border-black"></td><td className="border border-black"></td>
                  <td className="border border-black"></td><td className="border border-black"></td>
                  <td className="border border-black"></td><td className="border border-black"></td>
               </tr>
            ))}
         </tbody>
         <tfoot>
            <tr className="h-10">
               <td colSpan="2" className="border border-black px-2 font-bold text-right">รวมเป็นเงิน / Total</td>
               <td colSpan="4" className="border border-black px-2 text-right text-lg">
                  {parseFloat(data.total_amount || 0).toLocaleString()}
               </td>
            </tr>
            <tr className="h-10">
               <td colSpan="6" className="border border-black px-2 text-center italic">
                  ( {data.total_text || '...........................................................................'} )
               </td>
            </tr>
         </tfoot>
      </table>

      {/* Footer Text */}
      <div className="mb-8 leading-relaxed text-sm">
         <p className="indent-8">
            เนื่องจาก ข้าพเจ้าเป็นบุคคลธรรมดา ไม่ต้องจดทะเบียนการค้า และภาษีมูลค่าเพิ่ม จึงออกใบสำคัญรับเงินฉบับนี้ 
            เพื่อเป็นหลักฐานในการรับเงิน แทนใบเสร็จรับเงิน
         </p>
         <p className="indent-8 mt-2">
            ขอรับรองว่า ข้อความข้างต้นเป็นความจริงทุกประการ
         </p>
      </div>

      {/* Signatures */}
      <div className="flex justify-between items-start mt-12 px-8">
         
         {/* ผู้จ่ายเงิน (Staff) */}
         <div className="text-center w-[40%]">
             <div className="border-b border-dotted border-black h-10 mb-2 flex items-end justify-center">
                 {data.payer_signature && <img src={data.payer_signature} className="h-10 object-contain" alt="sig" />}
             </div>
             <div>ผู้จ่ายเงิน</div>
             <div className="text-xs text-gray-500">(เจ้าหน้าที่บริษัท)</div>
         </div>

         {/* ผู้รับเงิน (Receiver) */}
         <div className="text-center w-[40%]">
             <div className="border-b border-dotted border-black h-10 mb-2"></div>
             <div>ผู้รับเงิน</div>
             <div className="text-xs text-gray-500">(ลงชื่อผู้รับเงินตามบัตรประชาชน)</div>
         </div>

      </div>

      <div className="absolute bottom-[10mm] left-[20mm] right-[20mm] text-[10px] text-gray-500 text-center">
        ** เอกสารฉบับใช้ทดแทนกรณีที่ไม่สามารถออกใบเสร็จรับเงินได้ และผู้รับเงินยินยอมให้ใช้ข้อมูลบัตรประชาชน เป็นหลักฐานการรับเงิน
      </div>

    </div>
  )
}