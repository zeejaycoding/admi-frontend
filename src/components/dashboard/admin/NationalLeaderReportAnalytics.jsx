import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { FileText, Download, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer, LabelList,
  AreaChart, Area, LineChart, Line, Legend,
} from "recharts";
import campusService from "../../../services/api/campusService";
import travelFormService from "../../../services/api/travelFormService";
import childDedicationService from "../../../services/api/childDedicationService";
import marriageCertificateService from "../../../services/api/marriageCertificateService";
import reportService from "../../../services/api/reportService";
import formService from "../../../services/api/formService";
import formSubmissionService from "../../../services/api/formSubmissionService";

const strip = (arr) =>
  arr == null ? [] : Array.isArray(arr) ? arr
    : Array.isArray(arr?.content) ? arr.content
    : Array.isArray(arr?.data) ? arr.data
    : Array.isArray(arr?.data?.data) ? arr.data.data
    : [];

const REPORT_TYPES = [
  { value: "all", label: "All Types" },
  { value: "travel", label: "Travel Forms" },
  { value: "child", label: "Child Dedications" },
  { value: "marriage", label: "Marriage Certificates" },
  { value: "reports", label: "Reports" },
  { value: "pbs", label: "Power Bible School" },
  { value: "discipleship", label: "Discipleship Program" },
  { value: "other", label: "Other Programmes" },
];

const TYPE_COLORS = {
  travel: "#33CFFF",
  child: "#40C4AA",
  marriage: "#FFD6A8",
  reports: "#F7A072",
  pbs: "#605BFF",
  discipleship: "#00BC7D",
  other: "#C4A0FF",
};

const TRAVEL_COLUMNS = [
  { key: "submitter", label: "Submitter" },
  { key: "campus", label: "Campus" },
  { key: "country", label: "Country" },
  { key: "travelDate", label: "Departure" },
  { key: "returnDate", label: "Return" },
  { key: "status", label: "Status" },
  { key: "submitted", label: "Submitted" },
];

const CHILD_COLUMNS = [
  { key: "childName", label: "Child Name" },
  { key: "parentName", label: "Parent" },
  { key: "campus", label: "Campus" },
  { key: "dedicationDate", label: "Dedication Date" },
  { key: "minister", label: "Minister" },
  { key: "status", label: "Status" },
  { key: "submittedAt", label: "Submitted" },
];

const MARRIAGE_COLUMNS = [
  { key: "groomName", label: "Groom" },
  { key: "brideName", label: "Bride" },
  { key: "campus", label: "Campus" },
  { key: "marriageDate", label: "Marriage Date" },
  { key: "minister", label: "Minister" },
  { key: "status", label: "Status" },
  { key: "submittedAt", label: "Submitted" },
];

const REPORT_COLUMNS = [
  { key: "country", label: "Country" },
  { key: "campus", label: "Campus" },
  { key: "date", label: "Date" },
  { key: "nationalLeader", label: "National Leader" },
  { key: "coordinator", label: "Coordinator" },
  { key: "summary", label: "Summary" },
  { key: "currency", label: "Currency" },
  { key: "status", label: "Status" },
];

const PBS_COLUMNS = [
  { key: "studentName", label: "Student" },
  { key: "memberId", label: "ID" },
  { key: "campus", label: "Campus" },
  { key: "academicLevel", label: "Level" },
  { key: "term", label: "Term" },
  { key: "graduationProgress", label: "Progress %" },
  { key: "submittedAt", label: "Enrolled" },
];

const DISCIPLESHIP_COLUMNS = [
  { key: "memberName", label: "Member" },
  { key: "memberId", label: "ID" },
  { key: "campus", label: "Campus" },
  { key: "cohortBatch", label: "Cohort" },
  { key: "status", label: "Status" },
  { key: "submittedAt", label: "Registered" },
];

