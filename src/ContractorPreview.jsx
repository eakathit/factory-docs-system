import React from 'react'

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d)) return ''
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'numeric', year: '2-digit' })
}

/** คำนวณชั่วโมงระหว่าง HH:MM สองค่า (รองรับข้ามเที่ยงคืน) */
const calcHours = (start, end) => {
  if (!start || !end) return ''
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  let mins = (eh * 60 + em) - (sh * 60 + sm)
  if (mins < 0) mins += 24 * 60
  if (mins === 0) return ''
  return (mins / 60).toFixed(1).replace('.0', '')
}

/** ช่องขีดเส้นสำหรับใส่ข้อความ */
const Line = ({ value, width = 'flex-1', center = true, bold = false }) => (
  <span
    className={`border-b border-dotted border-black inline-block ${width} ${center ? 'text-center' : 'text-left px-1'} ${bold ? 'font-bold text-blue-900' : ''} relative`}
    style={{ minHeight: '1.1em', verticalAlign: 'bottom' }}
  >
    {value || ''}
  </span>
)

/** Checkbox ตามแบบฟอร์ม */
const Checkbox = ({ checked }) => (
  <span
    className="inline-flex items-center justify-center border border-black text-[9px] font-bold"
    style={{ width: 12, height: 12, minWidth: 12 }}
  >
    {checked ? '✓' : ''}
  </span>
)

// ── Main Component ────────────────────────────────────────────────────────────

const MIN_ROWS = 10 // จำนวนแถวขั้นต่ำในตาราง

