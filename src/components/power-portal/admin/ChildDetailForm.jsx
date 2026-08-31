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
import { getDedicationById, updateDedicationStatus, clearSelected } from "../../../store/slices/childDedicationSlice";

const ChildDetailForm = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const dispatch = useDispatch();
  const { selectedDedication } = useSelector((state) => state.childDedication);
  const [actionLoading, setActionLoading] = useState(false);

  const dedication = selectedDedication || state?.dedication;

  useEffect(() => {
    if (!dedication && id) {
      dispatch(getDedicationById(id));
    }
    return () => { dispatch(clearSelected()); };
  }, [id, dispatch]);

  const handleApprove = async () => {
    setActionLoading(true);
    const result = await dispatch(updateDedicationStatus({ id, status: "Approved" }));
    setActionLoading(false);
    if (result.meta.requestStatus === "fulfilled") {
      alert("Child dedication approved successfully");
    }
  };

  const handleReject = async () => {
    const reason = prompt("Enter rejection reason (optional):");
    setActionLoading(true);
    const result = await dispatch(updateDedicationStatus({ id, status: "Rejected", rejectionReason: reason || null }));
    setActionLoading(false);
    if (result.meta.requestStatus === "fulfilled") {
      alert("Child dedication rejected");
    }
  };

  const handleExportPDF = () => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Child Dedication Certificate", 14, 18);

  doc.setFontSize(11);
  doc.text(`Certificate #: ${dedication?.certificateNumber || id}`, 14, 28);

  autoTable(doc, {
    startY: 38,
    head: [["Field", "Value"]],
    body: [
      ["Status", dedication?.status || "-"],
      ["Certificate Number", dedication?.certificateNumber || "-"],
      ["Child's Name", dedication?.childName || "-"],
      ["Date of Dedication", dedication?.dedicationDate || "-"],
      ["Parent/Guardian", dedication?.parentName || "-"],
      ["Campus", dedication?.campus || "-"],
      ["Officiating Minister", dedication?.minister || "-"],
      ["Submitted By", dedication?.submitter || "-"],
      ["Role", dedication?.role || "-"],
      ["Submitted At", dedication?.submitted || "-"],
      ["Reviewed By", dedication?.reviewedBy || "-"],
      ["Reviewed At", dedication?.reviewedAt || "-"],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [3, 33, 90],
    },
  });

  doc.save(`Child_Dedication_${dedication?.certificateNumber || id}.pdf`);
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
            Child Dedication Certificate
          </Typography>

          <Typography
            variant="body1"
            color="#474C59"
            sx={{
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
             <p>Certificate #: {dedication?.certificateNumber || id}</p>
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
          dedication?.status === "Approved" ? "#ECFDF5" :
          dedication?.status === "Rejected" ? "#FEF2F2" : "#FFFBEB",
        border: `1px solid ${
          dedication?.status === "Approved" ? "#A4F4CFCC" :
          dedication?.status === "Rejected" ? "#FECACA" : "#FEE685CC"
        }`,
      }}
    >
      <Circle
        size={8}
        fill={
          dedication?.status === "Approved" ? "#00BC7D" :
          dedication?.status === "Rejected" ? "#DC2626" : "#FFB900"
        }
        color={
          dedication?.status === "Approved" ? "#00BC7D" :
          dedication?.status === "Rejected" ? "#DC2626" : "#FFB900"
        }
      />

      <Typography
        sx={{
          fontSize: "14px",
          fontWeight: 500,
          color:
            dedication?.status === "Approved" ? "#007A55" :
            dedication?.status === "Rejected" ? "#991B1B" : "#BB4D00",
        }}
      >
        {dedication?.status}
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
    Details about the certificate submission
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
        {dedication?.submitter}
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
        {dedication?.role || "National Leader"}
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
        {dedication?.campus}
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
        {dedication?.submitted || "N/A"}
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
    Child Details
  </Typography>

  <Typography
    sx={{
      color: "#717182",
      fontSize: "16px",
      fontWeight: 400,
      mb: 4,
    }}
  >
    Information about the child and dedication
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
        Certificate Number
      </Typography>

      <Typography
        sx={{
          color: "#0A0A0A",
          fontSize: "16px",
          fontWeight: 500,
        }}
      >
        {dedication?.certificateNumber}
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
        Child's Name
      </Typography>

      <Typography
        sx={{
          color: "#0A0A0A",
          fontSize: "16px",
          fontWeight: 500,
        }}
      >
        {dedication?.childName}
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
        Date of Dedication
      </Typography>

      <Typography
        sx={{
          color: "#0A0A0A",
          fontSize: "16px",
          fontWeight: 500,
        }}
      >
        {dedication?.dedicationDate}
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
        Parent/Guardian
      </Typography>

      <Typography
        sx={{
          color: "#0A0A0A",
          fontSize: "16px",
          fontWeight: 500,
        }}
      >
        {dedication?.parentName}
      </Typography>
    </Box>
  </Box>

  {/* Row 3 */}
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
        Officiating Minister
      </Typography>

      <Typography
        sx={{
          color: "#0A0A0A",
          fontSize: "16px",
          fontWeight: 500,
        }}
      >
        {dedication?.minister}
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
        Campus
      </Typography>

      <Typography
        sx={{
          color: "#0A0A0A",
          fontSize: "16px",
          fontWeight: 500,
        }}
      >
        {dedication?.campus}
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

{/* Reviewed Info */}
<Box>
  <Typography
    sx={{
      color: "#6A7282",
      fontSize: "14px",
      fontWeight: 500,
      mb: 1,
    }}
  >
    Reviewed By
  </Typography>

  <Typography
    sx={{
      color: "#0A0A0A",
      fontSize: "16px",
      fontWeight: 400,
    }}
  >
    {dedication?.reviewedBy || "Not yet reviewed"}
  </Typography>
</Box>

{dedication?.rejectionReason && (
  <Box>
    <Typography
      sx={{
        color: "#6A7282",
        fontSize: "14px",
        fontWeight: 500,
        mb: 1,
      }}
    >
      Rejection Reason
    </Typography>

    <Typography
      sx={{
        color: "#991B1B",
        fontSize: "16px",
        fontWeight: 400,
      }}
    >
      {dedication?.rejectionReason}
    </Typography>
  </Box>
)}
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
    disabled={actionLoading || dedication?.status !== "Pending"}
    sx={{
      flex: 1,
      backgroundColor: dedication?.status === "Pending" ? "#030213" : "#9CA3AF",
      color: "#FFFFFF",
      borderRadius: "8px",
      py: 1.3,
      textTransform: "none",
      fontWeight: 500,
      "&:hover": {
        backgroundColor: dedication?.status === "Pending" ? "#030213" : "#9CA3AF",
      },
    }}
  >
    {actionLoading ? "Processing..." : "Approve"}
  </Button>

  <Button
    startIcon={<XCircle size={18} />}
    onClick={handleReject}
    disabled={actionLoading || dedication?.status !== "Pending"}
    sx={{
      flex: 1,
      backgroundColor: dedication?.status === "Pending" ? "#D4183D" : "#9CA3AF",
      color: "#FFFFFF",
      borderRadius: "8px",
      py: 1.3,
      textTransform: "none",
      fontWeight: 500,
      "&:hover": {
        backgroundColor: dedication?.status === "Pending" ? "#D4183D" : "#9CA3AF",
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

export default ChildDetailForm;
