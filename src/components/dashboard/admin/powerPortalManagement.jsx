/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Box,
  Typography,
  
  Grid,
  TextField,
  InputAdornment,
  Paper,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
   FileText,
  Baby,
  HouseHeart,
  Home,
  Heart,
  Clock3,
  Download,
  Plus,
  Search,Filter,MapPin,
  CheckCircle2,
} from "lucide-react";

import { DataGrid, Button, StatsCard } from "../../ui";
import DeleteConfirmationModal from "../../ui/DeleteConfirmationModal";
import {
  fetchTravelFormStats,
} from "../../../store/slices/travelFormSlice";
import { notify } from "../../../services/utils/authUtils";
import { useNavigate } from "react-router-dom";

const PowerPortalManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { stats, isLoading } = useSelector(
    (state) => state.travelForm,
  );

  const handleExportExcel = () => {
    if (!stats) return;
    const exportData = (stats.pendingApprovals || []).map((item) => ({
      "Form No": item.formNo || "—",
      Person: item.person || "—",
      Campus: item.campus || "—",
      Date: item.date || "—",
    }));

    import("xlsx").then((XLSX) => {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Approvals");
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const fileData = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
      import("file-saver").then(({ saveAs }) => saveAs(fileData, "approvals.xlsx"));
    });
  };

  useEffect(() => {
    dispatch(fetchTravelFormStats());
  }, [dispatch]);


  const tfStats = stats?.travelForms || { total: 0, pending: 0, approved: 0 };
  const cdStats = stats?.childDedications || { total: 0, pending: 0, approved: 0 };
  const mcStats = stats?.marriageCertificates || { total: 0, pending: 0, approved: 0 };

  const statsCards = [
  {
    title: "Travelling Forms",
    value: tfStats.total,
    pending: tfStats.pending,
    approved: tfStats.approved,
    icon: FileText,
    bg: "#E4F3FF",
    color: "#0F7DD5",
  },
  {
    title: "Child Dedication",
    value: cdStats.total,
    pending: cdStats.pending,
    approved: cdStats.approved,
    icon: Baby,
    bg: "#E30DE726",
    color: "#CE17CE",
  },
  {
    title: "Marriage Certificates",
    value: mcStats.total,
    pending: mcStats.pending,
    approved: mcStats.approved,
    icon: Home,
    bg: "#FFE6E5",
    color: "#FC1A12",
  },
];

const recentActivities = (stats?.recentActivity || []).length > 0
  ? stats.recentActivity
  : [];

