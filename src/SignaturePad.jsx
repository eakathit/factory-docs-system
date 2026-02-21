import React, { useRef } from 'react'
import SignatureCanvas from 'react-signature-canvas'

const SignaturePad = ({ onSave }) => {
  const sigRef = useRef({})

  const clear = () => sigRef.current.clear()
  const save = () => {
    // ดึงข้อมูลภาพเป็น Base64
    const dataURL = sigRef.current.getTrimmedCanvas().toDataURL('image/png')
    onSave(dataURL)
  }

  return (
    <div className="border rounded-xl p-2 bg-white">
      <SignatureCanvas 
        ref={sigRef}
        canvasProps={{
          className: 'w-full h-40 bg-slate-50 rounded-lg cursor-crosshair'
        }}
      />
      <div className="flex gap-2 mt-2">
        <button onClick={clear} className="text-xs text-red-500">ล้างหน้าจอ</button>
        <button onClick={save} className="text-xs text-blue-500 ml-auto">ยืนยันลายเซ็น</button>
      </div>
    </div>
  )
}