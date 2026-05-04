const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB");
};

const CheckBox = ({ checked, label, className = "" }) => (
  <div className={`flex items-center gap-1.5 ${className}`}>
    <div className="w-3.5 h-3.5 border border-black flex items-center justify-center text-[13px] font-bold flex-shrink-0 print:border-black leading-none">
      {checked ? "✓" : ""}
    </div>
    <span className="text-[13px] text-black leading-none">{label}</span>
  </div>
);

export default function OperationReportDocumentView({ doc = {} }) {
  const rawOps = doc.operationPerson || doc.operation_person || "";
  const opsList = rawOps.split(",");
  const op1 = opsList[0]?.trim() || "";
  const op2 = opsList[1]?.trim() || "";
  const op3 = opsList[2]?.trim() || "";
  const op4 = opsList[3]?.trim() || "";

  const receivedInfoFrom = doc.receivedInfoFrom || doc.received_info_from;
  const receivedInfoDate = doc.receivedInfoDate || doc.received_info_date;
  const receivedInfoTime = doc.receivedInfoTime || doc.received_info_time;

  return (
    <div className="w-[210mm] min-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none p-[15mm] text-black leading-tight relative print:w-[210mm] print:max-w-[210mm] print:min-w-[210mm] print:overflow-hidden print:min-h-0 print:h-[290mm]">
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
                      {doc.jobNo || doc.job_no || "-"}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-[13px] px-2 py-1 text-right whitespace-nowrap align-middle">
                      ISSUED DATE
                    </td>
                    <td className="text-[13px] border border-black px-1 py-0.5 text-center w-[100px] min-w-[100px] align-middle leading-none">
                      {formatDate(doc.issuedDate || doc.issued_date)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="text-center py-1 mb-1">
        <h2 className="text-lg font-bold tracking-wider">OPERATION REPORT</h2>
      </div>

      <div className="flex border border-black mb-1.5">
        <div className="flex-1 grid grid-cols-2 gap-y-2 p-2">
          <div className="flex items-center">
            <CheckBox checked={doc.isWarranty} label="WARRANTY" />
          </div>
          <div className="flex items-center">
            <CheckBox checked={doc.isUrgent} label="URGENT SERVICE" />
          </div>
          <div className="flex items-center">
            <CheckBox checked={doc.isAfterService} label="AFTER SERVICE" />
          </div>
          <div className="flex items-center gap-2">
            <CheckBox checked={doc.isOther} label="OTHER" />
          </div>
        </div>

        <div className="w-[30%] border-l border-black p-2 pl-4">
          <div className="flex items-start gap-3">
            <div className="h-3.5 flex items-center">
              <span className="text-[13px] leading-none">EXPENSE</span>
            </div>
            <div className="flex flex-col gap-1">
              <CheckBox checked={doc.expense === "HAVE"} label="HAVE" />
              <CheckBox checked={doc.expense === "NO HAVE"} label="NO HAVE" />
            </div>
          </div>
        </div>
      </div>

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
                {doc.customerName || doc.customer_name}
              </div>
            </div>
            <div className="flex">
              <div className="w-32 bg-gray-50 print:bg-gray-50 p-1.5 border-r border-black flex items-center text-[13px]">
                CONTACT NAME
              </div>
              <div className="flex-1 p-1.5 flex items-center print:text-black text-[13px]">
                {doc.contactName || doc.contact_name}
              </div>
            </div>
          </div>

          <div className="w-1/2">
            <div className="flex border-b border-black">
              <div className="w-20 bg-gray-50 print:bg-gray-50 p-1.5 border-r border-black flex items-center text-[13px]">
                PLACE
              </div>
              <div className="flex-1 p-1.5 flex items-center print:text-black text-[13px]">
                {doc.place}
              </div>
            </div>
            <div className="flex">
              <div className="w-20 bg-gray-50 print:bg-gray-50 p-1.5 border-r border-black flex items-center text-[13px]">
                PROJECT
              </div>
              <div className="flex-1 p-1.5 flex items-center print:text-black text-[13px]">
                {doc.project}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex border border-black mb-1.5 text-xs">
        <div className="w-[40%] border-r border-black">
          <div className="flex border-b border-black">
            <div className="w-[128px] bg-gray-50 print:bg-gray-50 p-1.5 border-r border-black flex items-center text-[13px]">
              START TIME
            </div>
            <div className="flex-1 p-1.5 text-center flex items-center justify-center text-[13px]">
              {doc.startTime || doc.start_time}
            </div>
          </div>
          <div className="flex">
            <div className="w-[128px] bg-gray-50 print:bg-gray-50 p-1.5 border-r border-black flex items-center text-[13px]">
              FINISH TIME
            </div>
            <div className="flex-1 p-1.5 text-center flex items-center justify-center text-[13px]">
              {doc.finishTime || doc.finish_time}
            </div>
          </div>
        </div>

        <div className="w-[60%] flex">
          <div className="w-[25%] bg-gray-50 print:bg-gray-50 p-1 border-r border-black text-center text-[13px] leading-tight flex items-center justify-center">
            OPERATION<br />PERSON
          </div>
          <div className="flex-1 grid grid-cols-2 grid-rows-2">
            <div className="border-r border-b border-black flex items-center justify-center p-0.5 print:text-black text-[13px] text-center overflow-hidden break-words leading-tight">
              {op1}
            </div>
            <div className="border-b border-black flex items-center justify-center p-0.5 print:text-black text-[13px] text-center overflow-hidden break-words leading-tight">
              {op2}
            </div>
            <div className="border-r border-black flex items-center justify-center p-0.5 print:text-black text-[13px] text-center overflow-hidden break-words leading-tight">
              {op3}
            </div>
            <div className="flex items-center justify-center p-0.5 print:text-black text-[13px] text-center overflow-hidden break-words leading-tight">
              {op4}
            </div>
          </div>
        </div>
      </div>

      <div className="border border-black text-xs">
        <div className="border-b border-black min-h-[110px] flex flex-col">
          <div className="p-1 px-2 flex flex-wrap items-baseline gap-2">
            <span className="text-[13px]">PROBLEM</span>
            <div className="text-[13px]">
              (Received Info. From
              <span className="mx-1 px-1 border-b border-dotted border-black min-w-[120px] inline-block text-center print:text-black">
                {receivedInfoFrom || "............................"}
              </span>
              Date
              <span className="mx-1 px-1 border-b border-dotted border-black min-w-[80px] inline-block text-center print:text-black">
                {receivedInfoDate ? formatDate(receivedInfoDate) : "........................"}
              </span>
              Time
              <span className="mx-1 px-1 border-b border-dotted border-black min-w-[60px] inline-block text-center print:text-black">
                {receivedInfoTime || "........................."}
              </span>
              And Detail as below)
            </div>
          </div>
          <div className="flex-1 p-2 print:text-black whitespace-pre-wrap leading-relaxed text-[13px]">
            {doc.problem}
          </div>
        </div>

        <div className="border-b border-black min-h-[70px] flex flex-col">
          <div className="p-1 px-2 text-[13px]">REASON</div>
          <div className="flex-1 p-2 print:text-black whitespace-pre-wrap leading-relaxed text-[13px]">
            {doc.reason}
          </div>
        </div>

        <div className="border-b border-black min-h-[220px] flex flex-col">
          <div className="p-1 px-2 text-[13px]">DETAIL OF OPERATION OR SOLUTION</div>
          <div className="flex-1 p-2 print:text-black whitespace-pre-wrap leading-relaxed text-[13px]">
            {doc.solution}
          </div>
        </div>

        <div className="border-b border-black min-h-[70px] flex flex-col">
          <div className="p-1 px-2 text-[13px]">COMMENT</div>
          <div className="flex-1 p-2 print:text-black whitespace-pre-wrap leading-relaxed text-[13px]">
            {doc.comment}
          </div>
        </div>

        <div className="flex min-h-[100px]">
          <div className="w-1/2 border-r border-black flex flex-col">
            <div className="p-1 px-2 text-center text-[13px] border-b border-black bg-gray-50 print:bg-gray-50">ACKNOWLEDGE BY</div>
            <div className="flex-1 flex items-end justify-center pb-2" />
          </div>
          <div className="w-1/2 flex flex-col">
            <div className="p-1 px-2 text-[13px] text-center border-b border-black bg-gray-50 print:bg-gray-50">ISSUED BY</div>
            <div className="flex-1 flex items-end justify-center pb-2" />
          </div>
        </div>
      </div>
    </div>
  );
}