const pendingApprovals = (stats?.pendingApprovals || []).length > 0
  ? stats.pendingApprovals
  : [];

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
        <Box>
          <Typography
            variant="h4"
            fontWeight="bold"
            color="#1f2937"
            gutterBottom
            sx={{
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.25rem" },
              lineHeight: 1.2,
            }}
          >
            Dashboard
          </Typography>

          <Typography
            variant="body1"
            color="#6b7280"
            sx={{
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            Welcome to PowerCity Portal - Overview of all forms and certificates
          </Typography>
        </Box>

        {/* Right Buttons */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          {/* Export Excel */}
          <Button
            startIcon={<Download size={18} />}
            onClick={handleExportExcel}
            sx={{
              backgroundColor: "#FFFFFF",
              color: "#111827",
              border: "1px solid #D1D5DB",
              px: 3,
              py: 1.2,
              borderRadius: "10px",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#F9FAFB",
              },
            }}
          >
            Export Excel
          </Button>

          {/* New Report */}
<Button
  startIcon={<Plus size={18} />}
        onClick={() => navigate("/admin/reports/create")}

  sx={{
    backgroundColor: "#011A5A",
    color: "#FFFFFF",
    px: 3,
    py: 1.2,
    borderRadius: "10px",
    fontWeight: 600,
    textTransform: "none",
    "&:hover": {
      backgroundColor: "#011A5A",
    },
  }}
>
  New Report
</Button>
        </Box>
      </Box>


      {/* Loading state */}
      {isLoading && !stats ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 8,
            gap: 2,
          }}
        >
          <CircularProgress sx={{ color: "#011A5A" }} />
          <Typography sx={{ color: "#6B7280", fontSize: "14px" }}>
            Loading dashboard statistics...
          </Typography>
        </Box>
      ) : (
      <Box
  sx={{
    display: "grid",
    gridTemplateColumns: {
      xs: "1fr",
      md: "repeat(3, minmax(0,1fr))",
    },
    gap: 3,
    mb: 3,
  }}
>
  {statsCards.map((card, index) => {
    const Icon = card.icon;

    return (
      <Box
        key={index}
        sx={{
          background: "#fff",
          border: "1px solid #EBEDF0",
          borderRadius: "16px",
          p: 3,
        }}
      >
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 500,
              color: "#000",
            }}
          >
            {card.title}
          </Typography>

          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              bgcolor: card.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={20} color={card.color} />
          </Box>
        </Box>

        {/* Total */}
        <Typography
          sx={{
            fontSize: "32px",
            fontWeight: 600,
            color: "#000",
            mb: 2,
          }}
        >
          {card.value}
        </Typography>

        {/* Bottom Row */}
        <Box display="flex" gap={3}>
          <Box display="flex" alignItems="center" gap={0.7}>
            <Clock3 size={16} color="#D08700" />
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 500,
                color: "#D08700",
              }}
            >
              {card.pending} Pending
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={0.7}>
            <CheckCircle2 size={16} color="#00A63E" />
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 500,
                color: "#00A63E",
              }}
            >
              {card.approved} Approved
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  })}
</Box>
)}

<Box
  sx={{
    display: "grid",
    gridTemplateColumns: {
      xs: "1fr",
      lg: "1fr 1fr",
    },
    gap: 3,
    mb: 3,
  }}
