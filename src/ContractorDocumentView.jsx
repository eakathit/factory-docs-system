const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "numeric",
    year: "2-digit",
  });
};

const calcHours = (start, end) => {
  if (!start || !end) return "";
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  if ([sh, sm, eh, em].some(Number.isNaN)) return "";
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  if (mins === 0) return "";
  return (mins / 60).toFixed(1).replace(".0", "");
};

const CheckBox = ({ checked }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      border: "1px solid black",
      width: 11,
      height: 11,
      minWidth: 11,
      fontSize: "8pt",
      fontWeight: "bold",
      lineHeight: 1,
    }}
  >
    {checked ? "✓" : ""}
  </span>
);

const BlankLine = ({ w = 60 }) => (
  <span
    style={{
      borderBottom: "1px dotted black",
      display: "inline-block",
      minWidth: w,
      width: w,
    }}
  >
    &nbsp;
  </span>
);

const MIN_ROWS = 10;

export default function ContractorDocumentView({ doc = {} }) {
  const items = doc.daily_items || [];
  const emptyRows = Math.max(0, MIN_ROWS - items.length);
  const totalDays = items.filter((item) => item.date).length;

  return (
    <div
      className="mx-auto bg-white shadow-2xl w-[210mm] min-w-[210mm] min-h-[297mm] print:shadow-none print:min-h-0 print:h-[290mm] print:overflow-hidden"
      style={{
        padding: "10mm 13mm",
        fontFamily: "Sarabun, TH Sarabun New, sans-serif",
        fontSize: "10.5pt",
        lineHeight: "1.45",
        color: "#000",
        boxSizing: "border-box",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "3px" }}>
        <div style={{ fontSize: "8.5pt", letterSpacing: "0.3px" }}>
          HARU SYSTEM DEVELOPMENT (THAILAND) CO.,LTD.
        </div>
        <div style={{ fontSize: "8.5pt", color: "#333" }}>
          47/20 M.1, KLONGPRAWET, BANPHO, CHACHOENGSAO 24140
        </div>
      </div>

      <div
        style={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "13pt",
          margin: "5px 0 6px",
        }}
      >
        ใบสั่งจ้างผู้รับเหมา / Technician supporter record
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end", gap: "6px", marginBottom: "8px" }}>
        <span>วันที่/ Date</span>
        <span style={{ borderBottom: "1px solid black", minWidth: "130px", textAlign: "center", display: "inline-block", paddingBottom: "1px" }}>
          {formatDate(doc.created_at)}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", marginBottom: "5px", flexWrap: "wrap" }}>
        <span style={{ whiteSpace: "nowrap" }}>ผู้รับเหมาชื่อ (นาย/นาง/นางสาว)</span>
        <span style={lineStyle({ flex: 1, minWidth: "120px" })}>{doc.contractor_name || ""}</span>
        <span style={{ whiteSpace: "nowrap", marginLeft: "8px" }}>เลขบัตรประชาชน</span>
        <span style={lineStyle({ minWidth: "140px" })}>{doc.id_card || ""}</span>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
        <span style={{ whiteSpace: "nowrap" }}>1. จ้างทำงานโปรเจ็คเลขที่</span>
        <span style={lineStyle({ minWidth: "150px" })}>{doc.doc_no || ""}</span>
        <span style={{ whiteSpace: "nowrap", marginLeft: "12px" }}>โดยมีผู้รับผิดชอบดูแลผู้รับเหมา คือ</span>
        <span style={lineStyle({ flex: 1, minWidth: "100px" })}>{doc.supervisor_name || ""}</span>
      </div>

      <div style={{ marginBottom: "3px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px", flexWrap: "wrap", marginBottom: "3px" }}>
          <span>2 . ค่าจ้างเป็นแบบ</span>
          <InlineCheck checked={doc.wage_type === "daily"} label="รายวัน" />
          <InlineCheck checked={doc.wage_type === "project"} label="ต่อโปรเจ็ค" />
          <span style={{ marginLeft: "10px" }}>เป็นจำนวนเงิน (เรทปกติ)</span>
          <span style={lineStyle({ minWidth: "70px" })}>{doc.wage_rate || ""}</span>
          <span>บาท ต่อ</span>
          <InlineCheck checked={doc.wage_type === "daily"} label="วัน" />
          <InlineCheck checked={doc.wage_type === "project"} label="งาน" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "7px", flexWrap: "wrap" }}>
          <span>โอที</span>
          <InlineCheck checked={doc.has_ot === true || doc.has_ot === "true"} label="มี" />
          <InlineCheck checked={!doc.has_ot || doc.has_ot === "false"} label="ไม่มี" />
          <span style={{ marginLeft: "10px" }}>โดยมีระยะเวลาตั้งแต่วันที่</span>
          <span style={lineStyle({ minWidth: "95px" })}>{formatDate(doc.start_date)}</span>
          <span>จนถึงวันที่</span>
          <span style={lineStyle({ minWidth: "95px" })}>{formatDate(doc.end_date)}</span>
        </div>
      </div>

      <div style={{ margin: "6px 0 5px" }}>
        <div style={{ marginBottom: "3px" }}>
          3. ตารางลงเวลา กรณีจ้างแบบรายวัน
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontSize: "9pt" }}>
          <thead>
            <tr style={{ textAlign: "center" }}>
              <TH w="10.5%">วันที่ทำงาน</TH>
              <TH w="8.5%">เริ่ม</TH>
              <TH w="8.5%">สิ้นสุด</TH>
              <TH w="8.5%">รวม</TH>
              <TH w="9%">โอทีเริ่ม</TH>
              <TH w="9%">โอทีสิ้นสุด</TH>
              <TH w="8.5%">รวมโอที</TH>
              <TH w="9%">ลงชื่อ</TH>
              <TH w="20%">รายละเอียดงาน</TH>
              <TH w="8.5%">ผู้รับผิดชอบ</TH>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} style={{ height: "29px", textAlign: "center" }}>
                <TD>{formatDate(item.date)}</TD>
                <TD>{item.start_time}</TD>
                <TD>{item.end_time}</TD>
                <TD>{calcHours(item.start_time, item.end_time)}</TD>
                <TD>{item.ot_start}</TD>
                <TD>{item.ot_end}</TD>
                <TD>{calcHours(item.ot_start, item.ot_end)}</TD>
                <TD></TD>
                <TD left>{item.detail}</TD>
                <TD>{item.responsible_person}</TD>
              </tr>
            ))}
            {Array.from({ length: emptyRows }).map((_, i) => (
              <tr key={`empty-${i}`} style={{ height: "29px" }}>
                {Array.from({ length: 10 }).map((__, j) => <TD key={j}></TD>)}
              </tr>
            ))}
            <tr style={{ height: "30px" }}>
              <td colSpan={3} style={tdSt({ center: true })}>รวม</td>
              <td colSpan={1} style={tdSt({ center: true })}>{totalDays > 0 ? totalDays : ""}</td>
              <td colSpan={2} style={tdSt({ center: true })}>วัน</td>
              <td colSpan={1} style={tdSt()}></td>
              <td colSpan={3} style={tdSt({ note: true })}>
                หมายเหตุ : ค่าจ้างและค่าใช้จ่ายทั้งหมด จะถูกหัก ณ<br />
                ที่จ่าย 3%
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginBottom: "6px", fontSize: "10pt" }}>
        <div style={{ marginBottom: "4px" }}>4. ค่าใช้จ่ายนอกจาก ค่าจ้าง</div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", flexWrap: "wrap" }}>
          <CheckBox checked={!!doc.has_accom} />
          <span>ค่าที่พัก เป็นเงิน</span>
          <span style={dotLineStyle()}>{doc.has_accom && doc.accom_rate ? doc.accom_rate : ""}</span>
          <span>บาท ต่อ</span>
          <CheckBox checked={doc.has_accom && doc.accom_unit !== "job"} />
          <span>วัน</span>
          <CheckBox checked={doc.has_accom && doc.accom_unit === "job"} />
          <span>งาน</span>
          <span style={{ marginLeft: "24px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <CheckBox checked={!doc.has_accom} />
            <span>ไม่มี</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          <CheckBox checked={!!doc.has_travel} />
          <span>ค่าเดินทาง เป็นเงิน</span>
          <span style={dotLineStyle()}>{doc.has_travel && doc.travel_rate ? doc.travel_rate : ""}</span>
          <span>บาท ต่อ</span>
          <CheckBox checked={doc.has_travel && doc.travel_unit !== "job"} />
          <span>วัน</span>
          <CheckBox checked={doc.has_travel && doc.travel_unit === "job"} />
          <span>งาน</span>
          <span style={{ marginLeft: "24px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <CheckBox checked={!doc.has_travel} />
            <span>ไม่มี</span>
          </span>
        </div>
      </div>

      <div style={{ display: "flex", gap: "20px", marginBottom: "0", marginTop: "20px" }}>
        <SignBox label="ผู้รับเหมา" />
        <SignBox label="ผู้รับผิดชอบโปรเจ็ค" />
      </div>

      <div style={{ borderTop: "2px dashed #666", margin: "14px 0 10px" }} />

      <div style={{ fontSize: "10pt" }}>
        <div style={{ fontWeight: "bold", marginBottom: "3px" }}>ตารางสรุปค่าจ้างงาน</div>
        <div style={{ marginBottom: "4px", fontSize: "9.5pt" }}>จำนวนวันทำงาน</div>
        <div style={{ display: "flex", gap: "24px", marginBottom: "8px" }}>
          <SummaryTable title="วันธรรมดา" otLabel="ชม.ล่วงเวลา" otSuffix="บาท (*1.5)" />
          <SummaryTable title="วันหยุด" otLabel="ชม.ล่วงเวลา" otSuffix="บาท (*3)" daySuffix="บาท (*2)" />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: "16px" }}>
          <div style={{ width: "60%", display: "flex", flexDirection: "column", gap: "10px" }}>
            <AmountLine label="ยอดรวมทั้งสิ้น" />
            <AmountLine label="ยอดหัก ณ ที่จ่าย รวม" />
            <AmountLine label="ยอดสุทธิ" />
          </div>
          <div style={{ width: "130px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: "100%", height: "70px", border: "1px solid black" }}></div>
            <div style={{ fontSize: "10pt", marginTop: "6px" }}>การเงิน</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InlineCheck({ checked, label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
      <CheckBox checked={checked} />
      <span>{label}</span>
    </span>
  );
}

function lineStyle(extra = {}) {
  return {
    borderBottom: "1px solid black",
    textAlign: "center",
    display: "inline-block",
    paddingBottom: "1px",
    ...extra,
  };
}

function dotLineStyle() {
  return {
    borderBottom: "1px dotted black",
    minWidth: "65px",
    textAlign: "center",
    display: "inline-block",
  };
}

function TH({ children, w }) {
  return (
    <th
      style={{
        border: "1px solid black",
        padding: "3px 3px",
        textAlign: "center",
        fontWeight: "normal",
        width: w || "auto",
        lineHeight: "1.25",
        fontSize: "9pt",
        height: "27px",
        verticalAlign: "middle",
      }}
    >
      {children}
    </th>
  );
}

function TD({ children, left }) {
  return (
    <td
      style={{
        border: "1px solid black",
        padding: "2px 4px",
        textAlign: left ? "left" : "center",
        fontSize: "8.5pt",
        verticalAlign: "middle",
        lineHeight: "1.25",
        wordBreak: "break-word",
      }}
    >
      {children}
    </td>
  );
}

function tdSt({ center, note } = {}) {
  return {
    border: "1px solid black",
    padding: note ? "1px 4px" : "2px 4px",
    textAlign: center || note ? "center" : "left",
    fontSize: note ? "8.5pt" : "9pt",
    lineHeight: note ? "1.25" : "1.2",
    verticalAlign: "middle",
  };
}

function SignBox({ label }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", border: "1px solid black", height: "58px" }}></div>
      <div style={{ fontSize: "10pt", marginTop: "4px" }}>{label}</div>
    </div>
  );
}

function SummaryTable({ title, otLabel, otSuffix, daySuffix = "บาท" }) {
  return (
    <table style={{ flex: 1, borderCollapse: "collapse", fontSize: "9.5pt" }}>
      <tbody>
        <SummaryRow label={title} middle="วันๆละ" suffix={daySuffix} />
        <SummaryRow label={otLabel} middle="ชม.ๆละ" suffix={otSuffix} />
        <tr>
          <td style={{ border: "1px solid black", padding: "4px 8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>รวมทั้งสิ้น</span>
              <span style={{ display: "inline-flex", alignItems: "center" }}>
                <BlankLine w={113} />
                <span style={{ width: "75px", paddingLeft: "4px", whiteSpace: "nowrap" }}>บาท</span>
              </span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function SummaryRow({ label, middle, suffix }) {
  return (
    <tr>
      <td style={{ border: "1px solid black", padding: "4px 8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{label}</span>
          <span style={{ display: "inline-flex", alignItems: "center" }}>
            <BlankLine w={28} />
            <span style={{ width: "45px", textAlign: "center" }}>{middle}</span>
            <BlankLine w={40} />
            <span style={{ width: "75px", paddingLeft: "4px", whiteSpace: "nowrap" }}>{suffix}</span>
          </span>
        </div>
      </td>
    </tr>
  );
}

function AmountLine({ label }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
      <span>{label}</span>
      <span style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
        <BlankLine w={150} />
        <span style={{ width: "30px" }}>บาท</span>
      </span>
    </div>
  );
}
