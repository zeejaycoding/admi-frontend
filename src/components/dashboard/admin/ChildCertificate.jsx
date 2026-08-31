import React, { useRef, useEffect, useState } from "react";
import { Box, Typography, Button, TextField } from "@mui/material";
import { useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Printer, Download , LucideMail,} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import childCertificateImg from "../../../assets/childcertificate.png";
import { getDedicationById, clearSelected } from "../../../store/slices/childDedicationSlice";
import childDedicationService from "../../../services/api/childDedicationService";
import { notify } from "../../../services/utils/authUtils";
import Modal from "../../ui/Modal";

const IMG_W = 1177;
const IMG_H = 849;

const ChildCertificate = () => {
  const { state } = useLocation();
  const { id } = useParams();
  const dispatch = useDispatch();
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const { selectedDedication } = useSelector((state) => state.childDedication);
  const reportRef = useRef(null);

  const certificate = state?.certificate || selectedDedication;

  useEffect(() => {
    if (!certificate && id) {
      dispatch(getDedicationById(id));
    }
    return () => { dispatch(clearSelected()); };
  }, [id, dispatch]);

  const handlePrint = () => {
    window.print();
  };

  const openEmailModal = () => {
    const certId = certificate?.id || id;
    if (!certId) {
      notify.error("Certificate details are not available yet. Please try again.");
      return;
    }
    setRecipientEmail("");
    setEmailError("");
    setEmailModalOpen(true);
  };

  const closeEmailModal = () => {
    setEmailModalOpen(false);
    setEmailError("");
  };

  const handleSendEmail = async () => {
    const certId = certificate?.id || id;
    if (!certId) {
      notify.error("Certificate details are not available yet. Please try again.");
      return;
    }

    const email = recipientEmail.trim();
    if (!email) {
      setEmailError("Recipient email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setSendingEmail(true);
    try {
      await childDedicationService.sendEmail(certId, email);
      notify.success("Certificate sent via email successfully");
      setEmailModalOpen(false);
    } catch (err) {
      notify.error(err.response?.data?.message || "Failed to send certificate via email. Please try again.");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleDownloadPDF = async () => {
    const pdf = new jsPDF("l", "pt", [IMG_W, IMG_H]);
    pdf.addImage(childCertificateImg, "PNG", 0, 0, IMG_W, IMG_H);

    const name = certificate?.childName || "";
    if (name) {
      pdf.setFont("Times", "Italic");
      pdf.setFontSize(52);
      pdf.setTextColor(26, 26, 26);

      const textW = pdf.getTextWidth(name);
      const x = (IMG_W - textW) / 2;
      const y = IMG_H * 0.545;

      pdf.text(name, x, y);
    }

    const fileName = (certificate?.childName || "Child").replace(/\s+/g, "_") + "-dedication-certificate.pdf";
    pdf.save(fileName);
  };

  return (
    <Box>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
      <Box sx={{ p: 3, backgroundColor: "#f8fafc" }}>
        <Box sx={{ "@media print": { display: "none" } }}>
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
            <Box>
              <Typography variant="h4" fontWeight={700} sx={{ color: "#111827", mb: 0.5 }}>
                Child Dedication Certificate
              </Typography>
              <Typography sx={{ color: "#6B7280", fontSize: "15px" }}>
                Generate and access child dedication certificates on the portal
              </Typography>
            </Box>

            <Box display="flex" gap={1.5} flexWrap="wrap">
              <Button
                startIcon={<LucideMail size={16} />}
                disabled={sendingEmail}
                onClick={openEmailModal}
                sx={{
                  backgroundColor: "#011A5A",
                  color: "#FFFF",
                  borderRadius: "10px",
                  px: 2.5,
                  py: 1,
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { backgroundColor: "#011A5A" },
                }}
              >
                {sendingEmail ? "Sending..." : "Send via Email"}
              </Button>

              <Button
                startIcon={<Printer size={16} />}
                sx={{
                  backgroundColor: "#FFFFFF",
                  color: "#0A0A0A",
                  border: "1px solid #D1D5DB",
                  borderRadius: "10px",
                  px: 2.5,
                  py: 1,
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { backgroundColor: "#F9FAFB" },
                }}
                onClick={handlePrint}
              >
                Print
              </Button>

              <Button
                startIcon={<Download size={16} />}
                sx={{
                  backgroundColor: "#FFFFFF",
                  color: "#0A0A0A",
                  border: "1px solid #D1D5DB",
                  borderRadius: "10px",
                  px: 2.5,
                  py: 1,
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { backgroundColor: "#F9FAFB" },
                }}
                onClick={handleDownloadPDF}
              >
                Download PDF
              </Button>
            </Box>
          </Box>
        </Box>

        <Box
          ref={reportRef}
          id="print-area"
          sx={{
            position: "relative",
            width: "100%",
            maxWidth: "1000px",
            mx: "auto",
          }}
        >
          <Box
            component="img"
            src={childCertificateImg}
            alt="Child Dedication Certificate"
            sx={{
              display: "block",
              width: "100%",
              height: "auto",
            }}
          />

          <Typography
            sx={{
              position: "absolute",
              top: "54.5%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: { xs: "1.2rem", sm: "1.8rem", md: "2.2rem" },
              fontWeight: 700,
              color: "#1a1a1a",
              fontFamily: "'Times New Roman', serif",
              fontStyle: "italic",
              textAlign: "center",
              width: "75%",
            }}
          >
            {certificate?.childName || "_________________________"}
          </Typography>
        </Box>
      </Box>

      <Modal
        open={emailModalOpen}
        onClose={closeEmailModal}
        title="Send Certificate via Email"
        actions={
          <>
            <Button
              onClick={closeEmailModal}
              sx={{
                backgroundColor: "#E3E4E7",
                color: "#746B6B",
                px: 3,
                py: 1,
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                textTransform: "none",
                "&:hover": { backgroundColor: "#D7D8DC" },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={sendingEmail}
              sx={{
                backgroundColor: "#011A5A",
                color: "#FFFF",
                px: 3,
                py: 1,
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                textTransform: "none",
                "&:hover": { backgroundColor: "#011A5A" },
              }}
            >
              {sendingEmail ? "Sending..." : "Send"}
            </Button>
          </>
        }
      >
        <Typography sx={{ color: "#374151", fontSize: "14px", mb: 2 }}>
          Enter the email address where you would like to send the child dedication certificate for{" "}
          <strong>{certificate?.childName || "this child"}</strong>.
        </Typography>
        <TextField
          fullWidth
          type="email"
          variant="outlined"
          placeholder="recipient@example.com"
          value={recipientEmail}
          onChange={(e) => {
            setRecipientEmail(e.target.value);
            setEmailError("");
          }}
          error={!!emailError}
          helperText={emailError}
          InputProps={{
            sx: {
              bgcolor: "#F3F3F5",
              borderRadius: "8px",
              "& fieldset": { borderColor: "transparent" },
              "& input::placeholder": { color: "#717182", opacity: 1, fontSize: "14px" },
            },
          }}
        />
      </Modal>
    </Box>
  );
};

export default ChildCertificate;
