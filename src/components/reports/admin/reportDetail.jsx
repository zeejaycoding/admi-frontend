import React ,{ useRef, useEffect, useState} from "react";
import { Box, Typography, Paper, Chip, Button, Divider,
 } from "@mui/material";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getReportById, updateReportStatus } from "../../../store/slices/reportSlice";
import { API_BASE_URL } from "../../../constants/api";
import { loadTokens } from "../../../services/utils/authUtils";import { Share2, Printer, Download, CheckCircle2, XCircle, Clock3, TrendingUp,
  TrendingDown, HandHeart, Medal, Wallet,
  DollarSign, Paperclip, FileText, Building2,
  User, Calendar, MapPin, RotateCw,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { getCurrencyByCode, DEFAULT_CURRENCY } from "../../../constants/currencies";

const ReportDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedReport, isLoading } = useSelector((state) => state.report);
  const accessToken = useSelector((state) => state.auth?.accessToken);
  const currentUser = useSelector((state) => state.auth?.user);
  const [actionLoading, setActionLoading] = useState(false);

  const report = selectedReport;

  const rawRoles = currentUser?.roles || currentUser?.authorities || [];
  const roles = rawRoles.map((r) => (typeof r === "string" ? r : r?.name || r?.role || "")).filter(Boolean);
  const canManage = roles.includes("ADMIN") || roles.includes("SUPER_ADMIN");

  const handleApprove = async () => {
    setActionLoading(true);
    const result = await dispatch(updateReportStatus({ id, status: "Approved" }));
    setActionLoading(false);
    if (result.meta.requestStatus === "fulfilled") {
      alert("Report approved successfully");
    }
  };

  const handleReject = async () => {
    const reason = prompt("Enter rejection reason (optional):");
    setActionLoading(true);
    const result = await dispatch(updateReportStatus({ id, status: "Rejected", rejectionReason: reason || null }));
    setActionLoading(false);
    if (result.meta.requestStatus === "fulfilled") {
      alert("Report rejected");
    }
  };

  const reportRef = useRef(null);

  React.useEffect(() => {
    if (id) {
      dispatch(getReportById(id));
    }
  }, [id, dispatch]);

  if (!report) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="#6A7282">{isLoading ? "Loading..." : "Report not found"}</Typography>
      </Box>
    );
  }

  const handleShare = async () => {
    const shareData = {
      title: `${report.country} Monthly Report`,
      text: `Report ID: #${report.id}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const input = reportRef.current;
    if (!input) return;

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: document.documentElement.scrollWidth,
      windowHeight: document.documentElement.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = 210;
    const pdfHeight = 297;

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`report-${report.id}.pdf`);
  };

  const downloadReceipt = async (file) => {
    const { accessToken: storedToken } = loadTokens();
    const token = accessToken || storedToken;
    const downloadUrl = `${API_BASE_URL}/reports/${report.id}/receipts/${file.id}/download`;
    try {
      const response = await fetch(downloadUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const contentType = response.headers.get("content-type") || blob.type || "application/octet-stream";
      const fixedBlob = new Blob([blob], { type: contentType });
      const url = URL.createObjectURL(fixedBlob);
      const ext = file.fileName?.includes(".") ? "" : "." + (contentType.split("/")[1] || "bin");
      const filename = file.fileName || ("receipt" + ext);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      window.open(downloadUrl, "_blank");
    }
  };

  const totalIncome = Number(report.income || 0);
  const totalExpenditures = Number(report.expenditure || 0);
  const closingBalance = Number(report.balance || 0);
  const isProfit = closingBalance >= 0;
  const totalIncomeForPercent = totalIncome || 1;
  const totalExpense = totalExpenditures;

  const expensesList = report.expenses || [];
  const receiptsList = report.receipts || [];

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  };

  const formatCurrency = (val) => {
    const num = Number(val || 0);
    const symbol = getCurrencyByCode(report.currency || DEFAULT_CURRENCY).symbol;
    return `${symbol}${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatMonth = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  if (!report) {
    return (
      <Box p={4}>
        <Typography>Report not found.</Typography>
      </Box>
    );
  }

  return (
<Box
  ref={reportRef}
  sx={{
    p: { xs: 1.5, sm: 2, md: 3 },
    backgroundColor: "#f8fafc",
    width: "100%",
    maxWidth: "100%",
    overflowX: "hidden",
  }}
>
  
        {/* Header */}
    {/* Header */}
<Box
  sx={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    mb: 3,
    gap: 2,
    flexWrap: "wrap",
  }}
>
  {/* Left */}
<Box>
  <Typography
    variant="h4"
    fontWeight={700}
    sx={{ color: "#111827", mb: 0.5 }}
  >
    {report.country} Monthly Report
  </Typography>

  <Typography
    sx={{
      color: "#6B7280",
      fontSize: "15px",
      mb: 1.5,
    }}
  >
    Report ID: #{report.id} • {report.campus} • {getCurrencyByCode(report.currency || DEFAULT_CURRENCY).code} ({getCurrencyByCode(report.currency || DEFAULT_CURRENCY).symbol})
  </Typography>

  {/* Status */}
  <Box
    sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: 1,
      px: 1.8,
      py: 0.9,
      fontWeight: 500,
      borderRadius: "999px",
      border:
        report.status === "Approved"
          ? "1px solid #7BF1A8"
          : report.status === "Rejected"
            ? "1px solid #FCA5A5"
            : "1px solid #FCD34D",
      backgroundColor:
        report.status === "Approved"
          ? "#DCFCE7"
          : report.status === "Rejected"
            ? "#FEF2F2"
            : "#FFF7ED",
    }}
  >
    {report.status === "Approved" ? (
      <CheckCircle2 size={16} color="#008236" />
    ) : report.status === "Rejected" ? (
      <XCircle size={16} color="#B91C1C" />
    ) : (
      <Clock3 size={16} color="#BB4D00" />
    )}

    <Typography
      sx={{
        fontSize: "12px",
        fontWeight: 600,
        color:
          report.status === "Approved"
            ? "#008236"
            : report.status === "Rejected"
              ? "#B91C1C"
              : "#BB4D00",
      }}
    >
      {report.status === "Approved"
        ? "Approved • Verified"
        : report.status === "Rejected"
          ? "Rejected"
          : "Pending • Verification"}
    </Typography>
  </Box>

  {report.status === "Rejected" && report.rejectionReason ? (
    <Typography
      sx={{
        mt: 1.5,
        fontSize: "13px",
        fontWeight: 500,
        color: "#B91C1C",
        backgroundColor: "#FEF2F2",
        border: "1px solid #FCA5A5",
        borderRadius: "10px",
        px: 1.8,
        py: 1,
        display: "inline-block",
      }}
    >
      Rejection reason: {report.rejectionReason}
    </Typography>
  ) : null}
</Box>


  {/* Right Buttons */}
  <Box display="flex" gap={1.5} flexWrap="wrap">
    {/* Share */}
    <Button
      startIcon={<Share2 size={16} color="#0A0A0A" />}
      sx={{
        backgroundColor: "#FFFFFF",
        color: "#0A0A0A",
        border: "1px solid #D1D5DB",
        borderRadius: "10px",
        px: 2.5,
        py: 1,
        textTransform: "none",
        fontWeight: 600,
        "&:hover": {
          backgroundColor: "#F9FAFB",
        },
      }}
      onClick={handleShare}
    >
      Share
    </Button>

    {/* Print */}
    <Button
      startIcon={<Printer size={16} color="#0A0A0A" />}
      sx={{
        backgroundColor: "#FFFFFF",
        color: "#0A0A0A",
        border: "1px solid #D1D5DB",
        borderRadius: "10px",
        px: 2.5,
        py: 1,
        textTransform: "none",
        fontWeight: 600,
        "&:hover": {
          backgroundColor: "#F9FAFB",
        },
      }}
      onClick={handlePrint}
    >
      Print
    </Button>

    {/* Download PDF */}
    <Button
      startIcon={<Download size={16} color="#FFFFFF" />}
      sx={{
        backgroundColor: "#011A5A",
        color: "#FFFFFF",
        borderRadius: "10px",
        px: 2.5,
        py: 1,
        textTransform: "none",
        fontWeight: 600,
        "&:hover": {
          backgroundColor: "#011A5A",
        },
      }}
      onClick={handleDownloadPDF}
    >
      Download PDF
    </Button>

    {/* Approve */}
    <Button
      startIcon={<CheckCircle2 size={16} color="#FFFFFF" />}
      onClick={handleApprove}
      disabled={actionLoading || report.status !== "Pending"}
      sx={{
        backgroundColor: report.status === "Pending" ? "#008236" : "#9CA3AF",
        color: "#FFFFFF",
        borderRadius: "10px",
        px: 2.5,
        py: 1,
        textTransform: "none",
        fontWeight: 600,
        display: canManage ? "inline-flex" : "none",
        "&:hover": {
          backgroundColor: report.status === "Pending" ? "#008236" : "#9CA3AF",
        },
      }}
    >
      {actionLoading ? "Processing..." : "Approve"}
    </Button>

    {/* Reject */}
    <Button
      startIcon={<XCircle size={16} color="#FFFFFF" />}
      onClick={handleReject}
      disabled={actionLoading || report.status !== "Pending"}
      sx={{
        backgroundColor: report.status === "Pending" ? "#D4183D" : "#9CA3AF",
        color: "#FFFFFF",
        borderRadius: "10px",
        px: 2.5,
        py: 1,
        textTransform: "none",
        fontWeight: 600,
        display: canManage ? "inline-flex" : "none",
        "&:hover": {
          backgroundColor: report.status === "Pending" ? "#D4183D" : "#9CA3AF",
        },
      }}
    >
      {actionLoading ? "Processing..." : "Reject"}
    </Button>
  </Box>
</Box>


        {/* Stats Cards */}
<Box
  sx={{
    display: "grid",
    gridTemplateColumns: {
      xs: "1fr",
      sm: "repeat(2, 1fr)",
      lg: "repeat(4, 1fr)",
    },
    gap: 2,
    mb: 3,
  }}
>
  {[
    {
      title: "Total Income",
      value: formatCurrency(report.income),
      icon: TrendingUp,
      bg: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)",
      border: "#B9F8CF",
      iconBg: "#00C950",
    },
    {
      title: "Total Expenditure",
      value: formatCurrency(report.expenditure),
      icon: TrendingDown,
      bg: "linear-gradient(135deg, #FEF2F2 0%, #FFE2E2 100%)",
      border: "#FFC9C9",
      iconBg: "#FB2C36",
    },
    {
      title: "Closing Balance",
      value: formatCurrency(report.balance),
      icon: Wallet,
      bg: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
      border: "#BEDBFF",
      iconBg: "#011A5A",
    },
    {
      title: "General Offering",
      value: formatCurrency(report.offerings),
      icon: DollarSign,
      bg: "linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)",
      border: "#E9D4FF",
      iconBg: "#AD46FF",
    },
  ].map((card, index) => {
    const Icon = card.icon;

    return (
      <Box
  key={index}
  sx={{
    background: card.bg,
    border: `1px solid ${card.border}`,
    borderRadius: "18px",
    p: 3, // increased from 2.5
    minHeight: "160px", // increased from 140
    display: "flex",
    flexDirection: "column",
    gap: 3, // adds spacing between icon and text block
  }}
>
  <Box
    sx={{
      width: 44,
      height: 44,
      borderRadius: "12px",
      backgroundColor: card.iconBg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <Icon size={18} color="#FFFFFF" />
  </Box>

  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      gap: 1.2, // spacing between title and value
    }}
  >
    <Typography
      sx={{
        fontSize: "14px",
        fontWeight: 500,
        color: "#19191A",
      }}
    >
      {card.title}
    </Typography>

    <Typography
      sx={{
        fontSize: "30px",
        fontWeight: 700,
        color: "#19191A",
        lineHeight: 1.15,
      }}
    >
      {card.value}
    </Typography>
  </Box>
</Box>
    );
  })}
