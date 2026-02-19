import { useState, useRef, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from './supabaseClient'
import SignatureCanvas from 'react-signature-canvas'
import { ArrowLeft, Plus, Trash2, Calculator, Pencil, Printer, Loader2 } from 'lucide-react'
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

  // 1. โหลดข้อมูลเดิมถ้ามีการกด "กลับไปแก้ไข"
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
      // 2. จัดการลายเซ็น (ถ้ามีการเซ็นใหม่ให้อัปโหลด ถ้าไม่มีให้ใช้ของเดิม)
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

      // 3. Update หรือ Insert ลง DB
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
      
      // 4. ส่งไปหน้า Print พร้อมข้อมูลเลย จะได้ไม่ต้องโหลดซ้ำ
      navigate(`/receipt-voucher-print/${resultData.id}`, { state: resultData })

    } catch (error) {
      console.error(error)
      toast.error('เกิดข้อผิดพลาด: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      <div className="max-w-3xl mx-auto px-4 pt-6 sm:pt-10">
        
         {/* Header */}
         <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center gap-3 mb-6">
            <Link to="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"><ArrowLeft size={20}/></Link>
            <div>
              <h1 className="text-xl font-bold text-slate-800">ใบสำคัญรับเงิน</h1>
              <p className="text-sm text-slate-500">Receipt Voucher</p>
            </div>
         </div>

         {/* Form Body */}
         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Card 1: ข้อมูลผู้รับเงิน */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-5">
                <h3 className="font-bold text-slate-800 text-lg border-b pb-3">1. ข้อมูลผู้รับเงิน</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">วันที่เอกสาร</label>
                        <input type="date" {...register('created_at')} className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">เลขบัตรประชาชน</label>
                        <input {...register('id_card_number')} placeholder="x-xxxx-xxxxx-xx-x" className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" required />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-600 mb-1">ชื่อ-นามสกุล (ข้าพเจ้า)</label>
                        <input {...register('receiver_name')} className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="ระบุชื่อ-นามสกุล..." required />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-600 mb-1">ที่อยู่ตามบัตรประชาชน</label>
                        <textarea {...register('address')} rows="2" className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none" placeholder="บ้านเลขที่ หมู่ ซอย ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์..." required />
                    </div>
                </div>
            </div>

            {/* Card 2: รายการรับเงิน */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
                  <h3 className="font-bold text-slate-800 text-lg">2. รายการรับเงิน</h3>
                  <div className="flex gap-2 w-full sm:w-auto">
                      <button type="button" onClick={handleCalculate} className="flex-1 sm:flex-none text-sm bg-green-50 text-green-600 px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 font-semibold hover:bg-green-100 transition-colors">
                        <Calculator size={16}/> คำนวณ
                      </button>
                      <button type="button" onClick={() => append({ name: '', quantity: 1, unit: 'ชิ้น', price: 0, total: 0 })} className="flex-1 sm:flex-none text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 font-semibold hover:bg-blue-100 transition-colors">
                        <Plus size={16}/> เพิ่มรายการ
                      </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-3 items-start bg-slate-50/80 p-4 rounded-xl border border-slate-100 relative">
                      {/* รายการ */}
                      <div className="col-span-12 sm:col-span-5">
                        <label className="sm:hidden text-xs text-slate-500 mb-1 block">ชื่อรายการ</label>
                        <div className="flex gap-2">
                          <span className="text-slate-400 font-bold mt-2.5 hidden sm:block">{index + 1}.</span>
                          <input placeholder="ระบุรายการ..." {...register(`items.${index}.name`)} className="w-full text-sm border-slate-200 p-2.5 rounded-lg border outline-none focus:border-blue-500" required />
                        </div>
                      </div>

                      {/* จำนวน & หน่วย */}
                      <div className="col-span-6 sm:col-span-3">
                        <label className="sm:hidden text-xs text-slate-500 mb-1 block">จำนวน / หน่วย</label>
                        <div className="flex gap-1.5">
                          <input type="number" placeholder="จำนวน" {...register(`items.${index}.quantity`)} className="w-1/2 text-sm border-slate-200 p-2.5 rounded-lg border text-center outline-none focus:border-blue-500" />
                          <div className="relative w-1/2 group">
                            <input placeholder="หน่วย" {...register(`items.${index}.unit`)} className="w-full text-sm border-slate-200 p-2.5 rounded-lg border text-center outline-none focus:border-blue-500 bg-white" />
                            <Pencil size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      {/* ราคา & ยอดรวม */}
                      <div className="col-span-6 sm:col-span-3">
                        <label className="sm:hidden text-xs text-slate-500 mb-1 block">ราคา/หน่วย</label>
                        <input type="number" placeholder="ราคา" {...register(`items.${index}.price`)} className="w-full text-sm border-slate-200 p-2.5 rounded-lg border text-right outline-none focus:border-blue-500" />
                        <div className="text-right text-xs text-slate-500 font-medium mt-1.5">
                          รวม: {watch(`items.${index}.total`)?.toLocaleString()} บ.
                        </div>
                      </div>

                      {/* ปุ่มลบ */}
                      <div className="col-span-12 sm:col-span-1 flex justify-end sm:justify-center mt-2 sm:mt-0">
                        <button type="button" onClick={() => remove(index)} className="text-red-400 hover:text-red-600 sm:mt-2 bg-red-50 p-2 rounded-lg sm:bg-transparent sm:p-0">
                          <Trash2 size={18}/> <span className="sm:hidden text-sm ml-1">ลบรายการนี้</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ยอดรวม */}
                <div className="mt-6 border-t border-slate-100 pt-5 flex justify-end">
                  <div className="text-right bg-slate-50 px-6 py-4 rounded-xl border border-slate-100">
                      <div className="text-sm text-slate-500 font-medium mb-1">รวมเป็นเงินทั้งสิ้น</div>
                      <div className="text-3xl font-black text-blue-600 tracking-tight">
                          {parseFloat(watch('total_amount') || 0).toLocaleString()} บาท
                      </div>
                  </div>
                </div>
            </div>

            {/* Card 3: การจ่ายเงิน & ลายเซ็น */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-5">
                <h3 className="font-bold text-slate-800 text-lg border-b pb-3">3. การจ่ายเงิน & การรับรอง</h3>
                
                <div className="flex gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                        <input type="radio" value="cash" {...register('payment_method')} className="w-5 h-5 accent-blue-600"/> เงินสด
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                        <input type="radio" value="transfer" {...register('payment_method')} className="w-5 h-5 accent-blue-600"/> โอนเงิน
                    </label>
                </div>

                <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
                  <div className="flex justify-between items-end mb-3">
                    <label className="block text-sm font-bold text-slate-700">ลายเซ็นผู้จ่ายเงิน <span className="text-xs text-slate-400 font-normal">(วาดลงในกรอบด้านล่าง)</span></label>
                    <button type="button" onClick={() => sigPad.current.clear()} className="text-xs text-red-500 font-medium hover:underline">ล้างลายเซ็น</button>
                  </div>
                  <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl overflow-hidden h-48 cursor-crosshair">
                      <SignatureCanvas 
                        ref={sigPad}
                        penColor="black"
                        canvasProps={{ className: 'w-full h-full' }}
                      />
                  </div>
                  {formData.payer_signature && (
                    <p className="text-xs text-green-600 mt-2 font-medium flex items-center gap-1">✓ มีลายเซ็นเดิมบันทึกไว้แล้ว (วาดใหม่เพื่อทับของเดิม)</p>
                  )}
                </div>
            </div>

            <div className="pt-4 pb-10">
              <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-lg shadow-xl shadow-slate-900/20 hover:bg-black hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                  {loading ? <><Loader2 size={24} className="animate-spin" /> กำลังบันทึก...</> : <><Printer size={24} /> บันทึกและพิมพ์เอกสาร</>}
              </button>
            </div>

         </form>
      </div>
    </div>
  )
}