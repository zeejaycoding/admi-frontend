import React from "react";
import { Box, Paper, Typography, CircularProgress, Divider } from "@mui/material";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";
import Button from "./Button";

const BulkActionsBar = ({
  selectedCount = 0,
  pendingCount = 0,
  itemLabel = "items",
  onApprove,
  onReject,
  onClear,
  loading = false,
  approving = false,
  rejecting = false,
}) => {
  const isBusy = loading || approving || rejecting;

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        px: { xs: 2, sm: 2.5 },
        py: 1.5,
        width: "100%",
        backgroundColor: "#F8FAFF",
        border: "1px solid #DCE6FF",
        borderRadius: "12px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 1.5,
        boxShadow: "0 1px 3px rgba(1,26,90,0.06)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mr: 0.5 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: "9px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#E1EBFF",
            color: "#011A5A",
          }}
        >
          {isBusy ? (
            <CircularProgress size={18} thickness={5} color="inherit" />
          ) : (
            <CheckCircle size={18} />
          )}
        </Box>
        <Box sx={{ lineHeight: 1.1 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#0F1C33" }}>
            {selectedCount} selected
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#5A6C8C" }}>
            {pendingCount > 0
              ? `${pendingCount} pending ${itemLabel} ready for review`
              : `No pending ${itemLabel} in selection`}
          </Typography>
        </Box>
      </Box>

      <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: "#DCE6FF" }} />

      <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap", flex: 1, justifyContent: { xs: "flex-start", md: "flex-end" } }}>
        <Button
          variant="contained"
          disabled={pendingCount === 0 || isBusy}
          startIcon={approving ? <CircularProgress size={16} color="inherit" /> : <CheckCircle size={16} />}
          onClick={onApprove}
          sx={{
            backgroundColor: "#059669",
            color: "#FFFFFF",
            px: 2.5,
            py: 1,
            borderRadius: "9px",
            fontWeight: 600,
            fontSize: 13.5,
            textTransform: "none",
            boxShadow: "none",
            "&:hover": { backgroundColor: "#047857", boxShadow: "none" },
            "&.Mui-disabled": { backgroundColor: "#C7D2D0", color: "#FFFFFF" },
          }}
        >
          Approve
        </Button>
        <Button
          variant="contained"
          disabled={pendingCount === 0 || isBusy}
          startIcon={rejecting ? <CircularProgress size={16} color="inherit" /> : <XCircle size={16} />}
          onClick={onReject}
          sx={{
            backgroundColor: "#DC2626",
            color: "#FFFFFF",
            px: 2.5,
            py: 1,
            borderRadius: "9px",
            fontWeight: 600,
            fontSize: 13.5,
            textTransform: "none",
            boxShadow: "none",
            "&:hover": { backgroundColor: "#B91C1C", boxShadow: "none" },
            "&.Mui-disabled": { backgroundColor: "#F0C4C4", color: "#FFFFFF" },
          }}
        >
          Reject
        </Button>
        <Button
          variant="contained"
          disabled={isBusy}
          startIcon={<RotateCcw size={16} />}
          onClick={onClear}
          sx={{
            backgroundColor: "#374151",
            color: "#FFFFFF",
            px: 2.5,
            py: 1,
            borderRadius: "9px",
            fontWeight: 600,
            fontSize: 13.5,
            textTransform: "none",
            boxShadow: "none",
            "&:hover": { backgroundColor: "#1F2937", boxShadow: "none" },
            "&.Mui-disabled": { backgroundColor: "#D1D5DB", color: "#FFFFFF" },
          }}
        >
          Clear
        </Button>
      </Box>
    </Paper>
  );
};

export default BulkActionsBar;
