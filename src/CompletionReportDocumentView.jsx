const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function CompletionReportDocumentView({ doc = {} }) {
  return (
    <div className="w-[210mm] min-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none p-[15mm] text-black leading-tight relative print:w-[210mm] print:max-w-[210mm] print:min-w-[210mm] print:overflow-hidden print:min-h-0 print:h-[290mm]">
      <div className="mb-4">
        <div className="flex justify-between items-start mb-2">
          <div className="w-[40%] pt-2">
            <h1 className="text-[9px] tracking-wide">
              HARU SYSTEM DEVELOPMENT (THAILAND) CO.,LTD.
            </h1>
            <p className="text-[9px]">
              47/20 M.1. KLONPRAWET, BANPHO. CHACHOENGSAO 24140
            </p>
            <p className="text-[9px]">TEL: 038-086-341, FAX: 038-086-342</p>
          </div>

          <div className="w-[20%] flex justify-center items-center">
            <img
              src="/logo.png"
              alt="Company Logo"
              className="h-16 w-auto object-contain"
            />
          </div>

          <div className="w-[40%] text-right pt-2">
            <h2 className="text-[9px]">
              บริษัท ฮารุ ซิสเต็ม ดีเวล็อปเมนท์ (ไทยแลนด์) จำกัด
            </h2>
            <p className="text-[9px] whitespace-nowrap tracking-tighter">
              47/20 หมู่ 1 ตำบลคลองประเวศ อำเภอบ้านโพธิ์ จังหวัดฉะเชิงเทรา
              24140
            </p>
            <p className="text-[9px]">
              โทร : 038-086-341, แฟ็กซ์ : 038-086-342
            </p>
          </div>
        </div>

        <div className="border border-black p-3 mb-6">
          <h1 className="text-center uppercase leading-none">
            工事完了報告書 / CONSTRUCTION COMPLETION REPORT /{" "}
            <span className="font-normal">รายงานเสร็จสิ้นโครงการ</span>
          </h1>
        </div>
      </div>

      <div className="mb-6 text-[13px] space-y-1 leading-relaxed text-gray-800">
        <p>
          下記工事について、自主検査及び社内検査における是正事項を処置し、工事を完了致しましたので、報告致します。
        </p>
        <p>
          For the following construction, treated matters in-house testing
          and corrective self-inspection. Since construction was completed,
          we will report.
        </p>
        <p>
          ตามที่ได้ตรวจสอบอย่างถูกต้องและทำการทดสอบภายใน
          เกี่ยวกับโครงการตามรายละเอียดข้างล่าง
          ทางบริษัทฯจึงขอรายงานเมื่อโครงการเสร็จสิ้น ดังนี้
        </p>
      </div>

      <div className="mt-6 text-sm font-sarabun">
        <div className="flex gap-4 mb-4">
          <div className="w-[60%]">
            <div className="text-[13px] text-center mb-1">
              工事場所 / Place / สถานที่โครงการ
            </div>
            <div className="border border-black pl-3 h-10 flex items-center text-left bg-white overflow-hidden whitespace-nowrap text-ellipsis">
              {doc.location}
            </div>
          </div>
          <div className="w-[40%]">
            <div className="text-[13px] text-center mb-1">
              記入日 / Date / วันที่
            </div>
            <div className="border border-black px-2 h-10 flex items-center justify-center bg-white">
              {formatDate(doc.date)}
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <div className="w-[60%]">
            <div className="text-[13px] text-center mb-1">
              工事名 / Project Name / ชื่อโครงการ
            </div>
            <div className="border border-black pl-3 h-10 flex items-center text-left bg-white overflow-hidden whitespace-nowrap text-ellipsis">
              {doc.projectName}
            </div>
          </div>
          <div className="w-[40%]">
            <div className="text-[13px] text-center mb-1">
              工事番号 / Project No. / รหัส
            </div>
            <div className="border border-black px-2 h-10 flex items-center justify-center bg-white">
              {doc.projectNo}
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <div className="w-[60%] flex items-center gap-3">
            <div className="text-[13px] whitespace-nowrap">
              終わた時間 / Time / เวลา
            </div>
            <div className="border border-black px-2 h-10 flex-grow flex items-center justify-center bg-white">
              {doc.finishTime} {doc.finishTime ? "น." : ""}
            </div>
          </div>

          <div className="w-[40%] flex flex-col justify-end">
            <div className="h-10 flex items-center gap-6 pl-2">
              <div className="flex items-center ml-3 gap-2">
                <div className="w-5 h-5 border border-black flex items-center justify-center bg-white">
                  {doc.isComplete && (
                    <span className="text-black font-bold text-sm">✓</span>
                  )}
                </div>
                <span className="text-[13px]">Complete</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border border-black flex items-center justify-center bg-white">
                  {!doc.isComplete && (
                    <span className="text-black font-bold text-sm">✓</span>
                  )}
                </div>
                <span className="text-[13px]">Not Complete</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-4 items-center">
          <div className="w-[60%] flex flex-col justify-center items-center">
            <h3 className="text-sm md:text-base leading-snug text-center">
              工事完了承認サイン / Construction Completion <br />
              Authorized Sign / ลายเซ็นต์อนุมัติเสร็จสิ้นโครงการ
            </h3>
          </div>
          <div className="w-[40%]">
            <div className="border border-black h-16 relative bg-white flex items-center justify-center overflow-hidden">
              {doc.approver_signature && (
                <img
                  src={doc.approver_signature}
                  alt="ลายเซ็นอนุมัติ"
                  className="max-w-full max-h-full object-contain mix-blend-multiply"
                />
              )}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-[13px] mb-1">備考 / Remark / หมายเหตุ</div>
          <div className="border border-black p-2 min-h-[100px] whitespace-pre-wrap leading-normal text-left bg-white">
            {doc.remark}
          </div>
        </div>
      </div>

      <div className="mt-4 text-[13px] space-y-1 text-center">
        <p>
          ご協力ありがとうございました。今後とも何卒お引き立て賜りますようお願い申し上げます。
        </p>
        <p>
          Thank you for your cooperation. We hope you will be able to kindly
          continue in the future.
        </p>
        <p>
          ขอขอบคุณสำหรับความร่วมมือ
          และหวังว่าเราจะได้รับความกรุณาจากท่านอีกครั้งในอนาคต
        </p>
      </div>
    </div>
  );
}
