import { useState, useRef } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { supabase } from './supabaseClient'
import SignatureCanvas from 'react-signature-canvas'
import toast from 'react-hot-toast'
import { ChevronLeft, Home, ChevronRight, Plus, Trash2, Save, Eraser, FileText, Eye } from 'lucide-react'
import ReceiptVoucherDocumentView from './ReceiptVoucherDocumentView'
import FormHeader from './FormHeader'

export default function ReceiptVoucherForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const sigRef = useRef({})
  const [loading, setLoading] = useState(false)
  const edit = location.state || null

  // ── Controlled state ──────────────────────────────────────────────────────
  const [createdAt,     setCreatedAt]     = useState(edit?.created_at     || new Date().toISOString().split('T')[0])
  const [receiverName,  setReceiverName]  = useState(edit?.receiver_name  || '')
  const [idCardNumber,  setIdCardNumber]  = useState(edit?.id_card_number || '')
  const [address,       setAddress]       = useState(edit?.address        || '')
  const [paymentMethod, setPaymentMethod] = useState(edit?.payment_method || 'cash')
  const [totalText,     setTotalText]     = useState(edit?.total_text     || '')
  const [activeTab,     setActiveTab]     = useState('form')

  // ── Table rows ────────────────────────────────────────────────────────────
  const [rows, setRows] = useState(
    edit?.items || [{ name: '', quantity: '', unit: '', price: '' }]
  )

  const total = rows.reduce(
    (s, r) => s + (parseFloat(r.quantity || 0) * parseFloat(r.price || 0)), 0
  )

  const addRow = () => setRows(p => [...p, { name: '', quantity: '', unit: '', price: '' }])
  const delRow = i  => rows.length > 1 && setRows(p => p.filter((_, x) => x !== i))
  const setRow = (i, f, v) => setRows(p => { const n = [...p]; n[i] = { ...n[i], [f]: v }; return n })

  // ── Live preview doc ──────────────────────────────────────────────────────
  const previewDoc = {
    created_at:     createdAt,
    receiver_name:  receiverName,
    id_card_number: idCardNumber,
    address,
    payment_method: paymentMethod,
    total_amount:   total,
    total_text:     totalText,
    items: rows.map(r => ({
      name:     r.name,
      quantity: parseFloat(r.quantity || 0),
      unit:     r.unit,
      price:    parseFloat(r.price || 0),
      total:    parseFloat(r.quantity || 0) * parseFloat(r.price || 0),
    })),
    payer_signature:    null,
    approver_signature: null,
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      let sig = edit?.payer_signature || null

      if (sigRef.current && !sigRef.current.isEmpty()) {
        try {
          const blob = await new Promise(r => sigRef.current.getCanvas().toBlob(r, 'image/png'))
          const name = `voucher-sig-${Date.now()}.png`
          const { error: ue } = await supabase.storage.from('signatures').upload(name, blob)
          if (ue) throw ue
          sig = supabase.storage.from('signatures').getPublicUrl(name).data.publicUrl
        } catch (sigErr) {
          console.warn('Signature upload failed (soft):', sigErr)
        }
      }

      const payload = {
        created_at:     createdAt || new Date().toISOString().split('T')[0],
        receiver_name:  receiverName,
        id_card_number: idCardNumber,
        address,
        payment_method: paymentMethod,
        total_amount:   total,
        total_text:     totalText,
        items: rows.map(r => ({
          name:     r.name,
          quantity: parseFloat(r.quantity || 0),
          unit:     r.unit,
          price:    parseFloat(r.price || 0),
          total:    parseFloat(r.quantity || 0) * parseFloat(r.price || 0),
        })),
        payer_signature: sig,
        status: edit?.status || 'Pending',
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
      navigate(`/receipt-voucher-print/${newId}`, { state: { ...payload, id: newId } })
    } catch (err) {
      console.error(err)
      toast.error('เกิดข้อผิดพลาด: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: "'Prompt', sans-serif" }}>
      <FormHeader
        title="Receipt Voucher"
        isEditing={!!edit?.id}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        accent="rose"
      />

      {/* ── Split layout ── */}
      <div className="xl:flex xl:h-[calc(100vh-64px)]">

        {/* ─── Form panel ─── */}
        <div className={`xl:w-[45%] xl:overflow-y-auto ${
          activeTab === 'preview' ? 'hidden xl:block' : 'block'
        }`}>
          <div className="max-w-2xl mx-auto px-4 pt-8">

            <div className="mb-7">
              <h1 className="text-xl font-bold text-stone-800 tracking-tight">RECEIPT VOUCHER</h1>
              <p className="text-stone-400 text-sm mt-0.5">ใบสำคัญรับเงิน</p>
              <div className="mt-3 h-px bg-stone-200" />
            </div>

            <form onSubmit={onSubmit} className="space-y-4">

              {/* ═══ ส่วน 1 — ข้อมูลผู้รับเงิน ═══ */}
              <Card title="ข้อมูลผู้รับเงิน">

                <Row2>
                  <Field label="วันที่" hint="Date" required>
                    <input type="date"
                      value={createdAt}
                      onChange={e => setCreatedAt(e.target.value)}
                      className={inp()} required />
                  </Field>
                  <div />
                </Row2>

                <Row2>
                  <Field label="ข้าพเจ้า" hint="ชื่อ-นามสกุลผู้รับเงิน" required>
                    <input type="text" required
                      placeholder="ชื่อ-นามสกุล"
                      value={receiverName}
                      onChange={e => setReceiverName(e.target.value)}
                      className={inp()} />
                  </Field>
                  <Field label="เลขบัตรประชาชน">
                    <input type="text" maxLength={13}
                      placeholder="_ _ _ _ _ _ _ _ _ _ _ _ _"
                      value={idCardNumber}
                      onChange={e => setIdCardNumber(e.target.value)}
                      className={inp('tracking-widest')} required />
                  </Field>
                </Row2>

                <Field label="ที่อยู่" hint="Address" required>
                  <input type="text"
                    placeholder="ระบุที่อยู่"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className={inp()} required />
                </Field>

                {/* ข้อความบริษัท + ยอดรวม live */}
                <div className="mt-4 pt-4 border-t border-dashed border-stone-200 text-[13.5px] text-stone-500 leading-loose">
                  ตามสำเนาแนบท้าย ได้รับเงินจาก{' '}
                  <span className="font-semibold text-stone-800">
                    บริษัท ฮารุ ซิสเต็ม ดีเวล็อปเมนต์ (ไทยแลนด์) จำกัด
                  </span>{' '}
                  เป็นจำนวนเงิน
                  <span className="inline-block min-w-[110px] border-b border-stone-400 text-center mx-2 font-bold text-stone-900 text-[15px]">
                    {total > 0 ? total.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '\u00A0'}
                  </span>
                  บาท
                </div>

                <div className="mt-3 flex items-center gap-5 flex-wrap">
                  <span className="text-[13.5px] text-stone-600 font-medium">ได้รับเงินเป็น</span>
                  {[{ v: 'cash', l: 'เงินสด' }, { v: 'transfer', l: 'โอนเงิน' }].map(o => (
                    <label key={o.v} className="flex items-center gap-2 cursor-pointer text-[13.5px] text-stone-700">
                      <input type="radio" name="payment_method" value={o.v}
                        checked={paymentMethod === o.v}
                        onChange={() => setPaymentMethod(o.v)}
                        className="w-4 h-4 accent-stone-700" />
                      {o.l}
                    </label>
                  ))}
                </div>

              </Card>

              {/* ═══ ส่วน 2 — รายการ ═══ */}
              <Card
                title="รายการค่าใช้จ่าย"
                action={
                  <button type="button" onClick={addRow}
                    className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors">
                    <Plus size={13} /> เพิ่มรายการ
                  </button>
                }
              >
                {/* ── Desktop header (sm+) ── */}
                <div className="hidden sm:grid gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-wider pb-2 border-b border-stone-200"
                  style={{ gridTemplateColumns: '28px 1fr 70px 60px 100px 90px 28px' }}>
                  <div className="text-center">#</div>
                  <div>รายการ</div>
                  <div className="text-center">จำนวน</div>
                  <div className="text-center">หน่วย</div>
                  <div className="text-right">ราคา/หน่วย</div>
                  <div className="text-right">รวม</div>
                  <div />
                </div>

                <div className="space-y-3 mt-2">
                  {rows.map((row, i) => {
                    const sub = parseFloat(row.quantity || 0) * parseFloat(row.price || 0)
                    return (
                      <div key={i}>

                        {/* ── Mobile layout (< sm) ── */}
                        <div className="sm:hidden bg-stone-50 rounded-xl border border-stone-200 overflow-hidden">
                          {/* Header row */}
                          <div className="flex items-center gap-2 px-3 py-2 bg-stone-100/60 border-b border-stone-200">
                            <span className="text-[11px] font-black text-stone-400 w-5 text-center">{i + 1}</span>
                            <input type="text" required value={row.name}
                              placeholder="ชื่อรายการ / รายละเอียด..."
                              onChange={e => setRow(i, 'name', e.target.value)}
                              className="flex-1 bg-transparent text-sm font-semibold text-stone-800 outline-none placeholder:text-stone-300 placeholder:font-normal" />
                            {rows.length > 1 && (
                              <button type="button" onClick={() => delRow(i)}
                                className="text-stone-300 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50">
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                          {/* Fields grid */}
                          <div className="grid grid-cols-3 divide-x divide-stone-200">
                            <div className="px-3 py-2.5">
                              <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">จำนวน</p>
                              <input type="number" min="0" step="any" value={row.quantity}
                                placeholder="0"
                                onChange={e => setRow(i, 'quantity', e.target.value)}
                                className="w-full text-sm font-bold text-stone-800 outline-none bg-transparent text-center" />
                            </div>
                            <div className="px-3 py-2.5">
                              <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">หน่วย</p>
                              <input type="text" value={row.unit}
                                placeholder="ชิ้น"
                                onChange={e => setRow(i, 'unit', e.target.value)}
                                className="w-full text-sm font-bold text-stone-800 outline-none bg-transparent text-center" />
                            </div>
                            <div className="px-3 py-2.5">
                              <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">ราคา/หน่วย</p>
                              <input type="number" min="0" step="any" value={row.price}
                                placeholder="0.00"
                                onChange={e => setRow(i, 'price', e.target.value)}
                                className="w-full text-sm font-bold text-stone-800 outline-none bg-transparent text-right" />
                            </div>
                          </div>
                          {/* Subtotal */}
                          <div className="flex items-center justify-between px-3 py-2 bg-stone-100/40 border-t border-stone-200">
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">รวมเป็นเงิน</span>
                            <span className={`text-sm font-black tabular-nums ${sub > 0 ? 'text-stone-800' : 'text-stone-300'}`}>
                              {sub > 0 ? sub.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '—'}
                            </span>
                          </div>
                        </div>

                        {/* ── Desktop layout (sm+) ── */}
                        <div className="hidden sm:grid gap-2 items-center bg-stone-50 rounded-lg px-2 py-2 border border-stone-100"
                          style={{ gridTemplateColumns: '28px 1fr 70px 60px 100px 90px 28px' }}>
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
                            {sub > 0 ? sub.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '—'}
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

                      </div>
                    )
                  })}
                </div>

                <div className="mt-3 flex justify-between items-center bg-stone-800 text-white rounded-xl px-5 py-3.5">
                  <span className="text-sm font-bold tracking-wide">รวมเป็นเงิน / Total</span>
                  <span className="text-lg font-black">
                    {total > 0 ? total.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '0.00'}
                    <span className="text-stone-400 text-xs font-normal ml-1.5">บาท</span>
                  </span>
                </div>

                <div className="mt-4">
                  <Field label="จำนวนเงินรวม (ตัวอักษร)" required>
                    <input type="text" required
                      placeholder="เช่น ห้าร้อยบาทถ้วน"
                      value={totalText}
                      onChange={e => setTotalText(e.target.value)}
                      className={inp()} />
                  </Field>
                </div>
              </Card>

              {/* ═══ ส่วน 3 — ลายมือชื่อผู้รับเงิน ═══ */}
              <Card title="ลายมือชื่อผู้รับเงิน">
                {edit?.payer_signature && (
                  <p className="text-xs text-stone-400 mb-3">
                    * มีลายเซ็นเดิมถูกบันทึกไว้แล้ว — เซ็นใหม่ด้านล่างเพื่อเปลี่ยน
                  </p>
                )}
                <div className="border-2 border-dashed border-stone-300 rounded-xl bg-stone-50 overflow-hidden cursor-crosshair hover:border-stone-400 transition-colors relative">
                  <SignatureCanvas ref={sigRef} penColor="#1c1917"
                    canvasProps={{ className: 'w-full', style: { minHeight: 130, display: 'block' } }} />
                  <div className="absolute bottom-2 right-3 text-[10px] text-stone-300 pointer-events-none font-bold uppercase tracking-widest">Sign Here</div>
                </div>
                <button type="button" onClick={() => sigRef.current.clear()}
                  className="mt-2 flex items-center gap-1.5 text-xs text-stone-400 hover:text-red-500 font-medium transition-colors ml-auto">
                  <Eraser size={12} /> ล้างลายเซ็น
                </button>
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
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> กำลังบันทึก...</>
                    : <><Save size={16} /> {edit ? 'บันทึกการแก้ไข' : 'บันทึกเอกสาร'}</>}
                </button>
              </div>

            </form>
          </div>
        </div>{/* end form panel */}

        {/* ─── Preview panel ─── */}
        <div className={`flex-1 bg-gray-200 overflow-y-auto xl:flex ${
          activeTab === 'preview' ? 'flex' : 'hidden xl:flex'
        }`}>
          <div className="w-full py-6 flex flex-col items-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">● Live Preview</p>
            <style>{`
              @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
              .font-sarabun { font-family: 'Sarabun', sans-serif; }
            `}</style>

            {/* Mobile: full-width */}
            <div className="xl:hidden w-full overflow-x-auto px-2">
              <ReceiptVoucherDocumentView doc={previewDoc} />
            </div>

            {/* Desktop: scaled */}
            <div className="hidden xl:block"
              style={{
                transform: 'scale(0.62)',
                transformOrigin: 'top center',
                marginBottom: 'calc((0.62 - 1) * 297mm)',
              }}>
              <ReceiptVoucherDocumentView doc={previewDoc} />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

// ── UI Helpers ────────────────────────────────────────────────────────────────

function Card({ title, children, action }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-stone-50/80">
        <span className="text-xs sm:text-sm font-extrabold text-stone-500 uppercase tracking-widest">{title}</span>
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

function inp(extra = '') {
  return `w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-base text-stone-800 outline-none focus:ring-2 focus:ring-stone-300 focus:border-stone-400 transition-all ${extra}`
}

function rowInp(align = '') {
  return `w-full px-3 py-2.5 bg-white border border-stone-200 rounded-lg text-sm sm:text-base text-stone-800 outline-none focus:ring-2 focus:ring-stone-300 transition-all${align ? ` text-${align}` : ''}`
}