export default function ContractorPreview({ data }) {
  const items = data.daily_items || []
  const wage = parseFloat(data.wage_rate) || 0

  // คำนวณ: วันธรรมดา / OT
  const normalRows = items.filter(i => i.date)
  const normalDays = normalRows.length

  // OT hours per row
  const otHoursList = items.map(i => {
    const h = parseFloat(calcHours(i.ot_start, i.ot_end)) || 0
    return h
  })
  const totalOtHours = otHoursList.reduce((a, b) => a + b, 0)

  // Rates
  const ratePerHourOT = wage > 0 ? (wage / 8 * 1.5) : 0
  const rateHolidayDay = wage > 0 ? wage * 2 : 0

  const normalTotal = normalDays * wage
  const otTotal = totalOtHours * ratePerHourOT

  // ค่าใช้จ่ายอื่น
  const accomRate = parseFloat(data.accom_rate) || 0
  const travelRate = parseFloat(data.travel_rate) || 0
  const accomTotal = data.has_accom ? accomRate : 0
  const travelTotal = data.has_travel ? travelRate : 0

  const grandTotal = normalTotal + otTotal + accomTotal + travelTotal
  const taxDeduct = data.deduct_tax ? grandTotal * 0.03 : 0
  const netTotal = grandTotal - taxDeduct

  // เติมแถวว่างให้ครบ MIN_ROWS
  const emptyRows = Math.max(0, MIN_ROWS - items.length)

  return (
    <div
      className="bg-white text-black"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '10mm 12mm',
        fontFamily: 'Sarabun, TH Sarabun New, sans-serif',
        fontSize: '11pt',
        lineHeight: '1.4',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >

      {/* ── Company Header ── */}
      <div style={{ textAlign: 'center', marginBottom: '4px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '12pt' }}>
          HARU SYSTEM DEVELOPMENT (THAILAND) CO.,LTD.
        </div>
        <div style={{ fontSize: '9pt', color: '#444' }}>
          47/20 M.1, KLONGPRAWET, BANPHO, CHACHOENGSAO 24140
        </div>
      </div>

      {/* ── Document Title ── */}
      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14pt', margin: '6px 0 8px' }}>
        ใบสั่งจ้างผู้รับเหมา / Technician supporter record
      </div>

      {/* ── Date ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', gap: '6px', marginBottom: '8px', fontSize: '11pt' }}>
        <span style={{ fontWeight: 'bold' }}>วันที่ / Date</span>
        <span style={{ borderBottom: '1px dotted black', minWidth: '120px', textAlign: 'center', display: 'inline-block' }}>
          {formatDate(data.created_at)}
        </span>
      </div>

      {/* ── ชื่อผู้รับเหมา ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', marginBottom: '6px' }}>
        <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>ผู้รับเหมาชื่อ (นาย/นาง/นางสาว)</span>
        <span style={{ borderBottom: '1px dotted black', flex: 1, textAlign: 'center', fontWeight: 'bold', color: '#1e3a8a', display: 'inline-block' }}>
          {data.contractor_name || ''}
        </span>
        <span style={{ whiteSpace: 'nowrap' }}>เลขบัตรประชาชน</span>
        <span style={{ borderBottom: '1px dotted black', minWidth: '130px', textAlign: 'center', letterSpacing: '2px', display: 'inline-block' }}>
          {data.id_card || ''}
        </span>
      </div>

      {/* ── ข้อ 1 ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', marginBottom: '6px' }}>
        <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>1. จ้างทำงานโปรเจ็คเลขที่</span>
        <span style={{ borderBottom: '1px dotted black', minWidth: '140px', textAlign: 'center', fontWeight: 'bold', display: 'inline-block' }}>
          {data.doc_no || ''}
        </span>
        <span style={{ whiteSpace: 'nowrap', marginLeft: '12px' }}>โดยมีผู้รับผิดชอบดูแลผู้รับเหมา คือ</span>
        <span style={{ borderBottom: '1px dotted black', flex: 1, textAlign: 'center', display: 'inline-block' }}>
          {data.supervisor_name || ''}
        </span>
      </div>

      {/* ── ข้อ 2: ค่าจ้าง ── */}
      <div style={{ marginBottom: '2px' }}>
        {/* บรรทัด 1 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
          <span style={{ fontWeight: 'bold' }}>2. ค่าจ้างเป็นแบบ</span>
          
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Checkbox checked={data.wage_type === 'daily'} />
            <span>รายวัน</span>
          </span>
          
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Checkbox checked={data.wage_type === 'project'} />
            <span>ต่อโปรเจ็ค</span>
          </span>

          <span style={{ marginLeft: '16px' }}>เป็นจำนวนเงิน (เรทปกติ)</span>
          <span style={{ borderBottom: '1px dotted black', minWidth: '70px', textAlign: 'center', fontWeight: 'bold', display: 'inline-block' }}>
            {data.wage_rate || ''}
          </span>
          <span>บาท ต่อ</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Checkbox checked={data.wage_type === 'daily'} />
            <span>วัน</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Checkbox checked={data.wage_type === 'project'} />
            <span>งาน</span>
          </span>
        </div>

        {/* บรรทัด 2 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 'bold' }}>โอที</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Checkbox checked={data.has_ot === true || data.has_ot === 'true'} />
            <span>มี</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Checkbox checked={!data.has_ot || data.has_ot === 'false'} />
            <span>ไม่มี</span>
          </span>

          <span style={{ marginLeft: '16px' }}>โดยมีระยะเวลาตั้งแต่วันที่</span>
          <span style={{ borderBottom: '1px dotted black', minWidth: '90px', textAlign: 'center', display: 'inline-block' }}>
            {formatDate(data.start_date)}
          </span>
          <span>จนถึงวันที่</span>
          <span style={{ borderBottom: '1px dotted black', minWidth: '90px', textAlign: 'center', display: 'inline-block' }}>
            {formatDate(data.end_date)}
          </span>
        </div>
      </div>

      {/* ── ข้อ 3: ตารางลงเวลา ── */}
      <div style={{ margin: '8px 0 6px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '3px', fontSize: '10.5pt' }}>
          3. ตารางลงเวลา กรณีจ้างแบบรายวัน
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5pt' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', textAlign: 'center' }}>
              <TH w="11%">วันที่ทำงาน</TH>
              <TH w="7%">เริ่ม</TH>
              <TH w="7%">สิ้นสุด</TH>
              <TH w="6%">รวม<br />(ชม.)</TH>
              <TH w="7%">โอที<br />เริ่ม</TH>
              <TH w="7%">โอที<br />สิ้นสุด</TH>
              <TH w="6%">รวม<br />โอที</TH>
              <TH w="9%">ลงชื่อ</TH>
              <TH>รายละเอียดงาน</TH>
              <TH w="10%">ผู้รับผิดชอบ</TH>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} style={{ height: '20px', textAlign: 'center' }}>
                <TD>{formatDate(item.date)}</TD>
                <TD>{item.start_time}</TD>
                <TD>{item.end_time}</TD>
                <TD>{calcHours(item.start_time, item.end_time)}</TD>
                <TD>{item.ot_start}</TD>
                <TD>{item.ot_end}</TD>
                <TD>{calcHours(item.ot_start, item.ot_end) || ''}</TD>
                <TD></TD>
                <TD left>{item.detail}</TD>
                <TD></TD>
              </tr>
            ))}

            {/* แถวว่าง */}
            {Array.from({ length: emptyRows }).map((_, i) => (
              <tr key={`e${i}`} style={{ height: '20px' }}>
                {Array.from({ length: 10 }).map((__, j) => <TD key={j}></TD>)}
              </tr>
            ))}

            {/* แถวรวม */}
            <tr style={{ background: '#f8fafc' }}>
              <td colSpan={2} style={tdStyle({ center: true, fontWeight: 'bold' })}>รวม</td>
              <td colSpan={2} style={tdStyle({ center: true, fontWeight: 'bold' })}>{normalDays > 0 ? `${normalDays} วัน` : ''}</td>
              <td colSpan={3} style={tdStyle({ center: true })}></td>
              <td colSpan={3} style={tdStyle({ fontSize: '7.5pt', color: '#555' })}>
                หมายเหตุ : ค่าจ้างและค่าใช้จ่ายทั้งหมด จะถูกหัก ณ ที่จ่าย 3%
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ══════════════════════════════════════════════════════════
           ข้อ 4: ค่าใช้จ่ายนอกจากค่าจ้าง
      ══════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: '6px', fontSize: '10pt' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>4. ค่าใช้จ่ายนอกจาก ค่าจ้าง</div>

        {/* ── บรรทัดที่ 1: ค่าที่พัก ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <Checkbox checked={!!data.has_accom} />
          <span>ค่าที่พัก เป็นเงิน</span>
          <span style={{ borderBottom: '1px dotted black', minWidth: '60px', textAlign: 'center', display: 'inline-block', paddingBottom: '1px' }}>
            {data.has_accom ? (data.accom_rate || '') : ''}
          </span>
          <span>บาท ต่อ</span>
          <Checkbox checked={data.has_accom && data.accom_unit !== 'job'} />
          <span>วัน</span>
          <Checkbox checked={data.has_accom && data.accom_unit === 'job'} />
          <span>งาน</span>
          <span style={{ marginLeft: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Checkbox checked={!data.has_accom} />
            <span>ไม่มี</span>
          </span>
        </div>

        {/* ── บรรทัดที่ 2: ค่าเดินทาง ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Checkbox checked={!!data.has_travel} />
          <span>ค่าเดินทาง เป็นเงิน</span>
          <span style={{ borderBottom: '1px dotted black', minWidth: '60px', textAlign: 'center', display: 'inline-block', paddingBottom: '1px' }}>
            {data.has_travel ? (data.travel_rate || '') : ''}
          </span>
          <span>บาท ต่อ</span>
          <Checkbox checked={data.has_travel && data.travel_unit !== 'job'} />
          <span>วัน</span>
          <Checkbox checked={data.has_travel && data.travel_unit === 'job'} />
          <span>งาน</span>
          <span style={{ marginLeft: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Checkbox checked={!data.has_travel} />
            <span>ไม่มี</span>
          </span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
           กล่องลายเซ็น 2 กล่อง (ผู้รับเหมา | ผู้รับผิดชอบโปรเจ็ค)
      ══════════════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '0px' }}>
        {/* กล่องผู้รับเหมา */}
        <div style={{
          flex: 1, border: '1px solid black',
          height: '60px', display: 'flex', alignItems: 'flex-end',
          justifyContent: 'center', paddingBottom: '4px',
          fontSize: '10pt',
        }}>
          ผู้รับเหมา
        </div>
        {/* กล่องผู้รับผิดชอบโปรเจ็ค */}
        <div style={{
          flex: 1, border: '1px solid black',
          height: '60px', display: 'flex', alignItems: 'flex-end',
          justifyContent: 'center', paddingBottom: '4px',
          fontSize: '10pt',
        }}>
          ผู้รับผิดชอบโปรเจ็ค
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
           เส้นประคั่นกลางหน้า
      ══════════════════════════════════════════════════════════ */}
      <div style={{
        borderTop: '2px dashed #555',
        margin: '10px 0 8px',
        position: 'relative',
      }} />

      {/* ══════════════════════════════════════════════════════════
           ตารางสรุปค่าจ้างงาน — เหมือนต้นฉบับทุก cell
      ══════════════════════════════════════════════════════════ */}
      <div style={{ fontSize: '10pt' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>ตารางสรุปค่าจ้างงาน</div>
        <div style={{ marginBottom: '3px' }}>จำนวนวันทำงาน</div>

        {/* ─── ตาราง 2 คอลัมน์หลัก ─── */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5pt' }}>
          <tbody>

            {/* ── แถว 1: วันธรรมดา | วันหยุด ── */}
            <tr>
              {/* ซ้าย: วันธรรมดา */}
              <td style={summaryTd()}>
                <div style={summaryInner()}>
                  <span>วันธรรมดา</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <DotLine val={normalDays > 0 ? normalDays : ''} w={28} />
                    <span>วันๆละ</span>
                    <DotLine val={wage > 0 ? wage : ''} w={50} right />
                    <span>บาท</span>
                  </span>
                </div>
              </td>

              {/* ขวา: วันหยุด */}
              <td style={summaryTd()}>
                <div style={summaryInner()}>
                  <span>วันหยุด</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <DotLine val="" w={28} />
                    <span>วันๆละ</span>
                    <DotLine val={wage > 0 ? rateHolidayDay : ''} w={50} right />
                    <span>บาท (*2)</span>
                  </span>
                </div>
              </td>
            </tr>

            {/* ── แถว 2: OT วันธรรมดา | OT วันหยุด ── */}
            <tr>
              {/* ซ้าย: ชม.ล่วงเวลา */}
              <td style={summaryTd()}>
                <div style={summaryInner()}>
                  <span>ชม.ล่วงเวลา</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <DotLine val={totalOtHours > 0 ? totalOtHours : ''} w={28} />
                    <span>ชม.ๆละ</span>
                    <DotLine val={wage > 0 ? ratePerHourOT.toFixed(0) : ''} w={50} right />
                    <span>บาท (*1.5)</span>
                  </span>
                </div>
              </td>

              {/* ขวา: ชม.ล่วงเวลา วันหยุด */}
              <td style={summaryTd()}>
                <div style={summaryInner()}>
                  <span>ชม.ล่วงเวลา</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <DotLine val="" w={28} />
                    <span>ชม.ๆละ</span>
                    <DotLine val={wage > 0 ? (wage / 8 * 3).toFixed(0) : ''} w={50} right />
                    <span>บาท (*3)</span>
                  </span>
                </div>
              </td>
            </tr>

            {/* ── แถว 3: รวมทั้งสิ้น ซ้าย | รวมทั้งสิ้น ขวา ── */}
            <tr>
              <td style={summaryTd()}>
                <div style={summaryInner()}>
                  <span>รวมทั้งสิ้น</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <DotLine val={normalTotal > 0 ? normalTotal.toLocaleString('th-TH') : ''} w={90} right />
                    <span>บาท</span>
                  </span>
                </div>
              </td>
              <td style={summaryTd()}>
                <div style={summaryInner()}>
                  <span>รวมทั้งสิ้น</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <DotLine val="" w={90} right />
                    <span>บาท</span>
                  </span>
                </div>
              </td>
            </tr>

          </tbody>
        </table>

        {/* ─── ยอดรวม / หัก / สุทธิ ─── */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0', fontSize: '9.5pt' }}>
          <tbody>
            {/* ยอดรวมทั้งสิ้น */}
            <tr>
              <td style={{ border: '1px solid black', padding: '3px 8px', fontWeight: 'bold' }}>
                ยอดรวมทั้งสิ้น
              </td>
              <td style={{ border: '1px solid black', padding: '3px 8px', textAlign: 'right', fontWeight: 'bold', minWidth: '120px' }}>
                {grandTotal > 0 ? grandTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : ''} บาท
              </td>
              {/* ช่องเซ็นการเงิน (rowspan 3) */}
              <td rowSpan={3} style={{
                border: '1px solid black', padding: '4px 8px',
                textAlign: 'center', verticalAlign: 'bottom',
                width: '120px', fontSize: '9pt',
              }}>
                <div style={{ marginBottom: '2px' }}>&nbsp;</div>
                <div>การเงิน</div>
              </td>
            </tr>

            {/* ยอดหัก ณ ที่จ่าย */}
            <tr>
              <td style={{ border: '1px solid black', padding: '3px 8px' }}>
                ยอดหัก ณ ที่จ่าย รวม
              </td>
              <td style={{ border: '1px solid black', padding: '3px 8px', textAlign: 'right' }}>
                {taxDeduct > 0 ? taxDeduct.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : ''} บาท
              </td>
            </tr>

            {/* ยอดสุทธิ */}
            <tr>
              <td style={{ border: '1px solid black', padding: '3px 8px', fontWeight: 'bold' }}>
                ยอดสุทธิ
              </td>
              <td style={{ border: '1px solid black', padding: '3px 8px', textAlign: 'right', fontWeight: 'bold', color: '#1e3a8a' }}>
                {netTotal > 0 ? netTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : ''} บาท
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TH({ children, w }) {
  return (
    <th style={{
      border: '1px solid black',
      padding: '2px 3px',
      textAlign: 'center',
      fontWeight: 'bold',
      width: w || 'auto',
      lineHeight: '1.3',
      fontSize: '8.5pt',
    }}>
      {children}
    </th>
  )
}

function tdStyle({ center, fontWeight, fontSize, color } = {}) {
  return {
    border: '1px solid black',
    padding: '1px 3px',
    textAlign: center ? 'center' : 'left',
    fontWeight: fontWeight || 'normal',
    fontSize: fontSize || '8.5pt',
    color: color || 'inherit',
  }
}

function TD({ children, left }) {
  return (
    <td style={{
      border: '1px solid black',
      padding: '1px 3px',
      textAlign: left ? 'left' : 'center',
      fontSize: '8.5pt',
    }}>
      {children}
    </td>
  )
}

/** style สำหรับ td ในตารางสรุป */
function summaryTd() {
  return {
    border: '1px solid black',
    padding: '3px 6px',
    verticalAlign: 'middle',
    width: '50%',
  }
}

/** layout ภายใน cell: label ซ้าย, ค่าต่างๆ ขวา */
function summaryInner() {
  return {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '4px',
  }
}

/** เส้นประรับค่า */
function DotLine({ val, w = 50, right = false }) {
  return (
    <span style={{
      borderBottom: '1px dotted black',
      minWidth: w,
      width: w,
      textAlign: right ? 'right' : 'center',
      display: 'inline-block',
      paddingBottom: '1px',
      fontSize: '9pt',
    }}>
      {val !== undefined && val !== null ? val : ''}
    </span>
  )
}