import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Eye, Save } from 'lucide-react'
import ContractorPreview from './ContractorPreview'
import { supabase } from './supabaseClient'

export default function ContractorForm() {
  const [showPreview, setShowPreview] = useState(false)

  const { register, control, watch, handleSubmit } = useForm({
    defaultValues: {
      created_at: new Date().toISOString().split('T')[0],
      wage_type: 'daily',       // 'daily' | 'project'
      has_ot: false,
      has_accom: false,
      has_travel: false,
      deduct_tax: true,
      daily_items: [
        { date: '', start_time: '08:00', end_time: '17:00', ot_start: '', ot_end: '', detail: '' }
      ]
    }
  })

  const formData = watch()

  const { fields, append, remove } = useFieldArray({ control, name: 'daily_items' })

  const [loading, setLoading] = useState(false)

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const payload = {
        created_at: data.created_at,
        doc_no: data.doc_no,
        contractor_name: data.contractor_name,
        id_card: data.id_card,
        supervisor_name: data.supervisor_name,
        wage_type: data.wage_type,
        wage_rate: parseFloat(data.wage_rate || 0),
        has_ot: data.has_ot,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        daily_items: data.daily_items,
        has_accom: data.has_accom,
        accom_rate: parseFloat(data.accom_rate || 0),
        accom_unit: data.accom_unit || 'day',
        has_travel: data.has_travel,
        travel_rate: parseFloat(data.travel_rate || 0),
        travel_unit: data.travel_unit || 'day',
        deduct_tax: data.deduct_tax,
      }

      const { error } = await supabase
        .from('doc_contractor_orders')
        .insert([payload])
        .select()

      if (error) throw error
      alert('✅ บันทึกใบสั่งจ้างเรียบร้อย!')
    } catch (error) {
      console.error('Error:', error)
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Watch individual fields for conditional rendering
  const hasAccom = watch('has_accom')
  const hasTravel = watch('has_travel')

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">

      {/* ========== LEFT: Form ========== */}
      <div className="w-full lg:w-1/2 flex flex-col h-full border-r border-gray-300 bg-slate-50">

        {/* Header */}
        <div className="p-4 bg-white border-b shadow-sm flex items-center gap-3">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={20} /></Link>
          <h1 className="font-bold text-gray-800">ใบสั่งจ้างผู้รับเหมา</h1>
          <div className="ml-auto lg:hidden">
            <button onClick={() => setShowPreview(true)} className="flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-bold">
              <Eye size={16} /> ดูตัวอย่าง
            </button>
          </div>
        </div>

        {/* Scrollable form */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-2xl mx-auto">

            {/* ── Card: ข้อมูลทั่วไป ── */}
            <div className="bg-white p-5 rounded-xl shadow-sm border space-y-4">
              <h3 className="font-bold text-gray-700 border-b pb-2">ข้อมูลทั่วไป</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 font-medium">วันที่เอกสาร</label>
                  <input type="date" {...register('created_at')} className="mt-1 w-full border p-2 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">จ้างทำงานโปรเจ็คเลขที่</label>
                  <input {...register('doc_no')} placeholder="เช่น PJ-24001" className="mt-1 w-full border p-2 rounded-lg text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 font-medium">ผู้รับเหมาชื่อ (นาย/นาง/นางสาว)</label>
                  <input {...register('contractor_name')} className="mt-1 w-full border p-2 rounded-lg text-sm" placeholder="ชื่อ-นามสกุล" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">เลขบัตรประชาชน</label>
                  <input {...register('id_card')} maxLength={13} className="mt-1 w-full border p-2 rounded-lg text-sm tracking-widest" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">โดยมีผู้รับผิดชอบดูแล คือ</label>
                  <input {...register('supervisor_name')} className="mt-1 w-full border p-2 rounded-lg text-sm" />
                </div>
              </div>
            </div>

            {/* ── Card: ข้อตกลงค่าจ้าง ── */}
            <div className="bg-white p-5 rounded-xl shadow-sm border space-y-4">
              <h3 className="font-bold text-gray-700 border-b pb-2">ค่าจ้างเป็นแบบ</h3>

              {/* ประเภทค่าจ้าง */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="daily" {...register('wage_type')} className="w-4 h-4 accent-blue-600" />
                  <span className="text-sm">รายวัน</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="project" {...register('wage_type')} className="w-4 h-4 accent-blue-600" />
                  <span className="text-sm">ต่อโปรเจ็ค (เหมา)</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 font-medium">เป็นจำนวนเงิน (เรทปกติ)</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="number" {...register('wage_rate')} className="w-full border p-2 rounded-lg text-sm font-bold text-blue-700" placeholder="0.00" />
                    <span className="text-sm text-gray-500 whitespace-nowrap">บาท ต่อ {formData.wage_type === 'daily' ? 'วัน' : 'งาน'}</span>
                  </div>
                </div>
                <div className="flex items-end gap-3 pb-1">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" {...register('has_ot')} className="w-4 h-4 rounded accent-blue-600" />
                    มีโอที (ล่วงเวลา)
                  </label>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">โดยมีระยะเวลาตั้งแต่วันที่</label>
                  <input type="date" {...register('start_date')} className="mt-1 w-full border p-2 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">จนถึงวันที่</label>
                  <input type="date" {...register('end_date')} className="mt-1 w-full border p-2 rounded-lg text-sm" />
                </div>
              </div>
            </div>

            {/* ── Card: ตารางลงเวลา ── */}
            <div className="bg-white p-5 rounded-xl shadow-sm border">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-700">ตารางลงเวลา (กรณีจ้างแบบรายวัน)</h3>
                <button
                  type="button"
                  onClick={() => append({ date: '', start_time: '08:00', end_time: '17:00', ot_start: '', ot_end: '', detail: '' })}
                  className="text-sm text-blue-600 flex items-center gap-1 font-bold hover:bg-blue-50 px-2 py-1 rounded"
                >
                  <Plus size={14} /> เพิ่มวัน
                </button>
              </div>

              {/* Column headers */}
              <div className="grid grid-cols-12 gap-1 text-[10px] text-gray-400 font-medium px-1 mb-1">
                <div className="col-span-3">วันที่</div>
                <div className="col-span-2">เริ่ม</div>
                <div className="col-span-2">สิ้นสุด</div>
                <div className="col-span-2">โอทีเริ่ม</div>
                <div className="col-span-2">โอทีสิ้น</div>
                <div className="col-span-1"></div>
              </div>

              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="bg-slate-50 rounded-lg border p-2 space-y-2">
                    <div className="grid grid-cols-12 gap-1 items-center">
                      <div className="col-span-3">
                        <input type="date" {...register(`daily_items.${index}.date`)} className="w-full text-xs border p-1.5 rounded" />
                      </div>
                      <div className="col-span-2">
                        <input type="time" {...register(`daily_items.${index}.start_time`)} className="w-full text-xs border p-1.5 rounded" />
                      </div>
                      <div className="col-span-2">
                        <input type="time" {...register(`daily_items.${index}.end_time`)} className="w-full text-xs border p-1.5 rounded" />
                      </div>
                      <div className="col-span-2">
                        <input type="time" {...register(`daily_items.${index}.ot_start`)} className="w-full text-xs border p-1.5 rounded" />
                      </div>
                      <div className="col-span-2">
                        <input type="time" {...register(`daily_items.${index}.ot_end`)} className="w-full text-xs border p-1.5 rounded" />
                      </div>
                      <div className="col-span-1 text-center">
                        <button type="button" onClick={() => remove(index)} className="text-red-400 hover:text-red-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <input type="text" placeholder="รายละเอียดงาน..." {...register(`daily_items.${index}.detail`)} className="w-full text-xs border p-1.5 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Card: ค่าใช้จ่ายนอกจากค่าจ้าง ── */}
            <div className="bg-white p-5 rounded-xl shadow-sm border space-y-4">
              <h3 className="font-bold text-gray-700 border-b pb-2">ค่าใช้จ่ายนอกจากค่าจ้าง</h3>

              {/* ค่าที่พัก */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                  <input type="checkbox" {...register('has_accom')} className="w-4 h-4 rounded accent-blue-600" />
                  ค่าที่พัก เป็นเงิน
                </label>
                {hasAccom && (
                  <div className="flex items-center gap-2 pl-6">
                    <input type="number" {...register('accom_rate')} placeholder="0.00" className="w-28 border p-2 rounded-lg text-sm" />
                    <span className="text-sm text-gray-500">บาท ต่อ</span>
                    <select {...register('accom_unit')} className="border p-2 rounded-lg text-sm">
                      <option value="day">วัน</option>
                      <option value="job">งาน</option>
                    </select>
                  </div>
                )}
              </div>

              {/* ค่าเดินทาง */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                  <input type="checkbox" {...register('has_travel')} className="w-4 h-4 rounded accent-blue-600" />
                  ค่าเดินทาง เป็นเงิน
                </label>
                {hasTravel && (
                  <div className="flex items-center gap-2 pl-6">
                    <input type="number" {...register('travel_rate')} placeholder="0.00" className="w-28 border p-2 rounded-lg text-sm" />
                    <span className="text-sm text-gray-500">บาท ต่อ</span>
                    <select {...register('travel_unit')} className="border p-2 rounded-lg text-sm">
                      <option value="day">วัน</option>
                      <option value="job">งาน</option>
                    </select>
                  </div>
                )}
              </div>

              {/* หักภาษี */}
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" {...register('deduct_tax')} className="w-4 h-4 rounded accent-blue-600" />
                <span>หักภาษี ณ ที่จ่าย 3% (ค่าจ้างและค่าใช้จ่ายทั้งหมดจะถูกหัก ณ ที่จ่าย 3%)</span>
              </label>
            </div>

            {/* ── ปุ่มบันทึก ── */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'กำลังบันทึก...' : <><Save size={20} /> บันทึกใบสั่งจ้าง</>}
            </button>

          </form>
        </div>
      </div>

      {/* ========== RIGHT: Preview ========== */}
      <div className={`
        fixed inset-0 z-50 bg-black/80 flex justify-center items-start pt-10 overflow-y-auto
        lg:static lg:bg-gray-300 lg:w-1/2 lg:flex lg:items-start lg:justify-center lg:h-full lg:z-0 lg:pt-8 lg:overflow-y-auto
        ${showPreview ? 'block' : 'hidden'}
      `}>
        <button onClick={() => setShowPreview(false)} className="lg:hidden fixed top-4 right-4 bg-white/20 text-white p-2 rounded-full backdrop-blur-md z-10">
          ✕ ปิด
        </button>

        <div className="transform scale-[0.55] sm:scale-[0.65] lg:scale-[0.62] xl:scale-[0.75] origin-top shadow-2xl mb-8">
          <ContractorPreview data={formData} />
        </div>
      </div>

    </div>
  )
}