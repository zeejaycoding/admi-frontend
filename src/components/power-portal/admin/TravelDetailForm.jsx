import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
} from "@mui/material";

import {
  Circle,
  CheckCircle2,
  XCircle,
  Pencil,
  Download,
} from "lucide-react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 

import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getTravelFormById, updateTravelFormStatus, clearSelected } from "../../../store/slices/travelFormSlice";

const TravelDetailForm = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const dispatch = useDispatch();
  const { selectedTravelForm } = useSelector((state) => state.travelForm);
  const [actionLoading, setActionLoading] = useState(false);

  const travelForm = selectedTravelForm || state?.travelForm;

  useEffect(() => {
    if (!travelForm && id) {
      dispatch(getTravelFormById(id));
    }
    return () => { dispatch(clearSelected()); };
  }, [id, dispatch]);

  const handleApprove = async () => {
    setActionLoading(true);
    const result = await dispatch(updateTravelFormStatus({ id, status: "Approved" }));
    setActionLoading(false);
    if (result.meta.requestStatus === "fulfilled") {
      alert("Travel form approved successfully");
    }
  };

  const handleReject = async () => {
    const reason = prompt("Enter rejection reason (optional):");
    setActionLoading(true);
    const result = await dispatch(updateTravelFormStatus({ id, status: "Rejected", rejectionReason: reason || null }));
    setActionLoading(false);
    if (result.meta.requestStatus === "fulfilled") {
      alert("Travel form rejected");
    }
  };

  const handleExportPDF = () => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Travelling Form", 14, 18);

  doc.setFontSize(11);
  doc.text(`ID: ${id}`, 14, 28);

  autoTable(doc, {
    startY: 38,
    head: [["Field", "Value"]],
    body: [
      ["Status", travelForm?.status || "-"],
      ["Submitted By", travelForm?.submitter || "-"],
      ["Role", travelForm?.role || "National Leader"],
      ["Campus", travelForm?.campus || "-"],
      ["Submitted At", travelForm?.submitted || "-"],
      ["Country", travelForm?.country || "-"],
      ["Days of Stay", travelForm?.days || "-"],
      ["Travel Date", travelForm?.travelDate || "-"],
      ["Return Date", travelForm?.returnDate || "-"],
      ["Reason", travelForm?.reason || "-"],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [3, 33, 90],
    },
  });

  doc.save(`Travel_Form_${id}.pdf`);
};

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
            Travelling Form
          </Typography>

          <Typography
            variant="body1"
            color="#474C59"
            sx={{
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
             <p>ID: {id}</p>
          </Typography>
        </Box>

        {/* Right side */}
      {/* Right side */}
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
    }}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 2,
        py: 0.8,
        borderRadius: "999px",
        backgroundColor:
          travelForm?.status === "Approved" ? "#ECFDF5" :
          travelForm?.status === "Rejected" ? "#FEF2F2" : "#FFFBEB",
        border: `1px solid ${
          travelForm?.status === "Approved" ? "#A4F4CFCC" :
          travelForm?.status === "Rejected" ? "#FECACA" : "#FEE685CC"
        }`,
      }}
    >
      <Circle
        size={8}
        fill={
          travelForm?.status === "Approved" ? "#00BC7D" :
          travelForm?.status === "Rejected" ? "#DC2626" : "#FFB900"
        }
        color={
          travelForm?.status === "Approved" ? "#00BC7D" :
          travelForm?.status === "Rejected" ? "#DC2626" : "#FFB900"
        }
      />

      <Typography
        sx={{
          fontSize: "14px",
          fontWeight: 500,
          color:
            travelForm?.status === "Approved" ? "#007A55" :
            travelForm?.status === "Rejected" ? "#991B1B" : "#BB4D00",
        }}
      >
        {travelForm?.status}
      </Typography>
    </Box>
  </Box>


    </Box>

    <Paper
  elevation={0}
  sx={{
    mt: 3,
    p: 4,
    borderRadius: "12px",
    border: "1px solid #00000014",
    backgroundColor: "#FFFFFF",
  }}