</Box>

{/* Remittance Receipts */}
<Box
  sx={{
    backgroundColor: "#FFFFFF",
    border: "1px solid #EBEDF0",
    boxShadow: "0 10px 30px rgba(2, 6, 23, 0.08)",

    borderRadius: "20px",
    p: 3,
  }}
>
  {/* Header */}
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.2,
      mb: 3,
    }}
  >
    <Paperclip size={20} color="#F54900" />

    <Typography
      sx={{
        fontSize: "18px",
        fontWeight: 700,
        color: "#111827",
      }}
    >
      Remittance Receipts ({receiptsList.length})
    </Typography>
  </Box>

  {/* Receipt List */}
<Box
  sx={{
    maxHeight: "380px",
    overflowY: "auto",
    scrollbarGutter: "stable",
    pr: 1.5,
    "&::-webkit-scrollbar": { width: "6px" },
    "&::-webkit-scrollbar-thumb": { backgroundColor: "#D1D5DB", borderRadius: "4px" },
    "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
  }}
>
<Box
  sx={{
    display: "grid",
    gridTemplateColumns: {
      xs: "1fr",
      md: "repeat(2, 1fr)",
      lg: "repeat(3, 1fr)",
    },
    gap: 2,
    height: "fit-content",
    alignContent: "start",
  }}
