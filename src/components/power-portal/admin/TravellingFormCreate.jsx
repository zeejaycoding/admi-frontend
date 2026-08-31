import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Box,
  Typography,
  TextField,
  Paper,
  InputAdornment,
} from "@mui/material";
import { Calendar, Plus } from "lucide-react";
import { Button } from "../../ui";
import { createTravelForm, clearSuccess } from "../../../store/slices/travelFormSlice";
import { notify } from "../../../services/utils/authUtils";
import { useNavigate } from "react-router-dom";

const TravellingFormCreate = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading, success } = useSelector((state) => state.travelForm);
    const [formData, setFormData] = useState({
      country: "",
      travelDate: "",
      days: "",
      reason: "",
      returnDate: "",
    });

    const handleChange = (field) => (e) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleSubmit = async () => {
      if (!formData.country || !formData.travelDate || !formData.days || !formData.reason || !formData.returnDate) {
        notify.error("Please fill in all required fields");
        return;
      }
      const payload = {
        country: formData.country,
        travelDate: formData.travelDate,
        days: parseInt(formData.days, 10),
        reason: formData.reason,
        returnDate: formData.returnDate,
      };
      const result = await dispatch(createTravelForm(payload));
      if (result.meta.requestStatus === "fulfilled") {
        notify.success("Travel form submitted successfully");
        navigate("/admin/travel");
      } else {
        notify.error(result.payload?.message || "Failed to submit travel form");
      }
    };

    useEffect(() => {
      if (success) dispatch(clearSuccess());
    }, [success, dispatch]);
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
              Travelling Forms
            </Typography>
  
            <Typography
              variant="body1"
              color="#6b7280"
              sx={{
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              View and manage all travelling form submissions
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
  
            {/* New Report */}
  <Button
    startIcon={<Plus size={18} />}
    onClick={() => navigate("/admin/power-portal/travelling/createForm")}
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
    New Forms
  </Button>
  
  
          </Box>
        </Box>

       <Paper
  elevation={0}
  sx={{
    mt: 3,
    p: 4,
    width: "100%",
    backgroundColor: "#FFFFFF",
    border: "1px solid #00000014",
    borderRadius: "12px",
  }}
>
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      gap: 3,
      width: "100%",
    }}
  >
    {/* Country */}
    <Box>
      <Typography
        sx={{
          color: "#0A0A0A",
          fontSize: "14px",
          fontWeight: 500,
          mb: 1,
        }}
      >
        Country of Arrival *
      </Typography>

      <TextField
        fullWidth
        placeholder="Enter Country"
        variant="outlined"
        value={formData.country}
        onChange={handleChange("country")}
        InputProps={{
          sx: {
            bgcolor: "#F3F3F5",
            borderRadius: "8px",
            "& fieldset": {
              borderColor: "transparent",
            },
            "&:hover fieldset": {
              borderColor: "transparent",
            },
            "&.Mui-focused fieldset": {
              borderColor: "transparent",
            },
            "& input::placeholder": {
              color: "#717182",
              opacity: 1,
              fontSize: "14px",
              fontWeight: 400,
            },
          },
        }}
      />
    </Box>

    {/* Travel Date */}
    <Box>
      <Typography
        sx={{
          color: "#0A0A0A",
          fontSize: "14px",
          fontWeight: 500,
          mb: 1,
        }}
      >
        Date of Travel *
      </Typography>

<TextField
  fullWidth
  type="date"
  variant="outlined"
  value={formData.travelDate}
  onChange={handleChange("travelDate")}
  InputLabelProps={{ shrink: true }}
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <Calendar size={18} color="#0A0A0A" />
      </InputAdornment>
    ),
    sx: {
      bgcolor: "#FFFFFF",
      borderRadius: "8px",

      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#0000001A",
      },

      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "#0000001A",
      },

      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#0000001A",
        borderWidth: "1px",
      },
    },
  }}
/>    </Box>

    {/* Days */}
    <Box>
      <Typography
        sx={{
          color: "#0A0A0A",
          fontSize: "14px",
          fontWeight: 500,
          mb: 1,
        }}
      >
        Days of Stay *
      </Typography>

      <TextField
        fullWidth
        placeholder="Enter number of days"
        variant="outlined"
        type="number"
        value={formData.days}
        onChange={handleChange("days")}
        InputProps={{
          sx: {
            bgcolor: "#F3F3F5",
            borderRadius: "8px",
            "& fieldset": {
              borderColor: "transparent",
            },
            "& input::placeholder": {
              color: "#717182",
              opacity: 1,
              fontSize: "14px",
              fontWeight: 400,
            },
          },
        }}
      />
    </Box>

    {/* Reason */}
    <Box>
      <Typography
        sx={{
          color: "#0A0A0A",
          fontSize: "14px",
          fontWeight: 500,
          mb: 1,
        }}
      >
        Reason for Travelling *
      </Typography>

      <TextField
        fullWidth
        placeholder="Enter reason for travel"
        variant="outlined"
        value={formData.reason}
        onChange={handleChange("reason")}
        InputProps={{
          sx: {
            bgcolor: "#F3F3F5",
            borderRadius: "8px",
            "& fieldset": {
              borderColor: "transparent",
            },
            "& input::placeholder": {
              color: "#717182",
              opacity: 1,
              fontSize: "14px",
              fontWeight: 400,
            },
          },
        }}
      />
    </Box>

    {/* Return Date */}
    <Box>
      <Typography
        sx={{
          color: "#0A0A0A",
          fontSize: "14px",
          fontWeight: 500,
          mb: 1,
        }}
      >
        Date of Return *
      </Typography>

      <TextField
  fullWidth
  type="date"
  variant="outlined"
  value={formData.returnDate}
  onChange={handleChange("returnDate")}
  InputLabelProps={{ shrink: true }}
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <Calendar size={18} color="#0A0A0A" />
      </InputAdornment>
    ),
    sx: {
      bgcolor: "#FFFFFF",
      borderRadius: "8px",

      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#0000001A",
      },

      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "#0000001A",
      },

      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#0000001A",
        borderWidth: "1px",
      },
    },
  }}
/>

      {/* Action Buttons */}
<Box
  sx={{
    mt: 4,
    display: "flex",
    justifyContent: "flex-end",
    gap: 2,
  }}
>
  <Button
    onClick={() => navigate(-1)}
    sx={{
      backgroundColor: "#E3E4E7",
      color: "#746B6B",
      px: 4,
      py: 1.4,
      minWidth: "140px",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: 400,
      textTransform: "none",
      "&:hover": {
        backgroundColor: "#D7D8DC",
      },
    }}
  >
    Cancel
  </Button>

  <Button
    onClick={handleSubmit}
    disabled={isLoading}
    sx={{
      backgroundColor: "#011A5A",
      color: "#FFFFFF",
      px: 4,
      py: 1.4,
      minWidth: "160px",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: 400,
      textTransform: "none",
      "&:hover": {
        backgroundColor: "#011A5A",
      },
    }}
  >
    {isLoading ? "Submitting..." : "Submit Form"}
  </Button>
</Box>


    </Box>
  </Box>
</Paper>
  
    
      </Box>
    );}

export default TravellingFormCreate;