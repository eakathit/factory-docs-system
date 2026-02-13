import { useState, useRef } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import SignatureCanvas from 'react-signature-canvas'
import { ArrowLeft, Save, Plus, Trash2, Eye, Calculator } from 'lucide-react'
import ReceiptVoucherPreview from './ReceiptVoucherPreview'
import toast from 'react-hot-toast'

export default function ReceiptVoucherForm() {
  const navigate = useNavigate()
  const sigPad = useRef({})
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const { register, control, watch, handleSubmit, setValue } = useForm({
    defaultValues: {
      created_at: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      items: [{ name: '', quantity: 1, unit: 'ชิ้น', price: 0, total: 0 }],
      total_amount: 0
    }
  })

  // Watch Fields เพื่อทำ Realtime Preview
  const formData = watch()
  
  // Field Array สำหรับรายการสินค้า
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  // คำนวณยอดรวมอัตโนมัติเมื่อมีการเปลี่ยนแปลงค่า
  const handleCalculate = () => {
    let grandTotal = 0
    const currentItems = formData.items.map(item => {
      const total = (parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0)
      grandTotal += total
      return { ...item, total }
    })
    
    // อัปเดตค่ากลับเข้าไปใน Form
    setValue('items', currentItems)
    setValue('total_amount', grandTotal)
    toast.success('คำนวณยอดเงินเรียบร้อย')
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      // 1. Upload Signature (ถ้ามีเซ็น)
      let signatureUrl = null
      if (sigPad.current && !sigPad.current.isEmpty()) {
        const canvas = sigPad.current.getCanvas()
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
        const fileName = `voucher-sig-${Date.now()}.png`
        const { error: uploadError } = await supabase.storage.from('signatures').upload(fileName, blob)
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('signatures').getPublicUrl(fileName)
        signatureUrl = urlData.publicUrl
      }

      // 2. Insert Database
      const { data: inserted, error } = await supabase
        .from('doc_receipt_vouchers')
        .insert([{
          created_at: data.created_at,
          receiver_name: data.receiver_name,
          id_card_number: data.id_card_number,
          address: data.address,
          payment_method: data.payment_method,
          items: data.items,
          total_amount: data.total_amount,
          total_text: data.total_text,
          payer_signature: signatureUrl // ลายเซ็นเจ้าหน้าที่ (คนทำจ่าย)
        }])
        .select()

      if (error) throw error

      toast.success('บันทึกใบสำคัญรับเงินเรียบร้อย!')
      // นำทางไปหน้า Print (เดี๋ยวค่อยสร้าง OrderPrint ให้รองรับ หรือทำแยก)
      // ตอนนี้ให้เด้งกลับหน้าหลัก หรือรีเฟรช
       setTimeout(() => {
        // navigate(`/receipt-voucher-print/${inserted[0].id}`) // รอทำหน้า Print
        window.location.reload()
      }, 1500)

    } catch (error) {
      console.error(error)
      toast.error('เกิดข้อผิดพลาด: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      
      {/* --- Left: Form --- */}
      <div className="w-full lg:w-1/2 flex flex-col h-full border-r border-gray-300 bg-slate-50">
         
         {/* Header */}
         <div className="p-4 bg-white border-b shadow-sm flex items-center gap-3">
            <Link to="/" className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={20}/></Link>
            <h1 className="font-bold text-gray-800">สร้างใบสำคัญรับเงิน</h1>
            <div className="ml-auto lg:hidden">
                <button onClick={() => setShowPreview(true)} className="flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-bold">
                    <Eye size={16}/> ตัวอย่าง
                </button>
            </div>
         </div>

         {/* Form Body */}
         <div className="flex-1 overflow-y-auto p-4 pb-24">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
               
               {/* Card 1: ข้อมูลผู้รับเงิน */}
               <div className="bg-white p-5 rounded-xl shadow-sm border space-y-4">
                  <h3 className="font-bold text-gray-700 border-b pb-2">1. ข้อมูลผู้รับเงิน (บุคคลภายนอก)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="text-sm text-gray-500">วันที่เอกสาร</label>
                        <input type="date" {...register('created_at')} className="w-full border p-2 rounded-lg" />
                     </div>
                     <div>
                        <label className="text-sm text-gray-500">เลขบัตรประชาชน</label>
                        <input {...register('id_card_number')} placeholder="x-xxxx-xxxxx-xx-x" className="w-full border p-2 rounded-lg" required />
                     </div>
                     <div className="col-span-2">
                        <label className="text-sm text-gray-500">ชื่อ-นามสกุล (ข้าพเจ้า)</label>
                        <input {...register('receiver_name')} className="w-full border p-2 rounded-lg" placeholder="นาย A..." required />
                     </div>
                     <div className="col-span-2">
                        <label className="text-sm text-gray-500">ที่อยู่ตามบัตรประชาชน</label>
                        <textarea {...register('address')} rows="2" className="w-full border p-2 rounded-lg" placeholder="บ้านเลขที่..." required />
                     </div>
                  </div>
               </div>

               {/* Card 2: รายการรับเงิน */}
               <div className="bg-white p-5 rounded-xl shadow-sm border">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-gray-700">2. รายการรับเงิน</h3>
                     <div className="flex gap-2">
                        <button type="button" onClick={handleCalculate} className="text-sm bg-green-50 text-green-600 px-3 py-1 rounded-lg flex items-center gap-1 hover:bg-green-100">
                           <Calculator size={16}/> คำนวณยอด
                        </button>
                        <button type="button" onClick={() => append({ name: '', quantity: 1, unit: 'ชิ้น', price: 0, total: 0 })} className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-lg flex items-center gap-1 hover:bg-blue-100">
                           <Plus size={16}/> เพิ่ม
                        </button>
                     </div>
                  </div>

                  <div className="space-y-3">
                     {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-12 gap-2 items-start bg-slate-50 p-3 rounded-lg border">
                           <div className="col-span-1 text-center py-2 text-gray-400 font-bold">{index+1}</div>
                           <div className="col-span-5">
                              <input placeholder="รายการ..." {...register(`items.${index}.name`)} className="w-full text-sm border p-1 rounded mb-1" required />
                           </div>
                           <div className="col-span-2">
                              <input type="number" placeholder="จำนวน" {...register(`items.${index}.quantity`)} className="w-full text-sm border p-1 rounded text-center" />
                              <input placeholder="หน่วย" {...register(`items.${index}.unit`)} className="w-full text-xs border p-1 rounded text-center mt-1 bg-white" />
                           </div>
                           <div className="col-span-3">
                              <input type="number" placeholder="ราคา/หน่วย" {...register(`items.${index}.price`)} className="w-full text-sm border p-1 rounded text-right" />
                              <div className="text-right text-xs text-gray-500 mt-2">รวม: {watch(`items.${index}.total`)?.toLocaleString()}</div>
                           </div>
                           <div className="col-span-1 text-center">
                              <button type="button" onClick={() => remove(index)} className="text-red-400 hover:text-red-600 mt-1"><Trash2 size={16}/></button>
                           </div>
                        </div>
                     ))}
                  </div>

                  {/* ยอดรวม */}
                  <div className="mt-6 border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label className="text-sm text-gray-500">จำนวนเงินตัวอักษร <span className="text-red-500">*</span></label>
                          <input {...register('total_text')} placeholder="เช่น หนึ่งพันบาทถ้วน" className="w-full border p-2 rounded-lg" required />
                      </div>
                      <div className="text-right">
                          <div className="text-sm text-gray-500">รวมเป็นเงินทั้งสิ้น</div>
                          <div className="text-3xl font-bold text-blue-600">{parseFloat(watch('total_amount') || 0).toLocaleString()}</div>
                      </div>
                  </div>
               </div>

               {/* Card 3: การจ่ายเงิน & ลายเซ็น */}
               <div className="bg-white p-5 rounded-xl shadow-sm border space-y-4">
                   <h3 className="font-bold text-gray-700 border-b pb-2">3. การจ่ายเงิน & การรับรอง</h3>
                   
                   <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                           <input type="radio" value="cash" {...register('payment_method')} className="w-5 h-5 accent-blue-600"/> เงินสด
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                           <input type="radio" value="transfer" {...register('payment_method')} className="w-5 h-5 accent-blue-600"/> โอนเงิน
                        </label>
                   </div>

                   <div className="border rounded-xl p-4 bg-slate-50">
                      <label className="block text-sm font-bold mb-2 text-gray-700">ลายเซ็นผู้จ่ายเงิน (เจ้าหน้าที่)</label>
                      <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg overflow-hidden h-40">
                         <SignatureCanvas 
                            ref={sigPad}
                            penColor="black"
                            canvasProps={{ className: 'w-full h-full' }}
                         />
                      </div>
                      <button type="button" onClick={() => sigPad.current.clear()} className="mt-2 text-xs text-red-500 underline">ล้างลายเซ็น</button>
                   </div>
               </div>

               <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 flex justify-center items-center gap-2 disabled:opacity-50">
                  {loading ? 'กำลังบันทึก...' : <><Save /> บันทึกใบสำคัญรับเงิน</>}
               </button>

            </form>
         </div>
      </div>

      {/* --- Right: Preview --- */}
      <div className={`
        fixed inset-0 z-50 bg-black/80 flex justify-center items-start pt-10 overflow-y-auto
        lg:static lg:bg-gray-200 lg:w-1/2 lg:flex lg:items-center lg:justify-center lg:h-full lg:z-0 lg:pt-0
        ${showPreview ? 'block' : 'hidden'}
      `}>
          <button onClick={() => setShowPreview(false)} className="lg:hidden absolute top-4 right-4 bg-white/20 text-white p-2 rounded-full backdrop-blur-md">✕ ปิด</button>
          
          <div className="transform scale-[0.6] sm:scale-[0.7] lg:scale-[0.65] xl:scale-[0.8] origin-top lg:origin-center shadow-2xl">
             <ReceiptVoucherPreview data={formData} />
          </div>
      </div>

    </div>
  )
}