>
  {receiptsList.length > 0 ? receiptsList.map((file, index) => (
    <Box
      key={file.id || index}
      sx={{
        background:
          "linear-gradient(135deg, #FFF7ED 0%, #FFFBEB 100%)",
        border: "1px solid #FFD6A8",
        borderRadius: "16px",
        p: 2.5,
        minHeight: "130px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Top */}
      <Box display="flex" alignItems="center" gap={1.5}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: "12px",
            backgroundColor: "#FF6900",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FileText size={18} color="#FFFFFF" />
        </Box>

        <Typography
          sx={{
            fontWeight: 600,
            color: "#101828",
            fontSize: "14px",
          }}
        >
          {file.fileName || "receipt"}
        </Typography>
      </Box>

      {/* Bottom */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 2,
        }}
      >
        <Box
          onClick={() => downloadReceipt(file)}
          sx={{ display: "flex", alignItems: "center", gap: 0.7, cursor: "pointer" }}
        >
          <Download size={15} color="#F54900" />
          <Typography
            sx={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#F54900",
            }}
          >
            Download
          </Typography>
        </Box>
      </Box>
    </Box>
  )) : (
    <Typography sx={{ color: "#6A7282", fontSize: 14, gridColumn: "1 / -1" }}>
      No receipts uploaded
    </Typography>
  )}
