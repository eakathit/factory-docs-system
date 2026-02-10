import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import SignatureCanvas from 'react-signature-canvas'
import { Save, Plus, Trash2, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ReceiptForm() {
  const navigate = useNavigate()
  const sigPad = useRef({})
  const [loading, setLoading] = useState(false)
  
  // State สำหรับรายการ (เพิ่ม project_no ตาม SQL ใหม่)
  const [items, setItems] = useState([
    { date: '', detail: '', amount: '', project_no: '' }
  ])

  // คำนวณยอดรวมอัตโนมัติ
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

      // 1. อัปโหลดลายเซ็น (ถ้ามี)
      let signatureUrl = null
      if (sigPad.current && !sigPad.current.isEmpty()) {
        const canvas = sigPad.current.getCanvas()
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
        const fileName = `receipt-sig-${Date.now()}.png`
        
        const { error: uploadError } = await supabase.storage
          .from('signatures')
          .upload(fileName, blob, { upsert: false })

        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('signatures').getPublicUrl(fileName)
        signatureUrl = urlData.publicUrl
      }

      // 2. บันทึกข้อมูล (Map ให้ตรงกับ SQL ใหม่เป๊ะๆ)
      const { error: insertError } = await supabase.from('doc_substitute_receipts').insert([
        {
          doc_no: data.doc_no,             // เลขที่ 65/...
          payer_name: data.payer_name,     // ชื่อผู้เบิก
          position: data.position,         // ตำแหน่ง
          items: items,                    // รายการ JSONB
          total_amount: totalAmount,       // ยอดเงินรวม (ตัวเลข)
          total_text: data.total_text,     // ยอดเงินรวม (ตัวอักษร) ***
          payment_method: data.payment_method, // วิธีจ่าย
          transfer_date: data.payment_method === 'transfer' ? data.transfer_date : null,
          payer_signature: signatureUrl    // ลายเซ็น
        }
      ])

      if (insertError) throw insertError

      alert('✅ บันทึกใบรับรองฯ เรียบร้อย!')
      navigate('/') // กลับหน้าหลัก (หรือจะให้ไปหน้า History ก็ได้)

    } catch (error) {
      console.error(error)
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white min-h-screen">
      <div className="mb-6 flex items-center gap-2">
        <Link to="/" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">ใบรับรองแทนใบเสร็จรับเงิน</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* ส่วนหัว */}
        <div className="p-4 border rounded-xl bg-gray-50">
          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-sm font-medium text-gray-700">เลขที่เอกสาร</label>
               <input type="text" name="doc_no" required className="mt-1 w-full p-2 border rounded-lg bg-white" placeholder="เช่น 65/001" />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700">วันที่ทำรายการ</label>
               <input type="date" disabled className="mt-1 w-full p-2 border rounded-lg bg-gray-200 text-gray-500" value={new Date().toISOString().split('T')[0]} />
               <p className="text-xs text-gray-400 mt-1">*วันที่บันทึกระบบอัตโนมัติ</p>
            </div>
          </div>
        </div>

        {/* ข้อมูลผู้เบิก */}
        <div className="p-4 border rounded-xl bg-blue-50 space-y-4">
          <h3 className="font-semibold text-blue-800 flex items-center gap-2">👤 ข้อมูลผู้เบิกจ่าย</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600">ข้าพเจ้า (ชื่อ-สกุล)</label>
              <input type="text" name="payer_name" required className="w-full p-2 border rounded-lg" placeholder="ระบุชื่อผู้เบิก" />
            </div>
            <div>
              <label className="block text-sm text-gray-600">ตำแหน่ง</label>
              <input type="text" name="position" required className="w-full p-2 border rounded-lg" placeholder="ระบุตำแหน่ง" />
            </div>
          </div>
        </div>

        {/* รายการค่าใช้จ่าย (ตาราง) */}
        <div className="border rounded-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">📋 รายการค่าใช้จ่าย</h3>
            <button type="button" onClick={addItem} className="text-sm bg-green-100 text-green-700 px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-green-200 font-bold transition">
              <Plus size={16} /> เพิ่มแถว
            </button>
          </div>
          
          <div className="space-y-3">
            {/* Header ตาราง (ซ่อนในมือถือ แสดงในจอใหญ่) */}
            <div className="hidden md:grid grid-cols-12 gap-2 text-xs text-gray-500 font-semibold px-2">
                <div className="col-span-2">ว/ด/ป</div>
                <div className="col-span-4">รายละเอียดรายจ่าย</div>
                <div className="col-span-3">จำนวนเงิน</div>
                <div className="col-span-2">เลขโปรเจ็ค</div>
                <div className="col-span-1"></div>
            </div>

            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-gray-50 p-3 rounded-lg border items-start relative">
                 {/* บนมือถือ: เรียงลงมา / บนคอม: เรียงแนวนอน */}
                 <div className="md:col-span-2">
                    <label className="md:hidden text-xs text-gray-400">วันที่</label>
                    <input type="date" value={item.date} onChange={(e) => handleItemChange(index, 'date', e.target.value)} className="w-full p-2 text-sm border rounded" required />
                 </div>
                 <div className="md:col-span-4">
                    <label className="md:hidden text-xs text-gray-400">รายละเอียด</label>
                    <input type="text" placeholder="ค่าอะไร..." value={item.detail} onChange={(e) => handleItemChange(index, 'detail', e.target.value)} className="w-full p-2 text-sm border rounded" required />
                 </div>
                 <div className="md:col-span-3">
                    <label className="md:hidden text-xs text-gray-400">จำนวนเงิน</label>
                    <input type="number" placeholder="0.00" value={item.amount} onChange={(e) => handleItemChange(index, 'amount', e.target.value)} className="w-full p-2 text-sm border rounded text-right" required />
                 </div>
                 <div className="md:col-span-2">
                    <label className="md:hidden text-xs text-gray-400">เลขโปรเจ็ค</label>
                    <input type="text" placeholder="Project No." value={item.project_no} onChange={(e) => handleItemChange(index, 'project_no', e.target.value)} className="w-full p-2 text-sm border rounded" />
                 </div>
                 
                 {/* ปุ่มลบ */}
                 <div className="md:col-span-1 flex justify-end">
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(index)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition">
                        <Trash2 size={18} />
                      </button>
                    )}
                 </div>
              </div>
            ))}
          </div>

          {/* สรุปยอด */}
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
             <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-gray-700">รวมทั้งสิ้น (ตัวเลข)</span>
                <span className="text-2xl font-bold text-blue-600">{totalAmount.toLocaleString()} บาท</span>
             </div>
             <div>
                <label className="block text-sm text-gray-600 mb-1">รวมทั้งสิ้น (ตัวอักษร) <span className="text-red-500">*</span></label>
                <input type="text" name="total_text" className="w-full p-2 border rounded-lg bg-white" placeholder="เช่น ห้าร้อยบาทถ้วน" required />
             </div>
          </div>
        </div>

        {/* วิธีจ่ายเงิน */}
        <div className="p-4 border rounded-xl">
           <h3 className="font-semibold mb-3">💰 วิธีจ่ายเงิน</h3>
           <div className="flex gap-6">
             <label className="flex items-center gap-2 cursor-pointer">
               <input type="radio" name="payment_method" value="cash" defaultChecked className="w-4 h-4 text-blue-600" /> 
               <span>เงินสด</span>
             </label>
             <label className="flex items-center gap-2 cursor-pointer">
               <input type="radio" name="payment_method" value="transfer" className="w-4 h-4 text-blue-600" /> 
               <span>โอนเงิน</span>
               <input type="date" name="transfer_date" className="ml-2 p-1 border rounded text-sm bg-gray-50" />
             </label>
           </div>
        </div>

        {/* ลายเซ็น */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ลงชื่อผู้เบิกจ่าย</label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 overflow-hidden">
            <SignatureCanvas 
              ref={sigPad}
              penColor="black"
              canvasProps={{ className: 'w-full h-48 bg-white' }}
            />
          </div>
          <button type="button" onClick={() => sigPad.current.clear()} className="text-xs text-red-500 mt-2 hover:underline">
            ล้างลายเซ็นเริ่มใหม่
          </button>
        </div>

        {/* ปุ่มบันทึก */}
        <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 active:scale-[0.98] transition flex justify-center items-center gap-2">
          {loading ? '⏳ กำลังบันทึก...' : <><Save /> บันทึกเอกสาร</>}
        </button>
      </form>
    </div>
  )
}