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

const EXCLUDED_FORMS = new Set(["POWER_BIBLE_SCHOOL", "DISCIPLESHIP_PROGRAM"]);
const EXCLUDED_TITLES = new Set(["POWER BIBLE SCHOOL", "DISCIPLESHIP PROGRAM", "MONTHLY REPORT", "TRAVEL"]);

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

const normalize = (v) => String(v || "").toLowerCase().trim();

const detectProgrammeType = (sd) => {
  const raw =
    sd.programmeType ||
    sd.ProgrammeType ||
    sd.program ||
    sd.programme ||
    sd["Program / Programme"] ||
    sd.type ||
    sd.eventType ||
    "";
  const t = normalize(raw);
  if (t.includes("women")) return "Women's Ministry";
  if (t.includes("youth")) return "Youth Ministry";
  if (t.includes("leadership") || t.includes("leader")) return "Leadership Training";
  if (t.includes("conference") || t.includes("summit")) return "Conference";
  if (t.includes("outreach")) return "Outreach";
  return raw || "Other";
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

  const programmeType = detectProgrammeType(sd);
  const programmeName =
    sd.programmeName ||
    sd.programName ||
    sd["Programme Name"] ||
    sd["Program Name"] ||
    s.formTitle ||
    programmeType;

  const status = sd.status || sd.Status || sd.registrationStatus || "Registered";
  const dateRegistered = sd.registeredAt || sd.dateRegistered || sd.submittedAt || s.submittedAt || s.createdAt;

  return {
    id: s.id,
    memberName,
    memberId: String(s.id ?? memberName).toUpperCase() === "ANONYMOUS" ? "—" : `PRG-${String(s.id ?? "").padStart(4, "0")}`,
    campus,
    programmeType,
    programmeName,
    status,
    dateRegistered,
    email: sd.email || s.userEmail || "—",
    phone: sd.phone || "—",
    country: sd.country || sd.Country || "—",
    city: sd.city || "—",
    submittedAt: s.submittedAt || s.createdAt,
    formId: s.formId,
  };
};

const OtherProgrammeRegistrations = () => {
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
        const res = await formSubmissionService.getAllSubmissions({
          page: 0,
          size: 1000,
        });
        const raw = res?.content || (Array.isArray(res) ? res : []);
        setRegistrations(
          raw
            .map(extractMember)
            .filter(
              (r) =>
                !EXCLUDED_FORMS.has(String(r.formId ?? "")) &&
                !EXCLUDED_TITLES.has(String(r.programmeName).toUpperCase())
            )
        );
      } catch (err) {
        const status = err?.response?.status;
        if (status === 403) {
          notify.error("You don't have permission to view programme registrations.");
        } else if (status === 401) {
          notify.error("Your session has expired. Please sign in again.");
        } else {
          notify.error("Failed to load programme registrations.");
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
        r.programmeType.toLowerCase().includes(term) ||
        r.programmeName.toLowerCase().includes(term) ||
        r.status.toLowerCase().includes(term)
    );
  }, [registrations, searchTerm]);

  const paginated = useMemo(() => {
    const start = page * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const stats = useMemo(() => {
    const count = (type) =>
      registrations.filter((r) => normalize(r.programmeType).includes(type)).length;
    return {
      leadership: count("leadership"),
      women: count("women"),
      youth: count("youth"),
    };
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
        "Programme Type",
        "Programme Name",
        "Registration Date",
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
          r.programmeType,
          r.programmeName,
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
      link.download = `Other-Programme-Registrations-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      notify.success("Other programme registrations exported to CSV.");
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
      doc.text("Other Programme Registrations", 14, 16);
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text(`Generated on ${new Date().toLocaleDateString("en-US")}`, 14, 23);

      autoTable(doc, {
        startY: 30,
        head: [[
          "Member Name",
          "Member ID",
          "Campus",
          "Programme Type",
          "Programme Name",
          "Registration Date",
          "Status",
        ]],
        body: filtered.map((r) => [
          r.memberName,
          r.memberId,
          r.campus,
          r.programmeType,
          r.programmeName,
          formatDate(r.dateRegistered),
          r.status,
        ]),
        theme: "grid",
        headStyles: { fillColor: [1, 26, 90] },
        styles: { fontSize: 8 },
      });

      doc.save(`Other-Programme-Registrations-${new Date().toISOString().split("T")[0]}.pdf`);
      notify.success("Other programme registrations exported to PDF.");
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
      headerClassName: "opg-header",
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
      headerClassName: "opg-header",
      renderCell: (params) => (
        <Typography sx={{ fontSize: 14, color: "#6b7280" }}>{params.value}</Typography>
      ),
    },
    {
      field: "campus",
      headerName: "Campus",
      flex: 1,
      minWidth: 140,
      headerClassName: "opg-header",
      renderCell: (params) => (
        <Typography sx={{ fontSize: 14, color: "#45556C" }}>{params.value}</Typography>
      ),
    },
    {
      field: "programmeType",
      headerName: "Programme Type",
      flex: 1,
      minWidth: 160,
      headerClassName: "opg-header",
      renderCell: (params) => (
        <Typography sx={{ fontSize: 14, color: "#45556C" }}>{params.value}</Typography>
      ),
    },
    {
      field: "programmeName",
      headerName: "Programme Name",
      flex: 1,
      minWidth: 160,
      headerClassName: "opg-header",
      renderCell: (params) => (
        <Typography sx={{ fontSize: 14, color: "#45556C" }}>{params.value}</Typography>
      ),
    },
    {
      field: "dateRegistered",
      headerName: "Registration Date",
      flex: 1,
      minWidth: 150,
      headerClassName: "opg-header",
      renderCell: (params) => (
        <Typography sx={{ fontSize: 14, color: "#6b7280" }}>{formatDate(params.value)}</Typography>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.9,
      minWidth: 130,
      headerClassName: "opg-header",
      renderCell: (params) => {
        const status = String(params.value || "").toLowerCase();
        const color =
          status.includes("complet")
            ? "#155DFC"
            : status.includes("drop") || status.includes("withdrawn")
            ? "#F54900"
            : "#00A63E";
        return (
          <Typography sx={{ fontSize: 14, fontWeight: 500, color }}>
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
            Other Programme Registrations
          </Typography>

          <Typography
            sx={{
              fontFamily: "Inter",
              fontWeight: 400,
              fontSize: { xs: "0.875rem", sm: "16px" },
              color: "#6b7280",
              maxWidth: { xs: "100%", md: 620 },
              lineHeight: 1.5,
            }}
          >
            View registrations for all other programmes (e.g., leadership
            training, women&apos;s ministry, youth conferences, outreach events)
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
              md: "repeat(3, 1fr)",
            },
            width: "100%",
          }}
        >
          {[
            { label: "Leadership Training", value: stats.leadership, color: "#0A0A0A" },
            { label: "Women's Ministry", value: stats.women, color: "#00A63E" },
            { label: "Youth Ministry", value: stats.youth, color: "#155DFC" },
          ].map((card, index) => (
            <Box
              key={card.label}
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRight: {
                  md: index < 2 ? "1px solid #0000001A" : "none",
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
          placeholder="Search by member name, member ID, campus, or programme..."
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
          key={`opg-${filtered.length}-${searchTerm}-${page}`}
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

            "& .opg-header": {
              backgroundColor: "#F5F6FA",
              color: "#19191A",
              fontSize: "14px",
              fontWeight: 500,
              borderBottom: "1px solid #EBEDF0",
            },

            "& .opg-header .MuiDataGrid-columnHeaderTitle": {
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

export default OtherProgrammeRegistrations;