>
  <Typography
    sx={{
      color: "#0A0A0A",
      fontSize: "16px",
      fontWeight: 500,
      mb: 0.5,
    }}
  >
    Submission Information
  </Typography>

  <Typography
    sx={{
      color: "#717182",
      fontSize: "16px",
      fontWeight: 400,
      mb: 4,
    }}
  >
    Details about the form submission
  </Typography>

<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
  {/* Row 1 */}
  <Box sx={{ display: "flex", gap: 8 }}>
    <Box sx={{ minWidth: 220 }}>
      <Typography
        sx={{
          color: "#6A7282",
          fontSize: "14px",
          fontWeight: 500,
          mb: 1,
        }}
      >
        Submitted By
      </Typography>

      <Typography
        sx={{
          color: "#0A0A0A",
          fontSize: "16px",
          fontWeight: 500,
        }}
      >
        {travelForm?.submitter}
      </Typography>
    </Box>

    <Box sx={{ minWidth: 220 }}>
      <Typography
        sx={{
          color: "#6A7282",
          fontSize: "14px",
          fontWeight: 500,
          mb: 1,
        }}
      >
        Role
      </Typography>

      <Typography
        sx={{
          color: "#0A0A0A",
          fontSize: "16px",
          fontWeight: 500,
        }}
      >
        {travelForm?.role || "National Leader"}
      </Typography>
    </Box>
  </Box>

  {/* Row 2 */}
  <Box sx={{ display: "flex", gap: 8 }}>
    <Box sx={{ minWidth: 220 }}>
      <Typography
        sx={{
          color: "#6A7282",
          fontSize: "14px",
          fontWeight: 500,
          mb: 1,
        }}
      >
        Campus
      </Typography>

      <Typography
        sx={{
          color: "#0A0A0A",
          fontSize: "16px",
          fontWeight: 500,
        }}
      >
        {travelForm?.campus}
      </Typography>
    </Box>

    <Box sx={{ minWidth: 220 }}>
      <Typography
        sx={{
          color: "#6A7282",
          fontSize: "14px",
          fontWeight: 500,
          mb: 1,
        }}
      >
        Submitted At
      </Typography>

      <Typography
        sx={{
          color: "#0A0A0A",
          fontSize: "16px",
          fontWeight: 500,
        }}
      >
        {travelForm?.submitted || "12 Jul 2026, 10:30 AM"}
      </Typography>
    </Box>
  </Box>
</Box>

</Paper>


 <Paper
  elevation={0}
  sx={{
    mt: 3,
    p: 4,
    borderRadius: "12px",
    border: "1px solid #00000014",
    backgroundColor: "#FFFFFF",
  }}
>
  <Typography
    sx={{
      color: "#0A0A0A",
      fontSize: "16px",
      fontWeight: 500,
      mb: 0.5,
    }}
  >
    Travel Details
  </Typography>

  <Typography
    sx={{
      color: "#717182",
      fontSize: "16px",
      fontWeight: 400,
      mb: 4,
    }}
  >
    Information about the planned travel
  </Typography>

<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
  {/* Row 1 */}
  <Box sx={{ display: "flex", gap: 8 }}>
    <Box sx={{ minWidth: 220 }}>
      <Typography
        sx={{
          color: "#6A7282",
          fontSize: "14px",
          fontWeight: 500,
          mb: 1,
        }}
      >
        Country of Arrival
      </Typography>

      <Typography
        sx={{
          color: "#0A0A0A",
          fontSize: "16px",
          fontWeight: 500,
        }}
      >
        {travelForm?.country}
      </Typography>
    </Box>

    <Box sx={{ minWidth: 220 }}>
      <Typography
        sx={{
          color: "#6A7282",
          fontSize: "14px",
          fontWeight: 500,
          mb: 1,
        }}
      >
        Days of Stay
      </Typography>

      <Typography
        sx={{
          color: "#0A0A0A",
          fontSize: "16px",
          fontWeight: 500,
        }}
      >
        {travelForm?.days}
      </Typography>
    </Box>
  </Box>

  {/* Row 2 */}
  <Box sx={{ display: "flex", gap: 8 }}>
    <Box sx={{ minWidth: 220 }}>
      <Typography
        sx={{
          color: "#6A7282",
          fontSize: "14px",
          fontWeight: 500,
          mb: 1,
        }}
      >
        Date of Travel
      </Typography>

      <Typography
        sx={{
          color: "#0A0A0A",
          fontSize: "16px",
          fontWeight: 500,
        }}
      >
        {travelForm?.travelDate}
      </Typography>
    </Box>

    <Box sx={{ minWidth: 220 }}>
      <Typography
        sx={{
          color: "#6A7282",
          fontSize: "14px",
          fontWeight: 500,
          mb: 1,
        }}
      >
        Date of Return
      </Typography>

      <Typography
        sx={{
          color: "#0A0A0A",
          fontSize: "16px",
          fontWeight: 500,
        }}
      >
        {travelForm?.returnDate}
      </Typography>
    </Box>
  </Box>
  {/* Half Divider */}
