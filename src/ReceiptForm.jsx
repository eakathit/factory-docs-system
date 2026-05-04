import { useState, useRef } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { supabase } from './supabaseClient'
import SignatureCanvas from 'react-signature-canvas'
import toast from 'react-hot-toast'
import { ChevronLeft, Home, ChevronRight, Plus, Trash2, Save, Eraser, FileText, Eye } from 'lucide-react'
import ReceiptDocumentView from './ReceiptDocumentView'

export default function ReceiptForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const sigRef = useRef({})
  const [loading, setLoading] = useState(false)
  const editData = location.state || null

  // ── Controlled state สำหรับ live preview ─────────────────────
  const [docNo, setDocNo] = useState(editData?.doc_no || '')
  const [payerName, setPayerName] = useState(editData?.payer_name || '')
  const [position, setPosition] = useState(editData?.position || '')
  const [totalText, setTotalText] = useState(editData?.total_text || '')
  const [paymentDate, setPaymentDate] = useState(editData?.payment_date || '')
  const [shopName, setShopName] = useState(editData?.shop_name || '')

  // ── State สำหรับรายการค่าใช้จ่าย ──────────────────────────────
  const [items, setItems] = useState(
    editData?.items || [{ date: '', detail: '', amount: '', project_no: '' }]
  )

  const totalAmount = items.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0), 0
  )

  const addItem = () =>
    setItems(p => [...p, { date: '', detail: '', amount: '', project_no: '' }])
  
  const removeItem = i =>
    items.length > 1 && setItems(p => p.filter((_, x) => x !== i))
  
  const handleItemChange = (i, field, value) =>
    setItems(p => { const n = [...p]; n[i] = { ...n[i], [field]: value }; return n })

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      let signatureUrl = editData?.payer_signature || null

      if (sigRef.current && typeof sigRef.current.isEmpty === 'function' && !sigRef.current.isEmpty()) {
        try {
          const blob = await new Promise(r => sigRef.current.getCanvas().toBlob(r, 'image/png'))
          const fileName = `receipt-sig-${Date.now()}.png`
          const { error: uploadError } = await supabase.storage.from('signatures').upload(fileName, blob)
          if (uploadError) throw uploadError
          signatureUrl = supabase.storage.from('signatures').getPublicUrl(fileName).data.publicUrl
        } catch (sigError) {
          console.warn('Signature upload failed, saving document without signature:', sigError.message)
          toast('บันทึกเอกสารสำเร็จ แต่ลายเซ็นอาจไม่ได้รับการบันทึก', { icon: '⚠️' })
        }
      }

      const dbPayload = {
        doc_no: docNo,
        payer_name: payerName,
        position: position,
        shop_name: shopName,
        items: items.map(item => ({
          ...item,
          amount: parseFloat(item.amount || 0)
        })),
        total_amount: totalAmount,
        total_text: totalText,
        payment_method: paymentMethod,
        payment_date: paymentDate || null,
        payer_signature: signatureUrl,
        status: 'Pending'
      }

      let newId = null

      if (editData?.id) {
        const { data, error } = await supabase
          .from('doc_substitute_receipts')
          .update(dbPayload)
          .eq('id', editData.id)
          .select()
        if (error) throw error
        newId = data[0].id
      } else {
        const { data, error } = await supabase
          .from('doc_substitute_receipts')
          .insert([dbPayload])
          .select()
        if (error) throw error
        newId = data[0].id
      }

      toast.success('บันทึกข้อมูลเรียบร้อย!')
      navigate(`/receipt-print/${newId}`, { state: { ...dbPayload, id: newId } })

    } catch (error) {
      console.error(error)
      toast.error('เกิดข้อผิดพลาด: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const [paymentMethod, setPaymentMethod] = useState(editData?.payment_method || 'cash')
  const [activeTab, setActiveTab] = useState('form')

  // ── Live preview object ───────────────────────────────────────
  const previewDoc = {
    doc_no: docNo,
    payer_name: payerName,
    position,
    shop_name: shopName,
    items,
    total_amount: totalAmount,
    total_text: totalText,
    payment_method: paymentMethod,
    payment_date: paymentDate,
    payer_signature: null,
    approver_signature: null,
  }

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: "'Prompt', sans-serif" }}>

      {/* ════ Sticky Navbar (full width) ════ */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
        <div className="px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          {/* breadcrumb */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link to="/" className="p-1.5 sm:p-2 hover:bg-stone-100 rounded-full text-stone-500 transition-colors shrink-0">
              <ChevronLeft size={18} />
            </Link>
            <div className="h-5 sm:h-6 w-[1px] bg-stone-200 mx-1 shrink-0" />
            <div className="flex items-center gap-1 sm:gap-2 text-[13px] sm:text-sm font-medium min-w-0">
              <Link to="/" className="text-stone-400 hover:text-stone-800 flex items-center gap-1 transition-colors whitespace-nowrap shrink-0">
                <Home size={14} /> หน้าแรก
              </Link>
              <ChevronRight size={12} className="text-stone-300 shrink-0" />
              <span className="text-stone-800 truncate font-bold">
                Substitute Receipt {editData && "(แก้ไข)"}
              </span>
            </div>
          </div>

          {/* Tab toggle — มือถือ/tablet เท่านั้น, ซ่อนที่ xl+ เพราะมี split-view แล้ว */}
          <div className="xl:hidden flex items-center bg-stone-100 rounded-xl p-1 gap-1 shrink-0 ml-3">
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'form'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <FileText size={13} /> กรอกข้อมูล
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'preview'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <Eye size={13} /> ดูตัวอย่าง
            </button>
          </div>
        </div>
      </nav>

      {/* ════ Split-view body ════ */}
      <div className="xl:flex xl:h-[calc(100vh-64px)]">

        {/* ─── Form panel — ซ่อนบนมือถือเมื่อ tab preview active ─── */}
        <div className={`xl:w-[45%] xl:overflow-y-auto pb-20 ${activeTab === 'preview' ? 'hidden xl:block' : ''}`}>
          <div className="max-w-2xl mx-auto px-4 pt-8">
        
        {/* ── Page heading ── */}
        <div className="mb-7">
          <h1 className="text-xl font-bold text-stone-800 tracking-tight uppercase">
            Substitute Receipt
          </h1>
          <p className="text-stone-400 text-sm mt-0.5">ใบรับรองแทนใบเสร็จรับเงิน</p>
          <div className="mt-3 h-px bg-stone-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* ════════════════════════════════════════════════
               ส่วน 1 — ข้อมูลเอกสารและผู้เบิก
          ════════════════════════════════════════════════ */}
          <Card title="ข้อมูลเอกสารและผู้เบิก">
            <Row2>
              <Field label="เลขที่เอกสาร" hint="Doc No." required>
                <input type="text" required
                  value={docNo}
                  onChange={e => setDocNo(e.target.value)}
                  placeholder="เช่น 65/001"
                  className={inp('font-sens')} />
              </Field>
              <Field label="วันที่ทำรายการ" hint="Date">
                <div className="w-full px-4 py-3 bg-stone-100 border border-stone-200 rounded-xl text-stone-500 flex justify-between items-center cursor-not-allowed text-base font-medium">
                  {new Date().toISOString().split('T')[0]}
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-stone-200 text-stone-400 font-bold">AUTO</span>
                </div>
              </Field>
            </Row2>

            <Row2>
              <Field label="ข้าพเจ้า (ผู้เบิก)" hint="Name" required>
                <input type="text" required
                  value={payerName}
                  onChange={e => setPayerName(e.target.value)}
                  placeholder="ระบุชื่อ-นามสกุล"
                  className={inp()} />
              </Field>
              <Field label="ตำแหน่ง" hint="Position" required>
                <input type="text" required
                  value={position}
                  onChange={e => setPosition(e.target.value)}
                  placeholder="ระบุตำแหน่งงาน"
                  className={inp()} />
              </Field>
            </Row2>
            <Field label="ชื่อร้านค้า / แพลตฟอร์ม" hint="เช่น Shopee ร้าน ABC, Lazada" required>
              <input type="text" required
                value={shopName}
                onChange={e => setShopName(e.target.value)}
                placeholder="เช่น Shopee ร้าน ABC, Lazada, TikTok Shop"
                className={inp()} />
            </Field>
          </Card>

          {/* ════════════════════════════════════════════════
               ส่วน 2 — รายการค่าใช้จ่าย
          ════════════════════════════════════════════════ */}
          <Card 
            title="รายการค่าใช้จ่าย"
            action={
              <button type="button" onClick={addItem} 
                className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors">
                <Plus size={13} /> เพิ่มรายการ
              </button>
            }
          >
            {/* Table Header (ซ่อนในจอมือถือขนาดเล็ก) */}
            <div className="hidden sm:grid gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-wider pb-2 border-b border-stone-200"
              style={{ gridTemplateColumns: '130px 1fr 120px 100px 30px' }}>
              <div>วันที่บิล</div>
              <div>รายละเอียด</div>
              <div className="text-right">จำนวนเงิน</div>
              <div className="text-center">Project No.</div>
              <div />
            </div>

            <div className="space-y-3 sm:space-y-2 mt-2">
              {items.map((item, index) => (
                <div key={index} 
                  className="grid grid-cols-1 sm:grid-cols-none gap-2 items-start sm:items-center bg-stone-50 rounded-lg p-3 sm:px-2 sm:py-2 border border-stone-100"
                  style={{ gridTemplateColumns: window.innerWidth >= 640 ? '130px 1fr 120px 100px 30px' : 'none' }}>
                  
                  <div>
                    <label className="sm:hidden text-xs font-bold text-stone-400 mb-1 block">วันที่บิล</label>
                    <input type="date" required value={item.date} 
                      onChange={(e) => handleItemChange(index, 'date', e.target.value)} 
                      className={rowInp()} />
                  </div>
                  
                  <div>
                    <label className="sm:hidden text-xs font-bold text-stone-400 mb-1 block">รายละเอียด</label>
                    <input type="text" required value={item.detail} placeholder="ระบุรายละเอียด..."
                      onChange={(e) => handleItemChange(index, 'detail', e.target.value)} 
                      className={rowInp()} />
                  </div>
                  
                  <div>
                    <label className="sm:hidden text-xs font-bold text-stone-400 mb-1 block">จำนวนเงิน</label>
                    <input type="number" min="0" step="any" required value={item.amount} placeholder="0.00"
                      onChange={(e) => handleItemChange(index, 'amount', e.target.value)} 
                      className={rowInp('sm:text-right font-medium')} />
                  </div>
                  
                  <div>
                    <label className="sm:hidden text-xs font-bold text-stone-400 mb-1 block">Project No.</label>
                    <input type="text" value={item.project_no} placeholder="-"
                      onChange={(e) => handleItemChange(index, 'project_no', e.target.value)} 
                      className={rowInp('sm:text-center text-stone-500')} />
                  </div>
                  
                  <div className="flex justify-end sm:justify-center mt-2 sm:mt-0">
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(index)} 
                        className="text-stone-300 hover:text-red-500 transition-colors p-1.5 sm:p-0.5 rounded flex items-center gap-1 text-xs">
                        <Trash2 size={16} className="sm:w-[14px] sm:h-[14px]" /> <span className="sm:hidden text-red-400">ลบรายการ</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-stone-800 text-white rounded-xl px-5 py-4 sm:py-3.5 gap-4">
              <span className="text-sm font-bold tracking-wide uppercase">รวมเป็นเงิน / Total</span>
              <span className="text-2xl sm:text-lg font-black w-full sm:w-auto text-right sm:text-left">
                {totalAmount > 0 ? totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '0.00'} 
                <span className="text-stone-400 text-xs font-normal ml-1.5">บาท</span>
              </span>
            </div>

            <div className="mt-4">
              <Field label="จำนวนเงินรวม (ตัวอักษร)" hint="Total in text" required>
                <input type="text" required
                  value={totalText}
                  onChange={e => setTotalText(e.target.value)}
                  placeholder="เช่น ห้าร้อยบาทถ้วน"
                  className={inp()} />
              </Field>
            </div>
          </Card>

          {/* ════════════════════════════════════════════════
               ส่วน 3 — ลายเซ็น
          ════════════════════════════════════════════════ */}
            <Card title="ลายมือชื่อผู้เบิก">
              {editData?.payer_signature && (
                <p className="text-xs text-stone-400 mb-3">
                  * มีลายเซ็นเดิมถูกบันทึกไว้แล้ว — เซ็นใหม่ด้านล่างเพื่อเปลี่ยน
                </p>
              )}
              <div className="border-2 border-dashed border-stone-300 rounded-xl bg-stone-50 overflow-hidden cursor-crosshair hover:border-stone-400 transition-colors relative">
                <SignatureCanvas ref={sigRef} penColor="#1c1917" 
                  canvasProps={{ className: 'w-full', style: { minHeight: 140, display: 'block' } }} />
                <div className="absolute bottom-2 right-3 text-[10px] text-stone-300 pointer-events-none font-bold uppercase tracking-widest">Sign Here</div>
              </div>
              <button type="button" onClick={() => sigRef.current.clear()} 
                className="mt-2 flex items-center gap-1.5 text-xs text-stone-400 hover:text-red-500 font-medium transition-colors ml-auto">
                <Eraser size={12} /> ล้างลายเซ็น
              </button>
            </Card>

          {/* ── ปุ่มกระทำ ── */}
          <div className="flex gap-3 pt-4 pb-10">
            <button type="button" onClick={() => navigate(-1)} 
              className="flex-1 py-3.5 rounded-xl border border-stone-200 text-stone-500 text-sm font-bold text-center hover:bg-stone-100 transition-colors">
              ยกเลิก
            </button>
            <button type="submit" disabled={loading} 
              className="flex-[3] py-3.5 rounded-xl bg-stone-900 text-white text-sm font-black flex items-center justify-center gap-2 hover:bg-black transition-colors disabled:opacity-50">
              {loading 
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> กำลังบันทึก...</> 
                : <><Save size={16} /> {editData ? 'บันทึกการแก้ไข' : 'บันทึกเอกสาร'}</>}
            </button>
          </div>

        </form>
          </div>{/* end max-w-2xl */}
        </div>{/* end form panel */}

        {/* ─── Preview panel — right on xl+, full-screen tab on mobile ─── */}
        <div className={`flex-1 bg-gray-200 overflow-y-auto xl:flex ${
          activeTab === 'preview' ? 'flex' : 'hidden xl:flex'
        }`}>
          <div className="w-full py-6 flex flex-col items-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              ● Live Preview
            </p>
            <style>{`
              @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
              .font-sarabun { font-family: 'Sarabun', sans-serif; }
            `}</style>

            {/* Mobile: full-width scrollable, no scale */}
            <div className="xl:hidden w-full overflow-x-auto px-2">
              <ReceiptDocumentView doc={previewDoc} />
            </div>

            {/* Desktop xl+: scaled to fit panel */}
            <div
              className="hidden xl:block"
              style={{
                transform: 'scale(0.62)',
                transformOrigin: 'top center',
                marginBottom: 'calc((0.62 - 1) * 297mm)',
              }}
            >
              <ReceiptDocumentView doc={previewDoc} />
            </div>
          </div>
        </div>

      </div>{/* end split-view */}
    </div>
  )
}

// ── UI Helpers ──────────────────────────────────────────────────────────────

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

function inp(extra = '') {
  return `w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-base text-stone-800 outline-none focus:ring-2 focus:ring-stone-300 focus:border-stone-400 transition-all ${extra}`
}

function rowInp(extra = '') {
  return `w-full px-3 py-2.5 bg-white border border-stone-200 rounded-lg text-sm sm:text-base text-stone-800 outline-none focus:ring-2 focus:ring-stone-300 transition-all ${extra}`
}