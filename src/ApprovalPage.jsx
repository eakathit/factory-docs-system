import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { supabase } from './supabaseClient'; //
import { CheckCircle, XCircle, Trash2 } from 'lucide-react';

const ApprovalPage = ({ docId, docType, docData }) => {
  const sigCanvas = useRef({});
  const [comment, setComment] = useState('');

  const handleApprove = async () => {
    const signatureImage = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
    
    // อัปเดตสถานะใน Supabase
    const { error } = await supabase
      .from(getTableByType(docType)) // เลือกตารางตามประเภทเอกสาร
      .update({ 
        status: 'approved', 
        approver_signature: signatureImage,
        approver_comment: comment 
      })
      .eq('id', docId);

    if (!error) alert('อนุมัติเรียบร้อยแล้ว');
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-slate-50 min-h-screen">
      <h2 className="text-xl font-bold mb-4">อนุมัติเอกสาร</h2>
      
      {/* ส่วนแสดงข้อมูลย่อของเอกสาร */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-4 border border-slate-200">
        <p className="text-sm text-slate-500">ประเภท: {docType}</p>
        <p className="font-bold text-lg">{docData.title}</p>
      </div>

      {/* พื้นที่เซ็นชื่อ */}
      <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-2 mb-4">
        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">ลงลายมือชื่อ</ts>
        <div className="bg-slate-100 rounded-lg">
          <SignatureCanvas 
            ref={sigCanvas}
            canvasProps={{className: 'w-full h-48 signature-canvas'}} 
          />
        </div>
        <button 
          onClick={() => sigCanvas.current.clear()}
          className="mt-2 text-xs text-red-500 flex items-center gap-1"
        >
          <Trash2 size={14} /> ล้างลายเซ็น
        </button>
      </div>

      <textarea 
        className="w-full p-3 rounded-xl border border-slate-200 mb-4"
        placeholder="ความเห็นเพิ่มเติม (ถ้ามี)..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <div className="flex gap-3">
        <button className="flex-1 bg-white border border-red-200 text-red-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
          <XCircle size={20} /> ตีกลับ
        </button>
        <button 
          onClick={handleApprove}
          className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
        >
          <CheckCircle size={20} /> อนุมัติ
        </button>
      </div>
    </div>
  );
};