import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createReport } from "../../../store/slices/reportSlice";
import { notify } from "../../../services/utils/authUtils";
import useCoordinatorCampus from "../../../hooks/useCoordinatorCampus";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import {
  Check,
  User,
  DollarSign,
  Wallet,
  Upload,
  Calendar,
  MapPin,
  Building2,
    Trash2,
  Plus,
  TrendingDown,
  TrendingUp, HandHeart, Medal,
} from "lucide-react";

const steps = [
  { label: "Basic Info", icon: User },
  { label: "Expenditures", icon: DollarSign },
  { label: "Income $ Review", icon: Wallet },
  { label: "Receipts & Submit", icon: Upload },
];


const AddReport = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [nextExpenseId, setNextExpenseId] = useState(6);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [reportDate, setReportDate] = useState(new Date().toISOString().split("T")[0]);
  const [country, setCountry] = useState("");
  const [nationalLeader, setNationalLeader] = useState("");
  const [campus, setCampus] = useState("");
  const [coordinator, setCoordinator] = useState("");
  const [zonalLeader, setZonalLeader] = useState("");
  const [summary, setSummary] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { isCoordinator, campusName } = useCoordinatorCampus();
  const effectiveCampus = isCoordinator ? campusName || "" : campus;

  useEffect(() => {
    if (activeStep > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [activeStep]);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles((prev) => [...prev, ...files]);
    e.target.value = null;
  };

  const removeFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const reportData = {
        date: reportDate,
        country,
        nationalLeader,
        campus: effectiveCampus,
        coordinator,
        zonalLeader,
        summary,
        partnership: income.partnership || "0",
        papaHonour: income.papaHonour || "0",
        offerings: income.offerings || "0",
        expenses: expenses.map(({ id, ...e }) => e),
      };

      await dispatch(createReport({ reportData, files: uploadedFiles })).unwrap();
      notify.success("Report submitted successfully!");
      navigate("/admin/reports");
    } catch (err) {
      notify.error(err.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  const [income, setIncome] = useState({
    partnership: "",
    papaHonour: "",
    offerings: "",
  });



  const nextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

const [expenses, setExpenses] = useState(
  Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: "",
  }))
);

const addExpense = () => {
  setExpenses(prev => [
    ...prev,
    {
      id: nextExpenseId,
      date: new Date().toISOString().split("T")[0],
      description: "",
      amount: "",
    },
  ]);

  setNextExpenseId(prev => prev + 1);
};


const deleteExpense = (id) => {
  setExpenses(prev => prev.filter(item => item.id !== id));
};

  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const nextStepLabel =
  activeStep < steps.length - 1
    ? steps[activeStep + 1].label
    : null;

const prevStepLabel =
  activeStep > 0
    ? steps[activeStep - 1].label
    : null;

    const totalExpenditures = expenses.reduce(
  (sum, item) => sum + (parseFloat(item.amount) || 0),
  0
);

const updateExpense = (id, field, value) => {
  setExpenses(prev =>
    prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    )
  );
};

const totalIncome =
  (parseFloat(income.partnership) || 0) +
  (parseFloat(income.papaHonour) || 0) +
  (parseFloat(income.offerings) || 0);

