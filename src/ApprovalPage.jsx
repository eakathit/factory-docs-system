import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { supabase } from './supabaseClient';
import { CheckCircle, XCircle, Trash2, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// 1. เพิ่มฟังก์ชันช่วยหาชื่อตาราง (เพราะในโค้ดเดิมไม่มี)
const getTableByType = (type) => {
  const tables = {
    'order': 'doc_contractor_orders',
    'receipt': 'doc_substitute_receipts',
    'voucher': 'doc_receipt_vouchers',
    'operation': 'doc_operation_reports',
    'completion': 'doc_completion_reports'
  };
  return tables[type] || 'doc_operation_reports';
};

const ApprovalPage = () => { 
  // 1. ดึง ID และประเภทจาก URL (รองรับลิงก์จาก Line)
  const { docType, docId } = useParams(); 
  
  // 2. ดึงข้อมูลที่ส่งมาจาก Link (ถ้ามี)
  const location = useLocation();
  const navigate = useNavigate();
  const sigCanvas = useRef(null); 
  
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ข้อมูลที่อาจจะส่งมาจากหน้า History (ถ้าไม่มีให้เป็น null)
  const docData = location.state;

  const handleApprove = async () => {
    if (sigCanvas.current.isEmpty()) {
      return toast.error('กรุณาลงลายมือชื่อก่อนอนุมัติ');
    }

    setIsSubmitting(true);
    try {
      const signatureImage = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
      
      const { error } = await supabase
        .from(getTableByType(docType))
        .update({ 
          status: 'approved', 
          approver_signature: signatureImage,
          approver_comment: comment 
        })
        .eq('id', docId);

      if (error) throw error;
      
      toast.success('อนุมัติเอกสารเรียบร้อยแล้ว');
      navigate('/history');
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-slate-50 min-h-screen">
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-200 rounded-full">
           <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-bold">อนุมัติเอกสาร</h2>
      </div>
      
      <div className="bg-white p-4 rounded-xl shadow-sm mb-4 border border-slate-200">
        <p className="text-sm text-slate-500">ประเภท: {docType || 'ไม่ระบุ'}</p>
        <p className="font-bold text-lg">{docData?.title || 'ไม่มีหัวข้อ'}</p>
      </div>

      <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-2 mb-4">
        {/* แก้ไข Tag ปิดจาก </ts> เป็น </label> */}
        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
          ลงลายมือชื่อ (Signature)
        </label> 
        <div className="bg-slate-100 rounded-lg overflow-hidden">
          <SignatureCanvas 
            ref={sigCanvas}
            canvasProps={{className: 'w-full h-48 signature-canvas'}} 
          />
        </div>
        <button 
          onClick={() => sigCanvas.current.clear()}
          className="mt-2 text-xs text-red-500 flex items-center gap-1 hover:bg-red-50 p-1 rounded"
        >
          <Trash2 size={14} /> ล้างลายเซ็น
        </button>
      </div>

      <textarea 
        className="w-full p-3 rounded-xl border border-slate-200 mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder="ความเห็นเพิ่มเติม (ถ้ามี)..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <div className="flex gap-3">
        <button className="flex-1 bg-white border border-red-200 text-red-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-50">
          <XCircle size={20} /> ตีกลับ
        </button>
        <button 
          onClick={handleApprove}
          disabled={isSubmitting}
          className="flex-[2] bg-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50"
        >
          {isSubmitting ? 'กำลังบันทึก...' : <><CheckCircle size={20} /> อนุมัติ</>}
        </button>
      </div>
    </div>
  );
};

export default ApprovalPage;