</Box>

</Box>

</Box>

{/* Report Info + Income Breakdown */}
<Box
  sx={{
    display: "grid",
    gridTemplateColumns: {
      xs: "1fr",
      lg: "3fr 2fr",
    },
    gap: 3,
    mt: 3,
    alignItems: "stretch",
  }}
>
  {/* LEFT CONTAINER */}
  <Box
    sx={{
      backgroundColor: "#FFFFFF",
      borderRadius: "20px",
      border: "1px solid #EBEDF0",
      boxShadow: "0 10px 30px rgba(2, 6, 23, 0.08)",

      p: 3,
    }}
  >
    {/* Header */}
    <Box display="flex" alignItems="center" gap={1.2} mb={3}>
      <FileText size={20} color="#011A5A" />
      <Typography sx={{ fontWeight: 700, fontSize: "18px", color: "#101828" }}>
        Report Information
      </Typography>
    </Box>

    {/* Info Grid */}
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        gap: 3,
      }}
    >
      {/* Left */}
      <Box display="flex" flexDirection="column" gap={2.5}>
        <Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Calendar size={16} color="#99A1AF" />
            <Typography sx={{ color: "#6A7282", fontSize: "14px" }}>
              Report Period
            </Typography>
          </Box>
          <Typography sx={{ color: "#101828", fontWeight: 600, mt: 0.5 }}>
            {formatMonth(report.date)}
          </Typography>
        </Box>

        <Box>
          <Box display="flex" alignItems="center" gap={1}>
            <MapPin size={16} color="#99A1AF" />
            <Typography sx={{ color: "#6A7282", fontSize: "14px" }}>
              Country
            </Typography>
          </Box>
          <Typography sx={{ color: "#101828", fontWeight: 600, mt: 0.5 }}>
            {report.country}
          </Typography>
        </Box>

        <Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Building2 size={16} color="#99A1AF" />
            <Typography sx={{ color: "#6A7282", fontSize: "14px" }}>
              Campus
            </Typography>
          </Box>
          <Typography sx={{ color: "#101828", fontWeight: 600, mt: 0.5 }}>
            {report.campus}
          </Typography>
        </Box>
      </Box>

      {/* Right */}
      <Box display="flex" flexDirection="column" gap={2.5}>
        <Box>
          <Box display="flex" alignItems="center" gap={1}>
            <User size={16} color="#99A1AF" />
            <Typography sx={{ color: "#6A7282", fontSize: "14px" }}>
              Campus Coordinator
            </Typography>
          </Box>
          <Typography sx={{ color: "#101828", fontWeight: 600, mt: 0.5 }}>
            {report.coordinator}
          </Typography>
        </Box>

        <Box>
          <Box display="flex" alignItems="center" gap={1}>
            <User size={16} color="#99A1AF" />
            <Typography sx={{ color: "#6A7282", fontSize: "14px" }}>
              National Leader
            </Typography>
          </Box>
          <Typography sx={{ color: "#101828", fontWeight: 600, mt: 0.5 }}>
            {report.nationalLeader || "—"}
          </Typography>
        </Box>

        <Box>
          <Box display="flex" alignItems="center" gap={1}>
            <User size={16} color="#99A1AF" />
            <Typography sx={{ color: "#6A7282", fontSize: "14px" }}>
              Zonal Coordinator
            </Typography>
          </Box>
          <Typography sx={{ color: "#101828", fontWeight: 600, mt: 0.5 }}>
            {report.zonalLeader || "—"}
          </Typography>
        </Box>
      </Box>
    </Box>

    {report.summary ? (
      <>
        <Divider sx={{ my: 3 }} />

        {/* Summary */}
        <Box>
          <Box display="flex" alignItems="center" gap={1}>
            <FileText size={16} color="#99A1AF" />
            <Typography sx={{ color: "#6A7282", fontSize: "14px" }}>
              Summary
            </Typography>
          </Box>
          <Typography
            sx={{
              color: "#101828",
              mt: 1,
              fontSize: "15px",
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
            }}
          >
            {report.summary}
          </Typography>
        </Box>
      </>
    ) : null}

    <Divider sx={{ my: 3 }} />

    {/* Submitted */}
    <Box display="flex" justifyContent="space-between">
      <Typography sx={{ color: "#6A7282" }}>Submitted</Typography>
      <Typography sx={{ fontWeight: 600, color: "#101828" }}>
        {formatDate(report.createdAt)}
      </Typography>
    </Box>
  </Box>

  {/* RIGHT CONTAINER */}
  <Box
    sx={{
      backgroundColor: "#FFFFFF",
      borderRadius: "20px",
      border: "1px solid #EBEDF0",
      boxShadow: "0 10px 30px rgba(2, 6, 23, 0.08)",

      p: 3,
    }}
  >
    <Box display="flex" alignItems="center" gap={1.2} mb={3}>
      <DollarSign size={20} color="#00A63E" />
      <Typography sx={{ fontWeight: 700, fontSize: "18px", color: "#101828" }}>
        Income Breakdown
      </Typography>
    </Box>

    <Box display="flex" flexDirection="column" gap={2}>
  {[
    {
      title: "Partnership",
      value: report.partnership,
      icon: HandHeart,
      bg: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
      border: "#BEDBFF",
      percentColor: "#011A5A",
      iconColor: "#011A5A",
    },
    {
      title: "Papa Honour",
      value: report.papaHonour,
      icon: Medal,
      bg: "linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)",
      border: "#E9D4FF",
      percentColor: "#8200DB",
      iconColor: "#9810FA",
    },
    {
      title: "General Offerings",
      value: report.offerings,
      icon: Wallet,
      bg: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)",
      border: "#B9F8CF",
      percentColor: "#008236",
      iconColor: "#008236",
    },
  ].map((item, index) => {
    const Icon = item.icon;
    const amount = Number(item.value || 0);
    const pct = totalIncomeForPercent > 0 ? ((amount / totalIncomeForPercent) * 100).toFixed(1) : "0.0";

    return (
      <Box
        key={index}
        sx={{
          p: 2.2,
          borderRadius: "16px",
          background: item.bg,
          border: `1px solid ${item.border}`,
          display: "flex",
          gap: 1.5,
          alignItems: "flex-start",
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "12px",
            backgroundColor: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={18} color={item.iconColor} />
        </Box>

        <Box>
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#19191A",
              mb: 0.7,
            }}
          >
            {item.title}
          </Typography>

          <Typography
            sx={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#19191A",
              lineHeight: 1.1,
            }}
          >
            {formatCurrency(amount)}
          </Typography>

          <Typography
            sx={{
              mt: 0.6,
              fontSize: "13px",
              fontWeight: 600,
              color: item.percentColor,
            }}
          >
            {pct}% of total
          </Typography>
        </Box>
      </Box>
    );
  })}