const closingBalance = totalIncome - totalExpenditures;
const isProfit = closingBalance >= 0;

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Report Period */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "18px",
                backgroundColor: "#FFFFFF",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              }}
            >
              {/* Top Row */}
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "12px",
                    backgroundColor: "#DBEAFE",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Calendar size={20} color="#155DFC" />
                </Box>

                <Box>
                  <Typography fontWeight={700} color="#101828">
                    Report Period
                  </Typography>

                  <Typography fontSize={14} color="#6A7282">
                    Select the reporting month
                  </Typography>
                </Box>
              </Box>

              {/* Full Width Date Picker */}
             <input
  type="date"
  value={reportDate}
  onChange={(e) => setReportDate(e.target.value)}
  className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-[#011A5A]"
  style={{
    width: "100%",
    height: "48px",
    color: "#676767",
    borderColor: "#D1D5DB",
    padding: "0 12px",
  }}
/>
            </Paper>

            {/* National Leadership */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "18px",
                backgroundColor: "#FFFFFF",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              }}
            >
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "12px",
                    backgroundColor: "#F3E8FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MapPin size={20} color="#9810FA" />
                </Box>

                <Box>
                  <Typography fontWeight={700}>National Leadership</Typography>
                  <Typography fontSize={14} color="#6B7280">
                    Country and national coordinator details
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <TextField
                  fullWidth
                  label="Country Name *"
                  placeholder="Enter country name"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MapPin size={18} color="#6A7282" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="National Coordinator *"
                  placeholder="Enter national coordinator name"
                  value={nationalLeader}
                  onChange={(e) => setNationalLeader(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <User size={18} color="#6A7282" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Paper>

            {/* Campus Details */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "18px",
                backgroundColor: "#FFFFFF",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              }}
            >
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "12px",
                    backgroundColor: "#DCFCE7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Building2 size={20} color="#00A63E" />
                </Box>

                <Box>
                  <Typography fontWeight={700}>Campus Details</Typography>
                  <Typography fontSize={14} color="#6B7280">
                    Campus and coordinator information
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  fullWidth
                  label="Campus Name *"
                  placeholder="Enter campus name"
                  value={effectiveCampus}
                  onChange={(e) => setCampus(e.target.value)}
                  disabled={isCoordinator}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Building2 size={18} color="#6A7282" />
                      </InputAdornment>
                    ),
                  }}
                />

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: 2,
                  }}
                >
                  <TextField
                    fullWidth
                    label="Campus Coordinator *"
                    placeholder="Enter campus coordinator name"
                    value={coordinator}
                    onChange={(e) => setCoordinator(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <User size={18} color="#6A7282" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Zonal Leader"
                    placeholder="Enter zonal leader name"
                    value={zonalLeader}
                    onChange={(e) => setZonalLeader(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <User size={18} color="#6A7282" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Box>
            </Paper>
          </Box>
        );

      case 1:
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: "18px",
        backgroundColor: "#fff",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box display="flex" gap={2} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              backgroundColor: "#FFE2E2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TrendingDown size={20} color="#E7000B" />
          </Box>

          <Box>
            <Typography fontWeight={700}>
              Monthly Expenditures
            </Typography>
            <Typography fontSize={14} color="#6B7280">
              Add all expenses for the reporting period
            </Typography>
          </Box>
        </Box>

        <Button
          onClick={addExpense}
          startIcon={<Plus size={16} />}
          sx={{
            backgroundColor: "#011A5A",
            color: "#fff",
            borderRadius: "12px",
            px: 3,
            textTransform: "none",
            "&:hover": {
              backgroundColor: "#011A5A",
            },
          }}
        >
          Add Item
        </Button>
      </Box>

      {/* Expense Cards */}
      <Box display="flex" flexDirection="column" gap={2}>
        {expenses.map((item, index) => (
          <Box
            key={item.id}
            sx={{
              backgroundColor: "#F9FAFB",
              borderRadius: "16px",
              p: 2.5,
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "80px 1fr 1fr 1fr 70px",
                lg: "80px 1.2fr 1.5fr 1fr 70px",
              },
              gap: 2,
              alignItems: "end",
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
            <Box>
              <Typography fontSize={13} mb={1} fontWeight={500} color="#4A5565">
                Date
              </Typography>
              <input
                type="date"
                value={item.date}
                onChange={(e) =>
                  updateExpense(item.id, "date", e.target.value)
                }
                style={{
                  width: "100%",
                  height: "44px",
                  color: "#676767",
                  border: "1px solid #D1D5DB",
                  borderRadius: "10px",
                  padding: "0 12px",
                }}
              />
            </Box>
{/* Description */}
<Box>
  <Typography
    fontSize={13}
    mb={1}
    fontWeight={500}
    color="#4A5565"
  >
    Description
  </Typography>

  <input
    type="text"
    placeholder="RENT"
    value={item.description}
    onChange={(e) =>
      updateExpense(item.id, "description", e.target.value)
    }
    style={{
      width: "100%",
      height: "44px",
      color: "#0A0A0A80",
      border: "1px solid #D1D5DB",
      borderRadius: "10px",
      padding: "0 12px",
      outline: "none",
      backgroundColor: "#fff",
    }}
  />
</Box>

{/* Amount */}
<Box>
  <Typography
    fontSize={13}
    mb={1}
    fontWeight={500}
    color="#4A5565"
  >
    Amount
  </Typography>

<input
  type="number"
  value={item.amount}
  onChange={(e) =>
    updateExpense(item.id, "amount", e.target.value)
  }
  placeholder="0.00"
  style={{
    width: "100%",
    height: "44px",
    color: "#676767",
    border: "1px solid #D1D5DB",
    borderRadius: "10px",
    padding: "0 12px",
    outline: "none",
    backgroundColor: "#fff",
  }}
/>
</Box>

            {/* Delete */}
            <Button
              onClick={() => deleteExpense(item.id)}
              sx={{
                minWidth: 48,
                width: 48,
                height: 48,
                borderRadius: "12px",
                backgroundColor: "#FFE2E2",
                "&:hover": {
                  backgroundColor: "#FFE2E2",
                },
              }}
            >
              <Trash2 size={18} color="#E7000B" />
            </Button>
          </Box>
        ))}
      </Box>
      <Box
  sx={{
    mt: 3,
    p: 2.5,
    borderLeft: "4px solid #FB2C36",
    borderRadius: "14px",
    background:
      "linear-gradient(90deg, #FEF2F2 0%, #FFF7ED 100%)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 2,
  }}
>
  {/* Left */}
  <Box display="flex" alignItems="center" gap={1.5}>
    <DollarSign size={20} color="#E7000B" />

    <Typography
      sx={{
        fontWeight: 700,
        color: "#101828",
      }}
    >
      Total Expenditures
    </Typography>
  </Box>

  {/* Right */}
  <Typography
    sx={{
      fontWeight: 700,
      fontSize: "20px",
      color: "#E7000B",
    }}
  >
    {totalExpenditures.toFixed(2)}
  </Typography>
</Box>
    </Paper>
  );


case 2:
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: "18px",
        backgroundColor: "#fff",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <Box mb={4}>
        <Box display="flex" gap={2} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              backgroundColor: "#DCFCE7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TrendingUp size={20} color="#00A63E" />
          </Box>

          <Box>
            <Typography fontWeight={700} color="#101828">PCI 2026 Givings</Typography>
            <Typography fontSize={14}fontWeight={400} color="#6A7282">
              Enter income from offerings and partnerships
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Income Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3,1fr)" },
          gap: 2,
        }}
      >
        {/* Partnership */}
       <Box
  sx={{
    p: 3,
    borderRadius: "18px",
    border: "1px solid #BEDBFF",
    background:
      "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
  }}
