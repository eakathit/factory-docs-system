import { useState, useRef } from 'react'
import { supabase } from './supabaseClient'
import SignatureCanvas from 'react-signature-canvas'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

// ⚠️ สำคัญมาก: ต้องมีคำว่า export default นำหน้า function
export default function ContractorForm() {
  const navigate = useNavigate()
  const sigPad = useRef({}) // ตัวเก็บลายเซ็น
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. ดึงข้อมูลจากฟอร์ม
      const formData = new FormData(e.target)
      const data = Object.fromEntries(formData.entries())

      // 2. จัดการลายเซ็น (ถ้ามีการเซ็น)
      let signatureUrl = null
      
      // เช็คว่ามี ref และไม่ได้ว่างเปล่า
      if (sigPad.current && !sigPad.current.isEmpty()) {
        // *** แก้ไขตรงนี้: ต้องดึง getCanvas() ออกมาก่อน ***
        const canvas = sigPad.current.getCanvas()
        
        // แปลงลายเซ็นเป็นไฟล์รูปภาพ (Blob)
        const blob = await new Promise(resolve => {
          canvas.toBlob(resolve, 'image/png')
        })

        const fileName = `sig-${Date.now()}.png`
        
        // อัปโหลดขึ้น Supabase Storage (Bucket: signatures)
        const { error: uploadError } = await supabase.storage
          .from('signatures')
          .upload(fileName, blob, {
            contentType: 'image/png',
            upsert: false
          })

        if (uploadError) throw uploadError

        // ขอ URL รูปภาพมาเก็บใน Database
        const { data: urlData } = supabase.storage.from('signatures').getPublicUrl(fileName)
        signatureUrl = urlData.publicUrl
      }

      // 3. บันทึกข้อมูลลง Database
      const { error: insertError } = await supabase.from('doc_contractor_orders').insert([
        {
          contractor_name: data.contractor_name,
          id_card_number: data.id_card_number,
          payment_type: data.payment_type,
          wage_rate: parseFloat(data.wage_rate || 0),
          start_date: data.start_date || null,
          end_date: data.end_date || null,
          supervisor_name: data.supervisor_name,
          contractor_signature: signatureUrl,
        }
      ])

      if (insertError) throw insertError

      alert('✅ บันทึกใบสั่งจ้างเรียบร้อย!')
      navigate('/') // กลับหน้าหลัก

    } catch (error) {
      console.error('Error:', error)
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="mb-4">
        <Link to="/" className="text-gray-500 flex items-center gap-1 text-sm hover:text-blue-600">
          <ArrowLeft size={16} /> กลับหน้าหลัก
        </Link>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">
          📝 ใบสั่งจ้างผู้รับเหมา
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* ชื่อผู้รับเหมา */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้รับเหมา</label>
            <input required name="contractor_name" type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="นาย ก." />
          </div>

          {/* เลขบัตรประชาชน */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">เลขบัตรประชาชน</label>
            <input name="id_card_number" type="text" className="w-full p-2 border rounded-lg" placeholder="1-xxxx-xxxxx-xx-x" />
          </div>

          {/* ประเภทค่าจ้าง (Radio) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทการจ้าง</label>
            <div className="flex gap-4 mt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="payment_type" value="daily" defaultChecked /> รายวัน
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="payment_type" value="project" /> เหมาโปรเจกต์
              </label>
            </div>
          </div>

          {/* ค่าจ้าง */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ค่าจ้าง (บาท)</label>
            <input required name="wage_rate" type="number" className="w-full p-2 border rounded-lg" placeholder="เช่น 500" />
          </div>

          {/* วันที่เริ่ม-จบ */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่ม</label>
              <input name="start_date" type="date" className="w-full p-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วันสิ้นสุด</label>
              <input name="end_date" type="date" className="w-full p-2 border rounded-lg text-sm" />
            </div>
          </div>

          {/* ผู้ควบคุมงาน */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ผู้รับผิดชอบ (หัวหน้างาน)</label>
            <input name="supervisor_name" type="text" className="w-full p-2 border rounded-lg" placeholder="ชื่อหัวหน้างาน" />
          </div>

          {/* ลายเซ็น */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ลายเซ็นผู้รับเหมา</label>
            <div className="border rounded-lg overflow-hidden bg-gray-50 relative">
              <SignatureCanvas 
                ref={sigPad}
                penColor="black"
                canvasProps={{width: 320, height: 150, className: 'sigCanvas mx-auto'}} 
              />
              <button 
                type="button" 
                onClick={() => sigPad.current.clear()}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 bg-white rounded-full p-1 shadow-sm"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1 text-center">เซ็นชื่อในกรอบสี่เหลี่ยม</p>
          </div>

          {/* ปุ่ม Submit */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 mt-4"
          >
            {loading ? 'กำลังบันทึก...' : <><Save size={20} /> บันทึกเอกสาร</>}
          </button>
        </form>
      </div>
    </div>
  )
}