</Box>
  </Box>
</Box>

{/* Expenditure Details */}
<Box
  sx={{
    mt: 3,
    backgroundColor: "#FFFFFF",
    borderRadius: "18px",
    p: 3,
    boxShadow: "0 10px 30px rgba(2, 6, 23, 0.08)",

  }}
>
  {/* Header */}
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 2,
      mb: 4,
    }}
  >
    <Box
      sx={{
        width: 44,
        height: 44,
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <DollarSign size={20} color="#E7000B" />
    </Box>

    <Box>
      <Typography fontWeight={700}>
        Expenditure Details
      </Typography>
    </Box>
  </Box>

  {/* Expense Cards */}
{/* Heading Bar */}
<Box
  sx={{
    backgroundColor: "#F9FAFB",
    border: "1px solid #E5E7EB",
    borderRadius: "14px",
    px: 2.5,
    py: 1.8,
    mb: 2,
    display: {
      xs: "none",
      lg: "grid",
    },
    gridTemplateColumns: "80px 1fr 1.5fr 1fr 1fr",
    gap: 2,
  }}
>
  {["#", "Date", "Description", "Amount", "% of Total"].map((heading) => (
    <Typography
      key={heading}
      sx={{
        fontSize: "13px",
        fontWeight: 700,
        color: "#4A5565",
      }}
    >
      {heading}
    </Typography>
  ))}
</Box>

{/* Expense Rows */}
<Box display="flex" flexDirection="column" gap={0}>
  {expensesList.map((item, index) => {
    const percentage = totalExpense > 0 ? ((item.amount / totalExpense) * 100).toFixed(1) : "0.0";

    return (
      <Box
        key={index}
        sx={{
          backgroundColor: "#FFFFFF", // row itself white
          borderBottom:
            index !== expensesList.length - 1
              ? "1px solid #E5E7EB"
              : "none",
          px: 2.5,
          py: 2.2,
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "80px 1fr 1.5fr 1fr 1fr",
          },
          gap: 2,
          alignItems: "center",
        }}
      >
        {/* Number */}
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            backgroundColor: "#011A5A",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
          }}
        >
          {index + 1}
        </Box>

        {/* Date */}
        <Typography
          sx={{
            fontSize: "14px",
            color: "#4A5565",
            fontWeight: 400,
          }}
        >
          {item.date}
        </Typography>

        {/* Description */}
        <Typography
          sx={{
            fontSize: "14px",
            color: "#101828",
            fontWeight: 500,
          }}
        >
          {item.description}
        </Typography>

        {/* Amount */}
        <Typography
          sx={{
            fontSize: "15px",
            fontWeight: 700,
            color: "#E7000B",
          }}
        >
          {formatCurrency(item.amount)}
        </Typography>

        {/* Percentage */}
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: 400,
            color: "#4A5565",
          }}
        >
          {percentage}%
        </Typography>
      </Box>
    );
  }
  )}

  {/* Total Expenditure Row */}
