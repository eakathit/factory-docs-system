import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, Home, ChevronRight, ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import { supabase } from './supabaseClient'

export default function ContractorForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)

  const { register, control, watch, handleSubmit, reset } = useForm({
    defaultValues: {
      created_at: new Date().toISOString().split('T')[0],
      // ── ข้อ 1 ──
      doc_no: '',
      contractor_name: '',
      id_card: '',
      supervisor_name: '',
      // ── ข้อ 2 ──
      wage_type: 'daily',         // 'daily' | 'project'
      wage_rate: '',
      has_ot: false,              // checkbox: มี/ไม่มีโอที
      start_date: '',
      end_date: '',
      // ── ข้อ 3 ──
      daily_items: [
        { date: '', start_time: '08:00', end_time: '17:00', ot_start: '', ot_end: '', detail: '' }
      ],
      // ── ข้อ 4 ──
      has_accom: false,
      accom_rate: '',
      accom_unit: 'day',          // 'day' | 'job'
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
      }

      const { data: res, error } = await supabase
        .from('doc_contractor_orders')
        .insert([payload])
        .select()

      if (error) throw error

      navigate('/contractor-print', { state: { ...data, id: res[0]?.id } })

    } catch (err) {
      console.error(err)
      alert('เกิดข้อผิดพลาด: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">

      {/* --- New Sticky Navbar --- */}
      <nav className="relative sm:sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
            >
              <ChevronLeft size={18} />
            </Link>
            <div className="h-5 sm:h-6 w-[1px] bg-slate-200 mx-1" />

            {/* Breadcrumbs: ปรับขนาดตัวอักษรและซ่อนไอคอนในจอเล็กมากเพื่อประหยัดพื้นที่ */}
            <div className="flex items-center gap-1 sm:gap-2 text-[13px] sm:text-sm font-medium">
              <Link
                to="/"
                className="text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors whitespace-nowrap"
              >
                <Home size={14} /> หน้าแรก
              </Link>
              <ChevronRight size={12} className="text-slate-300" />
              <span className="text-slate-800 truncate max-w-[190px] sm:max-w-none">
                Technician supporter record
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* ══════════════════════════════════════════
               ข้อมูลทั่วไป
          ══════════════════════════════════════════ */}
          <Section title="ข้อมูลทั่วไป">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <Field label="วันที่เอกสาร" required>
                <input
                  type="date" {...register('created_at', { required: true })}
                  className={inputCls()}
                />
              </Field>

              {/* ตรงกับ "จ้างทำงานโปรเจ็คเลขที่" ในฟอร์ม */}
              <Field label="จ้างทำงานโปรเจ็คเลขที่">
                <input
                  {...register('doc_no')} placeholder="เช่น PJ-24001"
                  className={inputCls('font-mono')}
                />
              </Field>

              {/* ชื่อผู้รับเหมา — full width */}
              <div className="sm:col-span-2">
                <Field label="ผู้รับเหมาชื่อ (นาย/นาง/นางสาว)" required>
                  <input
                    {...register('contractor_name', { required: true })}
                    placeholder="ชื่อ-นามสกุล"
                    className={inputCls()}
                  />
                </Field>
              </div>

              {/* เลขบัตรประชาชน */}
              <Field label="เลขบัตรประชาชน">
                <input
                  {...register('id_card')} maxLength={13}
                  placeholder="_ _ _ _ _ _ _ _ _ _ _ _ _"
                  className={inputCls('tracking-widest font-mono')}
                />
              </Field>

              {/* โดยมีผู้รับผิดชอบดูแลผู้รับเหมา คือ */}
              <Field label="โดยมีผู้รับผิดชอบดูแลผู้รับเหมา คือ">
                <input {...register('supervisor_name')} className={inputCls()} />
              </Field>

            </div>
          </Section>

          {/* ══════════════════════════════════════════
               ข้อ 2: ค่าจ้างเป็นแบบ
          ══════════════════════════════════════════ */}
          <Section title="2. ค่าจ้างเป็นแบบ">
            <div className="space-y-5">

              {/* รายวัน / ต่อโปรเจ็ค */}
              <div className="flex gap-3 flex-wrap">
                {[
                  { value: 'daily',   label: 'รายวัน' },
                  { value: 'project', label: 'ต่อโปรเจ็ค (เหมา)' },
                ].map(opt => (
                  <label key={opt.value}
                    className="flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                    <input type="radio" value={opt.value} {...register('wage_type')}
                      className="w-4 h-4 accent-blue-600" />
                    <span className="text-sm font-semibold text-slate-700">{opt.label}</span>
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                {/* เป็นจำนวนเงิน (เรทปกติ) บาท ต่อ วัน/งาน */}
                <Field label={`เป็นจำนวนเงิน (เรทปกติ) บาท / ${wageType === 'daily' ? 'วัน' : 'งาน'}`} required>
                  <input
                    type="number" step="0.01"
                    {...register('wage_rate', { required: true })}
                    placeholder="0.00"
                    className={inputCls('font-bold text-blue-700')}
                  />
                </Field>

                {/* โอที มี / ไม่มี */}
                <Field label="โอที (ล่วงเวลา)">
                  <label className="flex items-center gap-3 cursor-pointer h-[42px] px-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                    <input type="checkbox" {...register('has_ot')}
                      className="w-5 h-5 rounded accent-blue-600" />
                    <span className="text-sm font-semibold text-slate-700">มีโอที</span>
                    <span className="text-xs text-slate-400">(ไม่ติ๊ก = ไม่มี)</span>
                  </label>
                </Field>

                {/* โดยมีระยะเวลาตั้งแต่วันที่ */}
                <Field label="โดยมีระยะเวลาตั้งแต่วันที่">
                  <input type="date" {...register('start_date')} className={inputCls()} />
                </Field>

                {/* จนถึงวันที่ */}
                <Field label="จนถึงวันที่">
                  <input type="date" {...register('end_date')} className={inputCls()} />
                </Field>

              </div>
            </div>
          </Section>

          {/* ══════════════════════════════════════════
               ข้อ 3: ตารางลงเวลา
          ══════════════════════════════════════════ */}
          <Section
            title="3. ตารางลงเวลา (กรณีจ้างแบบรายวัน)"
            action={
              <button type="button"
                onClick={() => append({ date: '', start_time: '08:00', end_time: '17:00', ot_start: '', ot_end: '', detail: '' })}
                className="flex items-center gap-1.5 text-sm text-blue-600 font-semibold hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                <Plus size={15} /> เพิ่มวัน
              </button>
            }
          >
            {/* Column labels */}
            <div className="hidden sm:grid grid-cols-12 gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
              <div className="col-span-3">วันที่ทำงาน</div>
              <div className="col-span-2">เริ่ม</div>
              <div className="col-span-2">สิ้นสุด</div>
              <div className="col-span-2">โอทีเริ่ม</div>
              <div className="col-span-2">โอทีสิ้นสุด</div>
              <div className="col-span-1"></div>
            </div>

            <div className="space-y-3">
              {fields.map((field, idx) => (
                <div key={field.id} className="bg-slate-50 rounded-xl border border-slate-100 p-3 space-y-2">
                  <div className="grid grid-cols-12 gap-2 items-center">
                    {/* วันที่ */}
                    <div className="col-span-3">
                      <input type="date" {...register(`daily_items.${idx}.date`)}
                        className="w-full text-sm px-2 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    {/* เริ่ม */}
                    <div className="col-span-2">
                      <input type="time" {...register(`daily_items.${idx}.start_time`)}
                        className="w-full text-sm px-2 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    {/* สิ้นสุด */}
                    <div className="col-span-2">
                      <input type="time" {...register(`daily_items.${idx}.end_time`)}
                        className="w-full text-sm px-2 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    {/* โอทีเริ่ม */}
                    <div className="col-span-2">
                      <input type="time" {...register(`daily_items.${idx}.ot_start`)}
                        className="w-full text-sm px-2 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    {/* โอทีสิ้นสุด */}
                    <div className="col-span-2">
                      <input type="time" {...register(`daily_items.${idx}.ot_end`)}
                        className="w-full text-sm px-2 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    {/* ลบ */}
                    <div className="col-span-1 flex justify-center">
                      <button type="button" onClick={() => remove(idx)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  {/* รายละเอียดงาน — ตรงกับคอลัมน์ "รายละเอียดงาน" ในตาราง */}
                  <input type="text"
                    placeholder="รายละเอียดงาน..."
                    {...register(`daily_items.${idx}.detail`)}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                  />
                </div>
              ))}
            </div>

            {/* หมายเหตุหักภาษี — แสดงในหมายเหตุแถว "รวม" ของตาราง */}
            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" {...register('deduct_tax')}
                  className="mt-0.5 w-4 h-4 rounded accent-amber-500" />
                <div>
                  <span className="text-sm font-semibold text-amber-800">หักภาษี ณ ที่จ่าย 3%</span>
                  <p className="text-xs text-amber-600 mt-0.5">
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
            <div className="space-y-3">

              {/* ── ค่าที่พัก ── */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <label className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors bg-white">
                  <input type="checkbox" {...register('has_accom')} className="w-5 h-5 rounded accent-blue-600" />
                  <span className="text-sm font-semibold text-slate-700">ค่าที่พัก เป็นเงิน</span>
                  {!hasAccom && <span className="text-xs text-slate-400 ml-auto">ไม่มี</span>}
                </label>
                {hasAccom && (
                  <div className="px-4 pb-4 pt-3 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
                    <input type="number" step="0.01" {...register('accom_rate')}
                      placeholder="0.00"
                      className="w-32 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 bg-white" />
                    <span className="text-sm text-slate-500">บาท ต่อ</span>
                    <select {...register('accom_unit')}
                      className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none">
                      <option value="day">วัน</option>
                      <option value="job">งาน</option>
                    </select>
                  </div>
                )}
              </div>

              {/* ── ค่าเดินทาง ── */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <label className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors bg-white">
                  <input type="checkbox" {...register('has_travel')} className="w-5 h-5 rounded accent-blue-600" />
                  <span className="text-sm font-semibold text-slate-700">ค่าเดินทาง เป็นเงิน</span>
                  {!hasTravel && <span className="text-xs text-slate-400 ml-auto">ไม่มี</span>}
                </label>
                {hasTravel && (
                  <div className="px-4 pb-4 pt-3 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
                    <input type="number" step="0.01" {...register('travel_rate')}
                      placeholder="0.00"
                      className="w-32 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 bg-white" />
                    <span className="text-sm text-slate-500">บาท ต่อ</span>
                    <select {...register('travel_unit')}
                      className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none">
                      <option value="day">วัน</option>
                      <option value="job">งาน</option>
                    </select>
                  </div>
                )}
              </div>

            </div>
          </Section>

          {/* ── ปุ่มบันทึก ── */}
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={loading}
              className="w-full sm:w-auto px-10 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-base">
              {loading
                ? 'กำลังบันทึก...'
                : <><Save size={20} /> บันทึกและดูเอกสาร</>
              }
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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
        <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">{title}</h3>
        {action && <div>{action}</div>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function inputCls(extra = '') {
  return `w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all ${extra}`
}