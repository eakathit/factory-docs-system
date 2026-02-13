import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Eye, Save } from 'lucide-react'
import ContractorPreview from './ContractorPreview' // เรียกใช้ตัวอย่างที่สร้างเมื่อกี้

export default function ContractorForm() {
  const [showPreview, setShowPreview] = useState(false) // สำหรับมือถือ

  // Setup Form
  const { register, control, watch, handleSubmit } = useForm({
    defaultValues: {
      created_at: new Date().toISOString().split('T')[0],
      wage_type: 'daily',
      has_ot: 'no',
      daily_items: [{ date: '', start_time: '08:00', end_time: '17:00' }]
    }
  })

  // ตัวแปรนี้จะเปลี่ยนค่าทันทีที่ User พิมพ์ (Realtime)
  const formData = watch()
  
  // จัดการตาราง (เพิ่ม/ลบแถว)
  const { fields, append, remove } = useFieldArray({
    control,
    name: "daily_items"
  });

  const onSubmit = (data) => {
    console.log('บันทึกข้อมูล:', data)
    alert('ระบบกำลังบันทึก (รอเชื่อม Supabase)...')
    // ตรงนี้เดี๋ยวเราใส่ Code บันทึกลง Supabase ทีหลังได้ครับ
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      
      {/* ---------------- ฝั่งซ้าย: ฟอร์มกรอกข้อมูล ---------------- */}
      <div className="w-full lg:w-1/2 flex flex-col h-full border-r border-gray-300 bg-slate-50">
        
        {/* Header */}
        <div className="p-4 bg-white border-b shadow-sm flex items-center gap-3">
           <Link to="/" className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={20}/></Link>
           <h1 className="font-bold text-gray-800">ใบสั่งจ้างผู้รับเหมา</h1>
           <div className="ml-auto lg:hidden">
              <button onClick={() => setShowPreview(true)} className="flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-bold">
                 <Eye size={16}/> ดูตัวอย่าง
              </button>
           </div>
        </div>

        {/* Form Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24">
           <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
              
              {/* Card 1: ข้อมูลหลัก */}
              <div className="bg-white p-5 rounded-xl shadow-sm border space-y-4">
                 <h3 className="font-bold text-gray-700 border-b pb-2">1. ข้อมูลผู้รับเหมา</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-sm text-gray-500">วันที่เอกสาร</label>
                       <input type="date" {...register('created_at')} className="w-full border p-2 rounded-lg" />
                    </div>
                    <div>
                       <label className="text-sm text-gray-500">เลขที่โปรเจ็ค</label>
                       <input {...register('doc_no')} placeholder="เช่น PJ-24001" className="w-full border p-2 rounded-lg" />
                    </div>
                    <div className="col-span-2">
                       <label className="text-sm text-gray-500">ชื่อผู้รับเหมา</label>
                       <input {...register('contractor_name')} className="w-full border p-2 rounded-lg" placeholder="นาย ก." />
                    </div>
                    <div>
                       <label className="text-sm text-gray-500">เลขบัตร ปชช.</label>
                       <input {...register('id_card')} className="w-full border p-2 rounded-lg" />
                    </div>
                    <div>
                       <label className="text-sm text-gray-500">ผู้ดูแล</label>
                       <input {...register('supervisor_name')} className="w-full border p-2 rounded-lg" />
                    </div>
                 </div>
              </div>

              {/* Card 2: ค่าจ้าง */}
              <div className="bg-white p-5 rounded-xl shadow-sm border space-y-4">
                 <h3 className="font-bold text-gray-700 border-b pb-2">2. ข้อตกลงค่าจ้าง</h3>
                 <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                       <input type="radio" value="daily" {...register('wage_type')} className="w-5 h-5 accent-blue-600"/> รายวัน
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                       <input type="radio" value="project" {...register('wage_type')} className="w-5 h-5 accent-blue-600"/> เหมา
                    </label>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-sm text-gray-500">จำนวนเงิน (บาท)</label>
                       <input type="number" {...register('wage_rate')} className="w-full border p-2 rounded-lg font-bold text-blue-600" placeholder="0.00" />
                    </div>
                    <div>
                       <label className="text-sm text-gray-500">OT (ล่วงเวลา)</label>
                       <select {...register('has_ot')} className="w-full border p-2 rounded-lg">
                          <option value="no">ไม่มี</option>
                          <option value="yes">มี</option>
                       </select>
                    </div>
                    <div>
                       <label className="text-sm text-gray-500">เริ่มวันที่</label>
                       <input type="date" {...register('start_date')} className="w-full border p-2 rounded-lg" />
                    </div>
                    <div>
                       <label className="text-sm text-gray-500">ถึงวันที่</label>
                       <input type="date" {...register('end_date')} className="w-full border p-2 rounded-lg" />
                    </div>
                 </div>
              </div>

              {/* Card 3: ตารางงาน */}
              <div className="bg-white p-5 rounded-xl shadow-sm border">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-700">3. ตารางลงเวลา</h3>
                    <button type="button" onClick={() => append({ date: '', start_time: '08:00' })} className="text-sm text-blue-600 flex items-center gap-1 font-bold hover:bg-blue-50 px-2 py-1 rounded">
                       <Plus size={16}/> เพิ่มวัน
                    </button>
                 </div>
                 
                 <div className="space-y-3">
                    {fields.map((field, index) => (
                       <div key={field.id} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded-lg border">
                          <div className="col-span-4">
                             <input type="date" {...register(`daily_items.${index}.date`)} className="w-full text-xs border p-1 rounded" />
                          </div>
                          <div className="col-span-3">
                             <input type="time" {...register(`daily_items.${index}.start_time`)} className="w-full text-xs border p-1 rounded" />
                          </div>
                          <div className="col-span-4">
                             <input type="text" placeholder="งานที่ทำ..." {...register(`daily_items.${index}.detail`)} className="w-full text-xs border p-1 rounded" />
                          </div>
                          <div className="col-span-1 text-center">
                             <button type="button" onClick={() => remove(index)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Card 4: ค่าใช้จ่ายอื่น */}
              <div className="bg-white p-5 rounded-xl shadow-sm border space-y-4">
                 <h3 className="font-bold text-gray-700 border-b pb-2">4. เพิ่มเติม</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-gray-500">ค่าที่พัก (บาท)</label>
                        <input type="number" {...register('accom_cost')} className="w-full border p-2 rounded-lg" />
                    </div>
                    <div>
                        <label className="text-sm text-gray-500">ค่าเดินทาง (บาท)</label>
                        <input type="number" {...register('travel_cost')} className="w-full border p-2 rounded-lg" />
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                        <input type="checkbox" {...register('deduct_tax')} className="w-5 h-5 rounded" />
                        <span>หักภาษี ณ ที่จ่าย 3%</span>
                    </div>
                 </div>
              </div>

              {/* ปุ่มบันทึก (ด้านล่างสุด) */}
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 flex justify-center items-center gap-2">
                 <Save /> บันทึกใบสั่งจ้าง
              </button>

           </form>
        </div>
      </div>

      {/* ---------------- ฝั่งขวา: Preview Realtime ---------------- */}
      <div className={`
        fixed inset-0 z-50 bg-black/80 flex justify-center items-start pt-10 overflow-y-auto
        lg:static lg:bg-gray-200 lg:w-1/2 lg:flex lg:items-center lg:justify-center lg:h-full lg:z-0 lg:pt-0
        ${showPreview ? 'block' : 'hidden'}
      `}>
         
         {/* ปุ่มปิด Preview (มือถือ) */}
         <button onClick={() => setShowPreview(false)} className="lg:hidden absolute top-4 right-4 bg-white/20 text-white p-2 rounded-full backdrop-blur-md">
            ✕ ปิด
         </button>

         {/* ตัวกระดาษ A4 (ย่อส่วนให้พอดีจอ) */}
         <div className="transform scale-[0.6] sm:scale-[0.7] lg:scale-[0.65] xl:scale-[0.8] origin-top lg:origin-center shadow-2xl">
             {/* ส่งข้อมูล formData ที่ watch มาไปแสดงผลทันที */}
             <ContractorPreview data={formData} />
         </div>
      </div>

    </div>
  )
}