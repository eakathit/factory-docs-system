// src/OperationReportPrint.jsx
import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Printer, ChevronLeft } from 'lucide-react'

const OperationReportPrint = () => {
  const location = useLocation()
  const data = location.state || {}

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB')
  }

  // Checkbox Component
  const CheckBox = ({ checked, label, className = '' }) => (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="w-3.5 h-3.5 border border-black flex items-center justify-center text-[10px] font-bold flex-shrink-0 print:border-black leading-none">
        {checked ? '✓' : ''}
      </div>
      <span className="text-[11px] font-bold text-black leading-none pt-0.5">{label}</span>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100 p-4 print:p-0 print:bg-white print:overflow-hidden">
      
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0; 
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          html, body {
            height: 100%;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden;
          }
        }
      `}</style>

      {/* Toolbar */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center print:hidden">
        <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors">
          <ChevronLeft size={20} />
          กลับหน้าหลัก
        </Link>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-all"
        >
          <Printer size={20} />
          สั่งพิมพ์ (Print)
        </button>
      </div>

      {/* A4 Container */}
      <div className="w-[210mm] min-h-[297mm] mx-auto bg-white p-[15mm] shadow-lg print:shadow-none print:w-[210mm] print:h-[297mm] print:p-[15mm] print:mx-0 print:my-0 text-black font-sans">
        
        {/* --- HEADER --- */}
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="align-top">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 flex-shrink-0">
                     <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h1 className="font-bold text-base leading-tight whitespace-nowrap tracking-tight">
                      HARU SYSTEM DEVELOPMENT (THAILAND) CO.,LTD.
                    </h1>
                    <p className="text-[11px] mt-1 whitespace-nowrap tracking-tight">
                      47/20 M.1, KLONGPRAWET, BANPHO, CHACHOENGSAO 24140
                    </p>
                  </div>
                </div>
              </td>

              <td className="align-bottom w-[1%] pb-1">
                <table className="border-collapse ml-auto bg-white">
                  <tbody>
                    <tr>
                      <td className="text-[10px] px-2 py-1 text-right whitespace-nowrap align-middle">
                        JOB NO.
                      </td>
                      <td className="text-[10px] border border-black px-1 py-0.5 text-center w-[100px] min-w-[100px] align-middle leading-none">
                        {data.jobNo || '-'}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-[10px] px-2 py-1 text-right whitespace-nowrap align-middle">
                        ISSUED DATE
                      </td>
                      <td className="text-[10px] border border-black px-1 py-0.5 text-center w-[100px] min-w-[100px] align-middle leading-none">
                        {formatDate(data.issuedDate)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        {/* --- TITLE --- */}
        <div className="text-center py-1 mb-1">
          <h2 className="text-lg font-bold tracking-wider">OPERATION REPORT</h2>
        </div>

        {/* =========================================
            กล่องที่ 1: Service Type & Expense (แยกออกมา)
           ========================================= */}
        <div className="flex border-2 border-black mb-1.5 text-xs">
            {/* ฝั่งซ้าย */}
            <div className="flex-1 grid grid-cols-2 gap-y-2 p-2">
              <div className="flex items-center">
                 <CheckBox checked={data.isWarranty} label="WARRANTY" />
              </div>
              <div className="flex items-center">
                 <CheckBox checked={data.isUrgent} label="URGENT SERVICE" />
              </div>
              <div className="flex items-center">
                 <CheckBox checked={data.isAfterService} label="AFTER SERVICE" />
              </div>
              <div className="flex items-center gap-2">
                 <CheckBox checked={data.isOther} label="OTHER" />
              </div>
            </div>

            {/* ฝั่งขวา (Expense) */}
            <div className="w-[40%] border-l-2 border-black p-2 flex flex-col justify-center pl-4">
               <span className="font-bold text-[10px] mb-1">EXPENSE</span>
               <div className="flex flex-col gap-1">
                  <CheckBox checked={data.expense === 'HAVE'} label="HAVE" />
                  <CheckBox checked={data.expense === 'NO HAVE'} label="NO HAVE" />
               </div>
            </div>
        </div>

        {/* =========================================
            กล่องที่ 2: Information & Details (แยกออกมา)
           ========================================= */}
        <div className="border-2 border-black text-xs">
          
          {/* INFORMATION Header */}
          <div className="bg-gray-200 print:bg-gray-200 border-b border-black text-center font-bold py-1 text-[11px]">
            INFORMATION
          </div>

          {/* Customer & Contact */}
          <div className="grid grid-cols-2 border-b border-black">
            <div className="flex border-r border-black">
              <div className="w-28 bg-gray-50 print:bg-gray-50 p-1.5 font-bold border-r border-black flex items-center text-[10px]">CUSTOMER NAME</div>
              <div className="flex-1 p-1.5 flex items-center text-blue-900 print:text-black font-medium break-words text-[11px]">
                {data.customerName}
              </div>
            </div>
            <div className="flex">
              <div className="w-28 bg-gray-50 print:bg-gray-50 p-1.5 font-bold border-r border-black flex items-center text-[10px]">CONTACT NAME</div>
              <div className="flex-1 p-1.5 flex items-center text-blue-900 print:text-black font-medium text-[11px]">
                {data.contactName}
              </div>
            </div>
          </div>

          {/* Time & Person */}
          <div className="grid grid-cols-2 border-b border-black">
            <div className="flex border-r border-black">
               <div className="flex-1 flex border-r border-black">
                  <div className="w-20 bg-gray-50 print:bg-gray-50 p-1.5 font-bold border-r border-black flex items-center text-[10px]">START TIME</div>
                  <div className="flex-1 p-1.5 text-center flex items-center justify-center font-medium text-[11px]">{data.startTime}</div>
               </div>
               <div className="flex-1 flex">
                  <div className="w-20 bg-gray-50 print:bg-gray-50 p-1.5 font-bold border-r border-black flex items-center text-[10px]">FINISH TIME</div>
                  <div className="flex-1 p-1.5 text-center flex items-center justify-center font-medium text-[11px]">{data.finishTime}</div>
               </div>
            </div>
            <div className="flex">
              <div className="w-28 bg-gray-50 print:bg-gray-50 p-1.5 font-bold border-r border-black flex items-center text-[10px]">OPERATION PERSON</div>
              <div className="flex-1 p-1.5 flex items-center text-blue-900 print:text-black font-medium text-[11px]">
                {data.operationPerson}
              </div>
            </div>
          </div>

          {/* PROBLEM */}
          <div className="border-b border-black min-h-[110px] flex flex-col">
            <div className="bg-gray-50 print:bg-gray-50 p-1 px-2 border-b border-black flex justify-between items-center">
              <span className="font-bold text-[10px]">PROBLEM</span>
              <div className="text-[10px] flex gap-3">
                 <span>(Received Info. From)</span>
                 <span>Date: <span className="ml-1 font-medium text-[11px]">{formatDate(data.receivedInfoDate)}</span></span>
                 <span>Time: <span className="ml-1 font-medium text-[11px]">{data.receivedInfoTime}</span></span>
              </div>
            </div>
            <div className="flex-1 p-2 text-blue-900 print:text-black whitespace-pre-wrap leading-relaxed text-[11px]">
              {data.problem}
            </div>
          </div>

          {/* REASON */}
          <div className="border-b border-black min-h-[70px] flex flex-col">
            <div className="bg-gray-50 print:bg-gray-50 p-1 px-2 border-b border-black font-bold text-[10px]">REASON</div>
            <div className="flex-1 p-2 text-blue-900 print:text-black whitespace-pre-wrap leading-relaxed text-[11px]">
              {data.reason}
            </div>
          </div>

          {/* SOLUTION */}
          <div className="border-b border-black min-h-[220px] flex flex-col">
            <div className="bg-gray-50 print:bg-gray-50 p-1 px-2 border-b border-black font-bold text-[10px]">DETAIL OF OPERATION OR SOLUTION</div>
            <div className="flex-1 p-2 text-blue-900 print:text-black whitespace-pre-wrap leading-relaxed text-[11px]">
              {data.solution}
            </div>
          </div>

          {/* COMMENT */}
          <div className="border-b border-black min-h-[70px] flex flex-col">
            <div className="bg-gray-50 print:bg-gray-50 p-1 px-2 border-b border-black font-bold text-[10px]">COMMENT</div>
            <div className="flex-1 p-2 text-blue-900 print:text-black whitespace-pre-wrap leading-relaxed text-[11px]">
              {data.comment}
            </div>
          </div>

           {/* PLACE / PROJECT */}
           <div className="border-b border-black flex">
            <div className="w-28 bg-gray-50 print:bg-gray-50 p-2 font-bold border-r border-black flex items-center text-[10px]">PLACE / PROJECT</div>
            <div className="flex-1 p-2 text-blue-900 print:text-black font-medium text-[11px]">
               {data.placeProject}
            </div>
          </div>

          {/* SIGNATURES */}
          <div className="flex min-h-[100px]">
            <div className="w-1/2 border-r border-black flex flex-col">
               <div className="p-1 px-2 text-[10px] font-bold border-b border-black bg-gray-50 print:bg-gray-50">ACKNOWLEDGE BY</div>
               <div className="flex-1 flex items-end justify-center pb-2">
                  <div className="text-center w-3/4 border-t border-dotted border-black pt-1">
                     <p className="text-[10px] text-gray-500">Customer Signature</p>
                  </div>
               </div>
            </div>
            <div className="w-1/2 flex flex-col">
               <div className="p-1 px-2 text-[10px] font-bold border-b border-black bg-gray-50 print:bg-gray-50">ISSUED BY</div>
               <div className="flex-1 flex items-end justify-center pb-2">
                  <div className="text-center w-3/4 border-t border-dotted border-black pt-1">
                     <p className="text-[10px] text-gray-500">Staff Signature</p>
                  </div>
               </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

export default OperationReportPrint