>
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.2,
      mb: 2,
    }}
  >
    <HandHeart size={24} color="#011A5A" />
    <Typography fontWeight={600}>Partnership</Typography>
  </Box>

          <input
            type="number"
            placeholder="0.0"
            value={income.partnership}
            onChange={(e) =>
              setIncome({ ...income, partnership: e.target.value })
            }
            style={{
              width: "100%",
              height: "44px",
              border: "1px solid #8EC5FF",
              borderRadius: "12px",
              padding: "0 12px",
              outline: "none",
              background: "#fff",
            }}
          />
        </Box>

        {/* Papa Honour */}
        <Box
          sx={{
            p: 3,
            borderRadius: "18px",
            border: "1px solid #E9D4FF",
            background:
              "linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)",
          }}
        >
          <Box
  sx={{
    display: "flex",
    alignItems: "center",
    gap: 1.2,
    mb: 2,
  }}
>
  <Medal size={24} color="#9810FA" />
  <Typography fontWeight={600}>Papa Honour</Typography>
</Box>

          <input
            type="number"
            placeholder="0.0"
            value={income.papaHonour}
            onChange={(e) =>
              setIncome({ ...income, papaHonour: e.target.value })
            }
            style={{
              width: "100%",
              height: "44px",
              border: "1px solid #DAB2FF",
              borderRadius: "12px",
              padding: "0 12px",
              outline: "none",
              background: "#fff",
            }}
          />
        </Box>

        {/* General Offerings */}
        <Box
          sx={{
            p: 3,
            borderRadius: "18px",
            border: "1px solid #B9F8CF",
            background:
              "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)",
          }}
        >
