

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
  })
}

/**
 * Shared A4 document layout for ใบรับรองแทนใบเสร็จรับเงิน
 * Used by both ReceiptPrint (after save) and ReceiptForm (live preview)
 *
 * @param {{ doc: object }} props
 */
export default function ReceiptDocumentView({ doc }) {
  return (
    <div className="print-container w-[210mm] min-w-[210mm] mx-auto bg-white p-[20mm] shadow-lg print:shadow-none font-sarabun text-[16px] leading-relaxed relative min-h-[297mm]">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="text-center text-2xl mb-2">
          ใบรับรองแทนใบเสร็จรับเงิน
        </div>
        <div className="flex justify-end items-center text-lg mt-2">
          <span className="mr-2">เลขที่</span>
          <span className="border-b border-black border-dotted px-4 min-w-[120px] text-center">
            {doc.doc_no}
          </span>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────── */}
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
          {doc.items &&
            doc.items.map((item, index) => (
              <tr key={index} className="align-top h-8">
                <td className="border border-black text-center px-1">
                  {formatDate(item.date)}
                </td>
                <td className="border border-black px-2">{item.detail}</td>
                <td className="border border-black text-right px-2">
                  {item.amount !== '' && item.amount != null
                    ? parseFloat(item.amount).toLocaleString()
                    : ''}
                </td>
                <td className="border border-black text-center px-1">
                  {item.project_no}
                </td>
              </tr>
            ))}
          {[...Array(Math.max(0, 8 - (doc.items?.length || 0)))].map((_, i) => (
            <tr key={`empty-${i}`} className="h-8">
              <td className="border border-black" />
              <td className="border border-black" />
              <td className="border border-black" />
              <td className="border border-black" />
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="h-10">
            <td colSpan="2" className="align-middle px-2 py-2">
              <div className="flex items-center w-full justify-end gap-2 pr-2">
                <span>รวมทั้งสิ้น (ตัวอักษร)</span>
                <span className="border-b-2 border-dotted border-black min-w-[60%] text-center">
                  ({doc.total_text || '-'})
                </span>
              </div>
            </td>
            <td className="border border-black text-right px-2 align-middle text-lg">
              {doc.total_amount != null && doc.total_amount !== ''
                ? Number(doc.total_amount).toLocaleString()
                : '-'}
            </td>
            <td />
          </tr>
        </tfoot>
      </table>

      {/* ── Certification body ─────────────────────────────────── */}
      <div className="mt-8 space-y-4 px-4">
        <div className="flex flex-wrap items-end gap-2 leading-loose">
          <span>ข้าพเจ้า</span>
          <span className="border-b border-black border-dotted px-4 min-w-[200px] text-center">
            {doc.payer_name}
          </span>
          <span>(ผู้เบิกจ่าย)</span>
          <span className="ml-4">ตำแหน่ง</span>
          <span className="border-b border-black border-dotted px-4 min-w-[150px] text-center">
            {doc.position}
          </span>
        </div>

        <p className="indent-8 leading-loose mt-2">
          ขอรับรองว่า รายจ่ายข้างต้นนี้ไม่อาจเรียกเก็บใบเสร็จรับเงินจากผู้รับได้
          และข้าพเจ้าได้จ่ายไปในงานของทางร้านค้า (ชื่อร้านใน Shopee, lazada, etc)
          <span className="mx-2 border-b border-black border-dotted px-2 min-w-[180px] inline-block text-center">
            {doc.shop_name || ''}
          </span>
          โดยแท้
        </p>
      </div>

      {/* ── Signatures — side by side ────────────────────────── */}
      <div className="flex justify-between mt-12 px-4 gap-8">

        {/* ลายเซ็นผู้เบิกจ่าย (ซ้าย) */}
        <div className="flex flex-col flex-1">
          <div className="h-16 flex items-end justify-center">
            {doc.payer_signature && (
              <img src={doc.payer_signature} className="h-12" alt="signature" />
            )}
          </div>
          <div className="flex items-center gap-0.5 mt-2 text-sm">
            <span className="whitespace-nowrap">ลงชื่อ</span>
            <span className="flex-1 border-b border-dotted border-black min-w-[40px] mx-1" />
            <span className="whitespace-nowrap">(ผู้เบิกจ่าย)</span>
          </div>
        </div>

        {/* ลายเซ็นผู้อนุมัติ (ขวา) */}
        <div className="flex flex-col flex-1">
          <div className="h-16 flex items-end justify-center">
            {doc.approver_signature && (
              <img src={doc.approver_signature} className="h-12" alt="approver signature" />
            )}
          </div>
          <div className="flex items-center gap-0.5 mt-2 text-sm">
            <span className="whitespace-nowrap">ลงชื่อ</span>
            <span className="flex-1 border-b border-dotted border-black min-w-[40px] mx-1" />
            <span className="whitespace-nowrap">(ผู้อนุมัติ)</span>
          </div>
        </div>
      </div>

      {/* ── Footer note ────────────────────────────────────────── */}
      <div className="mt-6 px-0 text-[10px] text-red-600 leading-relaxed border-t border-black pt-3">
        ** เอกสารนี้ใช้ทดแทนเอกสารที่ไม่สามารถได้รับใบเสร็จรับเงินได้ สำหรับผู้ขายหรือผู้ให้บริการที่ไม่อยู่ในระบบภาษีมูลค่าเพิ่ม เพื่อใช้เป็นเอกสารประกอบการจ่ายเงิน เช่น shopee, lazada, tiktok
      </div>
    </div>
  )
}
