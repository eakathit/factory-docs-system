import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import { supabase } from './supabaseClient'

export default function ContractorForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)

  const { register, control, watch, handleSubmit, reset } = useForm({
    defaultValues: {
      created_at: new Date().toISOString().split('T')[0],
      wage_type: 'daily',
      has_ot: false,
      has_accom: false,
      has_travel: false,
      deduct_tax: true,
      daily_items: [
        { date: '', start_time: '08:00', end_time: '17:00', ot_start: '', ot_end: '', detail: '' }
      ]
    }
  })

  // โหลดข้อมูลเก่ามาใส่ฟอร์มถ้ามีการกด "แก้ไข" กลับมาจากหน้า Print
  useEffect(() => {
    if (location.state) {
      reset(location.state)
    }
  }, [location.state, reset])

  const formData = watch()
  const { fields, append, remove } = useFieldArray({ control, name: 'daily_items' })

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

      // บันทึกลงฐานข้อมูล
      const { data: responseData, error } = await supabase
        .from('doc_contractor_orders')
        .insert([payload])
        .select()

      if (error) throw error
      alert('✅ บันทึกใบสั่งจ้างเรียบร้อย!')
      
      // ไปยังหน้า Print พร้อมส่งข้อมูลไปแสดงผล
      navigate('/contractor-print', { state: { ...data, id: responseData[0]?.id } })

    } catch (error) {
      console.error('Error:', error)
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const hasAccom = watch('has_accom')
  const hasTravel = watch('has_travel')

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-sans">
      {/* Sticky Navbar แบบเดียวกับหน้าอื่นๆ */}
      <nav className="relative sm:sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center gap-3">
          <Link to="/" className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div className="h-5 w-[1px] bg-slate-200 mx-1" />
          <div className="flex items-center text-sm font-medium">
            <span className="text-slate-800 font-bold uppercase tracking-tight">ใบสั่งจ้างผู้รับเหมา</span>
          </div>
        </div>
      </nav>

      {/* Form Area */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* ── Card: ข้อมูลทั่วไป ── */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6 uppercase tracking-wider">ข้อมูลทั่วไป</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5 uppercase">วันที่เอกสาร</label>
                <input type="date" {...register('created_at')} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5 uppercase">จ้างทำงานโปรเจ็คเลขที่</label>
                <input {...register('doc_no')} placeholder="เช่น PJ-24001" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-mono" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-800 mb-1.5 uppercase">ผู้รับเหมาชื่อ (นาย/นาง/นางสาว)</label>
                <input {...register('contractor_name')} placeholder="ชื่อ-นามสกุล" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5 uppercase">เลขบัตรประชาชน</label>
                <input {...register('id_card')} maxLength={13} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all tracking-widest" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5 uppercase">โดยมีผู้รับผิดชอบดูแล คือ</label>
                <input {...register('supervisor_name')} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
              </div>
            </div>
          </div>

          {/* ── Card: ข้อตกลงค่าจ้าง ── */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6 uppercase tracking-wider">ข้อตกลงค่าจ้าง</h3>
            
            <div className="flex gap-6 mb-6">
              <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors w-full sm:w-auto">
                <input type="radio" value="daily" {...register('wage_type')} className="w-4 h-4 accent-blue-600" />
                <span className="text-sm font-bold text-slate-700">รายวัน</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors w-full sm:w-auto">
                <input type="radio" value="project" {...register('wage_type')} className="w-4 h-4 accent-blue-600" />
                <span className="text-sm font-bold text-slate-700">ต่อโปรเจ็ค (เหมา)</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">เป็นจำนวนเงิน (เรทปกติ)</label>
                <div className="flex items-center gap-2">
                  <input type="number" {...register('wage_rate')} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-bold text-blue-700" placeholder="0.00" />
                  <span className="text-sm text-slate-500 whitespace-nowrap">บาท ต่อ {formData.wage_type === 'daily' ? 'วัน' : 'งาน'}</span>
                </div>
              </div>
              <div className="flex items-center md:items-end">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 w-full hover:bg-slate-50">
                  <input type="checkbox" {...register('has_ot')} className="w-5 h-5 rounded accent-blue-600" />
                  <span className="text-sm font-bold text-slate-700">มีโอที (ล่วงเวลา)</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">เริ่มตั้งแต่วันที่</label>
                <input type="date" {...register('start_date')} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">จนถึงวันที่</label>
                <input type="date" {...register('end_date')} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
            </div>
          </div>

          {/* ── Card: ตารางลงเวลา ── */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider">ตารางลงเวลา</h3>
              <button type="button" onClick={() => append({ date: '', start_time: '08:00', end_time: '17:00', ot_start: '', ot_end: '', detail: '' })} className="text-sm bg-blue-50 text-blue-600 flex items-center gap-1 font-bold hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors">
                <Plus size={16} /> เพิ่มวันทำงาน
              </button>
            </div>

            <div className="min-w-[800px]">
              <div className="grid grid-cols-12 gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">
                <div className="col-span-3">วันที่</div>
                <div className="col-span-2">เริ่ม</div>
                <div className="col-span-2">สิ้นสุด</div>
                <div className="col-span-2">โอทีเริ่ม</div>
                <div className="col-span-2">โอทีสิ้นสุด</div>
                <div className="col-span-1 text-center">ลบ</div>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-3">
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-3"><input type="date" {...register(`daily_items.${index}.date`)} className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none" /></div>
                      <div className="col-span-2"><input type="time" {...register(`daily_items.${index}.start_time`)} className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none" /></div>
                      <div className="col-span-2"><input type="time" {...register(`daily_items.${index}.end_time`)} className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none" /></div>
                      <div className="col-span-2"><input type="time" {...register(`daily_items.${index}.ot_start`)} className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none" /></div>
                      <div className="col-span-2"><input type="time" {...register(`daily_items.${index}.ot_end`)} className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none" /></div>
                      <div className="col-span-1 text-center"><button type="button" onClick={() => remove(index)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button></div>
                    </div>
                    <div>
                      <input type="text" placeholder="รายละเอียดงาน..." {...register(`daily_items.${index}.detail`)} className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Card: ค่าใช้จ่ายอื่น ๆ ── */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6 uppercase tracking-wider">ค่าใช้จ่ายเพิ่มเติม & ภาษี</h3>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <label className="flex items-center gap-3 cursor-pointer min-w-[150px]">
                  <input type="checkbox" {...register('has_accom')} className="w-5 h-5 rounded accent-blue-600" />
                  <span className="text-sm font-bold text-slate-700">ค่าที่พัก</span>
                </label>
                {hasAccom && (
                  <div className="flex items-center gap-3 flex-1">
                    <input type="number" {...register('accom_rate')} placeholder="0.00" className="w-32 px-4 py-2 border border-slate-200 rounded-lg outline-none text-sm" />
                    <span className="text-sm text-slate-500">บาท /</span>
                    <select {...register('accom_unit')} className="px-4 py-2 border border-slate-200 rounded-lg outline-none text-sm bg-white">
                      <option value="day">วัน</option><option value="job">งาน</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <label className="flex items-center gap-3 cursor-pointer min-w-[150px]">
                  <input type="checkbox" {...register('has_travel')} className="w-5 h-5 rounded accent-blue-600" />
                  <span className="text-sm font-bold text-slate-700">ค่าเดินทาง</span>
                </label>
                {hasTravel && (
                  <div className="flex items-center gap-3 flex-1">
                    <input type="number" {...register('travel_rate')} placeholder="0.00" className="w-32 px-4 py-2 border border-slate-200 rounded-lg outline-none text-sm" />
                    <span className="text-sm text-slate-500">บาท /</span>
                    <select {...register('travel_unit')} className="px-4 py-2 border border-slate-200 rounded-lg outline-none text-sm bg-white">
                      <option value="day">วัน</option><option value="job">งาน</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl border border-orange-200 bg-orange-50">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" {...register('deduct_tax')} className="w-5 h-5 rounded accent-orange-500" />
                  <span className="text-sm font-bold text-orange-800">หักภาษี ณ ที่จ่าย 3% (ค่าจ้างและค่าใช้จ่ายทั้งหมดจะถูกนำมาคำนวณหัก 3%)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={loading} className="w-full sm:w-auto px-10 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? 'กำลังบันทึก...' : <><Save size={20} /> บันทึกและดูเอกสาร</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}