import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Printer, Edit3 } from 'lucide-react'

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d)) return ''
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'numeric', year: '2-digit' })
}

const calcHours = (start, end) => {
  if (!start || !end) return ''
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  let mins = (eh * 60 + em) - (sh * 60 + sm)
  if (mins < 0) mins += 24 * 60
  if (mins === 0) return ''
  return (mins / 60).toFixed(1).replace('.0', '')
}

/** กล่อง ☐ ตามแบบฟอร์ม */
const CB = ({ checked }) => (
  <span
    style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      border: '1px solid black', width: 11, height: 11, minWidth: 11,
      fontSize: '8pt', fontWeight: 'bold', lineHeight: 1,
    }}
  >
    {checked ? '✓' : ''}
  </span>
)

/** เส้นประว่างสำหรับกรอก (ช่องว่างให้การเงินกรอก) */
const BlankLine = ({ w = 60 }) => (
  <span style={{
    borderBottom: '1px dotted black',
    display: 'inline-block',
    minWidth: w,
    width: w,
  }}>&nbsp;</span>
)

const MIN_ROWS = 10

// ── Main Component ────────────────────────────────────────────────────────────

export default function ContractorPrint() {
  const location = useLocation()
  const navigate = useNavigate()
  const data = location.state || {}

  const items = data.daily_items || []
  const emptyRows = Math.max(0, MIN_ROWS - items.length)

  // นับวันทำงานจริงจากตาราง (เพื่อแสดงในช่อง "รวม __ วัน")
  const totalDays = items.filter(i => i.date).length

  return (
    <div className="min-h-screen bg-gray-200 p-4 md:p-8 print:bg-white print:p-0 print:m-0 print:min-h-0 print:h-auto print:block">

      {/* ── Toolbar (ซ่อนตอนพิมพ์) ── */}
      <div className="w-full max-w-[210mm] mx-auto mb-6 print:hidden">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Link
            to="/history"
            className="inline-flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all text-sm font-medium"
          >
            <ArrowLeft size={16} /> กลับหน้าประวัติ
          </Link>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/contractor-order', { state: data })}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-sm font-medium"
            >
              <Edit3 size={16} /> แก้ไขข้อมูล
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all text-sm shadow-md shadow-blue-600/20"
            >
              <Printer size={16} /> สั่งพิมพ์
            </button>
          </div>
        </div>
      </div>

      {/* ── กระดาษ A4 ── */}
      <div className="overflow-x-auto pb-4 print:overflow-visible print:pb-0">
        <div
          className="mx-auto bg-white shadow-2xl w-[210mm] min-w-[210mm] min-h-[297mm] print:shadow-none print:min-h-0 print:h-[290mm] print:overflow-hidden"
          style={{
            padding: '10mm 13mm',
            fontFamily: 'Sarabun, TH Sarabun New, sans-serif',
            fontSize: '10.5pt', lineHeight: '1.45',
            color: '#000', boxSizing: 'border-box',
          }}
        >

          {/* ════ HEADER ════ */}
          <div style={{ textAlign: 'center', marginBottom: '3px' }}>
            <div style={{ fontSize: '8.5pt' , letterSpacing: '0.3px' }}>
              HARU SYSTEM DEVELOPMENT (THAILAND) CO.,LTD.
            </div>
            <div style={{ fontSize: '8.5pt', color: '#333' }}>
              47/20 M.1, KLONGPRAWET, BANPHO, CHACHOENGSAO 24140
            </div>
          </div>

          <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '13pt', margin: '5px 0 6px' }}>
            ใบสั่งจ้างผู้รับเหมา / Technician supporter record
          </div>

          {/* วันที่ — ชิดขวา */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', gap: '6px', marginBottom: '8px' }}>
            <span>วันที่/ Date</span>
            <span style={{ borderBottom: '1px solid black', minWidth: '130px', textAlign: 'center', display: 'inline-block', paddingBottom: '1px' }}>
              {formatDate(data.created_at)}
            </span>
          </div>

          {/* ════ ชื่อผู้รับเหมา + เลขบัตร ════ */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
            <span style={{ whiteSpace: 'nowrap' }}>ผู้รับเหมาชื่อ (นาย/นาง/นางสาว)</span>
            <span style={{
              borderBottom: '1px solid black', flex: 1, minWidth: '120px',
              textAlign: 'center',
              display: 'inline-block', paddingBottom: '1px',
            }}>
              {data.contractor_name || ''}
            </span>
            <span style={{ whiteSpace: 'nowrap', marginLeft: '8px' }}>เลขบัตรประชาชน</span>
            <span style={{
              borderBottom: '1px solid black', minWidth: '140px',
              textAlign: 'center',
              display: 'inline-block', paddingBottom: '1px',
            }}>
              {data.id_card || ''}
            </span>
          </div>

          {/* ════ ข้อ 1: โปรเจ็ค + ผู้ดูแล ════ */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <span style={{ whiteSpace: 'nowrap' }}>1. จ้างทำงานโปรเจ็คเลขที่</span>
            <span style={{
              borderBottom: '1px solid black', minWidth: '150px',
              textAlign: 'center',
              display: 'inline-block', paddingBottom: '1px',
            }}>
              {data.doc_no || ''}
            </span>
            <span style={{ whiteSpace: 'nowrap', marginLeft: '12px' }}>โดยมีผู้รับผิดชอบดูแลผู้รับเหมา คือ</span>
            <span style={{
              borderBottom: '1px solid black', flex: 1, minWidth: '100px',
              textAlign: 'center', display: 'inline-block', paddingBottom: '1px',
            }}>
              {data.supervisor_name || ''}
            </span>
          </div>

          {/* ════ ข้อ 2: ค่าจ้าง ════ */}
          <div style={{ marginBottom: '3px' }}>
            {/* บรรทัด 1 — ประเภทค่าจ้าง */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap', marginBottom: '3px' }}>
              <span>2 . ค่าจ้างเป็นแบบ</span>

              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <CB checked={data.wage_type === 'daily'} />
                <span>รายวัน</span>
              </span>

              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <CB checked={data.wage_type === 'project'} />
                <span>ต่อโปรเจ็ค</span>
              </span>

              <span style={{ marginLeft: '10px' }}>เป็นจำนวนเงิน (เรทปกติ)</span>
              <span style={{
                borderBottom: '1px solid black', minWidth: '70px',
                textAlign: 'center',
                display: 'inline-block', paddingBottom: '1px',
              }}>
                {data.wage_rate || ''}
              </span>
              <span>บาท ต่อ</span>

              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <CB checked={data.wage_type === 'daily'} />
                <span>วัน</span>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <CB checked={data.wage_type === 'project'} />
                <span>งาน</span>
              </span>
            </div>

            {/* บรรทัด 2 — OT + ระยะเวลา */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
              <span>โอที</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <CB checked={data.has_ot === true || data.has_ot === 'true'} />
                <span>มี</span>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <CB checked={!data.has_ot || data.has_ot === 'false'} />
                <span>ไม่มี</span>
              </span>

              <span style={{ marginLeft: '10px' }}>โดยมีระยะเวลาตั้งแต่วันที่</span>
              <span style={{
                borderBottom: '1px solid black', minWidth: '95px',
                textAlign: 'center', display: 'inline-block', paddingBottom: '1px',
              }}>
                {formatDate(data.start_date)}
              </span>
              <span>จนถึงวันที่</span>
              <span style={{
                borderBottom: '1px solid black', minWidth: '95px',
                textAlign: 'center', display: 'inline-block', paddingBottom: '1px',
              }}>
                {formatDate(data.end_date)}
              </span>
            </div>
          </div>

          {/* ════ ข้อ 3: ตารางลงเวลา ════ */}
          <div style={{ margin: '6px 0 5px' }}>
            <div style={{ marginBottom: '3px' }}>
              3. ตารางลงเวลา กรณีจ้างแบบรายวัน
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8pt' }}>
              <thead>
                <tr style={{ background: '#f0f0f0', textAlign: 'center' }}>
                  <TH w="11%">วันที่ทำงาน</TH>
                  <TH w="7%">เริ่ม</TH>
                  <TH w="7%">สิ้นสุด</TH>
                  <TH w="6%">รวม</TH>
                  <TH w="7%">โอทีเริ่ม</TH>
                  <TH w="8%">โอทีสิ้นสุด</TH>
                  <TH w="7%">รวมโอที</TH>
                  <TH w="9%">ลงชื่อ</TH>
                  <TH>รายละเอียดงาน</TH>
                  <TH w="10%">ผู้รับผิดชอบ</TH>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} style={{ height: '22px', textAlign: 'center' }}>
                    <TD>{formatDate(item.date)}</TD>
                    <TD>{item.start_time}</TD>
                    <TD>{item.end_time}</TD>
                    <TD>{calcHours(item.start_time, item.end_time)}</TD>
                    <TD>{item.ot_start}</TD>
                    <TD>{item.ot_end}</TD>
                    <TD>{calcHours(item.ot_start, item.ot_end)}</TD>
                    <TD></TD>
                    <TD left>{item.detail}</TD>
                    <TD></TD>
                  </tr>
                ))}
                {Array.from({ length: emptyRows }).map((_, i) => (
                  <tr key={`empty-${i}`} style={{ height: '22px' }}>
                    {Array.from({ length: 10 }).map((__, j) => <TD key={j}></TD>)}
                  </tr>
                ))}
                <tr style={{ background: '#f8f8f8' }}>
                  <td colSpan={2} style={tdSt({ center: true, bold: true })}>รวม</td>
                  <td colSpan={2} style={tdSt({ center: true, bold: true })}>
                    {totalDays > 0 ? `${totalDays} วัน` : ''}
                  </td>
                  <td colSpan={3} style={tdSt()}></td>
                  <td colSpan={3} style={tdSt({ small: true })}>
                    หมายเหตุ : ค่าจ้างและค่าใช้จ่ายทั้งหมด จะถูกหัก ณ ที่จ่าย 3%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ════ ข้อ 4: ค่าใช้จ่ายนอกจากค่าจ้าง ════ */}
          <div style={{ marginBottom: '6px', fontSize: '10pt' }}>
            <div style={{ marginBottom: '4px' }}>4. ค่าใช้จ่ายนอกจาก ค่าจ้าง</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <CB checked={!!data.has_accom} />
              <span>ค่าที่พัก เป็นเงิน</span>
              <span style={{ borderBottom: '1px dotted black', minWidth: '65px', textAlign: 'center', display: 'inline-block' }}>
                {data.has_accom && data.accom_rate ? data.accom_rate : ''}
              </span>
              <span>บาท ต่อ</span>
              <CB checked={data.has_accom && data.accom_unit !== 'job'} />
              <span>วัน</span>
              <CB checked={data.has_accom && data.accom_unit === 'job'} />
              <span>งาน</span>
              <span style={{ marginLeft: '24px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <CB checked={!data.has_accom} />
                <span>ไม่มี</span>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <CB checked={!!data.has_travel} />
              <span>ค่าเดินทาง เป็นเงิน</span>
              <span style={{ borderBottom: '1px dotted black', minWidth: '65px', textAlign: 'center', display: 'inline-block' }}>
                {data.has_travel && data.travel_rate ? data.travel_rate : ''}
              </span>
              <span>บาท ต่อ</span>
              <CB checked={data.has_travel && data.travel_unit !== 'job'} />
              <span>วัน</span>
              <CB checked={data.has_travel && data.travel_unit === 'job'} />
              <span>งาน</span>
              <span style={{ marginLeft: '24px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <CB checked={!data.has_travel} />
                <span>ไม่มี</span>
              </span>
            </div>
          </div>

          {/* ════ กล่องลายเซ็น 2 กล่อง (อยู่นอกกรอบ) ════ */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '0', marginTop: '20px' }}>
            <SignBox label="ผู้รับเหมา" />
            <SignBox label="ผู้รับผิดชอบโปรเจ็ค" />
          </div>

          {/* ════ เส้นประคั่น ════ */}
          <div style={{ borderTop: '2px dashed #666', margin: '14px 0 10px' }} />

          {/* ════ ตารางสรุปค่าจ้างงาน (การเงินกรอกเอง) ════ */}
          <div style={{ fontSize: '10pt' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>ตารางสรุปค่าจ้างงาน</div>
            <div style={{ marginBottom: '4px', fontSize: '9.5pt' }}>จำนวนวันทำงาน</div>
{/* ── แบ่ง 2 ฝั่ง ซ้าย-ขวา ห่างกัน ── */}
            <div style={{ display: 'flex', gap: '24px', marginBottom: '8px' }}>
              
              {/* ฝั่งซ้าย: วันธรรมดา */}
              <table style={{ flex: 1, borderCollapse: 'collapse', fontSize: '9.5pt' }}>
                <tbody>
                  <tr>
                    <td style={{ border: '1px solid black', padding: '4px 8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>วันธรรมดา</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <BlankLine w={28} />
                          <span style={{ width: '45px', textAlign: 'center' }}>วันๆละ</span>
                          <BlankLine w={40} />
                          {/* ปรับเป็น 75px เท่ากันทั้งหมด */}
                          <span style={{ width: '75px', paddingLeft: '4px', whiteSpace: 'nowrap' }}>บาท</span>
                        </span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid black', padding: '4px 8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>ชม.ล่วงเวลา</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <BlankLine w={28} />
                          <span style={{ width: '45px', textAlign: 'center' }}>ชม.ๆละ</span>
                          <BlankLine w={40} />
                          <span style={{ width: '75px', paddingLeft: '4px', whiteSpace: 'nowrap' }}>บาท (*1.5)</span>
                        </span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid black', padding: '4px 8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>รวมทั้งสิ้น</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <BlankLine w={113} />
                          <span style={{ width: '75px', paddingLeft: '4px', whiteSpace: 'nowrap' }}>บาท</span>
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* ฝั่งขวา: วันหยุด */}
              <table style={{ flex: 1, borderCollapse: 'collapse', fontSize: '9.5pt' }}>
                <tbody>
                  <tr>
                    <td style={{ border: '1px solid black', padding: '4px 8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>วันหยุด</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <BlankLine w={28} />
                          <span style={{ width: '45px', textAlign: 'center' }}>วันๆละ</span>
                          <BlankLine w={40} />
                          <span style={{ width: '75px', paddingLeft: '4px', whiteSpace: 'nowrap' }}>บาท (*2)</span>
                        </span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid black', padding: '4px 8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>ชม.ล่วงเวลา</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <BlankLine w={28} />
                          <span style={{ width: '45px', textAlign: 'center' }}>ชม.ๆละ</span>
                          <BlankLine w={40} />
                          <span style={{ width: '75px', paddingLeft: '4px', whiteSpace: 'nowrap' }}>บาท (*3)</span>
                        </span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid black', padding: '4px 8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>รวมทั้งสิ้น</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <BlankLine w={113} />
                          <span style={{ width: '75px', paddingLeft: '4px', whiteSpace: 'nowrap' }}>บาท</span>
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

            </div>

            {/* ── ยอดรวม / หัก / สุทธิ + ช่องการเงิน (ไม่มีกรอบตาราง) ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '16px' }}>
              
              {/* ฝั่งซ้าย: รายการยอดเงิน */}
              <div style={{ width: '60%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <span>ยอดรวมทั้งสิ้น</span>
                  <span style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                    <BlankLine w={150} /> <span style={{ width: '30px' }}>บาท</span>
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <span>ยอดหัก ณ ที่จ่าย รวม</span>
                  <span style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                    <BlankLine w={150} /> <span style={{ width: '30px' }}>บาท</span>
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <span>ยอดสุทธิ</span>
                  <span style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                    <BlankLine w={150} /> <span style={{ width: '30px' }}>บาท</span>
                  </span>
                </div>
              </div>

              {/* ฝั่งขวา: ช่องการเงิน (กรอบสี่เหลี่ยม + ข้อความด้านล่างนอกกรอบ) */}
              <div style={{ width: '130px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* กรอบสี่เหลี่ยมว่างๆ */}
                <div style={{
                  width: '100%',
                  height: '70px',
                  border: '1px solid black'
                }}></div>
                {/* ข้อความด้านล่างกรอบ */}
                <div style={{ fontSize: '10pt', marginTop: '6px' }}>
                  การเงิน
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Print CSS */}
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          html, body { height: auto !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; }
        }
      `}</style>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

/** TH cell */
function TH({ children, w }) {
  return (
    <th style={{
      border: '1px solid black', padding: '2px 3px',
      textAlign: 'center', fontWeight: 'bold',
      width: w || 'auto', lineHeight: '1.3', fontSize: '8pt',
    }}>
      {children}
    </th>
  )
}

/** TD cell */
function TD({ children, left }) {
  return (
    <td style={{
      border: '1px solid black', padding: '1px 3px',
      textAlign: left ? 'left' : 'center', fontSize: '8pt',
    }}>
      {children}
    </td>
  )
}

/** tdStyle สำหรับตารางลงเวลา */
function tdSt({ center, bold, small } = {}) {
  return {
    border: '1px solid black', padding: '2px 4px',
    textAlign: center ? 'center' : 'left',
    fontWeight: bold ? 'bold' : 'normal',
    fontSize: small ? '7.5pt' : '8pt',
  }
}

/** กล่องลายเซ็น (ปรับให้ข้อความอยู่ข้างนอกกรอบแล้ว) */
function SignBox({ label }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{
        width: '100%', 
        border: '1px solid black',
        height: '58px',
      }}></div>
      <div style={{ fontSize: '10pt', marginTop: '4px' }}>
        {label}
      </div>
    </div>
  )
}