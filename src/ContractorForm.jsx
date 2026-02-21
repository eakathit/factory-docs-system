import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, Home, ChevronRight, Plus, Trash2, Save, Loader2 } from 'lucide-react'
import { supabase } from './supabaseClient'
import toast from 'react-hot-toast'

export default function ContractorForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)

  const { register, control, watch, handleSubmit, reset } = useForm({
    defaultValues: {
      created_at: new Date().toISOString().split('T')[0],
      doc_no: '',
      contractor_name: '',
      id_card: '',
      supervisor_name: '',
      wage_type: 'daily',
      wage_rate: '',
      has_ot: false,
      start_date: '',
      end_date: '',
      daily_items: [
        { date: '', start_time: '08:00', end_time: '17:00', ot_start: '', ot_end: '', detail: '' }
      ],
      has_accom: false,
      accom_rate: '',
      accom_unit: 'day',
      has_travel: false,
      travel_rate: '',
      travel_unit: 'day',
      deduct_tax: true,
    }
  })

  // โหลดข้อมูลเก่าถ้ากดแก้ไขจากหน้า Print
  useEffect(() => {
    if (location.state) reset(location.state)
  }, [location.state, reset])

  const { fields, append, remove } = useFieldArray({ control, name: 'daily_items' })
  const [hasAccom, hasTravel, wageType] = watch(['has_accom', 'has_travel', 'wage_type'])

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
        accom_unit: data.accom_unit,
        has_travel: data.has_travel,
        travel_rate: parseFloat(data.travel_rate || 0),
        travel_unit: data.travel_unit,
        deduct_tax: data.deduct_tax,
        status: location.state?.status || 'Pending'
      }

      let newId = location.state?.id

      if (newId) {
        const { error } = await supabase
          .from('doc_contractor_orders')
          .update(payload)
          .eq('id', newId)
        if (error) throw error
      } else {
        const { data: res, error } = await supabase
          .from('doc_contractor_orders')
          .insert([payload])
          .select()
        if (error) throw error
        newId = res[0]?.id
      }

      toast.success('บันทึกข้อมูลเรียบร้อย!')
      navigate('/contractor-print', { state: { ...data, id: newId } })

    } catch (err) {
      console.error(err)
      toast.error('เกิดข้อผิดพลาด: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-20" style={{ fontFamily: "'Prompt', sans-serif" }}>

      {/* --- Sticky Navbar --- */}
      <nav className="relative sm:sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/" className="p-1.5 sm:p-2 hover:bg-stone-100 rounded-full text-stone-500 transition-colors">
              <ChevronLeft size={18} />
            </Link>
            <div className="h-5 sm:h-6 w-[1px] bg-stone-200 mx-1" />
            <div className="flex items-center gap-1 sm:gap-2 text-[13px] sm:text-sm font-medium">
              <Link to="/" className="text-stone-400 hover:text-blue-600 flex items-center gap-1 transition-colors whitespace-nowrap">
                <Home size={14} /> หน้าแรก
              </Link>
              <ChevronRight size={12} className="text-stone-300" />
              <span className="text-stone-800 truncate max-w-[190px] sm:max-w-none font-bold">
                Contractor Order {location.state?.id && "(แก้ไข)"}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">
        
        {/* ── Page heading (Minimalist Style) ── */}
        <div className="mb-7">
          <h1 className="text-xl font-bold text-stone-800 tracking-tight uppercase">
            CONTRACTOR ORDER
          </h1>
          <p className="text-stone-400 text-sm mt-0.5">ใบสั่งจ้างผู้รับเหมา</p>
          <div className="mt-3 h-px bg-stone-200" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* ══════════════════════════════════════════
               ข้อมูลทั่วไป
          ══════════════════════════════════════════ */}
          <Section title="1. ข้อมูลทั่วไป">
            <Row2>
              <Field label="วันที่เอกสาร" required>
                <input type="date" {...register('created_at', { required: true })} className={inputCls()} />
              </Field>
              <Field label="จ้างทำงานโปรเจ็คเลขที่">
                <input {...register('doc_no')} placeholder="เช่น PJ-24001" className={inputCls('font-sens')} />
              </Field>
            </Row2>
            
            <div className="mb-5">
              <Field label="ผู้รับเหมาชื่อ (นาย/นาง/นางสาว)" required>
                <input {...register('contractor_name', { required: true })} placeholder="ระบุชื่อ-นามสกุล..." className={inputCls()} />
              </Field>
            </div>

            <Row2>
              <Field label="เลขบัตรประชาชน">
                <input {...register('id_card')} maxLength={13} placeholder="เลขบัตร 13 หลัก" className={inputCls('tracking-widest font-sens')} />
              </Field>
              <Field label="โดยมีผู้รับผิดชอบดูแลผู้รับเหมา คือ">
                <input {...register('supervisor_name')} placeholder="ระบุชื่อผู้รับผิดชอบ..." className={inputCls()} />
              </Field>
            </Row2>
          </Section>

          {/* ══════════════════════════════════════════
               ข้อ 2: ค่าจ้างเป็นแบบ
          ══════════════════════════════════════════ */}
          <Section title="2. ค่าจ้างและการทำงาน">
            <div className="space-y-5">
              <Field label="ประเภทค่าจ้าง">
                <div className="flex bg-stone-100 p-1.5 rounded-xl border border-stone-200 gap-1.5 mt-1 max-w-sm">
                  {[
                    { value: 'daily', label: 'รายวัน' },
                    { value: 'project', label: 'ต่อโปรเจ็ค (เหมา)' },
                  ].map(opt => (
                    <label key={opt.value} className="flex-1 text-center cursor-pointer">
                      <input type="radio" value={opt.value} {...register('wage_type')} className="peer sr-only" />
                      <div className="py-2.5 rounded-lg text-sm font-bold text-stone-400 hover:text-stone-600 peer-checked:bg-white peer-checked:text-blue-700 peer-checked:shadow-sm peer-checked:ring-1 peer-checked:ring-stone-200 transition-all">
                        {opt.label}
                      </div>
                    </label>
                  ))}
                </div>
              </Field>

              <Row2>
                <Field label={`เป็นจำนวนเงิน (เรทปกติ) บาท / ${wageType === 'daily' ? 'วัน' : 'งาน'}`} required>
                  <input type="number" step="0.01" {...register('wage_rate', { required: true })} placeholder="0.00" className={inputCls('font-bold text-blue-700')} />
                </Field>
                <Field label="โอที (ล่วงเวลา)">
                  <label className="flex items-center gap-3 cursor-pointer h-[46px] px-4 rounded-xl border border-stone-200 bg-stone-50 hover:bg-white transition-colors">
                    <input type="checkbox" {...register('has_ot')} className="w-4 h-4 rounded accent-blue-600" />
                    <span className="text-sm font-semibold text-stone-700">มีโอที</span>
                    <span className="text-xs text-stone-400 font-normal">(ไม่ติ๊ก = ไม่มี)</span>
                  </label>
                </Field>
              </Row2>

              <Row2>
                <Field label="ตั้งแต่วันที่">
                  <input type="date" {...register('start_date')} className={inputCls()} />
                </Field>
                <Field label="จนถึงวันที่">
                  <input type="date" {...register('end_date')} className={inputCls()} />
                </Field>
              </Row2>
            </div>
          </Section>

          {/* ══════════════════════════════════════════
               ข้อ 3: ตารางลงเวลา
          ══════════════════════════════════════════ */}
          <Section
            title="3. ตารางลงเวลา (กรณีจ้างแบบรายวัน)"
            action={
              <button type="button" onClick={() => append({ date: '', start_time: '08:00', end_time: '17:00', ot_start: '', ot_end: '', detail: '' })}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                <Plus size={14} /> เพิ่มวัน
              </button>
            }
          >
            {/* Headers สำหรับ Desktop */}
            <div className="hidden sm:grid grid-cols-12 gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2 px-1">
              <div className="col-span-3">วันที่ทำงาน</div>
              <div className="col-span-2">เริ่ม</div>
              <div className="col-span-2">สิ้นสุด</div>
              <div className="col-span-2">โอทีเริ่ม</div>
              <div className="col-span-2">โอทีสิ้นสุด</div>
              <div className="col-span-1"></div>
            </div>

            <div className="space-y-3">
              {fields.map((field, idx) => (
                <div key={field.id} className="bg-stone-50 rounded-xl border border-stone-200 p-3 sm:p-2 sm:px-3 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <div className="sm:col-span-3">
                      <label className="sm:hidden text-[10px] font-bold text-stone-400 uppercase block mb-1">วันที่ทำงาน</label>
                      <input type="date" {...register(`daily_items.${idx}.date`)} className={rowInp()} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:col-span-4">
                      <div>
                        <label className="sm:hidden text-[10px] font-bold text-stone-400 uppercase block mb-1">เริ่ม</label>
                        <input type="time" {...register(`daily_items.${idx}.start_time`)} className={rowInp()} />
                      </div>
                      <div>
                        <label className="sm:hidden text-[10px] font-bold text-stone-400 uppercase block mb-1">สิ้นสุด</label>
                        <input type="time" {...register(`daily_items.${idx}.end_time`)} className={rowInp()} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:col-span-4">
                      <div>
                        <label className="sm:hidden text-[10px] font-bold text-stone-400 uppercase block mb-1">โอทีเริ่ม</label>
                        <input type="time" {...register(`daily_items.${idx}.ot_start`)} className={rowInp()} />
                      </div>
                      <div>
                        <label className="sm:hidden text-[10px] font-bold text-stone-400 uppercase block mb-1">โอทีสิ้นสุด</label>
                        <input type="time" {...register(`daily_items.${idx}.ot_end`)} className={rowInp()} />
                      </div>
                    </div>
                    <div className="sm:col-span-1 flex justify-end sm:justify-center mt-1 sm:mt-0">
                      <button type="button" onClick={() => remove(idx)}
                        className="text-stone-300 hover:text-red-500 transition-colors p-1 rounded-lg flex items-center gap-1 text-xs">
                        <Trash2 size={16} /> <span className="sm:hidden text-red-400">ลบรายการ</span>
                      </button>
                    </div>
                  </div>
                  <input type="text" placeholder="รายละเอียดงาน..." {...register(`daily_items.${idx}.detail`)} className={rowInp('w-full')} />
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-amber-50/50 border border-amber-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" {...register('deduct_tax')} className="mt-1 w-4 h-4 rounded accent-amber-500" />
                <div>
                  <span className="text-sm font-bold text-amber-800">หักภาษี ณ ที่จ่าย 3%</span>
                  <p className="text-[11px] text-amber-600 mt-0.5">
                    จะแสดงข้อความในหมายเหตุของตาราง: "ค่าจ้างและค่าใช้จ่ายทั้งหมด จะถูกหัก ณ ที่จ่าย 3%"
                  </p>
                </div>
              </label>
            </div>
          </Section>

          {/* ══════════════════════════════════════════
               ข้อ 4: ค่าใช้จ่ายนอกจากค่าจ้าง
          ══════════════════════════════════════════ */}
          <Section title="4. ค่าใช้จ่ายนอกจากค่าจ้าง">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="rounded-xl border border-stone-200 overflow-hidden bg-white">
                <label className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-stone-50 transition-colors">
                  <input type="checkbox" {...register('has_accom')} className="w-4 h-4 rounded accent-blue-600" />
                  <span className="text-sm font-bold text-stone-700">ค่าที่พัก เป็นเงิน</span>
                  {!hasAccom && <span className="text-xs text-stone-400 ml-auto font-medium">ไม่มี</span>}
                </label>
                {hasAccom && (
                  <div className="px-4 pb-4 pt-2 bg-stone-50 border-t border-stone-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                    <input type="number" step="0.01" {...register('accom_rate')} placeholder="0.00" className={rowInp('w-24 font-medium text-center')} />
                    <span className="text-xs font-bold text-stone-400 uppercase">บาท / ต่อ</span>
                    <select {...register('accom_unit')} className={rowInp('flex-1 text-center')}>
                      <option value="day">วัน</option>
                      <option value="job">งาน</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-stone-200 overflow-hidden bg-white">
                <label className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-stone-50 transition-colors">
                  <input type="checkbox" {...register('has_travel')} className="w-4 h-4 rounded accent-blue-600" />
                  <span className="text-sm font-bold text-stone-700">ค่าเดินทาง เป็นเงิน</span>
                  {!hasTravel && <span className="text-xs text-stone-400 ml-auto font-medium">ไม่มี</span>}
                </label>
                {hasTravel && (
                  <div className="px-4 pb-4 pt-2 bg-stone-50 border-t border-stone-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                    <input type="number" step="0.01" {...register('travel_rate')} placeholder="0.00" className={rowInp('w-24 font-medium text-center')} />
                    <span className="text-xs font-bold text-stone-400 uppercase">บาท / ต่อ</span>
                    <select {...register('travel_unit')} className={rowInp('flex-1 text-center')}>
                      <option value="day">วัน</option>
                      <option value="job">งาน</option>
                    </select>
                  </div>
                )}
              </div>

            </div>
          </Section>

          {/* ── ปุ่มบันทึก ── */}
          <div className="flex gap-3 pt-4 pb-10">
            <button type="button" onClick={() => navigate(-1)} 
              className="flex-1 py-3.5 rounded-xl border border-stone-200 text-stone-500 text-sm font-bold text-center hover:bg-stone-100 transition-colors">
              ยกเลิก
            </button>
            <button type="submit" disabled={loading} 
              className="flex-[3] py-3.5 rounded-xl bg-blue-700 text-white text-sm font-black flex items-center justify-center gap-2 hover:bg-blue-800 transition-colors disabled:opacity-50 shadow-lg shadow-blue-700/20">
              {loading 
                ? <><Loader2 size={16} className="animate-spin" /> กำลังบันทึก...</> 
                : <><Save size={16} /> {location.state?.id ? 'บันทึกการแก้ไข' : 'บันทึกและพิมพ์'}</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

// ── UI Helpers ────────────────────────────────────────────────────────────────

function Section({ title, children, action }) {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 mb-5 sm:mb-6">
      {children}
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs sm:text-sm font-extrabold text-stone-500 uppercase tracking-widest mb-3">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

function inputCls(extra = '') {
  return `w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-base text-stone-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all ${extra}`
}

function rowInp(extra = '') {
  return `w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all ${extra}`
}