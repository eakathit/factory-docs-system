import { Check } from 'lucide-react'

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
}

/**
 * Shared A4 document layout for ใบสำคัญรับเงิน (single copy)
 * Used by ReceiptVoucherPreview (2 copies for print) and ReceiptVoucherForm (live preview)
 */
export default function ReceiptVoucherDocumentView({ doc }) {
  const items = doc?.items || []
  const emptyRows = Math.max(0, 4 - items.length)

  return (
    <div className="w-[210mm] min-w-[210mm] mx-auto bg-white px-[15mm] pt-[10mm] pb-[6mm] shadow-lg print:shadow-none font-sarabun text-[13px] leading-tight">

      {/* ── Header ─────────────────────────────────────────────── */}
      <h1 className="text-center text-[17px] font-normal mb-2">
        Receipt Voucher / ใบสำคัญรับเงิน
      </h1>

      {/* Date */}
      <div className="flex justify-end items-center gap-2 mb-2">
        <span>วันที่</span>
        <span className="border-b border-dotted border-black min-w-[150px] text-center px-2 inline-block">
          {formatDate(doc?.created_at)}
        </span>
      </div>

      {/* ── Info rows ──────────────────────────────────────────── */}
      <div className="space-y-1.5 mb-2">

        {/* ข้าพเจ้า + ID card */}
        <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
          <span className="whitespace-nowrap">ข้าพเจ้า</span>
          <span className="border-b border-dotted border-black flex-1 text-center px-2 min-w-[120px] inline-block">
            {doc?.receiver_name || ''}
          </span>
          <span className="whitespace-nowrap">ผู้มีถิ่นฐานอยู่ตามบัตรประชาชนเลขที่</span>
          <span className="border-b border-dotted border-black w-[130px] text-center px-2 inline-block">
            {doc?.id_card_number || ''}
          </span>
        </div>

        {/* ที่อยู่ */}
        <div className="flex items-end gap-2">
          <span className="whitespace-nowrap">ที่อยู่</span>
          <span className="border-b border-dotted border-black flex-1 px-2 inline-block">
            {doc?.address || ''}
          </span>
        </div>

        {/* ตามสำเนาแนบท้าย */}
        <div className="flex flex-wrap items-end gap-x-1 gap-y-0.5">
          <span>ตามสำเนาแนบท้าย ได้รับเงินจาก</span>
          <span className="font-medium">บริษัท ฮารุ ซิสเต็ม ดีเวล็อปเมนต์ (ไทยแลนด์) จำกัด</span>
          <span>เป็นจำนวนเงิน</span>
          <span className="border-b border-dotted border-black min-w-[80px] text-center px-2 inline-block">
            {doc?.total_amount ? Number(doc.total_amount).toLocaleString() : ''}
          </span>
          <span>บาท</span>
        </div>

        {/* วิธีรับเงิน */}
        <div className="flex items-center gap-4 pt-0.5">
          <span>ได้รับเงินเป็น</span>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 border border-black flex items-center justify-center flex-shrink-0">
              {doc?.payment_method === 'cash' && <Check size={11} strokeWidth={3} className="text-black" />}
            </div>
            <span>เงินสด</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 border border-black flex items-center justify-center flex-shrink-0">
              {doc?.payment_method === 'transfer' && <Check size={11} strokeWidth={3} className="text-black" />}
            </div>
            <span>โอนเงิน</span>
          </div>
          <span className="ml-2">ดังรายการต่อไปนี้</span>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────── */}
      <table className="w-full mb-2 text-[11px] border-collapse border border-black">
        <thead>
          <tr className="text-center h-7 border-b border-black">
            <th className="w-[8%] font-normal border-r border-black">ลำดับ</th>
            <th className="w-[44%] font-normal border-r border-black">รายการ</th>
            <th className="w-[10%] font-normal border-r border-black">จำนวน</th>
            <th className="w-[10%] font-normal border-r border-black">หน่วย</th>
            <th className="w-[13%] font-normal border-r border-black text-right px-2">ราคาต่อหน่วย</th>
            <th className="w-[15%] font-normal text-right px-2">รวมเป็นเงิน</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="h-6 align-top border-b border-black">
              <td className="text-center py-1 border-r border-black">{i + 1}</td>
              <td className="px-2 py-1 border-r border-black">{item.name}</td>
              <td className="text-center py-1 border-r border-black">{item.quantity}</td>
              <td className="text-center py-1 border-r border-black">{item.unit}</td>
              <td className="text-right px-2 py-1 border-r border-black">
                {item.price != null && item.price !== '' ? Number(item.price).toLocaleString() : ''}
              </td>
              <td className="text-right px-2 py-1">
                {item.total != null
                  ? Number(item.total).toLocaleString()
                  : (item.quantity && item.price
                    ? (Number(item.quantity) * Number(item.price)).toLocaleString()
                    : '')}
              </td>
            </tr>
          ))}
          {[...Array(emptyRows)].map((_, i) => (
            <tr key={`e-${i}`} className="h-6 border-b border-black">
              <td className="border-r border-black" />
              <td className="border-r border-black" />
              <td className="border-r border-black" />
              <td className="border-r border-black" />
              <td className="border-r border-black" />
              <td />
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="h-7">
            <td colSpan="2" className="border border-black px-2 text-center align-middle">
              รวมเป็นเงิน / Total
            </td>
            <td colSpan="4" className="border border-black px-2 text-right align-middle font-bold text-[12px]">
              {doc?.total_amount ? Number(doc.total_amount).toLocaleString() : ''}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* ── Certification ──────────────────────────────────────── */}
      <p className="text-[11px] mb-1.5 leading-relaxed">
        เนื่องจาก ข้าพเจ้าเป็นบุคคลธรรมดา ไม่ต้องจดทะเบียนการค้า และภาษีมูลค่าเพิ่ม
        จึงออกใบสำคัญรับเงินฉบับนี้ เพื่อเป็นหลักฐานในการรับเงิน แทนใบเสร็จรับเงิน
      </p>
      <p className="text-[11px] text-center mb-2">
        ขอรับรองว่า ข้อความข้างต้นเป็นความจริงทุกประการ
      </p>

      {/* ── Signatures ─────────────────────────────────────────── */}
      {/* payer_signature = form filler (ผู้รับเงิน, right)        */}
      {/* approver_signature = HR/Finance (ผู้จ่ายเงิน, left)      */}
      <div className="flex justify-between px-6 mt-2 gap-8">

        {/* ผู้จ่ายเงิน (left) — HR/Finance signs here during approval */}
        <div className="flex flex-col flex-1">
          <div className="h-12 flex items-end justify-center">
            {doc?.approver_signature && (
              <img src={doc.approver_signature} className="h-10 mix-blend-multiply" alt="payer sig" />
            )}
          </div>
          <div className="flex items-center gap-0.5 mt-1 text-sm">
            <span className="whitespace-nowrap">ลงชื่อ</span>
            <span className="flex-1 border-b border-dotted border-black mx-1 mb-0.5" />
            <span className="whitespace-nowrap">(ผู้จ่ายเงิน)</span>
          </div>
        </div>

        {/* ผู้รับเงิน (right) — form filler signs here */}
        <div className="flex flex-col flex-1">
          <div className="h-12 flex items-end justify-center">
            {doc?.payer_signature && (
              <img src={doc.payer_signature} className="h-10 mix-blend-multiply" alt="receiver sig" />
            )}
          </div>
          <div className="flex items-center gap-0.5 mt-1 text-sm">
            <span className="whitespace-nowrap">ลงชื่อ</span>
            <span className="flex-1 border-b border-dotted border-black mx-1 mb-0.5" />
            <span className="whitespace-nowrap">(ผู้รับเงิน)</span>
          </div>
        </div>
      </div>

      {/* ── Footer note ────────────────────────────────────────── */}
      <div
        className="mt-2 text-[10px] text-red-600 leading-relaxed pt-1.5 border-t border-black text-center"
        style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
      >
        ** เอกสารฉบับใช้ทดแทนกรณีที่ไม่สามารถออกใบเสร็จรับเงินได้
        และผู้รับเงินยินยอมให้ใช้ข้อมูลบัตรประชาชน เป็นหลักฐานการรับเงิน
      </div>
    </div>
  )
}