<Box
  sx={{
    mt: 2,
    px: 2.5,
    py: 2.5,
    borderRadius: "16px",
    background:
      "linear-gradient(135deg, #FEF2F2 0%, #FFF7ED 100%)",
    border: "1px solid #FFC9C9",
    display: "grid",
    gridTemplateColumns: {
      xs: "1fr",
      lg: "80px 1fr 1.5fr 1fr 1fr",
    },
    gap: 2,
    alignItems: "center",
  }}
>
  {/* Empty Number Column */}
  <Box />

  {/* Empty Date Column */}
  <Box />

  {/* Description */}
  <Typography
    sx={{
      color: "#101828",
      fontSize: "16px",
      fontWeight: 600,
    }}
  >
    Total Expenditure
  </Typography>

  {/* Total Amount */}
  <Typography
    sx={{
      color: "#E7000B",
      fontSize: "24px",
      fontWeight: 700,
    }}
  >
      {formatCurrency(totalExpense)}
  </Typography>

  {/* Percentage */}
  <Typography
    sx={{
      color: "#4A5565",
      fontSize: "16px",
      fontWeight: 700,
    }}
  >
    100% of total
  </Typography>
</Box>
</Box>
</Box>

<Box
  sx={{
    mt: 4,
    p: 3,
    borderRadius: "18px",
    border: "1px solid #E2E8F0",
    background:
      "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
      boxShadow: "0 10px 30px rgba(2, 6, 23, 0.08)",

  }}
