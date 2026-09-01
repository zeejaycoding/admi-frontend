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

const EVENT_CODE = "DISCIPLESHIP_PROGRAM";

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

const deriveStatus = (s, sd) => {
  const raw = s?.status || sd?.status || sd?.Status || sd?.registrationStatus;
  if (raw) return raw;
  const paymentDone = String(s?.paymentStatus || "").toUpperCase() === "COMPLETED";
  if (paymentDone) return "Active";
  return "Active";
};

const extractMember = (s) => {
  const sd = s.submissionData || {};
  const firstName = (sd.firstName || sd["First Name"] || "").trim();
  const lastName = (sd.lastName || sd["Last Name"] || "").trim();
  const middleName = (sd.middleName || "").trim();
  const memberName =
    [firstName, middleName, lastName].filter(Boolean).join(" ") ||
    s.userName ||
    "Anonymous";

  const campus =
    sd.campus ||
    sd["Campus"] ||
    sd.campusName ||
    (s.campus ? s.campus.name || s.campus : "") ||
    "—";

  const cohortBatch =
    sd.cohort ||
    sd.batch ||
    sd.Cohort ||
    sd.Batch ||
    sd.cohortBatch ||
    sd["Cohort / Batch"] ||
    "—";

  const status = deriveStatus(s, sd);
  const dateRegistered = sd.registeredAt || sd.dateRegistered || sd.submittedAt || s.submittedAt || s.createdAt;

  return {
    id: s.id,
    memberName,
    memberId: String(s.id ?? memberName).toUpperCase() === "ANONYMOUS" ? "—" : `DCP-${String(s.id ?? "").padStart(4, "0")}`,
    campus,
    cohortBatch,
    status,
    dateRegistered,
    email: sd.email || s.userEmail || "—",
    phone: sd.phone || "—",
    country: sd.country || sd.Country || "—",
    city: sd.city || "—",
    submittedAt: s.submittedAt || s.createdAt,
  };
};

const DiscipleshipProgramRegistrations = () => {
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
        setRegistrations(raw.map(extractMember));
      } catch (err) {
        const status = err?.response?.status;
        if (status === 403) {
          notify.error("You don't have permission to view Discipleship registrations.");
        } else if (status === 401) {
          notify.error("Your session has expired. Please sign in again.");
        } else if (status === 404) {
          notify.error("Discipleship Program form not found. Please set up the form first.");
        } else {
          notify.error("Failed to load Discipleship registrations.");
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
        r.memberName.toLowerCase().includes(term) ||
        r.memberId.toLowerCase().includes(term) ||
        r.campus.toLowerCase().includes(term) ||
        r.cohortBatch.toLowerCase().includes(term) ||
        r.status.toLowerCase().includes(term)
    );
  }, [registrations, searchTerm]);

  const paginated = useMemo(() => {
    const start = page * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const stats = useMemo(() => {
    const total = registrations.length;
    const completed = registrations.filter(
      (r) => String(r.status).toLowerCase().includes("complet")
    ).length;
    const dropped = registrations.filter(
      (r) =>
        String(r.status).toLowerCase().includes("dropped") ||
        String(r.status).toLowerCase().includes("withdrawn") ||
        String(r.status).toLowerCase().includes("drop")
    ).length;
    const active = Math.max(0, total - completed - dropped);
    return { total, active, completed, dropped };
  }, [registrations]);

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      notify.error("No registrations to export.");
      return;
    }
    setIsExporting(true);
    try {
      const headers = [
        "Member Name",
        "Member ID",
        "Campus",
        "Cohort/Batch",
        "Date Registered",
        "Status",
      ];
      const escape = (v) => {
        const str = v == null ? "" : String(v);
        return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
      };
      const rows = filtered.map((r) =>
        [
          r.memberName,
          r.memberId,
          r.campus,
          r.cohortBatch,
          formatDate(r.dateRegistered),
          r.status,
        ]
          .map(escape)
          .join(",")
      );
      const csv = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Discipleship-Registrations-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      notify.success("Discipleship registrations exported to CSV.");
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
      doc.text("Discipleship Program Registrations", 14, 16);
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text(`Generated on ${new Date().toLocaleDateString("en-US")}`, 14, 23);

      autoTable(doc, {
        startY: 30,
        head: [[
          "Member Name",
          "Member ID",
          "Campus",
          "Cohort/Batch",
          "Date Registered",
          "Status",
        ]],
        body: filtered.map((r) => [
          r.memberName,
          r.memberId,
          r.campus,
          r.cohortBatch,
          formatDate(r.dateRegistered),
          r.status,
        ]),
        theme: "grid",
        headStyles: { fillColor: [1, 26, 90] },
        styles: { fontSize: 8 },
      });

      doc.save(`Discipleship-Registrations-${new Date().toISOString().split("T")[0]}.pdf`);
      notify.success("Discipleship registrations exported to PDF.");
    } catch (err) {
      notify.error("PDF export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  const columns = [
    {
      field: "memberName",
      headerName: "Member Name",
      flex: 1,
      minWidth: 170,
      headerClassName: "dcp-header",
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
      headerClassName: "dcp-header",
      renderCell: (params) => (
        <Typography sx={{ fontSize: 14, color: "#6b7280" }}>{params.value}</Typography>
      ),
    },
    {
      field: "campus",
      headerName: "Campus",
      flex: 1,
      minWidth: 150,
      headerClassName: "dcp-header",
      renderCell: (params) => (
        <Typography sx={{ fontSize: 14, color: "#45556C" }}>{params.value}</Typography>
      ),
    },
    {
      field: "cohortBatch",
      headerName: "Cohort/Batch",
      flex: 1,
      minWidth: 150,
      headerClassName: "dcp-header",
      renderCell: (params) => (
        <Typography sx={{ fontSize: 14, color: "#45556C" }}>{params.value}</Typography>
      ),
    },
    {
      field: "dateRegistered",
      headerName: "Date Registered",
      flex: 1,
      minWidth: 150,
      headerClassName: "dcp-header",
      renderCell: (params) => (
        <Typography sx={{ fontSize: 14, color: "#6b7280" }}>{formatDate(params.value)}</Typography>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.9,
      minWidth: 140,
      headerClassName: "dcp-header",
      renderCell: (params) => {
        const status = String(params.value || "").toLowerCase();
        const color =
          status.includes("complet")
            ? "#155DFC"
            : status.includes("dropped") || status.includes("withdrawn") || status.includes("drop")
            ? "#F54900"
            : "#00A63E";
        return (
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 500,
              color,
            }}
          >
            {params.value}
          </Typography>
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
            Discipleship Program Registrations
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
            View all Discipleship Program registrations across campuses in your
            region
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
            { label: "Total Registrations", value: stats.total, color: "#0A0A0A" },
            { label: "Active", value: stats.active, color: "#00A63E" },
            { label: "Completed", value: stats.completed, color: "#155DFC" },
            { label: "Drop", value: stats.dropped, color: "#F54900" },
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
          placeholder="Search by member name, member ID, campus, or cohort..."
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
          key={`dcp-${filtered.length}-${searchTerm}-${page}`}
          rows={paginated}
          getRowId={(row) => row.id ?? row.memberName}
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

            "& .dcp-header": {
              backgroundColor: "#F5F6FA",
              color: "#19191A",
              fontSize: "14px",
              fontWeight: 500,
              borderBottom: "1px solid #EBEDF0",
            },

            "& .dcp-header .MuiDataGrid-columnHeaderTitle": {
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

export default DiscipleshipProgramRegistrations;