<Box
  sx={{
    display: "flex",
    alignItems: "center",
    gap: 1.2,
    mb: 2,
  }}
>
  <Wallet size={24} color="#00A63E" />
  <Typography fontWeight={600}>General Offerings</Typography>
</Box>
          <input
            type="number"
            placeholder="0.0"
            value={income.offerings}
            onChange={(e) =>
              setIncome({ ...income, offerings: e.target.value })
            }
            style={{
              width: "100%",
              height: "44px",
              border: "1px solid #7BF1A8",
              borderRadius: "12px",
              padding: "0 12px",
              outline: "none",
              background: "#fff",
            }}
          />
        </Box>
      </Box>

      {/* Financial Summary */}
<Box
  sx={{
    mt: 4,
    p: 3,
    borderRadius: "18px",
    border: "1px solid #E2E8F0",
    background:
      "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
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
        {totalIncome.toFixed(2)}
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
        {totalExpenditures.toFixed(2)}
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
        {Math.abs(closingBalance).toFixed(2)}
      </Typography>
    </Box>
  </Box>
</Box>

<Box
  sx={{
    mt: 3,
    p: 2.5,
    borderLeft: "4px solid #011A5A",
    borderRadius: "14px",
    background:
      "linear-gradient(90deg, #EFF6FF 0%, #EEF2FF 100%)",
  }}
>
  <Box display="flex" alignItems="flex-start" gap={2}>
    {/* Icon */}
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: "12px",
        backgroundColor: "#011A5A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Calendar size={18} color="#fff" />
    </Box>

    {/* Text */}
    <Box>
      <Typography
        sx={{
          fontWeight: 700,
          color: "#1C398E",
          mb: 0.5,
        }}
      >
        Reporting Deadline
      </Typography>

      <Typography
        sx={{
          fontSize: "14px",
          color: "#193CB8",
          mb: 1,
          lineHeight: 1.6,
        }}
      >
        Reports must be submitted from the first Sunday to
        Tuesday midnight of each month.
      </Typography>

      <Typography
        sx={{
          fontSize: "14px",
          color: "#011A5A",
          lineHeight: 1.6,
        }}
      >
        <Box component="span" sx={{ fontWeight: 700 }}>
          Final Deadline:
        </Box>{" "}
        End of day at all timezones (12:00 midnight local
        time)
      </Typography>
    </Box>
  </Box>
</Box>
    </Paper>
  );


case 3:
  return (
    <Box display="flex" flexDirection="column" gap={3}>
      {/* Upload Container */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: "18px",
          backgroundColor: "#fff",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}
      >
        {/* Header */}
        <Box display="flex" gap={2} alignItems="center" mb={3}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              backgroundColor: "#FFEDD4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Upload size={20} color="#F54900" />
          </Box>

          <Box>
            <Typography fontWeight={700} color="#101828">
              Remittance Receipts
            </Typography>

            <Typography fontSize={14} color="#6A7282">
              Upload proof of remittance payments (Required)
            </Typography>
          </Box>
        </Box>

        {/* Upload Area */}
        <input
  type="file"
  multiple
  accept=".pdf,.png,.jpg,.jpeg"
  hidden
  id="receipt-upload"
  onChange={handleFileUpload}
/>

<label htmlFor="receipt-upload" style={{ width: "100%" }}>
  <Box
    sx={{
      border: "2px dashed #D1D5DC",
      borderRadius: "16px",
      p: 5,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      cursor: "pointer",
    }}
  >
    <Upload size={30} color="#6A7282" />
    <Typography mt={2} fontWeight={600}>
      Click to upload or drag and drop
    </Typography>
    <Typography mt={1} fontSize={14} color="#6A7282">
      PDF, PNG, JPG or JPEG (Max 10MB each)
    </Typography>
  </Box>
</label>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 1 }}>
            {uploadedFiles.map((file, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 2,
                  borderRadius: "12px",
                  backgroundColor: "#F0FDF4",
                  border: "1px solid #BBF7D0",
                }}
              >
                <Typography sx={{ fontSize: 14, fontWeight: 500, flex: 1, color: "#166534" }}>
                  {file.name}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#16a34a", whiteSpace: "nowrap" }}>
                  {(file.size / 1024).toFixed(1)} KB
                </Typography>
                <Box
                  component="span"
                  onClick={() => removeFile(i)}
                  sx={{
                    ml: 1,
                    cursor: "pointer",
                    color: "#dc2626",
                    fontWeight: 700,
                    fontSize: 16,
                    lineHeight: 1,
                    "&:hover": { color: "#991b1b" },
                  }}
                >
                  ×
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {/* No Files Warning */}
        {uploadedFiles.length === 0 && (
          <Box
            sx={{
              mt: 3,
              p: 3,
              borderRadius: "14px",
              backgroundColor: "#FEFCE8",
              border: "1px solid #FFF085",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                backgroundColor: "#FFF7CC",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
                fontWeight: 700,
                fontSize: 24,
                color: "#CA8A04",
              }}
            >
              !
            </Box>

            <Typography fontWeight={700} color="#101828" mb={1}>
              No receipts uploaded yet
            </Typography>

            <Typography fontSize={14} color="#6A7282">
              You must upload at least one remittance receipt to submit
              the report
            </Typography>
          </Box>
        )}

<Box
  sx={{
    mt: 4,
    p: 3,
    borderRadius: "18px",
    border: "1px solid #E2E8F0",
    background:
      "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
  }}
>
  {/* Header */}
  <Box display="flex" alignItems="center" gap={2} mb={2}>
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
      <Typography fontWeight={700} color="#45556C" sx={{ fontSize: 20 }}>
        S
      </Typography>
    </Box>

    <Box>
      <Typography fontWeight={700} color="#101828">
        Summary <Box component="span" sx={{ fontWeight: 400, color: "#6A7282", fontSize: 13 }}>(Optional)</Box>
      </Typography>

      <Typography fontSize={14} color="#6A7282">
        Add a brief summary or description
      </Typography>
    </Box>
  </Box>

  <TextField
    fullWidth
    multiline
    minRows={4}
    placeholder="Admin/leader can add a summary, description, or anything explaining why this report was written…"
    value={summary}
    onChange={(e) => setSummary(e.target.value)}
    sx={{
      backgroundColor: "#fff",
      borderRadius: "12px",
      "& .MuiOutlinedInput-root": { borderRadius: "12px" },
    }}
  />
</Box>

              {/* Financial Summary */}
<Box
  sx={{
    mt: 4,
    p: 3,
    borderRadius: "18px",
    border: "1px solid #E2E8F0",
    background:
      "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
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
        {totalIncome.toFixed(2)}
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
        {totalExpenditures.toFixed(2)}
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
        {Math.abs(closingBalance).toFixed(2)}
      </Typography>
    </Box>
  </Box>
</Box>

<Box
  sx={{
    mt: 3,
    p: 2.5,
    borderLeft: "4px solid #011A5A",
    borderRadius: "14px",
    background:
      "linear-gradient(90deg, #EFF6FF 0%, #EEF2FF 100%)",
  }}
>
  <Box display="flex" alignItems="flex-start" gap={2}>
    {/* Icon */}
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: "12px",
        backgroundColor: "#011A5A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Calendar size={18} color="#fff" />
    </Box>

    {/* Text */}
    <Box>
      <Typography
        sx={{
          fontWeight: 700,
          color: "#1C398E",
          mb: 0.5,
        }}
      >
        Reporting Deadline
      </Typography>

      <Typography
        sx={{
          fontSize: "14px",
          color: "#193CB8",
          mb: 1,
          lineHeight: 1.6,
        }}
      >
        Reports must be submitted from the first Sunday to
        Tuesday midnight of each month.
      </Typography>

      <Typography
        sx={{
          fontSize: "14px",
          color: "#011A5A",
          lineHeight: 1.6,
        }}
      >
        <Box component="span" sx={{ fontWeight: 700 }}>
          Final Deadline:
        </Box>{" "}
        End of day at all timezones (12:00 midnight local
        time)
      </Typography>
    </Box>
  </Box>
</Box>

      </Paper>
    </Box>
  );

      default:
        return null;
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
            Submit Coordinator Report
          </Typography>

          <Typography
            variant="body1"
            color="#6b7280"
            sx={{
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            Campus by Campus Monthly Financial Reporting System
          </Typography>
        </Box>
      </Box>

      <Box sx={{ p: { xs: 1.5, sm: 2, md: 4 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            mb: 5,
            width: "100%",
            overflowX: "hidden",
          }}
        >
          {steps.map((step, index) => {
            const active = index === activeStep;
            const Icon = step.icon;

            return (
              <React.Fragment key={step.label}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: index <= activeStep ? "pointer" : "default",
                    minWidth: { xs: "58px", sm: "90px", md: "110px" },
                    flexShrink: 0,
                  }}
                  onClick={() => {
                    if (index <= activeStep) setActiveStep(index);
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 44, sm: 56 },
                      height: { xs: 44, sm: 56 },
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: active ? "#011A5A" : "#E5E7EB",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <Icon size={24} color={active ? "#FFFFFF" : "#6A7282"} />
                  </Box>

                  <Typography
                    sx={{
                      mt: 1.5,
                      fontSize: { xs: "11px", sm: "13px" },
                      fontWeight: 500,
                      color: active ? "#011A5A" : "#6A7282",
                      textAlign: "center",
                      maxWidth: { xs: "58px", sm: "110px" },
                      lineHeight: 1.3,
                    }}
                  >
                    {step.label}
                  </Typography>
                </Box>

                {index !== steps.length - 1 && (
                  <Box
                    sx={{
                      flex: 1,
                      height: "4px",
                      backgroundColor: "#E5E7EB",
                      mt: { xs: "20px", sm: "28px" },
                      mx: { xs: 0.5, sm: 1 },
                      width: "100%",
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </Box>

        <Box
          sx={{
            p: 0, // or 2 if you want little spacing
          }}
        >
          {renderStepContent()}

         <Box
  sx={{
    display: "flex",
    justifyContent: "space-between",
    mt: 4,
    gap: 2,
    flexDirection: { xs: "column", sm: "row" },
  }}
>
  {/* Back Button */}
  {activeStep > 0 ? (
    <Button
      onClick={prevStep}
      sx={{
        backgroundColor: "#011A5A",
        color: "#fff",
        px: 3,
        py: 1.4,
        borderRadius: "12px",
        textTransform: "none",
        fontWeight: 400,
        width: { xs: "100%", sm: "auto" },
        "&:hover": {
          backgroundColor: "#011A5A",
        },
      }}
    >
      {`<- Back to ${prevStepLabel}`}
    </Button>
  ) : (
    <Box />
  )}

  {/* Continue Button */}
 {activeStep < steps.length - 1 ? (
  <Button
    onClick={nextStep}
    sx={{
      backgroundColor: "#011A5A",
      color: "#fff",
      px: 3,
      py: 1.4,
      borderRadius: "12px",
      textTransform: "none",
      fontWeight: 400,
      width: { xs: "100%", sm: "auto" },
      "&:hover": {
        backgroundColor: "#011A5A",
      },
    }}
  >
    {`Continue to ${nextStepLabel} ->`}
  </Button>
) : (
  <Button
    disabled={uploadedFiles.length === 0 || submitting}
    onClick={handleSubmit}
    sx={{
      backgroundColor:
        uploadedFiles.length > 0 ? "#00A63E" : "#D1D5DB",
      color: "#fff",
      px: 4,
      py: 1.4,
      borderRadius: "12px",
      textTransform: "none",
      fontWeight: 600,
      minWidth: { xs: "100%", sm: "180px" },
      width: { xs: "100%", sm: "auto" },
      "&:hover": {
        backgroundColor:
          uploadedFiles.length > 0 ? "#00A63E" : "#D1D5DB",
      },
    }}
  >
    {submitting ? (
      <>
        <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />
        Submitting...
      </>
    ) : (
      "Submit Report"
    )}
  </Button>
)}
</Box>

        </Box>
      </Box>

    </Box>
  );
};

export default AddReport;