>
  {/* Header */}
  <Box display="flex" alignItems="center" gap={2} mb={3}>
    <Box
      sx={{
        width: 44,
        height: 44,
        borderRadius: "12px",
        
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <DollarSign size={20} color="#45556C" />
    </Box>

    <Typography fontWeight={700} color="#101828">
      Financial Summary
    </Typography>
  </Box>

  <Box display="flex" flexDirection="column" gap={2}>
    {/* Total Income */}
    <Box
      sx={{
        p: 2.5,
        borderRadius: "16px",
        backgroundColor: "#fff",
        border: "1px solid #B9F8CF",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Box display="flex" alignItems="center" gap={1.5}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "12px",
            backgroundColor: "#DCFCE7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TrendingUp size={18} color="#00A63E" />
        </Box>

        <Typography fontWeight={600}>Total Income</Typography>
      </Box>

      <Typography fontWeight={700} fontSize={18} color="#00A63E">
        {formatCurrency(totalIncome)}
      </Typography>
    </Box>

    {/* Total Expenditure */}
    <Box
      sx={{
        p: 2.5,
        borderRadius: "16px",
        backgroundColor: "#fff",
        border: "1px solid #FFC9C9",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Box display="flex" alignItems="center" gap={1.5}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "12px",
            backgroundColor: "#FFE2E2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TrendingDown size={18} color="#E7000B" />
        </Box>

        <Typography fontWeight={600}>Total Expenditure</Typography>
      </Box>

      <Typography fontWeight={700} fontSize={18} color="#E7000B">
        {formatCurrency(totalExpenditures)}
      </Typography>
    </Box>

    {/* Closing Balance */}
    <Box
      sx={{
        p: 2.5,
        borderRadius: "16px",
        border: isProfit
          ? "1px solid #7BF1A8"
          : "1px solid #FFC9C9",
        background: isProfit
          ? "linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)"
          : "linear-gradient(135deg, #FEF2F2 0%, #FFF7ED 100%)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Box display="flex" alignItems="center" gap={1.5}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "12px",
            backgroundColor: isProfit ? "#00C950" : "#FB2C36",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Wallet size={18} color="#fff" />
        </Box>

        <Typography fontWeight={600}>Closing Balance</Typography>
      </Box>

      <Typography
        fontWeight={700}
        fontSize={18}
        color={isProfit ? "#00A63E" : "#E7000B"}
      >
        {closingBalance >= 0 ? "+ " : "- " }
        {formatCurrency(Math.abs(closingBalance))}
      </Typography>
    </Box>
  </Box>
</Box>

  
    </Box>

  );
};

export default ReportDetail;