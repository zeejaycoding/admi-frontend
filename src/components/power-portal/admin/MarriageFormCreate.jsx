import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import marriageCertificateImg from "../../../assets/marriagecertificate.png";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  CheckCircle, FileText,
  User,
  Calendar,
  Send,
  Mail,
} from "lucide-react";
import campusService from "../../../services/api/campusService";
import { createCertificate } from "../../../store/slices/marriageCertificateSlice";
import { notify, formatBackendErrorMessage } from "../../../services/utils/authUtils";
import useCoordinatorCampus from "../../../hooks/useCoordinatorCampus";

const DEMO_CAMPUSES = [
  "Sanctuary Campus",
  "Hilltop Campus",
  "Riverside Campus",
  "Grace Campus",
];

const steps = [
  { label: "Fill Marriage Form", icon: FileText },
  { label: "Generate Certificate", icon: CheckCircle },
  { label: "Send to Couple", icon: Send },
];


const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const MarriageFormCreate = () => {
  const dispatch = useDispatch();
  const [activeStep, setActiveStep] = useState(0);
  const [campus, setCampus] = useState("");
  const [partner1Name, setPartner1Name] = useState("");
  const [partner1Email, setPartner1Email] = useState("");
  const [partner2Name, setPartner2Name] = useState("");
  const [partner2Email, setPartner2Email] = useState("");
  const [dateOfMarriage, setDateOfMarriage] = useState("");
  const [officiatingMinister, setOfficiatingMinister] = useState("");
  const [maidOfHonor, setMaidOfHonor] = useState("");
  const [bestMan, setBestMan] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [modalOpen, setModalOpen] = useState(true);
  const [additionalMessage, setAdditionalMessage] = useState("");
  const [certificateNumber, setCertificateNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [campuses, setCampuses] = useState([]);
  const { isCoordinator, campusName } = useCoordinatorCampus();
  const effectiveCampus = isCoordinator ? campusName || "" : campus;

  useEffect(() => {
    const loadCampuses = async () => {
      try {
        const res = await campusService.getAllCampuses({ size: 500 });
        const raw = res?.campuses || res?.content || res;
        const list = Array.isArray(raw) ? raw : [];
        const names = list.map((c) => (typeof c === "string" ? c : c?.name)).filter(Boolean);
        setCampuses(names.length > 0 ? names : DEMO_CAMPUSES);
      } catch (err) {
        setCampuses(DEMO_CAMPUSES);
      }
    };
    loadCampuses();
  }, []);


  const handleSubmit = async () => {
    if (
      !partner1Name.trim() ||
      !partner1Email.trim() ||
      !partner2Name.trim() ||
      !partner2Email.trim() ||
      !dateOfMarriage ||
      !effectiveCampus ||
      !officiatingMinister.trim()
    ) {
      notify.error("Please fill in all required fields before sending.");
      return;
    }

    const payload = {
      groomName: partner1Name.trim(),
      groomEmail: partner1Email.trim(),
      brideName: partner2Name.trim(),
      brideEmail: partner2Email.trim(),
      marriageDate: dateOfMarriage,
      campus: effectiveCampus,
      minister: officiatingMinister.trim(),
      maidOfHonor: maidOfHonor.trim(),
      bestMan: bestMan.trim(),
      subject: `Marriage Certificate - ${partner1Name.trim()} & ${partner2Name.trim()}`,
      additionalMessage: additionalMessage.trim(),
    };

    setSubmitting(true);
    const loadingToast = notify.info("Sending marriage certificate...");
    try {
      const result = await dispatch(createCertificate(payload)).unwrap();
      notify.dismiss(loadingToast);
      notify.success(
        `Marriage certificate ${result.certificateNumber} saved and sent to both partners.`
      );
      setCertificateNumber(result.certificateNumber || "");
      setModalOpen(false);
    } catch (err) {
      notify.dismiss(loadingToast);
      notify.error(
        formatBackendErrorMessage(err?.message || err) ||
          "Failed to send the marriage certificate."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
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

  const CertificatePreview = () => (
    <Box>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: "1000px",
          mx: "auto",
        }}
      >
        <Box
          component="img"
          src={marriageCertificateImg}
          alt="Marriage Certificate"
          sx={{
            display: "block",
            width: "100%",
            height: "auto",
          }}
        />

        {/* Bride and Groom */}
        <Typography
          sx={{
            position: "absolute",
            top: "42%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: { xs: "1.1rem", sm: "1.6rem", md: "2rem" },
            fontWeight: 700,
            color: "#1a1a1a",
            fontFamily: "'Times New Roman', serif",
            fontStyle: "italic",
            textAlign: "center",
            width: "80%",
          }}
        >
          {partner2Name} and {partner1Name}
        </Typography>

        {/* Date of Marriage */}
        <Typography
          sx={{
            position: "absolute",
            top: "55%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: { xs: "0.9rem", sm: "1.3rem", md: "1.6rem" },
            fontWeight: 600,
            color: "#1a1a1a",
            fontFamily: "'Times New Roman', serif",
            fontStyle: "italic",
            textAlign: "center",
            width: "60%",
          }}
        >
          {formatDate(dateOfMarriage)}
        </Typography>

        {/* Bride */}
        <Typography
          sx={{
            position: "absolute",
            top: "72%",
            left: "31%",
            transform: "translate(-50%, -50%)",
            fontSize: { xs: "0.9rem", sm: "1.3rem", md: "1.6rem" },
            fontWeight: 600,
            color: "#1a1a1a",
            fontFamily: "'Times New Roman', serif",
            fontStyle: "italic",
            textAlign: "center",
            width: "40%",
          }}
        >
          {partner2Name}
        </Typography>

        {/* Maid of Honor below Bride */}
        <Typography
          sx={{
            position: "absolute",
            top: "80%",
            left: "30%",
            transform: "translate(-50%, -50%)",
            fontSize: { xs: "0.8rem", sm: "1.1rem", md: "1.4rem" },
            fontWeight: 600,
            color: "#1a1a1a",
            fontFamily: "'Times New Roman', serif",
            fontStyle: "italic",
            textAlign: "center",
            width: "40%",
          }}
        >
          {maidOfHonor}
        </Typography>

        {/* Groom */}
        <Typography
          sx={{
            position: "absolute",
            top: "72%",
            left: "73%",
            transform: "translate(-50%, -50%)",
            fontSize: { xs: "0.9rem", sm: "1.3rem", md: "1.6rem" },
            fontWeight: 600,
            color: "#1a1a1a",
            fontFamily: "'Times New Roman', serif",
            fontStyle: "italic",
            textAlign: "center",
            width: "40%",
          }}
        >
          {partner1Name}
        </Typography>

        {/* Best Man below Groom */}
        <Typography
          sx={{
            position: "absolute",
            top: "80%",
            left: "75%",
            transform: "translate(-50%, -50%)",
            fontSize: { xs: "0.8rem", sm: "1.1rem", md: "1.4rem" },
            fontWeight: 600,
            color: "#1a1a1a",
            fontFamily: "'Times New Roman', serif",
            fontStyle: "italic",
            textAlign: "center",
            width: "40%",
          }}
        >
          {bestMan}
        </Typography>
      </Box>
    </Box>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box display="flex" flexDirection="column" gap={3}>
            <Box display="flex" flexDirection="column" gap={3}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 3,
                }}
              >
                <TextField
                  fullWidth
                  label="Groom Full Name *"
                  placeholder="Enter groom full name"
                  value={partner1Name}
                  onChange={(e) => setPartner1Name(e.target.value)}
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
                  type="email"
                  label="Groom Email *"
                  placeholder="Enter groom email"
                  value={partner1Email}
                  onChange={(e) => setPartner1Email(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail size={18} color="#6A7282" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 3,
                }}
              >
                <TextField
                  fullWidth
                  label="Bride Full Name *"
                  placeholder="Enter bride full name"
                  value={partner2Name}
                  onChange={(e) => setPartner2Name(e.target.value)}
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
                  type="email"
                  label="Bride Email *"
                  placeholder="Enter bride email"
                  value={partner2Email}
                  onChange={(e) => setPartner2Email(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail size={18} color="#6A7282" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <TextField
                fullWidth
                label="Date of Marriage *"
                type="date"
                value={dateOfMarriage}
                onChange={(e) => setDateOfMarriage(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Calendar size={18} color="#6A7282" />
                    </InputAdornment>
                  ),
                }}
              />

              {isCoordinator ? (
                <TextField
                  fullWidth
                  label="Campus"
                  value={effectiveCampus}
                  disabled
                  variant="outlined"
                />
              ) : (
              <FormControl fullWidth>
                <InputLabel>Campus *</InputLabel>
                <Select
                  label="Campus *"
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  sx={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                  }}
                >
                  {campuses.map((name) => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              )}

              <TextField
                fullWidth
                label="Officiating Minister *"
                placeholder="Enter officiating minister name"
                value={officiatingMinister}
                onChange={(e) => setOfficiatingMinister(e.target.value)}
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
                label="Maid of Honor"
                placeholder="Enter maid of honor name"
                value={maidOfHonor}
                onChange={(e) => setMaidOfHonor(e.target.value)}
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
                label="Best Man"
                placeholder="Enter best man name"
                value={bestMan}
                onChange={(e) => setBestMan(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <User size={18} color="#6A7282" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Email Notification Box */}
            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: "18px",
                backgroundColor: "#EFF6FF",
                border: "1px solid #BEDBFF",
                display: "flex",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: 2,
                mt: 1,
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "12px",
                  backgroundColor: "#155DFC",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Mail size={20} color="#FFFFFF" />
              </Box>

              <Checkbox
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                sx={{
                  p: 0,
                  mt: 0.5,
                  color: "#155DFC",
                  "&.Mui-checked": {
                    color: "#155DFC",
                  },
                }}
              />

              <Box>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontWeight: 500,
                    fontSize: "14px",
                    color: "#0A0A0A",
                  }}
                >
                  Send certificate via email to both partners
                </Typography>

                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontWeight: 500,
                    fontSize: "12px",
                    color: "#4A5565",
                    mt: 0.5,
                  }}
                >
                  Both partners will receive a copy of the marriage
                  certificate in PDF format
                </Typography>
              </Box>
            </Box>
          </Box>
        );

      case 1:
        return <CertificatePreview />;

      case 2:
        return (
          <Dialog
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                boxShadow: "0 4px 20px #0000001A",
              },
            }}
          >
            <DialogContent
              sx={{ p: { xs: 2, md: 3 }, pt: { xs: 2, md: 2.5 } }}
            >
              <Typography
                sx={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: "18px",
                  color: "#0A0A0A",
                  mb: 0.5,
                }}
              >
                Send Marriage Certificate via Email
              </Typography>

              <Typography
                sx={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 400,
                  fontSize: "13px",
                  color: "#717182",
                  mb: 2,
                }}
              >
                Send the marriage certificate to both partners via email. The
                certificate will be included in the email body.
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 3,
                  mb: 2.5,
                }}
              >
                <TextField
                  size="small"
                  label="Partner 1 Email *"
                  value={partner1Email}
                  onChange={(e) => setPartner1Email(e.target.value)}
                  fullWidth
                />
                <TextField
                  size="small"
                  label="Partner 2 Email *"
                  value={partner2Email}
                  onChange={(e) => setPartner2Email(e.target.value)}
                  fullWidth
                />
              </Box>

              <TextField
                size="small"
                label="Subject"
                value={`Marriage Certificate - ${partner1Name} & ${partner2Name}`}
                InputProps={{ readOnly: true }}
                fullWidth
                sx={{ mb: 2.5 }}
              />

              <TextField
                size="small"
                label="Additional Message (Optional)"
                value={additionalMessage}
                onChange={(e) => setAdditionalMessage(e.target.value)}
                multiline
                minRows={4}
                fullWidth
                sx={{ mb: 2.5 }}
              />

              <Box
                sx={{
                  backgroundColor: "#EFF6FF",
                  border: "1px solid #BEDBFF",
                  borderRadius: "12px",
                  p: 2,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    fontSize: "15px",
                    color: "#1C398E",
                    mb: 1,
                  }}
                >
                  Certificate Details
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Typography
                      sx={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                        fontSize: "13px",
                        color: "#193CB8",
                      }}
                    >
                      Certificate Number:
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 400,
                        fontSize: "13px",
                        color: "#193CB8",
                      }}
                    >
                      {certificateNumber}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Typography
                      sx={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                        fontSize: "13px",
                        color: "#193CB8",
                      }}
                    >
                      Couple:
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 400,
                        fontSize: "13px",
                        color: "#193CB8",
                      }}
                    >
                      {partner1Name} & {partner2Name}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Typography
                      sx={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                        fontSize: "13px",
                        color: "#193CB8",
                      }}
                    >
                      Campus:
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 400,
                        fontSize: "13px",
                        color: "#193CB8",
                      }}
                    >
                      {campus}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </DialogContent>

            <DialogActions
              sx={{
                p: { xs: 2, md: 3 },
                pt: 0,
                justifyContent: "flex-end",
                gap: 2,
              }}
            >
              <Button
                onClick={() => setModalOpen(false)}
                sx={{
                  color: "#6A7282",
                  backgroundColor: "#F3F4F6",
                  px: 3,
                  py: 1.1,
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "13px",
                  "&:hover": { backgroundColor: "#E5E7EB" },
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                sx={{
                  backgroundColor: "#011A5A",
                  color: "#fff",
                  px: 3,
                  py: 1.1,
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "13px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  "&:hover": { backgroundColor: "#011A5A" },
                  "&.Mui-disabled": {
                    backgroundColor: "#3B4C7E",
                    color: "#fff",
                  },
                }}
              >
                <Send size={16} color="#FFFFFF" />
                {submitting ? "Sending..." : "Send to Both Partners"}
              </Button>
            </DialogActions>
          </Dialog>
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
            Marriage Certificates
          </Typography>

          <Typography
            variant="body1"
            color="#6b7280"
            sx={{
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            View and manage all marriage certificates
          </Typography>
        </Box>
      </Box>

      <Box sx={{ p: { xs: 1, sm: 2, md: 4 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            mb: { xs: 4, sm: 5 },
            width: "100%",
            gap: { xs: 0.5, sm: 1, md: 2 },
            overflowX: "auto",
            pb: { xs: 1, sm: 0 },
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
                    minWidth: { xs: "70px", sm: "90px", md: "110px" },
                    flexShrink: 0,
                  }}
                  onClick={() => {
                    if (index <= activeStep) setActiveStep(index);
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 44, sm: 50, md: 56 },
                      height: { xs: 44, sm: 50, md: 56 },
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: active ? "#011A5A" : "#E5E7EB",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <Icon
                      size={24}
                      color={active ? "#FFFFFF" : "#6A7282"}
                      style={{ width: "50%", height: "50%" }}
                    />
                  </Box>

                  <Typography
                    sx={{
                      mt: 1.5,
                      fontSize: { xs: "11px", sm: "13px" },
                      fontWeight: 500,
                      color: active ? "#011A5A" : "#6A7282",
                      textAlign: "center",
                      maxWidth: { xs: "70px", sm: "90px", md: "110px" },
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
                      mt: { xs: "20px", sm: "24px", md: "28px" },
                      mx: { xs: 0.5, sm: 1 },
                      minWidth: "16px",
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
    flexWrap: "wrap",
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
      "&:hover": {
        backgroundColor: "#011A5A",
      },
    }}
  >
    {`Continue to ${nextStepLabel} ->`}
  </Button>
) : (
  <Button
    onClick={handleSubmit}
    sx={{
      backgroundColor: "#00A63E",
      color: "#fff",
      px: 4,
      py: 1.4,
      borderRadius: "12px",
      textTransform: "none",
      fontWeight: 600,
      "&:hover": {
        backgroundColor: "#00A63E",
      },
    }}
  >
    Send to Couple
  </Button>
)}
</Box>

        </Box>
      </Box>

    </Box>
  );
};

export default MarriageFormCreate;
