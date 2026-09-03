import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { FileText, Download, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import campusService from "../../../services/api/campusService";
import travelFormService from "../../../services/api/travelFormService";
import childDedicationService from "../../../services/api/childDedicationService";
import marriageCertificateService from "../../../services/api/marriageCertificateService";
import reportService from "../../../services/api/reportService";

const strip = (arr) =>
  arr == null
    ? []
    : Array.isArray(arr)
    ? arr
    : Array.isArray(arr?.content)
    ? arr.content
    : Array.isArray(arr?.data)
    ? arr.data
    : Array.isArray(arr?.data?.data)
    ? arr.data.data
    : [];

const REPORT_TYPES = [
  { value: "all", label: "All Types" },
  { value: "travel", label: "Travel Forms" },
  { value: "child", label: "Child Dedications" },
  { value: "marriage", label: "Marriage Certificates" },
  { value: "reports", label: "Reports" },
];

const TRAVEL_COLUMNS = [
  { key: "submitterName", label: "Submitter" },
  { key: "campus", label: "Campus" },
  { key: "destination", label: "Destination" },
  { key: "departureDate", label: "Departure" },
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
  { key: "submitted", label: "Submitted" },
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

const formatDate = (val) => {
  if (!val) return "—";
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return val;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getVal = (row, key) => {
  if (key === "submitted" || key === "submittedAt") {
    return formatDate(row.submittedAt || row.submitted);
  }
  if (key === "departureDate" || key === "returnDate" || key === "dedicationDate" || key === "marriageDate" || key === "date") {
    return formatDate(row[key]);
  }
  return row[key] ?? "—";
};

const getColumns = (type) => {
  switch (type) {
    case "travel":
      return TRAVEL_COLUMNS;
    case "child":
      return CHILD_COLUMNS;
    case "marriage":
      return MARRIAGE_COLUMNS;
    case "reports":
      return REPORT_COLUMNS;
    default:
      return TRAVEL_COLUMNS;
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
    <span
      className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium"
      style={{
        backgroundColor: s.bg,
        border: `1px solid ${s.border}`,
        color: s.color,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {status}
    </span>
  );
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

  useEffect(() => {
    const loadCampuses = async () => {
      try {
        const res = await campusService.getManagementList({ size: 200 });
        setCampuses(strip(res?.data));
      } catch {
        setCampuses([]);
      }
    };
    loadCampuses();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        reportType === "all" || reportType === "travel"
          ? travelFormService.getAll().then((r) => strip(r?.data))
          : Promise.resolve([]),
        reportType === "all" || reportType === "child"
          ? childDedicationService.getAll().then((r) => strip(r?.data))
          : Promise.resolve([]),
        reportType === "all" || reportType === "marriage"
          ? marriageCertificateService.getAll().then((r) => strip(r?.data))
          : Promise.resolve([]),
        reportType === "all" || reportType === "reports"
          ? reportService.getAllReports().then((r) => strip(r?.data))
          : Promise.resolve([]),
      ]);
      setTravelForms(results[0].status === "fulfilled" ? results[0].value : []);
      setChildDedications(results[1].status === "fulfilled" ? results[1].value : []);
      setMarriages(results[2].status === "fulfilled" ? results[2].value : []);
      setReports(results[3].status === "fulfilled" ? results[3].value : []);
    } catch {
      // keep previous data
    } finally {
      setLoading(false);
    }
  };

  const filterByDate = (items, dateField) => {
    if (!dateFrom && !dateTo) return items;
    return items.filter((item) => {
      const raw = item[dateField] || item.submittedAt || item.createdAt;
      if (!raw) return false;
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) return false;
      if (dateFrom) {
        const from = new Date(dateFrom);
        if (d < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (d > to) return false;
      }
      return true;
    });
  };

  const filterByCampus = (items) => {
    if (selectedCampus === "all") return items;
    return items.filter(
      (item) => (item.campus || "").toLowerCase() === selectedCampus.toLowerCase()
    );
  };

  const filteredTravel = useMemo(
    () => filterByCampus(filterByDate(travelForms, "submitted")),
    [travelForms, selectedCampus, dateFrom, dateTo]
  );
  const filteredChild = useMemo(
    () => filterByCampus(filterByDate(childDedications, "dedicationDate")),
    [childDedications, selectedCampus, dateFrom, dateTo]
  );
  const filteredMarriage = useMemo(
    () => filterByCampus(filterByDate(marriages, "marriageDate")),
    [marriages, selectedCampus, dateFrom, dateTo]
  );
  const filteredReports = useMemo(
    () => filterByCampus(filterByDate(reports, "date")),
    [reports, selectedCampus, dateFrom, dateTo]
  );

  const hasData =
    filteredTravel.length > 0 ||
    filteredChild.length > 0 ||
    filteredMarriage.length > 0 ||
    filteredReports.length > 0;

  const handleGenerate = async () => {
    setGenerating(true);
    await fetchData();
    setGenerating(false);
  };

  const buildRows = (data, columns) =>
    data.map((row) => columns.map((col) => String(getVal(row, col.key) ?? "—")));

  const buildAllCSVRows = () => {
    const rows = [];
    if (reportType === "all" || reportType === "travel") {
      const cols = TRAVEL_COLUMNS;
      filteredTravel.forEach((row) => {
        rows.push(["Travel", ...cols.map((c) => String(getVal(row, c.key) ?? ""))]);
      });
    }
    if (reportType === "all" || reportType === "child") {
      const cols = CHILD_COLUMNS;
      filteredChild.forEach((row) => {
        rows.push(["Child", ...cols.map((c) => String(getVal(row, c.key) ?? ""))]);
      });
    }
    if (reportType === "all" || reportType === "marriage") {
      const cols = MARRIAGE_COLUMNS;
      filteredMarriage.forEach((row) => {
        rows.push(["Marriage", ...cols.map((c) => String(getVal(row, c.key) ?? ""))]);
      });
    }
    if (reportType === "all" || reportType === "reports") {
      const cols = REPORT_COLUMNS;
      filteredReports.forEach((row) => {
        rows.push(["Report", ...cols.map((c) => String(getVal(row, c.key) ?? ""))]);
      });
    }
    return rows;
  };

  const handleExportCSV = () => {
    const allRows = buildAllCSVRows();
    if (allRows.length === 0) return alert("No data to export. Click 'Generate report' first.");

    const allColumns =
      reportType === "all"
        ? [["Type", ...TRAVEL_COLUMNS.map((c) => c.label)]]
        : [];

    let headers;
    if (reportType === "all") {
      headers = allColumns[0];
    } else if (reportType === "travel") headers = TRAVEL_COLUMNS.map((c) => c.label);
    else if (reportType === "child") headers = CHILD_COLUMNS.map((c) => c.label);
    else if (reportType === "marriage") headers = MARRIAGE_COLUMNS.map((c) => c.label);
    else headers = REPORT_COLUMNS.map((c) => c.label);

    const csv = [headers, ...allRows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nl-report-${reportType}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const allRows = buildAllCSVRows();
    if (allRows.length === 0) return alert("No data to export. Click 'Generate report' first.");

    const doc = new jsPDF("l", "mm", "a4");

    doc.setFontSize(16);
    doc.text("Regional Reports & Analytics", 14, 15);
    doc.setFontSize(10);
    doc.text(`Region: ${region || "N/A"}  |  Report Type: ${REPORT_TYPES.find((t) => t.value === reportType)?.label}  |  Generated: ${new Date().toLocaleDateString()}`, 14, 22);

    let startY = 30;

    const drawTable = (title, columns, data) => {
      if (data.length === 0) return startY;
      doc.setFontSize(12);
      doc.text(title, 14, startY);
      startY += 2;

      doc.autoTable({
        startY,
        head: [columns.map((c) => c.label)],
        body: buildRows(data, columns),
        theme: "striped",
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [0, 33, 102] },
        margin: { left: 14 },
      });

      startY = doc.lastAutoTable.finalY + 8;
      return startY;
    };

    if (reportType === "all" || reportType === "travel")
      startY = drawTable("Travel Forms", TRAVEL_COLUMNS, filteredTravel);
    if (reportType === "all" || reportType === "child")
      startY = drawTable("Child Dedications", CHILD_COLUMNS, filteredChild);
    if (reportType === "all" || reportType === "marriage")
      startY = drawTable("Marriage Certificates", MARRIAGE_COLUMNS, filteredMarriage);
    if (reportType === "all" || reportType === "reports")
      startY = drawTable("Reports", REPORT_COLUMNS, filteredReports);

    doc.save(`nl-report-${reportType}-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const renderTable = (title, columns, data) => {
    if (data.length === 0) return null;
    return (
      <div className="mb-6">
        <h3
          className="text-[#0A0A0A] mb-3"
          style={{ fontSize: "15px", fontFamily: "Inter, sans-serif", fontWeight: 500 }}
        >
          {title} ({data.length})
        </h3>
        <div className="overflow-x-auto border border-[#E5E7EB] rounded-lg">
          <table className="w-full text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
            <thead>
              <tr className="bg-[#F5F6FA] border-b border-[#E5E7EB]">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="text-left px-4 py-3 text-[#62748E] text-xs font-medium uppercase tracking-wider"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  className="border-b border-[#F0F0F0] hover:bg-[#FAFAFA] transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-4 py-3 text-[#0A0A0A] whitespace-nowrap"
                      style={{ fontSize: "13px", fontWeight: 400 }}
                    >
                      {col.key === "status" ? (
                        <StatusChip status={getVal(row, col.key)} />
                      ) : (
                        <span className="text-[#333]">{getVal(row, col.key)}</span>
                      )}
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
    fontFamily: "Inter, sans-serif",
    fontSize: "14px",
    backgroundColor: "#F3F3F5",
    border: "1px solid #00000000",
    borderRadius: "8px",
    padding: "10px 12px",
    color: "#0A0A0A",
    outline: "none",
    width: "100%",
  };

  return (
    <div className="min-h-screen bg-[#fafafa] p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1
          className="text-[#0A0A0A]"
          style={{ fontSize: "24px", fontFamily: "Inter, sans-serif", fontWeight: 600 }}
        >
          Regional Reports & Analytics
        </h1>
        <p
          className="mt-1"
          style={{ fontSize: "16px", fontFamily: "Inter, sans-serif", fontWeight: 400, color: "#474C59" }}
        >
          Generate and view comprehensive reports and analytics for all activities in your region
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#F5F6FA] flex items-center justify-center">
            <FileText size={20} color="#0A0A0A" />
          </div>
          <p
            className="text-[#0A0A0A]"
            style={{ fontSize: "16px", fontFamily: "Inter, sans-serif", fontWeight: 500 }}
          >
            Select Report Type
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label
              className="block mb-2 text-[#0A0A0A]"
              style={{ fontSize: "14px", fontFamily: "Inter, sans-serif", fontWeight: 500 }}
            >
              Report type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              style={inputStyle}
            >
              {REPORT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              className="block mb-2 text-[#0A0A0A]"
              style={{ fontSize: "14px", fontFamily: "Inter, sans-serif", fontWeight: 500 }}
            >
              Filter by Campus
            </label>
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              style={inputStyle}
            >
              <option value="all">All Campuses</option>
              {campuses.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div>
            <label
              className="block mb-2 text-[#0A0A0A]"
              style={{ fontSize: "14px", fontFamily: "Inter, sans-serif", fontWeight: 500 }}
            >
              Date from
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label
              className="block mb-2 text-[#0A0A0A]"
              style={{ fontSize: "14px", fontFamily: "Inter, sans-serif", fontWeight: 500 }}
            >
              Date to
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              fontFamily: "Inter, sans-serif",
              backgroundColor: "#002166",
              color: "#FFFFFF",
              opacity: generating ? 0.7 : 1,
            }}
          >
            {generating ? "Generating..." : "Generate report"}
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-[#E5E7EB] text-sm font-medium text-[#0A0A0A] hover:bg-gray-50 transition-colors"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            <Download size={16} />
            Export to PDF
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-[#E5E7EB] text-sm font-medium text-[#0A0A0A] hover:bg-gray-50 transition-colors"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            <FileSpreadsheet size={16} />
            Export as CSV
          </button>
        </div>
      </div>

      {(loading || hasData) && (
        <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p
                className="text-[#62748E]"
                style={{ fontSize: "14px", fontFamily: "Inter, sans-serif" }}
              >
                Loading data...
              </p>
            </div>
          ) : !hasData ? (
            <div className="flex items-center justify-center py-12">
              <p
                className="text-[#62748E]"
                style={{ fontSize: "14px", fontFamily: "Inter, sans-serif" }}
              >
                No records found matching the selected filters.
              </p>
            </div>
          ) : (
            <>
              {(reportType === "all" || reportType === "travel") &&
                renderTable("Travel Forms", TRAVEL_COLUMNS, filteredTravel)}
              {(reportType === "all" || reportType === "child") &&
                renderTable("Child Dedications", CHILD_COLUMNS, filteredChild)}
              {(reportType === "all" || reportType === "marriage") &&
                renderTable("Marriage Certificates", MARRIAGE_COLUMNS, filteredMarriage)}
              {(reportType === "all" || reportType === "reports") &&
                renderTable("Reports", REPORT_COLUMNS, filteredReports)}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NationalLeaderReportAnalytics;