const OTHER_COLUMNS = [
  { key: "memberName", label: "Member" },
  { key: "memberId", label: "ID" },
  { key: "campus", label: "Campus" },
  { key: "programmeType", label: "Programme Type" },
  { key: "programmeName", label: "Programme" },
  { key: "status", label: "Status" },
  { key: "submittedAt", label: "Registered" },
];

const formatDate = (val) => {
  if (!val) return "—";
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return val;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const getVal = (row, key) => {
  if (key === "submittedAt") return formatDate(row.submittedAt || row.submitted);
  if (["departureDate", "returnDate", "dedicationDate", "marriageDate", "date"].includes(key))
    return formatDate(row[key]);
  return row[key] ?? "—";
};

const getColumns = (type) => {
  switch (type) {
    case "travel": return TRAVEL_COLUMNS;
    case "child": return CHILD_COLUMNS;
    case "marriage": return MARRIAGE_COLUMNS;
    case "reports": return REPORT_COLUMNS;
    case "pbs": return PBS_COLUMNS;
    case "discipleship": return DISCIPLESHIP_COLUMNS;
    case "other": return OTHER_COLUMNS;
    default: return TRAVEL_COLUMNS;
  }
};

const STATUS_STYLES = {
  Approved: { bg: "#ECFDF5", border: "#A4F4CFCC", color: "#007A55" },
  Rejected: { bg: "#FEF2F2", border: "#FECACA", color: "#991B1B" },
  Pending: { bg: "#FFFBEB", border: "#FEE685CC", color: "#BB4D00" },
  Sent: { bg: "#ECFDF5", border: "#A4F4CFCC", color: "#007A55" },
};

const StatusChip = ({ status }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Pending;
  return (
    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: s.bg, border: `1px solid ${s.border}`, color: s.color, fontFamily: "Inter, sans-serif" }}>
      {status}
    </span>
  );
};

const extractPBS = (s) => {
  const sd = s.submissionData || {};
  const fn = (sd.firstName || sd["First Name"] || "").trim();
  const ln = (sd.lastName || sd["Last Name"] || "").trim();
  const mn = (sd.middleName || "").trim();
  const studentName = [fn, mn, ln].filter(Boolean).join(" ") || s.userName || "Anonymous";
  const campus = sd.campus || sd["Campus"] || sd.campusName || (s.campus ? s.campus.name || s.campus : "") || "—";
  const attendance = sd.attendanceType || sd["Attendance Type"] || "—";
  const paymentDone = String(s.paymentStatus || "").toUpperCase() === "COMPLETED";
  return {
    id: s.id, studentName,
    memberId: `PBS-${String(s.id ?? "").padStart(4, "0")}`,
    campus,
    academicLevel: sd.academicLevel || sd["Academic Level"] || "—",
    term: sd.term || sd["Term"] || "—",
    graduationProgress: paymentDone ? 100 : attendance === "Online" ? 65 : 35,
    submittedAt: s.submittedAt || s.createdAt,
  };
};

const extractDiscipleship = (s) => {
  const sd = s.submissionData || {};
  const fn = (sd.firstName || sd["First Name"] || "").trim();
  const ln = (sd.lastName || sd["Last Name"] || "").trim();
  const mn = (sd.middleName || "").trim();
  const memberName = [fn, mn, ln].filter(Boolean).join(" ") || s.userName || "Anonymous";
  const campus = sd.campus || sd["Campus"] || sd.campusName || (s.campus ? s.campus.name || s.campus : "") || "—";
  return {
    id: s.id, memberName,
    memberId: `DCP-${String(s.id ?? "").padStart(4, "0")}`,
    campus,
    cohortBatch: sd.cohort || sd.batch || sd.Cohort || sd.Batch || sd.cohortBatch || "—",
    status: s.status || sd.status || "Active",
    submittedAt: s.submittedAt || s.createdAt,
  };
};

