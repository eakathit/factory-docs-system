// src/History.jsx
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { Link } from "react-router-dom";
import {
  FileText,
  Search,
  Filter,
  User,
  Printer,
  Receipt,
  FileCheck,
  ChevronLeft,
  Banknote,
  ClipboardCheck,
  ClipboardList // เพิ่มไอคอนสำหรับ Operation Report
} from "lucide-react";

// ฟังก์ชันเลือกสีป้ายสถานะ
const getStatusColor = (status) => {
  switch (status) {
    case "อนุมัติแล้ว":
    case "เสร็จสิ้น":
    case "Complete": 
    case "Recorded": 
    case "approved": // 🟢 เพิ่มเพื่อให้รองรับค่า 'approved' เป็นสีเขียว
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "รออนุมัติ":
    case "pending":  // 🟢 เพิ่มเพื่อให้รองรับค่า 'pending' เป็นสีส้ม
    case "Pending":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "แก้ไข":
    case "Not Complete": 
      return "bg-orange-100 text-orange-700 border-orange-200";
    default:
      return "bg-blue-100 text-blue-700 border-blue-200";
  }
};

const History = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);

      // 1. ดึงข้อมูลใบสั่งจ้าง
      const reqOrders = supabase
        .from("doc_contractor_orders")
        .select("*")
        .order("created_at", { ascending: false });

      // 2. ดึงข้อมูลใบรับรองแทนใบเสร็จ
      const reqReceipts = supabase
        .from("doc_substitute_receipts")
        .select("*")
        .order("created_at", { ascending: false });

      // 3. ดึงข้อมูลใบสำคัญรับเงิน
      const reqVouchers = supabase
        .from("doc_receipt_vouchers")
        .select("*")
        .order("created_at", { ascending: false });
        
      // 4. ดึงข้อมูล Completion Report
      const reqCompletions = supabase
        .from("doc_completion_reports")
        .select("*")
        .order("created_at", { ascending: false });

      // 5. ดึงข้อมูล Operation Report (เพิ่มใหม่)
      const reqOperations = supabase
        .from("doc_operation_reports")
        .select("*")
        .order("created_at", { ascending: false });

      const [resOrders, resReceipts, resVouchers, resCompletions, resOperations] = await Promise.all([
        reqOrders,
        reqReceipts,
        reqVouchers,
        reqCompletions,
        reqOperations
      ]);

      if (resOrders.error) console.error("Error Orders:", resOrders.error);
      if (resReceipts.error) console.error("Error Receipts:", resReceipts.error);
      if (resVouchers.error) console.error("Error Vouchers:", resVouchers.error);
      if (resCompletions.error) console.error("Error Completions:", resCompletions.error);
      if (resOperations.error) console.error("Error Operations:", resOperations.error);

      // --- แปลงข้อมูล (Mapping) ---
      
      const orders = (resOrders.data || []).map((item) => ({
        ...item,
        doc_type: "order",
        display_title: item.contractor_name,
        // ปรับเป็น wage_type ให้ตรงกับ Database ใหม่
        display_subtitle: `ใบสั่งจ้าง: ${item.wage_type === "daily" ? "รายวัน" : "เหมา"}`,
        display_amount: item.wage_rate,
        display_person: item.supervisor_name,
        display_status: item.status || "Pending",
        // ชี้ไปที่ Route ของหน้า Print ใหม่ที่คุณเพิ่มใน App.jsx
        link_print: '/contractor-print',
        // ส่งข้อมูลทั้งหมดไปให้หน้า Print แสดงผลและใช้สำหรับการกดปุ่ม "แก้ไข"
        item_state: item 
      }));

      const receipts = (resReceipts.data || []).map((item) => ({
        ...item,
        doc_type: "receipt",
        display_title: item.payer_name,
        display_subtitle: `ใบรับรองฯ: ${item.doc_no}`,
        display_amount: item.total_amount,
        display_person: item.position,
        display_status: item.status || "Pending",
        link_print: `/receipt-print/${item.id}`,
        item_state: item
      }));

      const vouchers = (resVouchers.data || []).map((item) => ({
        ...item,
        doc_type: "voucher",
        display_title: item.receiver_name,
        display_subtitle: "ใบสำคัญรับเงิน",
        display_amount: item.total_amount,
        display_person: "",
        display_status: item.status || "Pending",
        link_print: `/receipt-voucher-print/${item.id}`,
        item_state: null
      }));

      const completions = (resCompletions.data || []).map((item) => ({
        ...item,
        doc_type: "completion",
        display_title: item.project_name,
        display_subtitle: `Completion Report (Project: ${item.project_no || "-"})`,
        display_amount: null, 
        display_person: item.location, 
        display_status: item.status || "Pending",
        link_print: '/completion-report-print',
        item_state: {
            date: item.date,
            projectName: item.project_name,
            projectNo: item.project_no,
            location: item.location,
            finishTime: item.finish_time,
            isComplete: item.is_complete,
            remark: item.remark
        }
      }));

      // จ. Operation Reports (เพิ่มใหม่)
      const operations = (resOperations.data || []).map((item) => {
        // ดึง service_type ออกมา (ถ้าเป็น null ให้เป็น object ว่าง)
        const serviceType = item.service_type || {};
        
        return {
          ...item,
          doc_type: "operation",
          display_title: item.customer_name || "ไม่ระบุลูกค้า",
          display_subtitle: `Operation Report: ${item.job_no || "-"}`,
          display_amount: null, // ไม่มีจำนวนเงิน
          display_person: item.operation_person,
          display_status: item.status || "Pending",
          link_print: '/operation-report-print',
          // ต้องแปลง field จาก DB (snake_case) เป็น State (camelCase) เพื่อให้หน้า Print รับค่าได้ถูกต้อง
          item_state: {
            id: item.id,
            jobNo: item.job_no,
            issuedDate: item.issued_date,
            // Checkboxes
            isWarranty: serviceType.warranty,
            isUrgent: serviceType.urgent,
            isAfterService: serviceType.after_service,
            isOther: serviceType.other,
            otherDetail: serviceType.other_detail,
            // Info
            expense: item.expense,
            customerName: item.customer_name,
            contactName: item.contact_name,
            startTime: item.start_time,
            finishTime: item.finish_time,
            operationPerson: item.operation_person,
            // Details
            problem: item.problem,
            receivedInfoFrom: item.received_info_from,
            receivedInfoDate: item.received_info_date,
            receivedInfoTime: item.received_info_time,
            reason: item.reason,
            solution: item.solution,
            comment: item.comment,
            place: item.place,
            project: item.project,
            status: item.status
          }
        };
      });

      // รวมทุกเอกสาร
      const allDocs = [...orders, ...receipts, ...vouchers, ...completions, ...operations].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setDocs(allDocs);
    } catch (error) {
      console.error("Error fetching history:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocs = docs.filter((doc) => {
    const matchesSearch =
      (doc.display_title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.display_subtitle || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.job_no || "").toLowerCase().includes(searchTerm.toLowerCase()); // เพิ่มการค้นหา Job No

    const matchesType =
      filterType === "All" ||
      (filterType === "Order" && doc.doc_type === "order") ||
      (filterType === "Receipt" && doc.doc_type === "receipt") ||
      (filterType === "Voucher" && doc.doc_type === "voucher") ||
      (filterType === "Completion" && doc.doc_type === "completion") ||
      (filterType === "Operation" && doc.doc_type === "operation"); // เพิ่ม Filter

    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* Header Bar */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                <ChevronLeft size={28} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <FileCheck className="text-blue-600" />
                  ประวัติเอกสาร
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  รายการเอกสารทั้งหมด {docs.length} รายการ
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-grow md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ, เลขที่..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="relative md:w-48">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select
                  className="w-full pl-10 pr-8 py-2 rounded-xl border border-slate-200 appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="All">ทุกประเภท</option>
                  <option value="Order">ใบสั่งจ้าง</option>
                  <option value="Receipt">ใบรับรองฯ</option>
                  <option value="Voucher">ใบสำคัญรับเงิน</option>
                  <option value="Completion">Completion Report</option>
                  <option value="Operation">Operation Report</option> {/* เพิ่มตัวเลือก */}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Content Section --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="text-center py-20 text-slate-400 animate-pulse">กำลังโหลดข้อมูล...</div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-slate-600">ไม่พบเอกสาร</h3>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 bg-slate-50 px-6 py-4 border-b border-slate-100 text-sm font-semibold text-slate-600">
              <div className="col-span-2">วันที่</div>
              <div className="col-span-3">ชื่อ / หัวข้อ</div>
              <div className="col-span-3">รายละเอียด</div>
              <div className="col-span-2 text-center">สถานะ</div>
              <div className="col-span-2 text-right">จัดการ</div>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredDocs.map((doc) => (
                <div
                  key={`${doc.doc_type}-${doc.id}`}
                  className="group hover:bg-slate-50 transition-colors duration-200"
                >
                  <div className="p-4 md:px-6 md:py-4 flex flex-col md:grid md:grid-cols-12 md:gap-4 md:items-center">
                    
                    {/* วันที่ & ไอคอน */}
                    <div className="flex justify-between md:block md:col-span-2 mb-2 md:mb-0">
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        {doc.doc_type === "order" && <FileText size={16} className="text-blue-500" />}
                        {doc.doc_type === "receipt" && <Receipt size={16} className="text-emerald-500" />}
                        {doc.doc_type === "voucher" && <Banknote size={16} className="text-pink-500" />}
                        {doc.doc_type === "completion" && <ClipboardCheck size={16} className="text-orange-500" />} 
                        {doc.doc_type === "operation" && <ClipboardList size={16} className="text-violet-500" />} 
                        
                        <span className="font-medium text-slate-700">
                          {new Date(doc.created_at).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "2-digit" })}
                        </span>
                      </div>
                    </div>

                    {/* ชื่อ / หัวข้อ */}
                    <div className="md:col-span-3 mb-1 md:mb-0">
                      <h4 className="font-bold text-slate-800 text-base md:text-sm truncate">
                        {doc.display_title || "ไม่ระบุชื่อ"}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-slate-500 md:hidden">
                        <User size={12} /> {doc.display_person || "-"}
                      </div>
                    </div>

                    {/* รายละเอียด */}
                    <div className="md:col-span-3 mb-3 md:mb-0">
                      <p className="text-sm text-slate-600 line-clamp-1">{doc.display_subtitle}</p>
                      
                    </div>

                    {/* สถานะ */}
                    <div className="md:col-span-2 flex md:justify-center mb-3 md:mb-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(doc.display_status)}`}>
                        {doc.display_status}
                      </span>
                    </div>

                    {/* ปุ่ม Print */}
                    <div className="md:col-span-2 flex items-center justify-end gap-2 mt-2 md:mt-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                      
  {doc.display_status === "Pending" && (
    <Link
      to={`/approve/${doc.doc_type}/${doc.id}`}
      state={doc} // ส่งข้อมูล doc ทั้งก้อนไปให้หน้า ApprovalPage
      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-all shadow-sm active:scale-95"
    >
      <ClipboardList size={18} />
      <span>อนุมัติ</span>
    </Link>
  )}

                      <Link
                        to={doc.link_print}
                        state={doc.item_state} 
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm active:scale-95"
                      >
                        <Printer size={18} />
                        <span>พิมพ์</span>
                      </Link>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button (Mobile) */}
      <Link
        to="/"
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-slate-800 text-white rounded-full shadow-lg shadow-slate-800/30 flex items-center justify-center active:scale-90 transition-transform z-50"
      >
        <span className="text-2xl font-light">+</span>
      </Link>
    </div>
  );
};

export default History;