<Divider
  sx={{
    width: "50%",
    borderColor: "#0000001A",
    my: 3,
  }}
/>

{/* Reason for Travelling */}
<Box>
  <Typography
    sx={{
      color: "#6A7282",
      fontSize: "14px",
      fontWeight: 500,
      mb: 1,
    }}
  >
    Reason for Travelling
  </Typography>

  <Typography
    sx={{
      color: "#0A0A0A",
      fontSize: "16px",
      fontWeight: 400,
    }}
  >
    {travelForm?.reason || "Business Meeting"}
  </Typography>
</Box>
</Box>

</Paper>


<Box
  sx={{
    mt: 4,
    width: "100%",
    display: "flex",
    gap: 2,
    flexWrap: { xs: "wrap", md: "nowrap" },
  }}
>
  <Button
    startIcon={<CheckCircle2 size={18} />}
    onClick={handleApprove}
    disabled={actionLoading || travelForm?.status !== "Pending"}
    sx={{
      flex: 1,
      backgroundColor: travelForm?.status === "Pending" ? "#030213" : "#9CA3AF",
      color: "#FFFFFF",
      borderRadius: "8px",
      py: 1.3,
      textTransform: "none",
      fontWeight: 500,
      "&:hover": {
        backgroundColor: travelForm?.status === "Pending" ? "#030213" : "#9CA3AF",
      },
    }}
  >
    {actionLoading ? "Processing..." : "Approve"}
  </Button>

  <Button
    startIcon={<XCircle size={18} />}
    onClick={handleReject}
    disabled={actionLoading || travelForm?.status !== "Pending"}
    sx={{
      flex: 1,
      backgroundColor: travelForm?.status === "Pending" ? "#D4183D" : "#9CA3AF",
      color: "#FFFFFF",
      borderRadius: "8px",
      py: 1.3,
      textTransform: "none",
      fontWeight: 500,
      "&:hover": {
        backgroundColor: travelForm?.status === "Pending" ? "#D4183D" : "#9CA3AF",
      },
    }}
  >
    {actionLoading ? "Processing..." : "Reject"}
  </Button>

  <Button
    startIcon={<Pencil size={18} />}
    variant="outlined"
    sx={{
      flex: 1,
      backgroundColor: "#FFFFFF",
      color: "#0A0A0A",
      border: "1px solid #0000001A",
      borderRadius: "8px",
      py: 1.3,
      textTransform: "none",
      fontWeight: 500,
      "&:hover": {
        backgroundColor: "#FFFFFF",
        border: "1px solid #0000001A",
      },
    }}
  >
    Edit
  </Button>

  <Button
    startIcon={<Download size={18} />}
    onClick={handleExportPDF}
    variant="outlined"
    sx={{
      flex: 1,
      backgroundColor: "#FFFFFF",
      color: "#0A0A0A",
      border: "1px solid #0000001A",
      borderRadius: "8px",
      py: 1.3,
      textTransform: "none",
      fontWeight: 500,
      "&:hover": {
        backgroundColor: "#FFFFFF",
        border: "1px solid #0000001A",
      },
    }}
  >
    Export
  </Button>
</Box>


    </Box>
  );

};

export default TravelDetailForm;
