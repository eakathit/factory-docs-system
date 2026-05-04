import React from 'react'
import ReceiptVoucherDocumentView from './ReceiptVoucherDocumentView'

export default function ReceiptVoucherPreview({ data }) {
  return (
    <div className="w-[210mm] min-w-[210mm] bg-white font-sarabun shadow-lg print:shadow-none print:w-[210mm] print:m-0">

      {/* ใบที่ 1 — ต้นฉบับ */}
      <div className="border-b-2 border-dashed border-gray-400 overflow-hidden" style={{ height: '148.5mm' }}>
        <ReceiptVoucherDocumentView doc={data} />
      </div>

      {/* ใบที่ 2 — สำเนา */}
      <div className="overflow-hidden" style={{ height: '148.5mm' }}>
        <ReceiptVoucherDocumentView doc={data} />
      </div>

    </div>
  )
}
