import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from './supabaseClient'
import SignatureCanvas from 'react-signature-canvas'
import toast from 'react-hot-toast'
import { 
  ArrowLeft, Save, Plus, Trash2, FileText, 
  User, CreditCard, Calendar, Briefcase, 
  Hash, DollarSign, PenTool, Eraser,
  ChevronLeft, Home, ChevronRight, ReceiptText // เพิ่มไอคอนสำหรับ Navbar และ Header
} from 'lucide-react'

// --- คง InputGroup เดิมของคุณไว้ ---
const InputGroup = ({ label, icon: Icon, fullWidth, ...props }) => (
    <div className={`space-y-1.5 ${fullWidth ? 'col-span-1 md:col-span-2' : ''}`}>
      <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
        {Icon && <Icon size={16} className="text-blue-500" />}
        {label}
      </label>
      <input
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 text-slate-700"
        {...props}
      />
    </div>
  )

export default function ReceiptForm() {
  const navigate = useNavigate()
  const sigPad = useRef({})
  const [loading, setLoading] = useState(false)
  
  const [items, setItems] = useState([
    { date: '', detail: '', amount: '', project_no: '' }
  ])

  const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)

  const addItem = () => {
    setItems([...items, { date: '', detail: '', amount: '', project_no: '' }])
  }

  const removeItem = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index)
      setItems(newItems)
    }
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.target)
      const data = Object.fromEntries(formData.entries())

      let signatureUrl = null
      if (sigPad.current && !sigPad.current.isEmpty()) {
        const canvas = sigPad.current.getCanvas()
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
        const fileName = `receipt-sig-${Date.now()}.png`
        const { error: uploadError } = await supabase.storage.from('signatures').upload(fileName, blob)
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('signatures').getPublicUrl(fileName)
        signatureUrl = urlData.publicUrl
      }

      const { data: insertedData, error: insertError } = await supabase
        .from('doc_substitute_receipts')
        .insert([{
            doc_no: data.doc_no,
            payer_name: data.payer_name,
            position: data.position,
            items: items,
            total_amount: totalAmount,
            total_text: data.total_text,
            payment_method: data.payment_method,
            payment_date: data.payment_date || null,
            payer_signature: signatureUrl
        }])
        .select()

      if (insertError) throw insertError
      const newId = insertedData[0].id
      toast.success('บันทึกข้อมูลเรียบร้อย!')
      navigate(`/receipt-print/${newId}`) 

    } catch (error) {
      console.error(error)
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-sans">
      
      {/* --- Sticky Navbar (New) --- */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/" className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
              <ChevronLeft size={18} />
            </Link>
            <div className="h-5 sm:h-6 w-[1px] bg-slate-200 mx-1" />
            <div className="flex items-center gap-1 sm:gap-2 text-[13px] sm:text-sm font-medium">
              <Link to="/" className="text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors">
                <Home size={14} /> หน้าแรก
              </Link>
              <ChevronRight size={12} className="text-slate-300" />
              <span className="text-slate-800 font-bold">ใบรับรองแทนใบเสร็จ</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* --- Header Section (New) --- */}
        <div className="flex items-center gap-5 mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shadow-xl shadow-orange-500/20 rotate-3">
            <ReceiptText size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Substitute Receipt</h1>
            <p className="text-slate-500 text-sm font-medium">ใบรับรองแทนใบเสร็จรับเงิน / เอกสารเบิกจ่าย</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Card 1: ข้อมูลเอกสาร & ผู้เบิก (ใช้สไตล์เดิมของคุณ) */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-6 text-slate-800 font-bold text-lg border-b border-slate-100 pb-4">
              <FileText className="text-blue-600" />
              ข้อมูลเอกสารและผู้เบิก
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup 
                label="เลขที่เอกสาร" 
                name="doc_no" 
                required 
                icon={Hash}
                placeholder="เช่น 65/001"
              />
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <Calendar size={16} className="text-blue-500" />
                  วันที่ทำรายการ
                </label>
                <div className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 flex justify-between items-center cursor-not-allowed font-medium">
                  {new Date().toISOString().split('T')[0]}
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-400 font-bold">AUTO</span>
                </div>
              </div>

              <InputGroup 
                label="ข้าพเจ้า (ชื่อผู้เบิก)" 
                name="payer_name" 
                required 
                icon={User}
                placeholder="ระบุชื่อ-นามสกุล"
              />

              <InputGroup 
                label="ตำแหน่ง" 
                name="position" 
                required 
                icon={Briefcase}
                placeholder="ระบุตำแหน่งงาน"
              />
            </div>
          </div>

          {/* Card 2: รายการค่าใช้จ่าย (ใช้สไตล์เดิมของคุณ) */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
                <CreditCard className="text-orange-500" />
                รายการค่าใช้จ่าย
              </div>
              <button 
                type="button" 
                onClick={addItem} 
                className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-blue-100 transition-colors"
              >
                <Plus size={16} /> เพิ่มรายการ
              </button>
            </div>

            <div className="space-y-4">
              {/* Header Row for Desktop */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <div className="col-span-2">วันที่บิล</div>
                <div className="col-span-5">รายละเอียด</div>
                <div className="col-span-2 text-right">จำนวนเงิน</div>
                <div className="col-span-2">Project No.</div>
                <div className="col-span-1"></div>
              </div>

              {items.map((item, index) => (
                <div key={index} className="group relative bg-slate-50 p-4 rounded-xl border border-slate-100 md:bg-white md:border-0 md:p-0 md:hover:bg-slate-50 md:transition-colors">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-start md:items-center">
                    <div className="md:col-span-2">
                      <label className="md:hidden text-xs font-semibold text-slate-500 mb-1 block">วันที่</label>
                      <input type="date" value={item.date} onChange={(e) => handleItemChange(index, 'date', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none" required />
                    </div>
                    <div className="md:col-span-5">
                      <label className="md:hidden text-xs font-semibold text-slate-500 mb-1 block">รายละเอียด</label>
                      <input type="text" placeholder="ระบุรายละเอียด..." value={item.detail} onChange={(e) => handleItemChange(index, 'detail', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none" required />
                    </div>
                    <div className="md:col-span-2">
                      <label className="md:hidden text-xs font-semibold text-slate-500 mb-1 block">จำนวนเงิน</label>
                      <input type="number" placeholder="0.00" value={item.amount} onChange={(e) => handleItemChange(index, 'amount', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-right text-slate-700 focus:border-blue-500 outline-none" required />
                    </div>
                    <div className="md:col-span-2">
                      <label className="md:hidden text-xs font-semibold text-slate-500 mb-1 block">Project No.</label>
                      <input type="text" placeholder="-" value={item.project_no} onChange={(e) => handleItemChange(index, 'project_no', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-500 focus:border-blue-500 outline-none" />
                    </div>
                    <div className="md:col-span-1 flex justify-end">
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(index)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="w-full md:w-2/3">
                <label className="text-sm font-semibold text-slate-600 mb-1.5 block">จำนวนเงินรวม (ตัวอักษร) <span className="text-red-500">*</span></label>
                <input type="text" name="total_text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-slate-700" placeholder="เช่น ห้าร้อยบาทถ้วน" required />
              </div>
              <div className="w-full md:w-1/3 text-right">
                <p className="text-sm text-slate-500 font-medium mb-1">ยอดรวมทั้งสิ้น</p>
                <div className="text-3xl font-bold text-blue-600">
                  {totalAmount.toLocaleString()} <span className="text-sm text-slate-400 font-normal">บาท</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: วิธีจ่าย & ลายเซ็น (ใช้สไตล์เดิมของคุณ) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                <DollarSign size={20} className="text-emerald-500" /> 
                วิธีการจ่ายเงิน
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                  <input type="radio" name="payment_method" value="cash" defaultChecked className="w-5 h-5 text-blue-600 accent-blue-600" />
                  <span className="font-medium text-slate-700">เงินสด (Cash)</span>
                </label>
                <div className="border border-slate-200 rounded-xl p-3 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 transition-all">
                  <label className="flex items-center gap-3 cursor-pointer mb-2">
                    <input type="radio" name="payment_method" value="transfer" className="w-5 h-5 text-blue-600 accent-blue-600" />
                    <span className="font-medium text-slate-700">โอนเงิน (Transfer)</span>
                  </label>
                  <input type="date" name="payment_date" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
              <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                <PenTool size={20} className="text-purple-500" /> 
                ลายมือชื่อผู้เบิก
              </h3>
              <div className="flex-1 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-white hover:border-purple-400 transition-colors cursor-crosshair relative overflow-hidden">
                <SignatureCanvas ref={sigPad} penColor="black" canvasProps={{ className: 'w-full h-full min-h-[160px]' }} />
                <div className="absolute bottom-2 right-2 text-xs text-slate-300 pointer-events-none select-none font-bold uppercase">Sign Here</div>
              </div>
              <button type="button" onClick={() => sigPad.current.clear()} className="mt-3 text-sm text-red-500 hover:text-red-600 flex items-center gap-1 font-medium self-end hover:bg-red-50 px-2 py-1 rounded transition-colors">
                <Eraser size={14} /> ล้างลายเซ็น
              </button>
            </div>
          </div>

          <div className="pt-4 flex flex-col-reverse md:flex-row gap-4">
            <Link to="/" className="flex-1 px-6 py-4 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors text-center">ยกเลิก</Link>
            <button type="submit" disabled={loading} className="flex-[2] px-6 py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-black shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 transform active:scale-[0.99]">
              {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> กำลังบันทึก...</> : <><Save size={20} /> บันทึกเอกสาร</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}