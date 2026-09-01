import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Search, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { DataGrid, Button } from "../../ui";
import { notify } from "../../../services/utils/authUtils";
import formSubmissionService from "../../../services/api/formSubmissionService";
import formService from "../../../services/api/formService";

const EVENT_CODE = "POWER_BIBLE_SCHOOL";

const formatDate = (val) => {
  if (!val) return "—";
  try {
    const d = new Date(val);
    if (isNaN(d)) return val;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return val;
  }
};

const extractStudent = (s) => {
  const sd = s.submissionData || {};
  const firstName = (sd.firstName || sd["First Name"] || "").trim();
  const lastName = (sd.lastName || sd["Last Name"] || "").trim();
  const middleName = (sd.middleName || "").trim();
  const studentName =
    [firstName, middleName, lastName].filter(Boolean).join(" ") ||
    s.userName ||
    "Anonymous";

  const campus =
    sd.campus ||
    sd["Campus"] ||
    sd.campusName ||
    (s.campus ? s.campus.name || s.campus : "") ||
    "—";
  const attendance = sd.attendanceType || sd["Attendance Type"] || "—";
  const academicLevel = sd.academicLevel || sd["Academic Level"] || "—";
  const term = sd.term || sd["Term"] || "—";
  const starts = sd.startDate || sd["Start Date"] || sd.starts || s.submittedAt || s.createdAt;
  const paymentDone = String(s.paymentStatus || "").toUpperCase() === "COMPLETED";

  return {
    id: s.id,
    studentName,
    memberId: String(s.id ?? studentName).toUpperCase() === "ANONYMOUS" ? "—" : `PBS-${String(s.id ?? "").padStart(4, "0")}`,
    campus,
    academicLevel,
    term,
    starts,
    graduationProgress: paymentDone ? 100 : attendance === "Online" ? 65 : 35,
    email: sd.email || s.userEmail || "—",
    phone: sd.phone || "—",
    country: sd.country || sd.Country || "—",
    city: sd.city || "—",
    attendance,
    maritalStatus: sd.maritalStatus || sd["Marital Status"] || "—",
    paymentStatus: s.paymentStatus,
    paymentAmount: s.paymentAmount,
    submittedAt: s.submittedAt || s.createdAt,
  };
};

const PowerBibleSchoolRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const loadRegistrations = async () => {
      setIsLoading(true);
      try {
        const form = await formService.getFormByEventCode(EVENT_CODE);
        const formId = form?.id;
        if (!formId) {
          setRegistrations([]);
          return;
        }
        const res = await formSubmissionService.getFormSubmissions(formId, {
          page: 0,
          size: 1000,
        });
        const raw = res?.content || (Array.isArray(res) ? res : []);
        setRegistrations(raw.map(extractStudent));
      } catch (err) {
        const status = err?.response?.status;
        if (status === 403) {
          notify.error("You don't have permission to view PBS registrations.");
        } else if (status === 401) {
          notify.error("Your session has expired. Please sign in again.");
        } else if (status === 404) {
          notify.error("Power Bible School form not found. Please set up the PBS form first.");
        } else {
          notify.error("Failed to load PBS registrations.");
        }
        setRegistrations([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadRegistrations();
  }, []);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return registrations;
    const term = searchTerm.toLowerCase();
    return registrations.filter(
      (r) =>
        r.studentName.toLowerCase().includes(term) ||
        r.memberId.toLowerCase().includes(term) ||
        r.campus.toLowerCase().includes(term) ||
        r.academicLevel.toLowerCase().includes(term) ||
        r.term.toLowerCase().includes(term)
    );
  }, [registrations, searchTerm]);

  const paginated = useMemo(() => {
    const start = page * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const stats = useMemo(() => {
    const total = registrations.length;
    const graduated = registrations.filter((r) => Number(r.graduationProgress) >= 100).length;
    const withdrawn = registrations.filter(
      (r) => Number(r.graduationProgress) >= 0 && Number(r.graduationProgress) < 40
    ).length;
    const enrolled = Math.max(0, total - graduated - withdrawn);
    return { total, enrolled, graduated, withdrawn };
  }, [registrations]);

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      notify.error("No registrations to export.");
      return;
    }
    setIsExporting(true);
    try {
      const headers = [
        "Student Name",
        "Member ID",
        "Campus",
        "Academic Level",
        "Term",
        "Starts",
        "Graduation Progress (%)",
      ];
      const escape = (v) => {
        const str = v == null ? "" : String(v);
        return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
      };
      const rows = filtered.map((r) =>
        [
          r.studentName,
          r.memberId,
          r.campus,
          r.academicLevel,
          r.term,
          formatDate(r.starts),
          Math.round(Number(r.graduationProgress) || 0),
        ]
          .map(escape)
          .join(",")
      );
      const csv = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `PBS-Registrations-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      notify.success("PBS registrations exported to CSV.");
    } catch (err) {
      notify.error("CSV export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = () => {
    if (filtered.length === 0) {
      notify.error("No registrations to export.");
      return;
    }
    setIsExporting(true);
    try {
      const doc = new jsPDF({ orientation: "landscape" });
      doc.setFontSize(16);
      doc.setTextColor(1, 26, 90);
      doc.text("Power Bible School Registrations", 14, 16);
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text(`Generated on ${new Date().toLocaleDateString("en-US")}`, 14, 23);

      autoTable(doc, {
        startY: 30,
        head: [[
          "Student Name",
          "Member ID",
          "Campus",
          "Academic Level",
          "Term",
          "Starts",
          "Progress (%)",
        ]],
        body: filtered.map((r) => [
          r.studentName,
          r.memberId,
          r.campus,
          r.academicLevel,
          r.term,
          formatDate(r.starts),
          Math.round(Number(r.graduationProgress) || 0),
        ]),
        theme: "grid",
        headStyles: { fillColor: [1, 26, 90] },
        styles: { fontSize: 8 },
      });

      doc.save(`PBS-Registrations-${new Date().toISOString().split("T")[0]}.pdf`);
      notify.success("PBS registrations exported to PDF.");
    } catch (err) {
      notify.error("PDF export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  const columns = [
    {
      field: "studentName",
      headerName: "Student Name",
      flex: 1,
      minWidth: 170,
      headerClassName: "pbs-header",
      renderCell: (params) => (
        <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#1f2937" }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "memberId",
      headerName: "Member ID",
      flex: 0.8,
      minWidth: 130,
      headerClassName: "pbs-header",
      renderCell: (params) => (
        <Typography sx={{ fontSize: 14, color: "#6b7280" }}>{params.value}</Typography>
      ),
    },
    {
      field: "campus",
      headerName: "Campus",
      flex: 1,
      minWidth: 150,
      headerClassName: "pbs-header",
      renderCell: (params) => (
        <Typography sx={{ fontSize: 14, color: "#45556C" }}>{params.value}</Typography>
      ),
    },
    {
      field: "academicLevel",
      headerName: "Academic Level",
      flex: 1,
      minWidth: 140,
      headerClassName: "pbs-header",
      renderCell: (params) => (
        <Typography sx={{ fontSize: 14, color: "#45556C" }}>{params.value}</Typography>
      ),
    },
    {
      field: "term",
      headerName: "Term",
      flex: 0.7,
      minWidth: 110,
      headerClassName: "pbs-header",
      renderCell: (params) => (
        <Typography sx={{ fontSize: 14, color: "#45556C" }}>{params.value}</Typography>
      ),
    },
    {
      field: "starts",
      headerName: "Starts",
      flex: 0.8,
      minWidth: 130,
      headerClassName: "pbs-header",
      renderCell: (params) => (
        <Typography sx={{ fontSize: 14, color: "#6b7280" }}>{formatDate(params.value)}</Typography>
      ),
    },
    {
      field: "graduationProgress",
      headerName: "Graduation Progress",
      flex: 1,
      minWidth: 180,
      headerClassName: "pbs-header",
      renderCell: (params) => {
        const value = Math.max(0, Math.min(100, Number(params.value) || 0));
        return (
          <Box sx={{ width: "100%", maxWidth: 180, pr: 2 }}>
            <Box
              sx={{
                width: "100%",
                height: 10.62,
                borderRadius: "999px",
                backgroundColor: "#0302131C",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  width: `${value}%`,
                  height: "100%",
                  borderRadius: "999px",
                  backgroundColor: "#011A5A",
                  transition: "width 0.3s ease",
                }}
              />
            </Box>
            <Typography sx={{ fontSize: 11, color: "#6b7280", mt: 0.5 }}>
              {Math.round(value)}%
            </Typography>
          </Box>
        );
      },
    },
  ];

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2, md: 3 },
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        minHeight: "100vh",
        backgroundColor: "#fafafa",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: { xs: 2, sm: 3 },
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
        }}
      >
        {/* Left Side */}
        <Box sx={{ maxWidth: "100%" }}>
          <Typography
            sx={{
              fontFamily: "Inter",
              fontWeight: 700,
              fontSize: { xs: "1.4rem", sm: "1.6rem", md: "24px" },
              lineHeight: 1.2,
              color: "#000000",
              mb: 1,
            }}
          >
            Power Bible School Registrations
          </Typography>

          <Typography
            sx={{
              fontFamily: "Inter",
              fontWeight: 400,
              fontSize: { xs: "0.875rem", sm: "16px" },
              color: "#6b7280",
              maxWidth: { xs: "100%", md: 560 },
              lineHeight: 1.5,
            }}
          >
            View all PBS registrations across campuses in your region - oversee
            enrollment numbers, monitor academic progress, and support campus
            coordinators
          </Typography>
        </Box>

        {/* Right Buttons */}
        <Box
          sx={{
            display: "flex",
            gap: { xs: 1.5, sm: 2 },
            flexWrap: "wrap",
            flexShrink: 0,
          }}
        >
          <Button
            variant="contained"
            startIcon={<Download size={18} color="#504F4F" />}
            onClick={handleExportPDF}
            disabled={isExporting}
            sx={{
              backgroundColor: "#FFFFFF",
              color: "#504F4F",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.12)",
              px: { xs: 2, sm: 3 },
              py: 1.2,
              borderRadius: "10px",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#F3F4F6",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.12)",
              },
            }}
          >
            Export to PDF
          </Button>

          <Button
            variant="contained"
            startIcon={<Download size={18} color="#FFFFFF" />}
            onClick={handleExportCSV}
            disabled={isExporting}
            sx={{
              backgroundColor: "#011A5A",
              color: "#FFFFFF",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.12)",
              px: { xs: 2, sm: 3 },
              py: 1.2,
              borderRadius: "10px",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#011A5A",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.12)",
              },
            }}
          >
            Export to CSV
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Paper
        elevation={0}
        sx={{
          mt: { xs: 1, sm: 2 },
          mb: { xs: 2, sm: 3 },
          width: "100%",
          backgroundColor: "#FFFFFF",
          border: "1px solid #0000001A",
          borderRadius: "10px",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr 1fr",
              md: "repeat(4, 1fr)",
            },
            width: "100%",
          }}
        >
          {[
            { label: "Total PBS Students", value: stats.total, color: "#0A0A0A" },
            { label: "Currently Enrolled", value: stats.enrolled, color: "#00A63E" },
            { label: "Graduated", value: stats.graduated, color: "#155DFC" },
            { label: "Deferred/Withdrawn", value: stats.withdrawn, color: "#F54900" },
          ].map((card, index) => (
            <Box
              key={card.label}
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRight: {
                  md: index < 3 ? "1px solid #0000001A" : "none",
                },
                borderBottom:
                  { xs: index < 2 ? "1px solid #0000001A" : "none", md: "none" },
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontWeight: 500,
                  fontSize: { xs: "12px", sm: "13px", md: "14px" },
                  color: "#0A0A0A",
                  mb: 1,
                }}
              >
                {card.label}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontWeight: 700,
                  fontSize: { xs: "20px", sm: "22px", md: "24px" },
                  color: card.color,
                  lineHeight: 1.2,
                }}
              >
                {card.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Search */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search by student name, member ID, campus, or level..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} color="#000000" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Table */}
      <Paper
        elevation={2}
        sx={{
          width: "100%",
          overflow: "hidden",
          borderRadius: 2,
          backgroundColor: "white",
        }}
      >
        <DataGrid
          key={`pbs-${filtered.length}-${searchTerm}-${page}`}
          rows={paginated}
          getRowId={(row) => row.id ?? row.studentName}
          rowCount={filtered.length}
          paginationMode="client"
          columns={columns}
          loading={isLoading}
          pagination
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          sx={{
            height: 620,

            "& .pbs-header": {
              backgroundColor: "#F5F6FA",
              color: "#19191A",
              fontSize: "14px",
              fontWeight: 500,
              borderBottom: "1px solid #EBEDF0",
            },

            "& .pbs-header .MuiDataGrid-columnHeaderTitle": {
              color: "#19191A",
              fontSize: "14px",
              fontWeight: 500,
            },

            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#F5F6FA !important",
              borderBottom: "1px solid #EBEDF0",
            },

            "& .MuiDataGrid-columnHeader": {
              backgroundColor: "#F5F6FA !important",
              borderBottom: "1px solid #EBEDF0",
            },

            "& .MuiDataGrid-row": {
              cursor: "pointer",
              borderBottom: "1px solid #F1F5F9",
            },

            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #F1F5F9",
              display: "flex",
              alignItems: "center",
              fontSize: 14,
              paddingLeft: "16px",
            },
          }}
        />
      </Paper>
    </Box>
  );
};

export default PowerBibleSchoolRegistrations;
