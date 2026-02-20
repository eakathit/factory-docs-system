import { useState, useRef, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from './supabaseClient'
import SignatureCanvas from 'react-signature-canvas'
import { 
  ChevronLeft, 
  Home, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Calculator, 
  Pencil, 
  Printer, 
  Loader2, 
  Wallet, 
  User, 
  FileText, 
  CreditCard,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ReceiptVoucherForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const sigPad = useRef({})
  const [loading, setLoading] = useState(false)

  const { register, control, watch, handleSubmit, setValue, reset } = useForm({
    defaultValues: {
      created_at: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      items: [{ name: '', quantity: 1, unit: 'ชิ้น', price: 0, total: 0 }],
      total_amount: 0
    }
  })

  useEffect(() => {
    if (location.state) {
      reset(location.state)
    }
  }, [location.state, reset])

  const formData = watch()
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  })

  const handleCalculate = () => {
    let grandTotal = 0
    const currentItems = formData.items.map(item => {
      const total = (parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0)
      grandTotal += total
      return { ...item, total }
    })
    setValue('items', currentItems)
    setValue('total_amount', grandTotal)
    toast.success('คำนวณยอดเงินเรียบร้อย')
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      let signatureUrl = data.payer_signature || null
      if (sigPad.current && !sigPad.current.isEmpty()) {
        const canvas = sigPad.current.getCanvas()
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
        const fileName = `voucher-sig-${Date.now()}.png`
        const { error: uploadError } = await supabase.storage.from('signatures').upload(fileName, blob)
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('signatures').getPublicUrl(fileName)
        signatureUrl = urlData.publicUrl
      }

      const dbData = {
        created_at: data.created_at,
        receiver_name: data.receiver_name,
        id_card_number: data.id_card_number,
        address: data.address,
        payment_method: data.payment_method,
        items: data.items,
        total_amount: data.total_amount,
        total_text: data.total_text,
        payer_signature: signatureUrl
      }

      let resultData = null
      if (data.id) {
        const { data: updated, error } = await supabase
          .from('doc_receipt_vouchers')
          .update(dbData)
          .eq('id', data.id)
          .select()
        if (error) throw error
        resultData = updated[0]
      } else {
        const { data: inserted, error } = await supabase
          .from('doc_receipt_vouchers')
          .insert([dbData])
          .select()
        if (error) throw error
        resultData = inserted[0]
      }

      toast.success('บันทึกข้อมูลเรียบร้อย!')
      navigate(`/receipt-voucher-print/${resultData.id}`, { state: resultData })
    } catch (error) {
      console.error(error)
      toast.error('เกิดข้อผิดพลาด: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Helper Component สำหรับ Label
  const FormLabel = ({ label, required }) => (
    <label className="block mb-1.5">
      <span className="text-slate-800 font-bold text-sm uppercase tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
    </label>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-sans">
      {/* --- Sticky Navbar --- */}
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
              <span className="text-slate-800 font-bold">ใบสำคัญรับเงิน</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex items-center gap-5 mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20 rotate-3">
            <Wallet size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Receipt Voucher</h1>
            <p className="text-slate-500 text-sm font-medium">ใบสำคัญรับเงิน / เอกสารการรับเงิน</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Card 1: ข้อมูลผู้รับเงิน */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
              <User size={20} className="text-blue-600" />
              <h3 className="font-bold text-slate-800 uppercase tracking-wider">1. ข้อมูลผู้รับเงิน</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FormLabel label="วันที่เอกสาร" required />
                <input type="date" {...register('created_at')} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
              </div>
              <div>
                <FormLabel label="เลขบัตรประชาชน" required />
                <input {...register('id_card_number')} placeholder="x-xxxx-xxxxx-xx-x" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" required />
              </div>
              <div className="md:col-span-2">
                <FormLabel label="ชื่อ-นามสกุล (ข้าพเจ้า)" required />
                <input {...register('receiver_name')} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" placeholder="ระบุชื่อ-นามสกุล..." required />
              </div>
              <div className="md:col-span-2">
                <FormLabel label="ที่อยู่" required />
                <textarea {...register('address')} rows="2" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none" placeholder="ระบุที่อยู่..." required />
              </div>
            </div>
          </div>

          {/* Card 2: รายการรับเงิน */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-blue-600" />
                <h3 className="font-bold text-slate-800 uppercase tracking-wider">2. รายการรับเงิน</h3>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button type="button" onClick={handleCalculate} className="flex-1 sm:flex-none text-xs bg-green-50 text-green-600 px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 font-bold hover:bg-green-100 transition-colors">
                  <Calculator size={14}/> คำนวณยอด
                </button>
                <button type="button" onClick={() => append({ name: '', quantity: 1, unit: 'ชิ้น', price: 0, total: 0 })} className="flex-1 sm:flex-none text-xs bg-blue-50 text-blue-600 px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 font-bold hover:bg-blue-100 transition-colors">
                  <Plus size={14}/> เพิ่มรายการ
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-4 items-start bg-slate-50/50 p-5 rounded-2xl border border-slate-100 relative group">
                  <div className="col-span-12 sm:col-span-5">
                    <FormLabel label={`รายการที่ ${index + 1}`} />
                    <input placeholder="ระบุรายการ..." {...register(`items.${index}.name`)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 transition-all text-sm" required />
                  </div>
                  {/* จำนวน & หน่วย */}
      <div className="col-span-6 sm:col-span-3">
        <FormLabel label="จำนวน / หน่วย" />
        <div className="flex gap-2">
          <input 
            type="number" 
            {...register(`items.${index}.quantity`)} 
            className="w-1/2 px-2 py-2.5 bg-white border border-slate-200 rounded-lg text-center outline-none text-sm focus:border-blue-500 transition-all" 
          />
          
          {/* ช่องหน่วย พร้อมไอคอนดินสอสื่อว่าแก้ไขได้ */}
          <div className="relative w-1/2 group/unit">
            <input 
              placeholder="หน่วย" 
              {...register(`items.${index}.unit`)} 
              className="w-full pl-2 pr-7 py-2.5 bg-white border border-slate-200 rounded-lg text-center outline-none text-sm focus:border-blue-500 transition-all" 
            />
            <Pencil 
              size={12} 
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-hover/unit:text-slate-400 transition-colors" 
            />
          </div>
        </div>
      </div>
                  <div className="col-span-6 sm:col-span-3">
                    <FormLabel label="ราคา/หน่วย" />
                    <input type="number" {...register(`items.${index}.price`)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-right outline-none text-sm" />
                  </div>
                  <div className="col-span-12 sm:col-span-1 flex justify-end sm:justify-center pt-2 sm:pt-8">
                    <button type="button" onClick={() => remove(index)} className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all">
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <div className="text-right bg-blue-50/50 px-8 py-5 rounded-2xl border border-blue-100">
                <div className="text-xs text-blue-600 font-bold uppercase mb-1">รวมเป็นเงินทั้งสิ้น</div>
                <div className="text-3xl font-black text-slate-900 tracking-tight">
                  {parseFloat(watch('total_amount') || 0).toLocaleString()} <span className="text-lg">บาท</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: การจ่ายเงิน & ลายเซ็น */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-4">
              <CreditCard size={20} className="text-blue-600" />
              <h3 className="font-bold text-slate-800 uppercase tracking-wider">3. ได้รับเงินเป็น</h3>
            </div>

            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1.5">
              {[
                { id: 'cash', label: 'เงินสด' },
                { id: 'transfer', label: 'โอนเงิน' }
              ].map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setValue('payment_method', method.id)}
                  className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${
                    watch('payment_method') === method.id
                      ? "bg-white text-blue-600 shadow-md ring-1 ring-black/5"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>

            <div className="border border-slate-200 rounded-2xl p-6 bg-white shadow-inner">
              <div className="flex justify-between items-end mb-4">
                <FormLabel label="ลายเซ็นผู้จ่ายเงิน" />
                <button type="button" onClick={() => sigPad.current.clear()} className="text-xs text-red-500 font-bold hover:underline mb-1.5">ล้างลายเซ็น</button>
              </div>
              <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl overflow-hidden h-48 cursor-crosshair">
                <SignatureCanvas ref={sigPad} penColor="black" canvasProps={{ className: 'w-full h-full' }} />
              </div>
            </div>

            
          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4 mt-10 pt-8 border-t border-slate-100">
            <button type="button" onClick={() => navigate('/')} className="px-6 py-2.5 text-sm text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">ยกเลิก</button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:bg-black hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? <><Loader2 size={24} className="animate-spin" /> กำลังบันทึก...</> : <><Printer size={24} /> บันทึกและพิมพ์</>}
            </button>
          </div>
          
          </div>

        </form>
      </div>
    </div>
  )
}