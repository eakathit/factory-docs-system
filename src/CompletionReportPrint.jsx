// src/CompletionReportPrint.jsx
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Printer, ChevronLeft } from 'lucide-react'

const CompletionReportPrint = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  // รับข้อมูลจากหน้า Form หรือ History
  const data = location.state || {
    date: '',
    projectName: '',
    projectNo: '',
    location: '',
    finishTime: '',
    isComplete: false,
    remark: ''
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white p-4 md:p-8 font-sans">
      
      {/* Toolbar */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center print:hidden">
        <button 
          // แก้ไข: ส่งข้อมูลกลับไปที่หน้า Form (สมมติว่า path คือ /completion-report)
          onClick={() => navigate('/completion-report', { state: data })}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm text-gray-600 hover:bg-gray-50 border transition-colors"
        >
          <ChevronLeft size={18} /> กลับแก้ไข
        </button>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 font-medium transition-colors"
        >
          <Printer size={18} /> สั่งพิมพ์ (Print)
        </button>
      </div>

      {/* A4 Paper Container */}
      <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white shadow-2xl print:shadow-none p-[15mm] text-black leading-tight relative">
        
        {/* === HEADER === */}
        <div className="mb-4">
          <div className="flex justify-between items-start mb-2">
             <div className="w-[40%] pt-2">
                <h1 className="text-[9px] tracking-wide">HARU SYSTEM DEVELOPMENT (THAILAND) CO.,LTD.</h1>
                <p className="text-[9px]">47/20 M.1. KLONPRAWET, BANPHO. CHACHOENGSAO 24140</p>
                <p className="text-[9px]">TEL: 038-086-341, FAX: 038-086-342</p>
             </div>

             <div className="w-[20%] flex justify-center items-center">
                <img src="/logo.png" alt="Company Logo" className="h-16 w-auto object-contain" />
             </div>

             <div className="w-[50%] text-right pt-2">
                <h2 className="text-[9px]">บริษัท ฮารุ ซิสเต็ม ดีเวล็อปเมนท์ (ไทยแลนด์) จำกัด</h2>
                <p className="text-[9px]">47/20 หมู่ 1 ตำบลคลองประเวศ อำเภอบ้านโพธิ์ จังหวัดฉะเชิงเทรา 24140</p>
                <p className="text-[9px]">โทร : 038-086-341, แฟ็กซ์ : 038-086-342</p>
             </div>
          </div>

          <div className="border border-black p-3 mb-6">
            <h1 className="text-center uppercase leading-none">
              工事完了報告書 / CONSTRUCTION COMPLETION REPORT / <span className="font-normal">รายงานเสร็จสิ้นโครงการ</span>
            </h1>
          </div>
        </div>

        {/* === BODY TEXT === */}
        <div className="mb-6 text-[13px] space-y-1 leading-relaxed text-gray-800">
            <p>下記工事について、自主検査及び社内検査における是正事項を処置し、工事を完了致しましたので、報告致します。</p>
            <p>For the following construction, treated matters in-house testing and corrective self-inspection. Since construction was completed, we will report.</p>
            <p>ตามที่ได้ตรวจสอบอย่างถูกต้องและทำการทดสอบภายใน เกี่ยวกับโครงการตามรายละเอียดข้างล่าง ทางบริษัทฯจึงขอรายงานเมื่อโครงการเสร็จสิ้น ดังนี้</p>
        </div>

        {/* === TABLE FORM === */}
        <div className="mt-6 text-sm font-sans">
            
            {/* Row 1: Place / Date */}
            <div className="flex gap-4 mb-4">
                <div className="w-[60%]">
                    <div className="text-[13px] text-center mb-1">工事場所 / Place / สถานที่โครงการ</div>
                    <div className="border border-black pl-3 h-10 flex items-center text-left bg-white overflow-hidden whitespace-nowrap text-ellipsis">
                        {data.location}
                    </div>
                </div>
                <div className="w-[40%]">
                    <div className="text-[13px] text-center mb-1">記入日 / Date / วันที่</div>
                    <div className="border border-black px-2 h-10 flex items-center justify-center bg-white">
                        {formatDate(data.date)}
                    </div>
                </div>
            </div>

            {/* Row 2: Project Name / Project No */}
            <div className="flex gap-4 mb-4">
                <div className="w-[60%]">
                    <div className="text-[13px] text-center mb-1">工事名 / Project Name / ชื่อโครงการ</div>
                    <div className="border border-black pl-3 h-10 flex items-center text-left bg-white overflow-hidden whitespace-nowrap text-ellipsis">
                        {data.projectName}
                    </div>
                </div>
                <div className="w-[40%]">
                    <div className="text-[13px]  text-center mb-1">工事番号 / Project No. / รหัส</div>
                    <div className="border border-black px-2 h-10 flex items-center justify-center bg-white">
                        {data.projectNo}
                    </div>
                </div>
            </div>

            {/* Row 3: Time / Checkbox */}
            {/* Row 3: Time / Checkbox */}
            <div className="flex gap-4 mb-4">
                {/* ฝั่งซ้าย 60% : Time (ข้อความและกรอบอยู่ในบรรทัดเดียวกัน) */}
                <div className="w-[60%] flex items-center gap-3">
                    {/* ข้อความ Label */}
                    <div className="text-[13px] whitespace-nowrap">
                        終わた時間 / Time / เวลา
                    </div>
                    
                    {/* กรอบสี่เหลี่ยม (ให้ขยายเต็มพื้นที่ที่เหลือ) */}
                    <div className="border border-black px-2 h-10 flex-grow flex items-center justify-center bg-white">
                        {data.finishTime} {data.finishTime ? 'น.' : ''}
                    </div>
                </div>

                <div className="w-[40%] flex flex-col justify-end">
                     <div className="h-10 flex items-center gap-6 pl-2">
                        <div className="flex items-center ml-3 gap-2">
                            <div className="w-5 h-5 border border-black flex items-center justify-center bg-white">
                                {data.isComplete && <span className="text-black font-bold text-sm">✓</span>}
                            </div>
                            <span className="text-[13px] font-bold">Complete</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border border-black flex items-center justify-center bg-white">
                                {!data.isComplete && <span className="text-black font-bold text-sm">✓</span>}
                            </div>
                            <span className="text-[13px] font-bold">Not Complete</span>
                        </div>
                     </div>
                </div>
            </div>

             {/* Row 4: Signature (New Line) */}
            <div className="flex gap-4 mb-4">
                {/* ฝั่งซ้าย 60% : ข้อความ Label */}
                <div className="w-[60%] flex flex-col justify-end items-end pb-4 pr-2">
                    <h3 className="mt-1 text-sm md:text-base leading-snug text-left">
                        工事完了承認サイン / Construction Completion <br />
                        Authorized Sign / ลายเซ็นต์อนุมัติเสร็จสิ้นโครงการ
                    </h3>
                </div>

                {/* ฝั่งขวา 40% : ช่องเซ็นชื่อ */}
                <div className="w-[40%]">
                    <div className="border border-black h-16 relative bg-white">
                        <div className="absolute bottom-2 left-0 w-full text-center">
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 5: Remark */}
            <div className="mb-4">
                <div className="text-[13px] mb-1">備考 / Remark / หมายเหตุ</div>
                <div className="border border-black p-2 min-h-[100px] whitespace-pre-wrap leading-normal text-left bg-white">
                    {data.remark}
                </div>
            </div>

        </div>

        {/* === FOOTER === */}
        <div className="mt-4 text-[13px] space-y-1 text-center">
            <p>ご協力ありがとうございました。今後とも何卒お引き立て賜りますようお願い申し上げます。</p>
            <p>Thank you for your cooperation. We hope you will be able to kindly continue in the future.</p>
            <p>ขอขอบคุณสำหรับความร่วมมือ และหวังว่าเราจะได้รับความกรุณาจากท่านอีกครั้งในอนาคต</p>
        </div>

      </div>

      <style type="text/css">
        {`
          @media print {
            body { background: white; -webkit-print-color-adjust: exact; }
            @page { size: A4; margin: 0; }
            .print\\:hidden { display: none !important; }
            .print\\:shadow-none { box-shadow: none !important; }
          }
        `}
      </style>
    </div>
  )
}

export default CompletionReportPrint