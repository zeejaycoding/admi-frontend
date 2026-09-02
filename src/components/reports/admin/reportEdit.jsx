import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { X, Save, FileText, MapPin, User, Building2 } from "lucide-react";
import { updateReport } from "../../../store/slices/reportSlice";
import { notify } from "../../../services/utils/authUtils";
import { CURRENCIES, DEFAULT_CURRENCY } from "../../../constants/currencies";

const EditReport = ({ report, onCancel, onSuccess }) => {
  const dispatch = useDispatch();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    country: report?.country || "",
    date: report?.date || "",
    nationalLeader: report?.nationalLeader || "",
    campus: report?.campus || "",
    coordinator: report?.coordinator || "",
    zonalLeader: report?.zonalLeader || "",
    summary: report?.summary || "",
    currency: report?.currency || DEFAULT_CURRENCY,
  });

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const reportData = {
        country: form.country,
        date: form.date,
        nationalLeader: form.nationalLeader,
        campus: form.campus,
        coordinator: form.coordinator,
        zonalLeader: form.zonalLeader,
        summary: form.summary,
        currency: form.currency,
      };
      await dispatch(updateReport({ id: report.id, reportData })).unwrap();
      notify.success("Report updated successfully!");
      onSuccess();
    } catch (err) {
      const msg =
        (err && (err.message || err.error)) ||
        "Failed to update report. Please try again.";
      notify.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 3,
            borderBottom: "1px solid #E5E7EB",
          }}
        >
          <Box>
            <Typography
              sx={{ fontSize: "20px", fontWeight: 700, color: "#101828" }}
            >
              Edit Report
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "#6B7280" }}>
              Update the report name and information section
            </Typography>
          </Box>
          <Box
            onClick={onCancel}
            sx={{
              cursor: "pointer",
              width: 32,
              height: 32,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "&:hover": { backgroundColor: "#F3F4F6" },
            }}
          >
            <X size={18} color="#374151" />
          </Box>
        </Box>

        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
          {/* Report Name */}
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <FileText size={16} color="#011A5A" />
              <Typography sx={{ color: "#6A7282", fontSize: "14px" }}>
                Report Name (Country)
              </Typography>
            </Box>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. Nigeria"
              value={form.country}
              onChange={handleChange("country")}
            />
          </Box>

          {/* Report Period */}
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <MapPin size={16} color="#011A5A" />
              <Typography sx={{ color: "#6A7282", fontSize: "14px" }}>
                Report Period (Month)
              </Typography>
            </Box>
            <input
              type="date"
              value={form.date}
              onChange={handleChange("date")}
              style={{
                width: "100%",
                height: "40px",
                border: "1px solid #D1D5DB",
                borderRadius: "8px",
                padding: "0 12px",
                color: "#111827",
              }}
            />
          </Box>

          {/* Currency */}
          <Box display="flex" flexDirection="column" gap={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <MapPin size={16} color="#011A5A" />
              <Typography sx={{ color: "#6A7282", fontSize: "14px" }}>
                Currency
              </Typography>
            </Box>
            <select
              value={form.currency}
              onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value }))}
              style={{
                width: "100%",
                height: "40px",
                border: "1px solid #D1D5DB",
                borderRadius: "8px",
                padding: "0 12px",
                color: "#111827",
                backgroundColor: "#fff",
                outline: "none",
              }}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol}) - {c.displayName}
                </option>
              ))}
            </select>
          </Box>

          {/* National Leader */}
          <Box display="flex" flexDirection="column" gap={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <User size={16} color="#011A5A" />
              <Typography sx={{ color: "#6A7282", fontSize: "14px" }}>
                National Leader
              </Typography>
            </Box>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter national leader name"
              value={form.nationalLeader}
              onChange={handleChange("nationalLeader")}
            />
          </Box>

          {/* Campus */}
          <Box display="flex" flexDirection="column" gap={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <Building2 size={16} color="#011A5A" />
              <Typography sx={{ color: "#6A7282", fontSize: "14px" }}>
                Campus
              </Typography>
            </Box>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter campus name"
              value={form.campus}
              onChange={handleChange("campus")}
            />
          </Box>

          {/* Coordinator */}
          <Box display="flex" flexDirection="column" gap={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <User size={16} color="#011A5A" />
              <Typography sx={{ color: "#6A7282", fontSize: "14px" }}>
                Campus Coordinator
              </Typography>
            </Box>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter campus coordinator name"
              value={form.coordinator}
              onChange={handleChange("coordinator")}
            />
          </Box>

          {/* Zonal Leader */}
          <Box display="flex" flexDirection="column" gap={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <User size={16} color="#011A5A" />
              <Typography sx={{ color: "#6A7282", fontSize: "14px" }}>
                Zonal Leader
              </Typography>
            </Box>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter zonal leader name"
              value={form.zonalLeader}
              onChange={handleChange("zonalLeader")}
            />
          </Box>

          {/* Summary */}
          <Box display="flex" flexDirection="column" gap={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <FileText size={16} color="#011A5A" />
              <Typography sx={{ color: "#6A7282", fontSize: "14px" }}>
                Summary
              </Typography>
            </Box>
            <TextField
              fullWidth
              multiline
              minRows={4}
              placeholder="Add a summary or description for this report"
              value={form.summary}
              onChange={handleChange("summary")}
            />
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            p: 3,
            borderTop: "1px solid #E5E7EB",
          }}
        >
          <Button
            onClick={onCancel}
            sx={{
              textTransform: "none",
              color: "#111827",
              backgroundColor: "#F3F4F6",
              px: 3,
              py: 1.2,
              borderRadius: "10px",
              fontWeight: 600,
              "&:hover": { backgroundColor: "#E5E7EB" },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            startIcon={<Save size={16} />}
            sx={{
              textTransform: "none",
              color: "#fff",
              backgroundColor: "#011A5A",
              px: 3,
              py: 1.2,
              borderRadius: "10px",
              fontWeight: 600,
              minWidth: "140px",
              "&:hover": { backgroundColor: "#011A5A" },
            }}
          >
            {submitting ? (
              <>
                <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </Box>
      </form>
    </div>
  );
};

export default EditReport;
