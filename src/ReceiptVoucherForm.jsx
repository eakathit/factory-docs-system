import { useState, useRef } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { supabase } from './supabaseClient'
import SignatureCanvas from 'react-signature-canvas'
import toast from 'react-hot-toast'
import { ChevronLeft, Home, ChevronRight, ArrowLeft, Plus, Trash2, Save, Eraser } from 'lucide-react'

export default function ReceiptVoucherForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const sigRef = useRef({})
  const [loading, setLoading] = useState(false)
  const edit = location.state || null

  // ── ตาราง: รายการ, จำนวน, หน่วย, ราคาต่อหน่วย ──────────────────────────────
  // ปรับชื่อ Field ให้ตรงกับ Database Schema เดิม (name, quantity, unit, price)
  const [rows, setRows] = useState(
    edit?.items || [{ name: '', quantity: '', unit: '', price: '' }]
  )

  const total = rows.reduce(
    (s, r) => s + (parseFloat(r.quantity || 0) * parseFloat(r.price || 0)), 0
  )

  const addRow = () =>
    setRows(p => [...p, { name: '', quantity: '', unit: '', price: '' }])
  const delRow = i =>
    rows.length > 1 && setRows(p => p.filter((_, x) => x !== i))
  const setRow = (i, f, v) =>
    setRows(p => { const n = [...p]; n[i] = { ...n[i], [f]: v }; return n })

  // ── Submit ────────────────────────────────────────────────────────────────────
  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = Object.fromEntries(new FormData(e.target).entries())
      let sig = edit?.payer_signature || null

      if (sigRef.current && !sigRef.current.isEmpty()) {
        const blob = await new Promise(r => sigRef.current.getCanvas().toBlob(r, 'image/png'))
        const name = `voucher-sig-${Date.now()}.png`
        const { error: ue } = await supabase.storage.from('signatures').upload(name, blob)
        if (ue) throw ue
        sig = supabase.storage.from('signatures').getPublicUrl(name).data.publicUrl
      }

      // จัดเตรียม Payload ให้ตรงกับ Table 'doc_receipt_vouchers'
      const payload = {
        created_at: fd.created_at || new Date().toISOString().split('T')[0],
        receiver_name: fd.receiver_name,
        id_card_number: fd.id_card_number,
        address: fd.address,
        payment_method: fd.payment_method,
        total_amount: total,
        total_text: fd.total_text,
        items: rows.map(r => ({
          name: r.name,
          quantity: parseFloat(r.quantity || 0),
          unit: r.unit,
          price: parseFloat(r.price || 0),
          total: parseFloat(r.quantity || 0) * parseFloat(r.price || 0)
        })),
        payer_signature: sig,
      }

      let newId
      if (edit?.id) {
        const { data: r, error } = await supabase
          .from('doc_receipt_vouchers')
          .update(payload)
          .eq('id', edit.id)
          .select()
        if (error) throw error
        newId = r[0].id
      } else {
        const { data: r, error } = await supabase
          .from('doc_receipt_vouchers')
          .insert([payload])
          .select()
        if (error) throw error
        newId = r[0].id
      }

      toast.success('บันทึกข้อมูลเรียบร้อย!')
      // นำทางไปหน้า Print พร้อมส่ง State
      navigate(`/receipt-voucher-print/${newId}`, { state: { ...payload, id: newId } })
    } catch (err) {
      console.error(err)
      toast.error('เกิดข้อผิดพลาด: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-20"
      style={{ fontFamily: "'Prompt', sans-serif" }}>

      {/* --- New Sticky Navbar --- */}
      <nav className="relative sm:sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
            >
              <ChevronLeft size={18} />
            </Link>
            <div className="h-5 sm:h-6 w-[1px] bg-slate-200 mx-1" />

            {/* Breadcrumbs: ปรับขนาดตัวอักษรและซ่อนไอคอนในจอเล็กมากเพื่อประหยัดพื้นที่ */}
            <div className="flex items-center gap-1 sm:gap-2 text-[13px] sm:text-sm font-medium">
              <Link
                to="/"
                className="text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors whitespace-nowrap"
              >
                <Home size={14} /> หน้าแรก
              </Link>
              <ChevronRight size={12} className="text-slate-300" />
              <span className="text-slate-800 truncate max-w-[190px] sm:max-w-none">
                Receipt Voucher
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 pt-8">

        {/* ── Page heading ── */}
        <div className="mb-7">
          <h1 className="text-xl font-bold text-stone-800 tracking-tight">
            RECEIPT VOUCHER
          </h1>
          <p className="text-stone-400 text-sm mt-0.5">ใบสำคัญรับเงิน</p>
          <div className="mt-3 h-px bg-stone-200" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">

          {/* ════════════════════════════════════════════════
               ส่วน 1 — ข้อมูลผู้รับเงิน
          ════════════════════════════════════════════════ */}
          <Card title="ข้อมูลผู้รับเงิน">

            {/* วันที่เอกสาร */}
            <Row2>
              <Field label="วันที่" hint="Date" required>
                <input type="date" name="created_at"
                  defaultValue={edit?.created_at || new Date().toISOString().split('T')[0]}
                  className={inp()} required />
              </Field>
              <div />
            </Row2>

            <Row2>
              <Field label="ข้าพเจ้า" hint="ชื่อ-นามสกุลผู้รับเงิน" required>
                <input type="text" name="receiver_name" required
                  placeholder="ชื่อ-นามสกุล"
                  defaultValue={edit?.receiver_name}
                  className={inp()} />
              </Field>
              <Field label="ผู้มีถิ่นฐานอยู่ตามบัตรประชาชนเลขที่">
                <input type="text" name="id_card_number" maxLength={13}
                  placeholder="_ _ _ _ _ _ _ _ _ _ _ _ _"
                  defaultValue={edit?.id_card_number}
                  className={inp('font-mono tracking-widest')} required />
              </Field>
            </Row2>

            <Field label="ที่อยู่" hint="Address">
              <input type="text" name="address"
                placeholder="ระบุที่อยู่"
                defaultValue={edit?.address}
                className={inp()} required />
            </Field>

            <div className="mt-4 pt-4 border-t border-dashed border-stone-200 text-[13.5px] text-stone-500 leading-loose">
              ตามสำเนาแนบท้าย ได้รับเงินจาก{' '}
              <span className="font-semibold text-stone-800">
                บริษัท ฮารุ ซิสเต็ม ดีเวล็อปเมนต์ (ไทยแลนด์) จำกัด
              </span>{' '}
              เป็นจำนวนเงิน
              <span className="inline-block min-w-[110px] border-b border-stone-400 text-center mx-2 font-bold text-stone-900 text-[15px]">
                {total > 0
                  ? total.toLocaleString('th-TH', { minimumFractionDigits: 2 })
                  : '\u00A0'}
              </span>
              บาท
            </div>

            <div className="mt-3 flex items-center gap-5 flex-wrap">
              <span className="text-[13.5px] text-stone-600 font-medium">ได้รับเงินเป็น</span>
              {[
                { v: 'cash',     l: 'เงินสด' },
                { v: 'transfer', l: 'โอนเงิน' },
              ].map(o => (
                <label key={o.v} className="flex items-center gap-2 cursor-pointer text-[13.5px] text-stone-700">
                  <input type="radio" name="payment_method" value={o.v}
                    defaultChecked={edit ? edit.payment_method === o.v : o.v === 'cash'}
                    className="w-4 h-4 accent-stone-700" />
                  {o.l}
                </label>
              ))}
            </div>

            <p className="mt-2 text-[13.5px] text-stone-500">ดังรายการต่อไปนี้</p>
          </Card>

          {/* ════════════════════════════════════════════════
               ส่วน 2 — รายการรับเงิน
          ════════════════════════════════════════════════ */}
          <Card
            title="รายการค่าใช้จ่าย"
            action={
              <button type="button" onClick={addRow}
                className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors">
                <Plus size={13} /> เพิ่มรายการ
              </button>
            }
          >
            <div className="grid gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-wider pb-2 border-b border-stone-200"
              style={{ gridTemplateColumns: '28px 1fr 64px 60px 90px 86px 24px' }}>
              <div className="text-center">ลำดับ</div>
              <div>รายการ</div>
              <div className="text-center">จำนวน</div>
              <div className="text-center">หน่วย</div>
              <div className="text-right">ราคาต่อหน่วย</div>
              <div className="text-right">รวมเป็นเงิน</div>
              <div />
            </div>

            <div className="space-y-2 mt-2">
              {rows.map((row, i) => {
                const sub = parseFloat(row.quantity || 0) * parseFloat(row.price || 0)
                return (
                  <div key={i}
                    className="grid gap-2 items-center bg-stone-50 rounded-lg px-2 py-2 border border-stone-100"
                    style={{ gridTemplateColumns: '28px 1fr 64px 60px 90px 86px 24px' }}>

                    <div className="text-center text-xs font-bold text-stone-300">{i + 1}</div>

                    <input type="text" required value={row.name}
                      placeholder="ระบุรายการ..."
                      onChange={e => setRow(i, 'name', e.target.value)}
                      className={rowInp()} />

                    <input type="number" min="0" step="any" value={row.quantity}
                      placeholder="0"
                      onChange={e => setRow(i, 'quantity', e.target.value)}
                      className={rowInp('text-center')} />

                    <input type="text" value={row.unit}
                      placeholder="ชิ้น"
                      onChange={e => setRow(i, 'unit', e.target.value)}
                      className={rowInp('text-center')} />

                    <input type="number" min="0" step="any" value={row.price}
                      placeholder="0.00"
                      onChange={e => setRow(i, 'price', e.target.value)}
                      className={rowInp('text-right')} />

                    <div className={`text-right text-[13px] font-semibold pr-1 ${sub > 0 ? 'text-stone-800' : 'text-stone-300'}`}>
                      {sub > 0
                        ? sub.toLocaleString('th-TH', { minimumFractionDigits: 2 })
                        : '—'}
                    </div>

                    <div className="flex justify-center">
                      {rows.length > 1 && (
                        <button type="button" onClick={() => delRow(i)}
                          className="text-stone-300 hover:text-red-500 transition-colors p-0.5 rounded">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-3 flex justify-between items-center bg-stone-800 text-white rounded-xl px-5 py-3.5">
              <span className="text-sm font-bold tracking-wide">รวมเป็นเงิน / Total</span>
              <span className="text-lg font-black">
                {total > 0
                  ? total.toLocaleString('th-TH', { minimumFractionDigits: 2 })
                  : '0.00'}
                <span className="text-stone-400 text-xs font-normal ml-1.5">บาท</span>
              </span>
            </div>

            <div className="mt-4">
              <Field label="จำนวนเงินรวม (ตัวอักษร)" required>
                <input type="text" name="total_text" required
                  placeholder="เช่น ห้าร้อยบาทถ้วน"
                  defaultValue={edit?.total_text}
                  className={inp()} />
              </Field>
            </div>

          </Card>

          {/* ════════════════════════════════════════════════
               ส่วน 3 — ลายมือชื่อผู้รับเงิน (ใน UI เก่าเขียนผู้จ่ายเงิน แต่ใน Form รับคือผู้รับ)
          ════════════════════════════════════════════════ */}
          <Card title="ลายมือชื่อผู้รับเงิน">

            {edit?.payer_signature && (
              <p className="text-xs text-stone-400 mb-3">
                * มีลายเซ็นเดิมถูกบันทึกไว้แล้ว — เซ็นใหม่ด้านล่างเพื่อเปลี่ยน
              </p>
            )}

            <div className="border-2 border-dashed border-stone-300 rounded-xl bg-stone-50 overflow-hidden cursor-crosshair hover:border-stone-400 transition-colors">
              <SignatureCanvas ref={sigRef} penColor="#1c1917"
                canvasProps={{ className: 'w-full', style: { minHeight: 130, display: 'block' } }} />
            </div>

            <button type="button" onClick={() => sigRef.current.clear()}
              className="mt-2 flex items-center gap-1.5 text-xs text-stone-400 hover:text-red-500 font-medium transition-colors ml-auto">
              <Eraser size={12} /> ล้างลายเซ็น
            </button>

            <div className="mt-4 pt-4 border-t border-dashed border-stone-200 text-[12px] text-stone-400 leading-relaxed">
              เนื่องจาก ข้าพเจ้าเป็นบุคคลธรรมดา ไม่ต้องจดทะเบียนการค้า และภาษีมูลค่าเพิ่ม
              จึงออกใบสำคัญรับเงินฉบับนี้ เพื่อเป็นหลักฐานในการรับเงิน แทนใบเสร็จรับเงิน
            </div>
            <p className="mt-2 text-[12.5px] text-stone-500 font-medium text-center">
              ขอรับรองว่า ข้อความข้างต้นเป็นความจริงทุกประการ
            </p>

          </Card>

          {/* ── ปุ่มกระทำ ── */}
          <div className="flex gap-3 pt-2 pb-10">
            <button type="button" onClick={() => navigate(-1)}
              className="flex-1 py-3.5 rounded-xl border border-stone-200 text-stone-500 text-sm font-bold text-center hover:bg-stone-100 transition-colors">
              ยกเลิก
            </button>
            <button type="submit" disabled={loading}
              className="flex-[3] py-3.5 rounded-xl bg-stone-900 text-white text-sm font-black flex items-center justify-center gap-2 hover:bg-black transition-colors disabled:opacity-50">
              {loading
                ? <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    กำลังบันทึก...
                  </>
                : <>
                    <Save size={16} />
                    {edit ? 'บันทึกการแก้ไข' : 'บันทึกและพิมพ์'}
                  </>}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

// ── UI Helpers (ปรับปรุง Font Size สำหรับ Web/Mobile UX) ────────────────────────

function Card({ title, children, action }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-stone-50/80">
        <span className="text-xs sm:text-sm font-extrabold text-stone-500 uppercase tracking-widest">
          {title}
        </span>
        {action}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  )
}

function Row2({ children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-5">
      {children}
    </div>
  )
}

function Field({ label, hint, required, children }) {
  return (
    <div>
      <label className="block text-xs sm:text-sm font-extrabold text-stone-500 uppercase tracking-widest mb-2">
        {label}
        {hint && <span className="ml-1.5 normal-case text-xs font-normal text-stone-400">{hint}</span>}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

// ปรับ Input ให้เป็น text-base (16px) เพื่อรองรับ Mobile ไม่ให้ซูม และอ่านง่ายบน PC
function inp(extra = '') {
  return `w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-base text-stone-800 outline-none focus:ring-2 focus:ring-stone-300 focus:border-stone-400 transition-all ${extra}`
}

// ปรับ Input ในตารางให้ใหญ่ขึ้นเป็น text-sm (14px) หรือ text-base (16px)
function rowInp(align = '') {
  return `w-full px-3 py-2.5 bg-white border border-stone-200 rounded-lg text-sm sm:text-base text-stone-800 outline-none focus:ring-2 focus:ring-stone-300 transition-all${align ? ` text-${align}` : ''}`
}