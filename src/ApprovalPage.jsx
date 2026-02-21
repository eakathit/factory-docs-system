import React, { useRef, useState } from 'react';
// 🟢 เพิ่มการ import useParams และ useLocation ที่ขาดหายไป
import { useParams, useLocation, useNavigate } from 'react-router-dom'; 
import SignatureCanvas from 'react-signature-canvas';
import { supabase } from './supabaseClient';
import { CheckCircle, XCircle, Trash2, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

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
  const { docType, docId } = useParams(); 
  const location = useLocation();
  const navigate = useNavigate();
  const sigCanvas = useRef(null); 
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ข้อมูลที่ส่งมาจากหน้า History
  const docData = location.state;

  const handleApprove = async () => {
    if (sigCanvas.current.isEmpty()) {
      return toast.error('กรุณาลงลายมือชื่อก่อนอนุมัติ');
    }

    setIsSubmitting(true);
    try {
      // 🟢 ใช้ getCanvas() แทน getTrimmedCanvas() เพื่อเลี่ยง Bug ของ Library เวอร์ชัน Alpha
      const signatureImage = sigCanvas.current.getCanvas().toDataURL('image/png');
      
      const { error } = await supabase
        .from(getTableByType(docType))
        .update({ 
          status: 'approved', 
          approver_signature: signatureImage,
          // 🔴 นำบรรทัด approver_comment ออกตามคำขอเพื่อเลี่ยง Error คอลัมน์ไม่มีอยู่จริง
        })
        .eq('id', docId);

      if (error) throw error;
      
      toast.success('อนุมัติเอกสารเรียบร้อยแล้ว');
      navigate('/history');
    } catch (error) {
      console.error(error);
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-slate-50 min-h-screen" style={{ fontFamily: "'Prompt', sans-serif" }}>
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-200 rounded-full">
           <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-bold">อนุมัติเอกสาร</h2>
      </div>
      
      <div className="bg-white p-4 rounded-xl shadow-sm mb-4 border border-slate-200">
        <p className="text-sm text-slate-500">ประเภท: {docType || 'ไม่ระบุ'}</p>
        {/* ใช้ display_title ตามข้อมูลที่ส่งมาจากหน้า History */}
        <p className="font-bold text-lg">{docData?.display_title || 'ไม่มีหัวข้อ'}</p>
      </div>

      <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-2 mb-6">
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

      {/* 🔴 นำช่อง textarea สำหรับ Comment ออกเพื่อให้หน้าจอสะอาดสอดคล้องกับโค้ดบันทึก */}

      <div className="flex gap-3">
        <button 
          type="button"
          onClick={() => navigate(-1)}
          className="flex-1 bg-white border border-slate-200 text-slate-500 py-3 rounded-xl font-bold hover:bg-slate-50"
        >
          ยกเลิก
        </button>
        <button 
          onClick={handleApprove}
          disabled={isSubmitting}
          className="flex-[2] bg-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50 shadow-lg shadow-emerald-600/20"
        >
          {isSubmitting ? 'กำลังบันทึก...' : <><CheckCircle size={20} /> อนุมัติเอกสาร</>}
        </button>
      </div>
    </div>
  );
};

export default ApprovalPage;