import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Box,
  Typography,
  TextField,
  Paper,
  InputAdornment,
    FormControl,
  MenuItem,
  Select,

} from "@mui/material";
import { Calendar, Plus } from "lucide-react";
import { Button } from "../../ui";
import { notify } from "../../../services/utils/authUtils";
import { useNavigate } from "react-router-dom";
import { createDedication } from "../../../store/slices/childDedicationSlice";
import { fetchAllCampuses } from "../../../store/slices/campusSlice";


const ChildFormCreate = () => {
const dispatch = useDispatch();
const navigate = useNavigate();

const { campuses } = useSelector((state) => state.campus);
const { isLoading } = useSelector((state) => state.childDedication);

const mockCampuses = [
  { id: 1, name: "Karachi" },
  { id: 2, name: "Lahore" },
  { id: 3, name: "Islamabad" },
  { id: 4, name: "Peshawar" },
];

const campusList = campuses && campuses.length > 0 ? campuses : mockCampuses;

const [isSubmitting, setIsSubmitting] = useState(false);

const [formData, setFormData] = useState({
  dedicationDate: "",
  childName: "",
  parentName: "",
  campus: "",
  minister: "",
});
    const handleChange = (field) => (e) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

    useEffect(() => {
      if (!campuses || campuses.length === 0) {
        dispatch(fetchAllCampuses());
      }
    }, [dispatch, campuses]);

    const handleSubmit = async () => {
  if (
    !formData.dedicationDate ||
    !formData.childName ||
    !formData.parentName ||
    !formData.campus ||
    !formData.minister
  ) {
    notify.error("Please fill in all required fields");
    return;
  }

  setIsSubmitting(true);

  const payload = {
    childName: formData.childName,
    dedicationDate: formData.dedicationDate,
    parentName: formData.parentName,
    campus: formData.campus,
    minister: formData.minister,
  };

  const result = await dispatch(createDedication(payload));
  setIsSubmitting(false);

  if (result.meta.requestStatus === "fulfilled") {
    notify.success("Child dedication certificate created successfully.");
    navigate("/admin/child/certificate", { state: { certificate: result.payload } });
  } else {
    notify.error(result.payload?.message || "Failed to create certificate");
  }
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
              color="#6b7280"
              sx={{
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              Generate and access child dedication certificates on the portal
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
    onClick={() => navigate("/admin/power-portal/child/createForm")}
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
    New Certificate
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

    {/* dedication Date */}
    <Box>
      <Typography
        sx={{
          color: "#0A0A0A",
          fontSize: "14px",
          fontWeight: 500,
          mb: 1,
        }}
      >
        Date of Dedication *
      </Typography>

<TextField
  fullWidth
  type="date"
  variant="outlined"
  placeholder="Pick a date"
  value={formData.dedicationDate}
  onChange={handleChange("dedicationDate")}
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

    {/* child name */}
    <Box>
      <Typography
        sx={{
          color: "#0A0A0A",
          fontSize: "14px",
          fontWeight: 500,
          mb: 1,
        }}
      >
        Child's Name *
      </Typography>

      <TextField
        fullWidth
        placeholder="Enter child's full name"
        variant="outlined"
        type="text"
        value={formData.childName}
        onChange={handleChange("childName")}
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

    {/* parents name */}
    <Box>
      <Typography
        sx={{
          color: "#0A0A0A",
          fontSize: "14px",
          fontWeight: 500,
          mb: 1,
        }}
      >
        Parent/Guardian Name(s) *
      </Typography>

      <TextField
        fullWidth
        placeholder="Enter parent/guardian name(s)"
        variant="outlined"
        type="text"
        value={formData.parentName}
        onChange={handleChange("parentName")}
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

    {/* Campus */}
<Box>
  <Typography
    sx={{
      color: "#0A0A0A",
      fontSize: "14px",
      fontWeight: 500,
      mb: 1,
    }}
  >
    Campus *
  </Typography>

  <FormControl fullWidth>
    <Select
      displayEmpty
      value={formData.campus}
      onChange={handleChange("campus")}
      renderValue={(selected) =>
        selected ? selected : "Select campus"
      }
      sx={{
        bgcolor: "#F3F3F5",
        borderRadius: "8px",

        "& fieldset": {
          borderColor: "transparent",
        },

        "& .MuiSelect-select": {
          color: formData.campus ? "#0A0A0A" : "#717182",
          fontSize: "14px",
        },
      }}
    >
      <MenuItem disabled value="">
        Select campus
      </MenuItem>

      {campusList?.map((campus) => (
        <MenuItem key={campus.id} value={campus.name}>
          {campus.name}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Box>


    {/* officiating minister */}
    <Box>
      <Typography
        sx={{
          color: "#0A0A0A",
          fontSize: "14px",
          fontWeight: 500,
          mb: 1,
        }}
      >
        Officiating Minister *
      </Typography>

      <TextField
        fullWidth
        placeholder="Enter officiating minister's name"
        variant="outlined"
        value={formData.minister}
        onChange={handleChange("minister")}
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
          disabled={isSubmitting || isLoading}
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
          {isSubmitting ? "Submitting..." : "Submit Form"}
        </Button>
      </Box>
    </Box>
  </Box>
</Paper>
  
    
      </Box>
    );}

export default ChildFormCreate;
