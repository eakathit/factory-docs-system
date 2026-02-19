// src/OperationReportPrint.jsx
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Printer, Edit3 } from 'lucide-react'

const OperationReportPrint = () => {
  const location = useLocation()
  const navigate = useNavigate() // เพิ่ม useNavigate
  const data = location.state || {}

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB')
  }

  // Checkbox Component
  const CheckBox = ({ checked, label, className = '' }) => (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="w-3.5 h-3.5 border border-black flex items-center justify-center text-[13px] font-bold flex-shrink-0 print:border-black leading-none">
        {checked ? '✓' : ''}
      </div>
      <span className="text-[13px] text-black leading-none">{label}</span>
    </div>
  )

  return (
    // 1. แก้ไข Outer Div: เพิ่ม print:min-h-0 print:h-auto print:block แก้หน้าว่างแผ่นที่สอง
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sarabun print:bg-white print:p-0 print:m-0 print:min-h-0 print:h-auto print:block">
      
      {/* Toolbar */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center print:hidden">
        {/* 2. เปลี่ยนปุ่มกลับหน้าหลัก เป็นปุ่ม "กลับไปแก้ไข" */}
        <button 
          onClick={() => navigate('/operation-report', { state: data })}
          className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-lg shadow-sm border border-gray-200 hover:bg-slate-50 transition-colors"
        >
          <Edit3 size={18} /> กลับไปแก้ไข
        </button>

        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors font-semibold"
        >
          <Printer size={18} /> สั่งพิมพ์เอกสาร
        </button>
      </div>

      {/* 3. Wrapper สำหรับมือถือ เพื่อให้เลื่อนซ้ายขวาได้ ไม่บีบกระดาษ */}
      <div className="w-full overflow-x-auto pb-4 print:overflow-visible print:pb-0">
        
        {/* 4. A4 Container ล็อคขนาด 210mm เสมอ และปรับ print:h-[290mm] หลบขอบมือถือ */}
        <div className="w-[210mm] min-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none p-[15mm] text-black leading-tight relative print:w-[210mm] print:max-w-[210mm] print:min-w-[210mm] print:overflow-hidden print:min-h-0 print:h-[290mm]">
          
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
                        <td className="text-[13px] px-2 py-1 text-right whitespace-nowrap align-middle">
                          JOB NO.
                        </td>
                        <td className="text-[13px] border border-black px-1 py-0.5 text-center w-[100px] min-w-[100px] align-middle leading-none">
                          {data.jobNo || '-'}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-[13px] px-2 py-1 text-right whitespace-nowrap align-middle">
                          ISSUED DATE
                        </td>
                        <td className="text-[13px] border border-black px-1 py-0.5 text-center w-[100px] min-w-[100px] align-middle leading-none">
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
              กล่องที่ 1: Service Type & Expense 
             ========================================= */}
          <div className="flex border border-black mb-1.5">
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

             <div className="w-[30%] border-l border-black p-2 pl-4"> 
                 <div className="flex items-start gap-3">
                    <div className="h-3.5 flex items-center">
                       <span className="text-[13px] leading-none">EXPENSE</span>
                    </div>

                    <div className="flex flex-col gap-1">
                        <CheckBox checked={data.expense === 'HAVE'} label="HAVE" />
                        <CheckBox checked={data.expense === 'NO HAVE'} label="NO HAVE" />
                    </div>
                 </div>
              </div>
          </div>

          {/* =========================================
              กล่องที่ 2: Information
             ========================================= */}
          <div className="border border-black mb-1.5 text-xs">
            <div className="bg-gray-50 print:bg-gray-50 border-b border-black text-center py-1 text-[13px]">
              INFORMATION
            </div>

            <div className="flex">
              <div className="w-1/2 border-r border-black">
                <div className="flex border-b border-black">
                  <div className="w-32 bg-gray-50 print:bg-gray-50 p-1.5 border-r border-black flex items-center text-[13px]">
                    CUSTOMER NAME
                  </div>
                  <div className="flex-1 p-1.5 flex items-center print:text-black break-words text-[13px]">
                    {data.customerName}
                  </div>
                </div>
                <div className="flex">
                  <div className="w-32 bg-gray-50 print:bg-gray-50 p-1.5 border-r border-black flex items-center text-[13px]">
                    CONTACT NAME
                  </div>
                  <div className="flex-1 p-1.5 flex items-center print:text-black text-[13px]">
                    {data.contactName}
                  </div>
                </div>
              </div>

              <div className="w-1/2">
                <div className="flex border-b border-black">
                  <div className="w-20 bg-gray-50 print:bg-gray-50 p-1.5 border-r border-black flex items-center text-[13px]">
                    PLACE
                  </div>
                  <div className="flex-1 p-1.5 flex items-center print:text-black text-[13px]">
                    {data.place}
                  </div>
                </div>
                <div className="flex">
                  <div className="w-20 bg-gray-50 print:bg-gray-50 p-1.5 border-r border-black flex items-center text-[13px]">
                    PROJECT
                  </div>
                  <div className="flex-1 p-1.5 flex items-center print:text-black text-[13px]">
                    {data.project}
                  </div>
                </div>
              </div>
            </div>
          </div>

         {/* =========================================
              กล่องที่ 3: Time & Person
             ========================================= */}
          <div className="flex border border-black mb-1.5 text-xs">
             <div className="w-[40%] border-r border-black">
                 <div className="flex border-b border-black">
                    <div className="w-[128px] bg-gray-50 print:bg-gray-50 p-1.5 border-r border-black flex items-center text-[13px]">
                      START TIME
                    </div>
                    <div className="flex-1 p-1.5 text-center flex items-center justify-center text-[13px]">
                      {data.startTime}
                    </div>
                 </div>
                 <div className="flex">
                    <div className="w-[128px] bg-gray-50 print:bg-gray-50 p-1.5 border-r border-black flex items-center text-[13px]">
                      FINISH TIME
                    </div>
                    <div className="flex-1 p-1.5 text-center flex items-center justify-center text-[13px]">
                      {data.finishTime}
                    </div>
                 </div>
             </div>

             <div className="w-[60%] flex">
                <div className="w-[25%] bg-gray-50 print:bg-gray-50 p-1 border-r border-black text-center text-[13px] leading-tight flex items-center justify-center">
                   OPERATION<br/>PERSON
                </div>
                <div className="flex-1 grid grid-cols-2 grid-rows-2">
                   <div className="border-r border-b border-black flex items-center justify-center p-0.5 print:text-black text-[13px] text-center overflow-hidden break-words leading-tight">
                      {data.operationPerson}
                   </div>
                   <div className="border-b border-black"></div>
                   <div className="border-r border-black"></div>
                   <div></div>
                </div>
             </div>
          </div>
          
          {/* =========================================
              กล่องที่ 4: Details
             ========================================= */}
          <div className="border border-black text-xs">
            
            <div className="border-b border-black min-h-[110px] flex flex-col">
              <div className="p-1 px-2 flex justify-start gap-1 items-center">
                <span className="text-[13px]">PROBLEM</span>
                <div className="text-[13px] flex gap-3">
                   <span>(Received Info. From)</span>
                   <span>Date: <span className="ml-1 text-[13px]">{formatDate(data.receivedInfoDate)}</span></span>
                   <span>Time: <span className="ml-1 text-[13px]">{data.receivedInfoTime}</span></span>
                </div>
              </div>
              <div className="flex-1 p-2 print:text-black whitespace-pre-wrap leading-relaxed text-[13px]">
                {data.problem}
              </div>
            </div>

            <div className="border-b border-black min-h-[70px] flex flex-col">
              <div className="p-1 px-2 text-[13px]">REASON</div>
              <div className="flex-1 p-2 print:text-black whitespace-pre-wrap leading-relaxed text-[13px]">
                {data.reason}
              </div>
            </div>

            <div className="border-b border-black min-h-[220px] flex flex-col">
              <div className="p-1 px-2 text-[13px]">DETAIL OF OPERATION OR SOLUTION</div>
              <div className="flex-1 p-2 print:text-black whitespace-pre-wrap leading-relaxed text-[13px]">
                {data.solution}
              </div>
            </div>

            <div className="border-b border-black min-h-[70px] flex flex-col">
              <div className="p-1 px-2 text-[13px]">COMMENT</div>
              <div className="flex-1 p-2 print:text-black whitespace-pre-wrap leading-relaxed text-[13px]">
                {data.comment}
              </div>
            </div>

            <div className="flex min-h-[100px]">
              <div className="w-1/2 border-r border-black flex flex-col">
                 <div className="p-1 px-2 text-center text-[13px] border-b border-black bg-gray-50 print:bg-gray-50">ACKNOWLEDGE BY</div>
                 <div className="flex-1 flex items-end justify-center pb-2">
                 </div>
              </div>
              <div className="w-1/2 flex flex-col">
                 <div className="p-1 px-2 text-[13px] text-center border-b border-black bg-gray-50 print:bg-gray-50">ISSUED BY</div>
                 <div className="flex-1 flex items-end justify-center pb-2">
                 </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 5. แก้ไข Style: ลบส่วนสูงของ html, body เพื่อกันหน้าว่าง */}
      <style type="text/css">
        {`
          @media print {
            @page { size: A4; margin: 0; }
            body { -webkit-print-color-adjust: exact; }
            html, body { height: auto !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; }
          }
        `}
      </style>
    </div>
  )
}

export default OperationReportPrint