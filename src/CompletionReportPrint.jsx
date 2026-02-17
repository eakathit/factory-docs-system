// src/CompletionReportPrint.jsx
import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Printer, ChevronLeft } from 'lucide-react'

const CompletionReportPrint = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  // รับข้อมูลจากหน้า Form (ถ้าไม่มีให้ใช้ค่าว่างเพื่อป้องกัน Error)
  const data = location.state || {
    date: '',
    projectName: '',
    projectNo: '',
    location: '',
    finishTime: '',
    isComplete: false,
    remark: ''
  }

  // Format วันที่ให้สวยงาม
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white p-4 md:p-8">
      
      {/* Toolbar - ซ่อนเวลาสั่งพิมพ์ */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center print:hidden">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm text-gray-600 hover:bg-gray-50 border"
        >
          <ChevronLeft size={18} /> กลับแก้ไข
        </button>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 font-medium"
        >
          <Printer size={18} /> สั่งพิมพ์ (Print)
        </button>
      </div>

      {/* A4 Paper Container */}
      <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white shadow-2xl print:shadow-none p-[15mm] md:p-[20mm] text-black leading-tight relative">
        
        {/* === HEADER === */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
             {/* Logo / Company Name EN */}
             <div className="w-[40%]">
                <h1 className="font-bold text-base">HARU SYSTEM DEVELOPMENT (THAILAND) CO.,LTD.</h1>
                <p className="text-xs">47/20 M.1. KLONPRAWET, BANPHO. CHACHOENGSAO 24140</p>
                <p className="text-xs">TEL: 038-086-341, FAX: 038-086-342</p>
             </div>

             {/* Center: Logo */}
             <div className="w-[20%] flex justify-center items-center">
                <img 
                  src="/logo.png" 
                  alt="Company Logo" 
                  className="h-20 w-auto object-contain" 
                />
             </div>

             {/* Company Name TH */}
             <div className="w-[40%] text-right">
                <h2 className="font-bold text-base">บริษัท ฮารุ ซิสเต็ม ดีเวล็อปเมนท์ (ไทยแลนด์) จำกัด</h2>
                <p className="text-xs">47/20 หมู่ 1 ตำบลคลองประเวศ อำเภอบ้านโพธิ์ จังหวัดฉะเชิงเทรา 24140</p>
                <p className="text-xs">โทร : 038-086-341, แฟ็กซ์ : 038-086-342</p>
             </div>
          </div>

          <div className="border-t-2 border-black my-4"></div>

          <h1 className="text-xl font-bold text-center mt-6 mb-2">
            工事完了報告書 / CONSTRUCTION COMPLETION REPORT / รายงานเสร็จสิ้นโครงการ
          </h1>
        </div>

        {/* === BODY TEXT === */}
        <div className="mb-6 text-sm space-y-2">
            <p>下記工事について、自主検査及び社内検査における是正事項を処置し、工事を完了致しましたので、報告致します。</p>
            <p>For the following construction, treated matters in-house testing and corrective self-inspection. Since construction was completed, we will report.</p>
            <p>ตามที่ได้ตรวจสอบอย่างถูกต้องและทำการทดสอบภายใน เกี่ยวกับโครงการตามรายละเอียดข้างล่าง ทางบริษัทฯจึงขอรายงานเมื่อโครงการเสร็จสิ้น ดังนี้</p>
        </div>

        {/* === TABLE FORM === */}
        <div className="border border-black">
            
            {/* Row 1: Place / Date */}
            <div className="flex border-b border-black">
                <div className="w-1/2 border-r border-black p-2">
                    <div className="text-xs text-gray-500 mb-1">工事場所/Place/สถานที่โครงการ</div>
                    <div className="font-medium pl-2">{data.location}</div>
                </div>
                <div className="w-1/2 p-2">
                    <div className="text-xs text-gray-500 mb-1">記入日/Date/ วันที่</div>
                    <div className="font-medium pl-2">{formatDate(data.date)}</div>
                </div>
            </div>

            {/* Row 2: Project Name / Project No */}
            <div className="flex border-b border-black">
                <div className="w-1/2 border-r border-black p-2">
                    <div className="text-xs text-gray-500 mb-1">工事名/Project Name/ ชื่อโครงการ</div>
                    <div className="font-medium pl-2">{data.projectName}</div>
                </div>
                <div className="w-1/2 p-2">
                    <div className="text-xs text-gray-500 mb-1">工事番号/Project No./ รหัส</div>
                    <div className="font-medium pl-2">{data.projectNo}</div>
                </div>
            </div>

            {/* Row 3: Time / Sign */}
            <div className="flex border-b border-black h-32">
                <div className="w-1/2 border-r border-black flex flex-col">
                    <div className="p-2 border-b border-black h-16">
                        <div className="text-xs text-gray-500 mb-1">終わた時間/Time/ เวลา</div>
                        <div className="font-medium pl-2">{data.finishTime} {data.finishTime ? 'น.' : ''}</div>
                    </div>
                    {/* Checkbox Complete */}
                    <div className="flex-1 flex items-center justify-around p-2">
                         <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 border border-black flex items-center justify-center ${data.isComplete ? 'bg-black text-white' : ''}`}>
                                {data.isComplete && '✓'}
                            </div>
                            <span className="font-bold">Complete</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 border border-black flex items-center justify-center ${!data.isComplete ? 'bg-black text-white' : ''}`}>
                                {!data.isComplete && '✓'}
                            </div>
                            <span className="font-bold">Not Complete</span>
                         </div>
                    </div>
                </div>
                <div className="w-1/2 p-2 relative">
                    <div className="text-xs text-gray-500 mb-1">工事完了承認サイン/ Construction Completion Authorized Sign / ลายเซ็นต์อนุมัติเสร็จสิ้นโครงการ</div>
                    {/* พื้นที่เซ็นชื่อ */}
                    <div className="absolute bottom-2 left-0 w-full text-center text-gray-400 text-xs">
                        (ลงนาม / Signature)
                    </div>
                </div>
            </div>

            {/* Row 4: Remark */}
            <div className="flex min-h-[150px]">
                <div className="w-full p-2">
                    <div className="text-xs text-gray-500 mb-1">備考/Remark/ หมายเหตุ</div>
                    <div className="font-medium p-2 whitespace-pre-wrap">{data.remark}</div>
                </div>
            </div>

        </div>

        {/* === FOOTER === */}
        <div className="mt-8 text-sm space-y-2 text-center text-gray-600">
            <p>ご協力ありがとうございました。今後とも何卒お引き立て賜りますようお願い申し上げます。</p>
            <p>Thank you for your cooperation. We hope you will be able to kindly continue in the future.</p>
            <p>ขอขอบคุณสำหรับความร่วมมือ และหวังว่าเราจะได้รับความกรุณาจากท่านอีกครั้งในอนาคต</p>
        </div>

      </div>

      <style type="text/css">
        {`
          @media print {
            body { 
                background: white; 
                -webkit-print-color-adjust: exact; 
            }
            @page { 
                size: A4; 
                margin: 0; 
            }
            .print\\:hidden { 
                display: none !important; 
            }
            .print\\:shadow-none {
                box-shadow: none !important;
            }
          }
        `}
      </style>
    </div>
  )
}

export default CompletionReportPrint