const extractOther = (s) => {
  const sd = s.submissionData || {};
  const fn = (sd.firstName || sd["First Name"] || "").trim();
  const ln = (sd.lastName || sd["Last Name"] || "").trim();
  const mn = (sd.middleName || "").trim();
  const memberName = [fn, mn, ln].filter(Boolean).join(" ") || s.userName || "Anonymous";
  const campus = sd.campus || sd["Campus"] || sd.campusName || (s.campus ? s.campus.name || s.campus : "") || "—";
  const pt = sd.programmeType || sd.ProgrammeType || sd.program || sd.programme || sd["Program / Programme"] || sd.type || sd.eventType || "Other";
  return {
    id: s.id, memberName,
    memberId: `PRG-${String(s.id ?? "").padStart(4, "0")}`,
    campus,
    programmeType: pt,
    programmeName: sd.programmeName || sd.programName || s.formTitle || "—",
    status: sd.status || "Registered",
    submittedAt: s.submittedAt || s.createdAt,
  };
};

const weekKey = (d) => {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  const start = new Date(dt);
  start.setDate(dt.getDate() - dt.getDay());
  return start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const monthKey = (d) => {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toLocaleDateString("en-US", { year: "numeric", month: "short" });
};

const NationalLeaderReportAnalytics = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const region = currentUser?.region;

  const [reportType, setReportType] = useState("all");
  const [selectedCampus, setSelectedCampus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [campuses, setCampuses] = useState([]);
  const [travelForms, setTravelForms] = useState([]);
  const [childDedications, setChildDedications] = useState([]);
  const [marriages, setMarriages] = useState([]);
  const [reports, setReports] = useState([]);
  const [pbs, setPbs] = useState([]);
  const [discipleship, setDiscipleship] = useState([]);
  const [otherProgrammes, setOtherProgrammes] = useState([]);

  useEffect(() => {
    campusService.getManagementList({ size: 100 })
      .then((r) => {
        const payload = r?.data;
        const list = Array.isArray(payload) ? payload
          : Array.isArray(payload?.campuses) ? payload.campuses
          : Array.isArray(payload?.content) ? payload.content
          : [];
        setCampuses(list);
      })
      .catch(() => setCampuses([]));
  }, []);

  const fetchPBS = useCallback(async () => {
    try {
      const form = await formService.getFormByEventCode("POWER_BIBLE_SCHOOL");
      if (!form?.id) return [];
      const res = await formSubmissionService.getFormSubmissions(form.id, { page: 0, size: 1000 });
      const raw = strip(res);
      return raw.map(extractPBS);
    } catch { return []; }
  }, []);

  const fetchDiscipleship = useCallback(async () => {
    try {
      const form = await formService.getFormByEventCode("DISCIPLESHIP_PROGRAM");
      if (!form?.id) return [];
      const res = await formSubmissionService.getFormSubmissions(form.id, { page: 0, size: 1000 });
      const raw = strip(res);
      return raw.map(extractDiscipleship);
    } catch { return []; }
  }, []);

  const fetchOther = useCallback(async () => {
    try {
      const [pbsForm, discForm] = await Promise.all([
        formService.getFormByEventCode("POWER_BIBLE_SCHOOL").catch(() => null),
        formService.getFormByEventCode("DISCIPLESHIP_PROGRAM").catch(() => null),
      ]);
      const excludeIds = new Set([pbsForm?.id, discForm?.id].filter(Boolean));
      const res = await formSubmissionService.getAllSubmissions({ page: 0, size: 1000 });
      const raw = strip(res);
      return raw.filter((s) => !excludeIds.has(s.formId)).map(extractOther);
    } catch { return []; }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        reportType === "all" || reportType === "travel"
          ? travelFormService.getAll().then((r) => strip(r?.data)) : Promise.resolve([]),
        reportType === "all" || reportType === "child"
          ? childDedicationService.getAll().then((r) => strip(r?.data)) : Promise.resolve([]),
        reportType === "all" || reportType === "marriage"
          ? marriageCertificateService.getAll().then((r) => strip(r?.data)) : Promise.resolve([]),
        reportType === "all" || reportType === "reports"
          ? reportService.getAllReports().then((r) => strip(r?.data)) : Promise.resolve([]),
        reportType === "all" || reportType === "pbs" ? fetchPBS() : Promise.resolve([]),
        reportType === "all" || reportType === "discipleship" ? fetchDiscipleship() : Promise.resolve([]),
        reportType === "all" || reportType === "other" ? fetchOther() : Promise.resolve([]),
      ]);
      setTravelForms(results[0].status === "fulfilled" ? results[0].value : []);
      setChildDedications(results[1].status === "fulfilled" ? results[1].value : []);
      setMarriages(results[2].status === "fulfilled" ? results[2].value : []);
      setReports(results[3].status === "fulfilled" ? results[3].value : []);
      setPbs(results[4].status === "fulfilled" ? results[4].value : []);
      setDiscipleship(results[5].status === "fulfilled" ? results[5].value : []);
      setOtherProgrammes(results[6].status === "fulfilled" ? results[6].value : []);
    } catch { /* keep previous */ } finally { setLoading(false); }
  }, [reportType, fetchPBS, fetchDiscipleship, fetchOther]);

  const filterByDate = (items) => {
    if (!dateFrom && !dateTo) return items;
    return items.filter((item) => {
      const raw = item.submittedAt || item.createdAt || item.submitted;
      if (!raw) return false;
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) return false;
      if (dateFrom && d < new Date(dateFrom)) return false;
      if (dateTo) { const to = new Date(dateTo); to.setHours(23, 59, 59, 999); if (d > to) return false; }
      return true;
    });
  };

  const filterByCampus = (items) => {
    if (selectedCampus === "all") return items;
    return items.filter((i) => (i.campus || "").toLowerCase() === selectedCampus.toLowerCase());
  };

  const fTravel = useMemo(() => filterByCampus(filterByDate(travelForms, "submittedAt")), [travelForms, selectedCampus, dateFrom, dateTo]);
  const fChild = useMemo(() => filterByCampus(filterByDate(childDedications, "submittedAt")), [childDedications, selectedCampus, dateFrom, dateTo]);
  const fMarriage = useMemo(() => filterByCampus(filterByDate(marriages, "submittedAt")), [marriages, selectedCampus, dateFrom, dateTo]);
  const fReports = useMemo(() => filterByCampus(filterByDate(reports, "submittedAt")), [reports, selectedCampus, dateFrom, dateTo]);
  const fPbs = useMemo(() => filterByCampus(filterByDate(pbs, "submittedAt")), [pbs, selectedCampus, dateFrom, dateTo]);
  const fDisc = useMemo(() => filterByCampus(filterByDate(discipleship, "submittedAt")), [discipleship, selectedCampus, dateFrom, dateTo]);
  const fOther = useMemo(() => filterByCampus(filterByDate(otherProgrammes, "submittedAt")), [otherProgrammes, selectedCampus, dateFrom, dateTo]);

  const typeCounts = useMemo(() => ({
    Travel: fTravel.length, Child: fChild.length, Marriage: fMarriage.length,
    Reports: fReports.length, PBS: fPbs.length, Discipleship: fDisc.length, Other: fOther.length,
  }), [fTravel, fChild, fMarriage, fReports, fPbs, fDisc, fOther]);

  const barData = useMemo(() => {
    const maxVal = Math.max(1, ...Object.values(typeCounts));
    return Object.entries(typeCounts).map(([name, value]) => ({
      name, value, fill: TYPE_COLORS[name.toLowerCase()] || "#CCC",
      pct: Math.round((value / maxVal) * 100),
    }));
  }, [typeCounts]);

  const allItems = useMemo(() => [...fTravel, ...fChild, ...fMarriage, ...fReports, ...fPbs, ...fDisc, ...fOther], [fTravel, fChild, fMarriage, fReports, fPbs, fDisc, fOther]);

  const weeklyGrowthData = useMemo(() => {
    const buckets = {};
    allItems.forEach((item) => {
      const raw = item.submittedAt || item.submitted || item.createdAt;
      const k = weekKey(raw);
      if (k) buckets[k] = (buckets[k] || 0) + 1;
    });
    const keys = Object.keys(buckets).sort((a, b) => new Date(a) - new Date(b));
    return keys.map((k) => ({ day: k, members: buckets[k] }));
  }, [allItems]);

  const monthlyGrowthData = useMemo(() => {
    const buckets = {};
    allItems.forEach((item) => {
      const raw = item.submittedAt || item.submitted || item.createdAt;
      const k = monthKey(raw);
      if (k) buckets[k] = (buckets[k] || 0) + 1;
    });
    const keys = Object.keys(buckets).sort((a, b) => new Date(a) - new Date(b));
    return keys.map((k) => ({ month: k, members: buckets[k] }));
  }, [allItems]);

  const [growthView, setGrowthView] = useState("weekly");

  const pbsChartData = useMemo(() => {
    if (reportType !== "pbs" || fPbs.length === 0) return null;
    const enrolled = fPbs.filter((p) => p.graduationProgress < 100).length;
    const graduated = fPbs.filter((p) => p.graduationProgress >= 100).length;
    return [
      { name: "Enrolled", value: enrolled, fill: "#605BFF" },
      { name: "Graduated", value: graduated, fill: "#00BC7D" },
    ];
  }, [reportType, fPbs]);

  const pbsTimelineData = useMemo(() => {
    if (reportType !== "pbs" || fPbs.length === 0) return null;
    const buckets = {};
    fPbs.forEach((p) => {
      const k = weekKey(p.submittedAt);
      if (!k) return;
      if (!buckets[k]) buckets[k] = { week: k, enrolled: 0, graduated: 0 };
      if (p.graduationProgress >= 100) buckets[k].graduated++;
      else buckets[k].enrolled++;
    });
    return Object.values(buckets).sort((a, b) => new Date(a.week) - new Date(b.week));
  }, [reportType, fPbs]);

  const hasData = allItems.length > 0;

  const handleGenerate = async () => {
    setGenerating(true);
    await fetchData();
    setGenerating(false);
  };

  const buildRows = (data, columns) =>
    data.map((row) => columns.map((col) => String(getVal(row, col.key) ?? "—")));

  const handleExportCSV = () => {
    const typeMap = { travel: TRAVEL_COLUMNS, child: CHILD_COLUMNS, marriage: MARRIAGE_COLUMNS,
      reports: REPORT_COLUMNS, pbs: PBS_COLUMNS, discipleship: DISCIPLESHIP_COLUMNS, other: OTHER_COLUMNS };
    const dataMap = { travel: fTravel, child: fChild, marriage: fMarriage, reports: fReports,
      pbs: fPbs, discipleship: fDisc, other: fOther };
    const typesToShow = reportType === "all" ? Object.keys(typeMap) : [reportType];
    const allRows = [];
    typesToShow.forEach((t) => {
      const cols = typeMap[t]; if (!cols) return;
      (dataMap[t] || []).forEach((row) => {
        allRows.push([t, ...cols.map((c) => String(getVal(row, c.key) ?? ""))]);
      });
    });
    if (allRows.length === 0) return alert("No data to export. Click 'Generate report' first.");
    const headers = ["Type", ...Object.values(typeMap).flat().filter((v, i, a) => a.findIndex((c) => c.key === v.key) === i).map((c) => c.label)];
    const csv = [headers, ...allRows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `nl-report-${reportType}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const typeMap = { travel: TRAVEL_COLUMNS, child: CHILD_COLUMNS, marriage: MARRIAGE_COLUMNS,
      reports: REPORT_COLUMNS, pbs: PBS_COLUMNS, discipleship: DISCIPLESHIP_COLUMNS, other: OTHER_COLUMNS };
    const dataMap = { travel: fTravel, child: fChild, marriage: fMarriage, reports: fReports,
      pbs: fPbs, discipleship: fDisc, other: fOther };
    const typesToShow = reportType === "all" ? Object.keys(typeMap) : [reportType];
    const doc = new jsPDF("l", "mm", "a4");
    doc.setFontSize(16); doc.text("Regional Reports & Analytics", 14, 15);
    doc.setFontSize(10);
    doc.text(`Region: ${region || "N/A"}  |  Type: ${REPORT_TYPES.find((t) => t.value === reportType)?.label}  |  Generated: ${new Date().toLocaleDateString()}`, 14, 22);
    let startY = 30;
    typesToShow.forEach((t) => {
      const cols = typeMap[t]; const data = dataMap[t] || [];
      if (data.length === 0) return;
      doc.setFontSize(12); doc.text(`${t.charAt(0).toUpperCase() + t.slice(1)} (${data.length})`, 14, startY); startY += 2;
      doc.autoTable({ startY, head: [cols.map((c) => c.label)], body: buildRows(data, cols),
        theme: "striped", styles: { fontSize: 8, cellPadding: 2 }, headStyles: { fillColor: [0, 33, 102] }, margin: { left: 14 } });
      startY = doc.lastAutoTable.finalY + 8;
    });
    doc.save(`nl-report-${reportType}-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const renderTable = (title, columns, data) => {
    if (data.length === 0) return null;
    return (
      <div className="mb-6">
        <h3 className="text-[#0A0A0A] mb-3" style={{ fontSize: "15px", fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
          {title} ({data.length})
        </h3>
        <div className="overflow-x-auto border border-[#E5E7EB] rounded-lg">
          <table className="w-full text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
            <thead>
              <tr className="bg-[#F5F6FA] border-b border-[#E5E7EB]">
                {columns.map((col) => (
                  <th key={col.key} className="text-left px-4 py-3 text-[#62748E] text-xs font-medium uppercase tracking-wider">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={row.id || idx} className="border-b border-[#F0F0F0] hover:bg-[#FAFAFA] transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-[#0A0A0A] whitespace-nowrap" style={{ fontSize: "13px", fontWeight: 400 }}>
                      {col.key === "status" ? <StatusChip status={getVal(row, col.key)} />
                        : col.key === "graduationProgress" ? `${getVal(row, col.key)}%`
                        : <span className="text-[#333]">{getVal(row, col.key)}</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const inputStyle = {
    fontFamily: "Inter, sans-serif", fontSize: "14px", backgroundColor: "#F3F3F5",
    border: "1px solid #00000000", borderRadius: "8px", padding: "10px 12px",
    color: "#0A0A0A", outline: "none", width: "100%",
  };

  const chartTooltip = { contentStyle: { borderRadius: 8, fontFamily: "Inter, sans-serif", fontSize: 13 } };

  return (
    <div className="min-h-screen bg-[#fafafa] p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-[#0A0A0A]" style={{ fontSize: "24px", fontFamily: "Inter, sans-serif", fontWeight: 600 }}>
          Regional Reports & Analytics
        </h1>
        <p className="mt-1" style={{ fontSize: "16px", fontFamily: "Inter, sans-serif", fontWeight: 400, color: "#474C59" }}>
          Generate and view comprehensive reports and analytics for all activities in your region
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#F5F6FA] flex items-center justify-center">
            <FileText size={20} color="#0A0A0A" />
          </div>
          <p className="text-[#0A0A0A]" style={{ fontSize: "16px", fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
            Select Report Type
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block mb-2 text-[#0A0A0A]" style={{ fontSize: "14px", fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
              Report type
            </label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)} style={inputStyle}>
              {REPORT_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
            </select>
          </div>
          <div>
            <label className="block mb-2 text-[#0A0A0A]" style={{ fontSize: "14px", fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
              Filter by Campus
            </label>
            <select value={selectedCampus} onChange={(e) => setSelectedCampus(e.target.value)} style={inputStyle}>
              <option value="all">All Campuses</option>
              {campuses.map((c) => (<option key={c.id} value={c.name}>{c.name}</option>))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div>
            <label className="block mb-2 text-[#0A0A0A]" style={{ fontSize: "14px", fontFamily: "Inter, sans-serif", fontWeight: 500 }}>Date from</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label className="block mb-2 text-[#0A0A0A]" style={{ fontSize: "14px", fontFamily: "Inter, sans-serif", fontWeight: 500 }}>Date to</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={handleGenerate} disabled={generating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ fontFamily: "Inter, sans-serif", backgroundColor: "#002166", color: "#FFF", opacity: generating ? 0.7 : 1 }}>
            {generating ? "Generating..." : "Generate report"}
          </button>
          <button onClick={handleExportPDF}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-[#E5E7EB] text-sm font-medium text-[#0A0A0A] hover:bg-gray-50 transition-colors"
            style={{ fontFamily: "Inter, sans-serif" }}>
            <Download size={16} /> Export to PDF
          </button>
          <button onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-[#E5E7EB] text-sm font-medium text-[#0A0A0A] hover:bg-gray-50 transition-colors"
            style={{ fontFamily: "Inter, sans-serif" }}>
            <FileSpreadsheet size={16} /> Export as CSV
          </button>
        </div>
      </div>

      {(loading || hasData) && (
        <div className="mt-6">
          {loading ? (
            <div className="bg-white rounded-xl p-6 shadow-sm flex items-center justify-center py-12">
              <p className="text-[#62748E]" style={{ fontSize: "14px", fontFamily: "Inter, sans-serif" }}>Loading data...</p>
            </div>
          ) : !hasData ? (
            <div className="bg-white rounded-xl p-6 shadow-sm flex items-center justify-center py-12">
              <p className="text-[#62748E]" style={{ fontSize: "14px", fontFamily: "Inter, sans-serif" }}>No records found matching the selected filters.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <p className="text-[#0A0A0A] mb-1" style={{ fontSize: "16px", fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
                    Records by Type
                  </p>
                  <p className="text-[#717182] mb-4" style={{ fontSize: "14px", fontFamily: "Inter, sans-serif", fontWeight: 400 }}>
                    Distribution across all programme types
                  </p>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={barData} margin={{ top: 20, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false}
                        tick={{ fill: "#666D80", fontSize: 11, fontFamily: "Inter, sans-serif" }} />
                      <YAxis axisLine={false} tickLine={false} domain={[0, 100]}
                        tick={{ fill: "#666D80", fontSize: 11, fontFamily: "Inter, sans-serif" }}
                        tickFormatter={(v) => `${v}%`} />
                      <Tooltip {...chartTooltip} formatter={(value, name, props) => [`${value} records`, props.payload.name]} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                        {barData.map((entry, i) => (<Cell key={i} fill={entry.fill} />))}
                        <LabelList dataKey="value" position="top"
                          formatter={(v) => `${v}`}
                          style={{ fill: "#0D0D12", fontSize: 12, fontFamily: "Inter, sans-serif", fontWeight: 500 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[#0A0A0A]" style={{ fontSize: "16px", fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
                      Campus Growth
                    </p>
                    <div className="flex gap-1 bg-[#F5F6FA] rounded-lg p-0.5">
                      {["weekly", "monthly"].map((v) => (
                        <button key={v} onClick={() => setGrowthView(v)}
                          className="px-3 py-1 rounded-md text-xs font-medium transition-colors"
                          style={{
                            fontFamily: "Inter, sans-serif",
                            backgroundColor: growthView === v ? "#FFF" : "transparent",
                            color: growthView === v ? "#0A0A0A" : "#62748E",
                            boxShadow: growthView === v ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                          }}>
                          {v.charAt(0).toUpperCase() + v.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-[#717182] mb-4" style={{ fontSize: "14px", fontFamily: "Inter, sans-serif", fontWeight: 400 }}>
                    Submissions over time
                  </p>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart
                      data={growthView === "weekly" ? weeklyGrowthData : monthlyGrowthData}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="lineGradNL" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#000000" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#000000" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="areaGradNL" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#73B1FF" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#73B1FF" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey={growthView === "weekly" ? "day" : "month"} axisLine={false} tickLine={false}
                        tick={{ fill: "#666D80", fontSize: 11, fontFamily: "Inter, sans-serif" }} />
                      <YAxis axisLine={false} tickLine={false}
                        tick={{ fill: "#666D80", fontSize: 11, fontFamily: "Inter, sans-serif" }} />
                      <Tooltip {...chartTooltip} formatter={(value) => [`${value} submissions`, "Count"]} />
                      <Area type="monotone" dataKey="members" stroke="url(#lineGradNL)" strokeWidth={2} fill="url(#areaGradNL)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {reportType === "pbs" && pbsTimelineData && pbsTimelineData.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                  <p className="text-[#0A0A0A] mb-1" style={{ fontSize: "16px", fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
                    Power Bible School — Enrolled vs Graduated
                  </p>
                  <p className="text-[#717182] mb-4" style={{ fontSize: "14px", fontFamily: "Inter, sans-serif", fontWeight: 400 }}>
                    Weekly registration and graduation trends
                  </p>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={pbsTimelineData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="pbsEnrolledLine" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#605BFF" stopOpacity={1} />
                          <stop offset="100%" stopColor="#605BFF" stopOpacity={0.6} />
                        </linearGradient>
                        <linearGradient id="pbsEnrolledArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#EBEBFF" stopOpacity={1} />
                          <stop offset="100%" stopColor="#EEEDFF" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="pbsGradLine" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00BC7D" stopOpacity={1} />
                          <stop offset="100%" stopColor="#00BC7D" stopOpacity={0.6} />
                        </linearGradient>
                        <linearGradient id="pbsGradArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#A4F4CFCC" stopOpacity={1} />
                          <stop offset="100%" stopColor="#ECFDF5" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="week" axisLine={false} tickLine={false}
                        tick={{ fill: "#666D80", fontSize: 11, fontFamily: "Inter, sans-serif" }} />
                      <YAxis axisLine={false} tickLine={false}
                        tick={{ fill: "#666D80", fontSize: 11, fontFamily: "Inter, sans-serif" }} />
                      <Tooltip {...chartTooltip} />
                      <Legend wrapperStyle={{ fontFamily: "Inter, sans-serif", fontSize: 13 }} />
                      <Area type="monotone" dataKey="enrolled" name="Enrolled"
                        stroke="url(#pbsEnrolledLine)" strokeWidth={2} fill="url(#pbsEnrolledArea)" />
                      <Area type="monotone" dataKey="graduated" name="Graduated"
                        stroke="url(#pbsGradLine)" strokeWidth={2} fill="url(#pbsGradArea)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="bg-white rounded-xl p-6 shadow-sm">
                {(reportType === "all" || reportType === "travel") && renderTable("Travel Forms", TRAVEL_COLUMNS, fTravel)}
                {(reportType === "all" || reportType === "child") && renderTable("Child Dedications", CHILD_COLUMNS, fChild)}
                {(reportType === "all" || reportType === "marriage") && renderTable("Marriage Certificates", MARRIAGE_COLUMNS, fMarriage)}
                {(reportType === "all" || reportType === "reports") && renderTable("Reports", REPORT_COLUMNS, fReports)}
                {(reportType === "all" || reportType === "pbs") && renderTable("Power Bible School", PBS_COLUMNS, fPbs)}
                {(reportType === "all" || reportType === "discipleship") && renderTable("Discipleship Program", DISCIPLESHIP_COLUMNS, fDisc)}
                {(reportType === "all" || reportType === "other") && renderTable("Other Programmes", OTHER_COLUMNS, fOther)}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NationalLeaderReportAnalytics;
