import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Printer, Edit3 } from 'lucide-react'

// ── Helpers ──────────────────────────────────────────────────────────────────
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

const Checkbox = ({ checked }) => (
  <span className="inline-flex items-center justify-center border border-black text-[9px] font-bold" style={{ width: 12, height: 12, minWidth: 12 }}>
    {checked ? '✓' : ''}
  </span>
)

const MIN_ROWS = 10 

export default function ContractorPrint() {
  const location = useLocation()
  const navigate = useNavigate()
  const data = location.state || {} // รับข้อมูลมาจากหน้าฟอร์ม

  const items = data.daily_items || []
  const wage = parseFloat(data.wage_rate) || 0

  const normalRows = items.filter(i => i.date)
  const normalDays = normalRows.length

  const otHoursList = items.map(i => parseFloat(calcHours(i.ot_start, i.ot_end)) || 0)
  const totalOtHours = otHoursList.reduce((a, b) => a + b, 0)

  const ratePerHourOT = wage > 0 ? (wage / 8 * 1.5) : 0
  const rateHolidayDay = wage > 0 ? wage * 2 : 0

  const normalTotal = normalDays * wage
  const otTotal = totalOtHours * ratePerHourOT

  const accomRate = parseFloat(data.accom_rate) || 0
  const travelRate = parseFloat(data.travel_rate) || 0
  const accomTotal = data.has_accom ? accomRate : 0
  const travelTotal = data.has_travel ? travelRate : 0

  const grandTotal = normalTotal + otTotal + accomTotal + travelTotal
  const taxDeduct = data.deduct_tax ? grandTotal * 0.03 : 0
  const netTotal = grandTotal - taxDeduct

  const emptyRows = Math.max(0, MIN_ROWS - items.length)

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sarabun print:bg-white print:p-0 print:m-0 print:min-h-0 print:block">
      
      {/* --- Toolbar --- */}
      <div className="w-full max-w-[210mm] mx-auto mb-6 print:hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4">
          <Link to="/history" className="inline-flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 rounded-lg transition-all font-medium text-sm">
            <ArrowLeft size={18} /> <span>กลับหน้าประวัติ</span>
          </Link>
          <div className="grid grid-cols-2 sm:flex gap-3 w-full sm:w-auto">
            <button onClick={() => navigate('/contractor-order', { state: data })} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-all font-medium text-sm">
              <Edit3 size={18} /> <span>แก้ไขข้อมูล</span>
            </button>
            <button onClick={() => window.print()} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all text-sm">
              <Printer size={18} /> <span>สั่งพิมพ์</span>
            </button>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto pb-4 print:overflow-visible print:pb-0">
        <div className="w-[210mm] min-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none p-[10mm_12mm] text-black" style={{ fontFamily: 'Sarabun, sans-serif', fontSize: '11pt', lineHeight: '1.4', minHeight: '297mm' }}>
          
          {/* Header แบบฟอร์ม A4 */}
          <div style={{ textAlign: 'center', marginBottom: '4px' }}>
            <div style={{ fontSize: '9pt' }}>HARU SYSTEM DEVELOPMENT (THAILAND) CO.,LTD.</div>
            <div style={{ fontSize: '9pt', color: '#444' }}>47/20 M.1, KLONGPRAWET, BANPHO, CHACHOENGSAO 24140</div>
          </div>
          <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '12pt', margin: '6px 0 8px' }}>
            ใบสั่งจ้างผู้รับเหมา / Technician supporter record
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginBottom: '8px' }}>
            <span style={{ fontSize: '12pt' }}>วันที่ / Date</span>
            <span style={{ fontSize: '12pt', borderBottom: '1px dotted black', minWidth: '120px', textAlign: 'center' }}>{formatDate(data.created_at)}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', marginBottom: '6px' }}>
            <span style={{ fontWeight: 'bold' }}>ผู้รับเหมาชื่อ</span>
            <span style={{ borderBottom: '1px dotted black', flex: 1, textAlign: 'center', fontWeight: 'bold', color: '#1e3a8a' }}>{data.contractor_name || ''}</span>
            <span>เลขบัตรประชาชน</span>
            <span style={{ borderBottom: '1px dotted black', minWidth: '130px', textAlign: 'center', letterSpacing: '2px' }}>{data.id_card || ''}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', marginBottom: '6px' }}>
            <span style={{ fontWeight: 'bold' }}>1. จ้างทำงานโปรเจ็คเลขที่</span>
            <span style={{ borderBottom: '1px dotted black', minWidth: '140px', textAlign: 'center', fontWeight: 'bold' }}>{data.doc_no || ''}</span>
            <span style={{ marginLeft: '12px' }}>ดูแลโดย</span>
            <span style={{ borderBottom: '1px dotted black', flex: 1, textAlign: 'center' }}>{data.supervisor_name || ''}</span>
          </div>

          <div style={{ marginBottom: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontWeight: 'bold' }}>2. ค่าจ้างเป็นแบบ</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Checkbox checked={data.wage_type === 'daily'} /> รายวัน</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Checkbox checked={data.wage_type === 'project'} /> ต่อโปรเจ็ค</span>
              <span style={{ marginLeft: '16px' }}>จำนวนเงิน</span>
              <span style={{ borderBottom: '1px dotted black', minWidth: '70px', textAlign: 'center', fontWeight: 'bold' }}>{data.wage_rate || ''}</span>
              <span>บาท ต่อ</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Checkbox checked={data.wage_type === 'daily'} /> วัน</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Checkbox checked={data.wage_type === 'project'} /> งาน</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>โอที</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Checkbox checked={data.has_ot === true || data.has_ot === 'true'} /> มี</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Checkbox checked={!data.has_ot || data.has_ot === 'false'} /> ไม่มี</span>
              <span style={{ marginLeft: '16px' }}>ตั้งแต่</span>
              <span style={{ borderBottom: '1px dotted black', minWidth: '90px', textAlign: 'center' }}>{formatDate(data.start_date)}</span>
              <span>ถึง</span>
              <span style={{ borderBottom: '1px dotted black', minWidth: '90px', textAlign: 'center' }}>{formatDate(data.end_date)}</span>
            </div>
          </div>

          {/* ตารางลงเวลา */}
          <div style={{ margin: '8px 0 6px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '3px', fontSize: '10.5pt' }}>3. ตารางลงเวลา กรณีจ้างแบบรายวัน</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5pt' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', textAlign: 'center' }}>
                  <TH w="11%">วันที่ทำงาน</TH><TH w="7%">เริ่ม</TH><TH w="7%">สิ้นสุด</TH><TH w="6%">รวม</TH>
                  <TH w="7%">OT เริ่ม</TH><TH w="7%">OT สิ้นสุด</TH><TH w="6%">รวม OT</TH><TH w="9%">ลงชื่อ</TH>
                  <TH>รายละเอียดงาน</TH><TH w="10%">ผู้รับผิดชอบ</TH>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} style={{ height: '20px', textAlign: 'center' }}>
                    <TD>{formatDate(item.date)}</TD><TD>{item.start_time}</TD><TD>{item.end_time}</TD>
                    <TD>{calcHours(item.start_time, item.end_time)}</TD><TD>{item.ot_start}</TD><TD>{item.ot_end}</TD>
                    <TD>{calcHours(item.ot_start, item.ot_end)}</TD><TD></TD><TD left>{item.detail}</TD><TD></TD>
                  </tr>
                ))}
                {Array.from({ length: emptyRows }).map((_, i) => (
                  <tr key={`e${i}`} style={{ height: '20px' }}>{Array.from({ length: 10 }).map((__, j) => <TD key={j}></TD>)}</tr>
                ))}
                <tr style={{ background: '#f8fafc' }}>
                  <td colSpan={2} style={tdStyle({ center: true, fontWeight: 'bold' })}>รวม</td>
                  <td colSpan={2} style={tdStyle({ center: true, fontWeight: 'bold' })}>{normalDays > 0 ? `${normalDays} วัน` : ''}</td>
                  <td colSpan={3} style={tdStyle()}></td>
                  <td colSpan={3} style={tdStyle({ fontSize: '7.5pt', color: '#555' })}>หมายเหตุ : หัก ณ ที่จ่าย 3%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ marginBottom: '6px', fontSize: '10pt' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>4. ค่าใช้จ่ายนอกจาก ค่าจ้าง</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Checkbox checked={!!data.has_accom} /> <span>ค่าที่พัก เป็นเงิน</span>
              <span style={{ borderBottom: '1px dotted black', minWidth: '60px', textAlign: 'center' }}>{data.has_accom ? data.accom_rate : ''}</span>
              <span>บาท ต่อ</span>
              <Checkbox checked={data.has_accom && data.accom_unit !== 'job'} /> วัน
              <Checkbox checked={data.has_accom && data.accom_unit === 'job'} /> งาน
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Checkbox checked={!!data.has_travel} /> <span>ค่าเดินทาง เป็นเงิน</span>
              <span style={{ borderBottom: '1px dotted black', minWidth: '60px', textAlign: 'center' }}>{data.has_travel ? data.travel_rate : ''}</span>
              <span>บาท ต่อ</span>
              <Checkbox checked={data.has_travel && data.travel_unit !== 'job'} /> วัน
              <Checkbox checked={data.has_travel && data.travel_unit === 'job'} /> งาน
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, border: '1px solid black', height: '60px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '4px' }}>ผู้รับเหมา</div>
            <div style={{ flex: 1, border: '1px solid black', height: '60px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '4px' }}>ผู้รับผิดชอบโปรเจ็ค</div>
          </div>

          <div style={{ borderTop: '2px dashed #555', margin: '10px 0 8px' }} />

          <div style={{ fontSize: '10pt' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>ตารางสรุปค่าจ้างงาน</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5pt' }}>
              <tbody>
                <tr>
                  <td style={summaryTd()}>
                    <div style={summaryInner()}><span>วันธรรมดา</span><span><DotLine val={normalDays||''} w={28}/>วันๆละ<DotLine val={wage||''} w={50} right/>บาท</span></div>
                  </td>
                  <td style={summaryTd()}>
                    <div style={summaryInner()}><span>วันหยุด</span><span><DotLine val="" w={28}/>วันๆละ<DotLine val={rateHolidayDay||''} w={50} right/>บาท (*2)</span></div>
                  </td>
                </tr>
                <tr>
                  <td style={summaryTd()}>
                    <div style={summaryInner()}><span>ชม.ล่วงเวลา</span><span><DotLine val={totalOtHours||''} w={28}/>ชม.ๆละ<DotLine val={ratePerHourOT.toFixed(0)||''} w={50} right/>บาท (*1.5)</span></div>
                  </td>
                  <td style={summaryTd()}>
                    <div style={summaryInner()}><span>ชม.ล่วงเวลา (หยุด)</span><span><DotLine val="" w={28}/>ชม.ๆละ<DotLine val={(wage/8*3).toFixed(0)||''} w={50} right/>บาท (*3)</span></div>
                  </td>
                </tr>
                <tr>
                  <td style={summaryTd()}>
                    <div style={summaryInner()}><span>รวมทั้งสิ้น</span><span><DotLine val={normalTotal?normalTotal.toLocaleString('th-TH'):''} w={90} right/>บาท</span></div>
                  </td>
                  <td style={summaryTd()}>
                    <div style={summaryInner()}><span>รวมทั้งสิ้น</span><span><DotLine val="" w={90} right/>บาท</span></div>
                  </td>
                </tr>
              </tbody>
            </table>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5pt' }}>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid black', padding: '3px 8px', fontWeight: 'bold' }}>ยอดรวมทั้งสิ้น</td>
                  <td style={{ border: '1px solid black', padding: '3px 8px', textAlign: 'right', fontWeight: 'bold', minWidth: '120px' }}>{grandTotal > 0 ? grandTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : ''} บาท</td>
                  <td rowSpan={3} style={{ border: '1px solid black', padding: '4px 8px', textAlign: 'center', verticalAlign: 'bottom', width: '120px' }}>การเงิน</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid black', padding: '3px 8px' }}>ยอดหัก ณ ที่จ่าย รวม</td>
                  <td style={{ border: '1px solid black', padding: '3px 8px', textAlign: 'right' }}>{taxDeduct > 0 ? taxDeduct.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : ''} บาท</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid black', padding: '3px 8px', fontWeight: 'bold' }}>ยอดสุทธิ</td>
                  <td style={{ border: '1px solid black', padding: '3px 8px', textAlign: 'right', fontWeight: 'bold', color: '#1e3a8a' }}>{netTotal > 0 ? netTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : ''} บาท</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>
      <style type="text/css">{`@media print { @page { size: A4; margin: 0; } body { -webkit-print-color-adjust: exact; } html, body { height: auto !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; } }`}</style>
    </div>
  )
}

function TH({ children, w }) { return <th style={{ border: '1px solid black', padding: '2px 3px', textAlign: 'center', fontWeight: 'bold', width: w || 'auto', fontSize: '8.5pt' }}>{children}</th> }
function tdStyle({ center, fontWeight, fontSize, color } = {}) { return { border: '1px solid black', padding: '1px 3px', textAlign: center ? 'center' : 'left', fontWeight: fontWeight || 'normal', fontSize: fontSize || '8.5pt', color: color || 'inherit' } }
function TD({ children, left }) { return <td style={{ border: '1px solid black', padding: '1px 3px', textAlign: left ? 'left' : 'center', fontSize: '8.5pt' }}>{children}</td> }
function summaryTd() { return { border: '1px solid black', padding: '3px 6px', verticalAlign: 'middle', width: '50%' } }
function summaryInner() { return { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' } }
function DotLine({ val, w = 50, right = false }) { return <span style={{ borderBottom: '1px dotted black', minWidth: w, width: w, textAlign: right ? 'right' : 'center', display: 'inline-block', fontSize: '9pt' }}>{val !== undefined && val !== null ? val : ''}</span> }