>
  {/* Recent Activity */}
  <Paper
    sx={{
      p: 3,
      borderRadius: "16px",
      border: "1px solid #EBEDF0",
      boxShadow: "none",
    }}
  >
    <Typography
      sx={{
        fontSize: 16,
        fontWeight: 500,
        color: "#000",
      }}
    >
      Recent Activity
    </Typography>

    <Typography
      sx={{
        fontSize: 13,
        fontWeight: 400,
        color: "#717182",
        mb: 3,
      }}
    >
      Latest actions across all modules
    </Typography>

    <Box display="flex" flexDirection="column" gap={2}>
      {recentActivities.length > 0 ? recentActivities.map((activity, index) => (
        <Box
          key={index}
          sx={{
            background: "#F9FAFB",
            borderLeft: "4px solid #2B7FFF",
            borderRadius: "10px",
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography
              sx={{
                color: "#101828",
                fontSize: 16,
                fontWeight: 500,
              }}
            >
              {activity.type}
            </Typography>

            <Typography
              sx={{
                color: "#4A5565",
                fontSize: 14,
                fontWeight: 400,
                mt: .4,
              }}
            >
              {activity.action}
            </Typography>

            <Typography
              sx={{
                color: "#6A7282",
                fontSize: 12,
                fontWeight: 400,
                mt: .4,
              }}
            >
              {activity.date}
            </Typography>
          </Box>

          <Chip
            label={activity.status}
            sx={{
              backgroundColor:
                activity.status === "Approved" ? "#DCFCE7" :
                activity.status === "Rejected" ? "#FEF2F2" : "#FEF9C2",
              color:
                activity.status === "Approved" ? "#016630" :
                activity.status === "Rejected" ? "#991B1B" : "#894B00",
              fontWeight: 500,
              fontSize: 12,
              borderRadius: "8px",
            }}
          />
        </Box>
      )) : (
        <Typography sx={{ color: "#6A7282", fontSize: 14, py: 2 }}>
          No recent activity
        </Typography>
      )}
    </Box>
  </Paper>

  {/* Pending Approvals */}
  <Paper
    sx={{
      p: 3,
      borderRadius: "16px",
      border: "1px solid #EBEDF0",
      boxShadow: "none",
    }}
  >
    <Typography
      sx={{
        fontSize: 16,
        fontWeight: 500,
        color: "#000",
      }}
    >
      Pending Approvals
    </Typography>

    <Typography
      sx={{
        fontSize: 13,
        color: "#717182",
        fontWeight: 400,
        mb: 3,
      }}
    >
      Forms requiring your review
    </Typography>

    <Box display="flex" flexDirection="column" gap={2}>
      {pendingApprovals.length > 0 ? pendingApprovals.map((approval, index) => (
        <Box
          key={index}
          sx={{
            background: "#F9FAFB",
            borderRadius: "10px",
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 500,
                color: "#101828",
              }}
            >
              {approval.formNo}
            </Typography>

            <Typography
              sx={{
                fontSize: 14,
                color: "#4A5565",
                mt: .4,
              }}
            >
              {approval.person} - {approval.campus}
            </Typography>

            <Typography
              sx={{
                fontSize: 12,
                color: "#6A7282",
                mt: .4,
              }}
            >
              {approval.date}
            </Typography>
          </Box>

          <Button
            sx={{
              background: "#000",
              color: "#fff",
              borderRadius: "8px",
              px: 2.5,
              py: .8,
              textTransform: "none",
              fontWeight: 500,
              "&:hover": {
                background: "#111",
              },
            }}
          >
            Review
          </Button>
        </Box>
      )) : (
        <Typography sx={{ color: "#6A7282", fontSize: 14, py: 2 }}>
          No pending approvals
        </Typography>
      )}
    </Box>
  </Paper>
</Box>

{/* Quick Actions */}
<Paper
  sx={{
    p: 3,
    borderRadius: "16px",
    border: "1px solid #EBEDF0",
    boxShadow: "none",
    mb: 3,
  }}
>
  <Typography
    sx={{
      fontSize: 16,
      fontWeight: 500,
      color: "#0A0A0A",
    }}
  >
    Quick Actions
  </Typography>

  <Typography
    sx={{
      fontSize: 16,
      fontWeight: 400,
      color: "#717182",
      mt: 0.5,
      mb: 3,
    }}
  >
    Frequently used operations
  </Typography>

  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: {
        xs: "1fr",
        sm: "repeat(2,1fr)",
        md: "repeat(3,1fr)",
      },
      gap: 2,
    }}
  >
    {/* Travelling */}
    <Box
      onClick={() => navigate("/admin/power-portal/travelling/createForm")}
      sx={{
        border: "1px solid #0000001A",
        borderRadius: "12px",
        p: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.5,
        cursor: "pointer",
        transition: "0.2s",
      }}
    >
      <FileText size={20} color="#0A0A0A" />

      <Typography
        align="center"
        sx={{
          fontSize: 14,
          fontWeight: 500,
          color: "#0A0A0A",
        }}
      >
        New Travelling Form
      </Typography>
    </Box>

    {/* Child */}
    <Box
      onClick={() => navigate("/admin/power-portal/child/create")}
      sx={{
        border: "1px solid #0000001A",
        borderRadius: "12px",
        p: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.5,
        cursor: "pointer",
        transition: "0.2s",
      }}
    >
      <Baby size={20} color="#0A0A0A" />

      <Typography
        align="center"
        sx={{
          fontSize: 14,
          fontWeight: 500,
          color: "#0A0A0A",
        }}
      >
        New Child Dedication Form
      </Typography>
    </Box>

    {/* Marriage */}
    <Box
      onClick={() => navigate("/admin/power-portal/marriage/create")}
      sx={{
        border: "1px solid #0000001A",
        borderRadius: "12px",
        p: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.5,
        cursor: "pointer",
        transition: "0.2s",
      }}
    >
      <Heart size={20} color="#0A0A0A" />

      <Typography
        align="center"
        sx={{
          fontSize: 14,
          fontWeight: 500,
          color: "#0A0A0A",
        }}
      >
        New Marriage Certificate
      </Typography>
    </Box>
  </Box>
</Paper>


    </Box>
  );
};

export default PowerPortalManagement;
