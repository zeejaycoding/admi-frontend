import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Plus, Edit, Trash2, MapPin, Search, CheckCircle2, XCircle } from "lucide-react";

import { DataGrid, Button, BulkActionsBar } from "../../ui";
import DeleteConfirmationModal from "../../ui/DeleteConfirmationModal";
import { notify } from "../../../services/utils/authUtils";
import { useNavigate } from "react-router-dom";
import useRoleBase from "../../../hooks/useRoleBase";
import {
  fetchAllCertificates,
  deleteCertificate,
  updateMarriageStatus,
} from "../../../store/slices/marriageCertificateSlice";

const MarriageForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { rolePath } = useRoleBase();
  const [searchTerm, setSearchTerm] = useState("");
  const currentUser = useSelector((state) => state.auth?.user);
  const [actionId, setActionId] = useState(null);

  const { certificates, isLoading } = useSelector(
    (state) => state.marriageCertificate,
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [selectionModel, setSelectionModel] = useState({ type: 'include', ids: new Set() });
  const [bulkAction, setBulkAction] = useState(null);

  const rawRoles = currentUser?.roles || currentUser?.authorities || [];
  const roles = rawRoles.map((r) => (typeof r === "string" ? r : r?.name || r?.role || "")).filter(Boolean);
  const canManage = roles.includes("ADMIN") || roles.includes("SUPER_ADMIN");

  useEffect(() => {
    dispatch(fetchAllCertificates());
  }, [dispatch]);

  const marriageData = useMemo(
    () =>
      certificates.map((c) => ({
        id: c.id,
        certificateNumber: c.certificateNumber,
        partner1: c.groomName,
        partner2: c.brideName,
        marriageDate: c.marriageDate,
        campus: c.campus,
        minister: c.minister,
        submitted: c.submitted,
        status: c.status,
      })),
    [certificates],
  );

  const [filtered, setFiltered] = useState(marriageData);

  useEffect(() => {
    let result = marriageData;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();

      result = marriageData.filter(
        (item) =>
          item.certificateNumber.toLowerCase().includes(term) ||
          item.partner1.toLowerCase().includes(term) ||
          item.partner2.toLowerCase().includes(term) ||
          item.marriageDate.toLowerCase().includes(term) ||
          item.campus.toLowerCase().includes(term) ||
          item.minister.toLowerCase().includes(term) ||
          item.submitted.toLowerCase().includes(term) ||
          item.status.toLowerCase().includes(term),
      );
    }

    setFiltered(result);
  }, [searchTerm, marriageData]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setPage(0);
  };

  const handleDeleteForm = (form) => {
    setFormToDelete(form);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteCertificate(formToDelete.id)).unwrap();
      notify.success("Marriage certificate deleted successfully.");
    } catch (err) {
      notify.error("Failed to delete the marriage certificate.");
    } finally {
      setDeleteModalOpen(false);
      setFormToDelete(null);
    }
  };

  const handleApprove = async (cert) => {
    setActionId(cert.id);
    const result = await dispatch(updateMarriageStatus({ id: cert.id, status: "Approved" }));
    setActionId(null);
    if (result.meta.requestStatus === "fulfilled") {
      notify.success("Marriage certificate approved successfully.");
    } else {
      notify.error("Failed to approve the marriage certificate.");
    }
  };

  const handleReject = async (cert) => {
    const reason = prompt("Enter rejection reason (optional):");
    setActionId(cert.id);
    const result = await dispatch(updateMarriageStatus({ id: cert.id, status: "Rejected", rejectionReason: reason || null }));
    setActionId(null);
    if (result.meta.requestStatus === "fulfilled") {
      notify.success("Marriage certificate rejected.");
    } else {
      notify.error("Failed to reject the marriage certificate.");
    }
  };

  const paginated = useMemo(() => {
    const startIndex = page * pageSize;
    return filtered.slice(startIndex, startIndex + pageSize);
  }, [filtered, page, pageSize]);

  const selectAllActive = selectionModel.type === "exclude";
  const selectedIds = selectionModel.ids;
  const selectedCertificates = selectAllActive
    ? filtered
    : filtered.filter((c) => selectedIds.has(c.id));

  const pendingSelected = selectedCertificates.filter(
    (c) => (c.status || "").toLowerCase() !== "approved" &&
           (c.status || "").toLowerCase() !== "rejected",
  );

  const handleBulkAction = async (status) => {
    if (pendingSelected.length === 0) {
      notify.error("None of the selected certificates are pending approval.");
      return;
    }
    setBulkAction(status === "Approved" ? "approve" : "reject");
    let successCount = 0;
    let failCount = 0;
    for (const cert of pendingSelected) {
      try {
        await dispatch(updateMarriageStatus({ id: cert.id, status })).unwrap();
        successCount += 1;
      } catch {
        failCount += 1;
      }
    }
    setBulkAction(null);
    setSelectionModel({ type: 'include', ids: new Set() });
    dispatch(fetchAllCertificates());
    if (successCount > 0) {
      notify.success(`${successCount} certificate(s) ${status.toLowerCase()}.`);
    }
    if (failCount > 0) {
      notify.error(`${failCount} certificate(s) failed to update.`);
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
            onClick={() => navigate(rolePath("/admin/power-portal/marriage/createForm"))}
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

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mb: 3,
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: "908px",
            minHeight: "181px",
            borderRadius: "10px",
            border: "1px solid #BEDBFF",
            background: "linear-gradient(90deg, #EFF6FF 0%, #FAF5FF 100%)",
            p: 3,
          }}
        >
          <Typography
            sx={{
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: "16px",
              color: "#1C398E",
              mb: 3,
            }}
          >
            ✨ Email Features:
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr",
              },
              rowGap: 2,
              columnGap: 5,
            }}
          >
            <Typography
              sx={{
                fontFamily: "Inter",
                fontWeight: 400,
                fontSize: "14px",
                color: "#193CB8",
              }}
            >
              ✅ Professional HTML template with PowerCity branding
            </Typography>

            <Typography
              sx={{
                fontFamily: "Inter",
                fontWeight: 400,
                fontSize: "14px",
                color: "#193CB8",
              }}
            >
              ✅ Full certificate embedded in email (no attachments needed)
            </Typography>

            <Typography
              sx={{
                fontFamily: "Inter",
                fontWeight: 400,
                fontSize: "14px",
                color: "#193CB8",
              }}
            >
              ✅ Mobile-friendly and print-ready design
            </Typography>

            <Typography
              sx={{
                fontFamily: "Inter",
                fontWeight: 400,
                fontSize: "14px",
                color: "#193CB8",
              }}
            >
              ✅ Biblical verse and official signatures included
            </Typography>

            <Typography
              sx={{
                fontFamily: "Inter",
                fontWeight: 400,
                fontSize: "14px",
                color: "#193CB8",
              }}
            >
              ✅ Automatic delivery to both partners
            </Typography>

            <Typography
              sx={{
                fontFamily: "Inter",
                fontWeight: 400,
                fontSize: "14px",
                color: "#193CB8",
              }}
            >
              ✅ Preview before sending
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} color="#000000" />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              height: 48,
              borderRadius: "10px",
              backgroundColor: "#FFFFFF",

              "& fieldset": {
                borderColor: "#E5E7EB",
              },

              "&:hover fieldset": {
                borderColor: "#D1D5DB",
              },

              "&.Mui-focused fieldset": {
                borderColor: "#011A5A",
              },
            },

            "& input::placeholder": {
              color: "#474C59",
              opacity: 1,
              fontSize: 14,
            },
          }}
        />
      </Box>

      {/* Bulk Actions */}
      {canManage && selectedCertificates.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedCertificates.length}
          pendingCount={pendingSelected.length}
          itemLabel="certificates"
          loading={!!bulkAction}
          approving={bulkAction === "approve"}
          rejecting={bulkAction === "reject"}
          onApprove={() => handleBulkAction("Approved")}
          onReject={() => handleBulkAction("Rejected")}
          onClear={() => setSelectionModel({ type: 'include', ids: new Set() })}
        />
      )}

      {/* reports DataGrid */}
      <Paper
        elevation={2}
        sx={{
          width: "100%",
          overflow: "hidden",
          borderRadius: 2,
          backgroundColor: "white",
        }}
      >
        <DataGrid
          key={`child-${filtered.length}-${searchTerm}-${page}`}
          rows={paginated}
          getRowId={(row) => row.id}
          rowCount={filtered.length}
          paginationMode="client"
          {...(canManage
            ? {
                checkboxSelection: true,
                disableRowSelectionOnClick: true,
                rowSelectionModel: selectionModel,
                onRowSelectionModelChange: (ids) => setSelectionModel(ids),
              }
            : {})}
          columns={[
            {
              field: "certificateNumber",
              headerName: "Certificate #",
              width: 150,
              headerClassName: "travel-header",
            },
            {
              field: "partner1",
              headerName: "Partner 1",
              width: 170,
              headerClassName: "travel-header",
            },
            {
              field: "partner2",
              headerName: "Partner 2",
              width: 170,
              headerClassName: "travel-header",
            },
            {
              field: "marriageDate",
              headerName: "Marriage Date",
              width: 160,
              headerClassName: "travel-header",
            },
            {
              field: "campus",
              headerName: "Campus",
              width: 180,
              headerClassName: "travel-header",
              renderCell: (params) => (
                <Box display="flex" alignItems="center" gap={1}>
                  <MapPin size={14} color="#90A1B9" />
                  <Typography sx={{ fontSize: 14, color: "#45556C" }}>
                    {params.value}
                  </Typography>
                </Box>
              ),
            },
            {
              field: "minister",
              headerName: "Minister",
              width: 180,
              headerClassName: "travel-header",
            },
            {
              field: "submitted",
              headerName: "Submitted",
              width: 150,
              headerClassName: "travel-header",
            },
            {
              field: "status",
              headerName: "Status",
              width: 140,
              headerClassName: "travel-header",
              renderCell: (params) => {
                const val = params.value;
                const isSent = val === "Sent";
                const isPending = val === "Pending";
                const isApproved = val === "Approved";
                const isRejected = val === "Rejected";

                return (
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.6,
                      borderRadius: "999px",
                      border: `1px solid ${
                        isApproved
                          ? "#A4F4CFCC"
                          : isRejected
                            ? "#FECACA"
                            : isSent
                              ? "#A4F4CFCC"
                              : "#FEE685CC"
                      }`,
                      bgcolor: isApproved
                        ? "#ECFDF5"
                        : isRejected
                          ? "#FEF2F2"
                          : isSent
                            ? "#ECFDF5"
                            : "#FFFBEB",
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: isApproved
                          ? "#007A55"
                          : isRejected
                            ? "#991B1B"
                            : isSent
                              ? "#007A55"
                              : "#BB4D00",
                      }}
                    >
                      {val}
                    </Typography>
                  </Box>
                );
              },
            },
            {
              field: "actions",
              headerName: "Action",
              width: 150,
              sortable: false,
              headerClassName: "travel-header",
              renderCell: (params) => {
                const st = params.row.status;
                const actionable = st === "Sent" || st === "Pending";
                return (
                <Box display="flex" gap={1} alignItems="center">
                  {canManage && (
                    <>
                      <CheckCircle2
                        size={18}
                        color="#008236"
                        style={{ cursor: actionable ? "pointer" : "not-allowed", opacity: actionable ? 1 : 0.4 }}
                        onClick={(e) => {
                          if (!actionable) return;
                          e.stopPropagation();
                          handleApprove(params.row);
                        }}
                      />
                      <XCircle
                        size={18}
                        color="#D4183D"
                        style={{ cursor: actionable ? "pointer" : "not-allowed", opacity: actionable ? 1 : 0.4 }}
                        onClick={(e) => {
                          if (!actionable) return;
                          e.stopPropagation();
                          handleReject(params.row);
                        }}
                      />
                    </>
                  )}
                  <Edit
                    size={16}
                    color="#374151"
                    style={{ cursor: "pointer" }}
                  />
                  <Trash2
                    size={16}
                    color="#DC2626"
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteForm(params.row);
                    }}
                  />
                </Box>
                );
              },
            },
          ]}
          loading={isLoading}
          pagination
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={(model) => {
            if (model.pageSize !== pageSize) {
              setPageSize(model.pageSize);
              setPage(0);
            } else {
              setPage(model.page);
            }
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          sx={{
            height: 650,

            "& .travel-header": {
              backgroundColor: "#F5F6FA",
              color: "#19191A",
              fontSize: "16px",
              fontWeight: 500,
              borderBottom: "1px solid #EBEDF0",
            },

            "& .travel-header .MuiDataGrid-columnHeaderTitle": {
              color: "#19191A",
              fontSize: "16px",
              fontWeight: 500,
            },

            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#F5F6FA !important",
              borderBottom: "1px solid #EBEDF0",
            },

            "& .MuiDataGrid-columnHeader": {
              backgroundColor: "#F5F6FA !important",
              borderBottom: "1px solid #EBEDF0",
            },

            "& .MuiDataGrid-columnHeaderTitle": {
              color: "#19191A",
              fontWeight: 500,
              fontSize: "16px",
            },

            "& .MuiDataGrid-columnSeparator": {
              display: "none",
            },

            "& .MuiDataGrid-iconSeparator": {
              display: "none",
            },

            "& .MuiDataGrid-row": {
              cursor: "pointer",
              borderBottom: "1px solid #F1F5F9",
            },

            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #F1F5F9",
              display: "flex",
              alignItems: "center",
              fontSize: 14,
              paddingLeft: "16px",
            },

            "& .MuiDataGrid-footerContainer": {
              borderTop: "1px solid #EBEDF0",
            },
          }}
        />
      </Paper>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setFormToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Marriage Certificate"
        message={`Are you sure you want to delete marriage certificate ${formToDelete?.certificateNumber || ""}? This action cannot be undone.`}
      />
    </Box>
  );
};

export default MarriageForm;
