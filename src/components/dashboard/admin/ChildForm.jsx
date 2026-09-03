import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Box,
  Typography,
  Paper,
} from "@mui/material";
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { DataGrid, Button, BulkActionsBar } from "../../ui";
import DeleteConfirmationModal from "../../ui/DeleteConfirmationModal";
import { notify } from "../../../services/utils/authUtils";
import { useNavigate } from "react-router-dom";
import useRoleBase from "../../../hooks/useRoleBase";
import { fetchAllDedications, deleteDedication, updateDedicationStatus } from "../../../store/slices/childDedicationSlice";

const ChildForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { rolePath } = useRoleBase();
  const [searchTerm, setSearchTerm] = useState("");

  const { dedications, isLoading, error } = useSelector(
    (state) => state.childDedication,
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [selectionModel, setSelectionModel] = useState({ type: 'include', ids: new Set() });
  const [bulkAction, setBulkAction] = useState(null);

  const currentUser = useSelector((state) => state.auth?.user);
  const [actionId, setActionId] = useState(null);

  const rawRoles = currentUser?.roles || currentUser?.authorities || [];
  const roles = rawRoles.map((r) => (typeof r === "string" ? r : r?.name || r?.role || "")).filter(Boolean);
  const canManage = roles.includes("ADMIN") || roles.includes("SUPER_ADMIN");

  useEffect(() => {
    dispatch(fetchAllDedications());
  }, [dispatch]);

const [filtered, setFiltered] = useState([]);
useEffect(() => {
  let result = dedications || [];

  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();

    result = result.filter(
      (item) =>
        (item.childName && item.childName.toLowerCase().includes(term)) ||
        (item.parentName && item.parentName.toLowerCase().includes(term)) ||
        (item.campus && item.campus.toLowerCase().includes(term))
    );
  }

  setFiltered(result);
}, [dedications, searchTerm]);


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
    if (!formToDelete) return;
    const result = await dispatch(deleteDedication(formToDelete.id));
    if (result.meta.requestStatus === "fulfilled") {
      notify.success("Child dedication deleted successfully");
    } else {
      notify.error(result.payload?.message || "Failed to delete");
    }
    setDeleteModalOpen(false);
    setFormToDelete(null);
  };

  const handleApprove = async (row) => {
    setActionId(row.id);
    const result = await dispatch(updateDedicationStatus({ id: row.id, status: "Approved" }));
    setActionId(null);
    if (result.meta.requestStatus === "fulfilled") {
      notify.success("Child dedication approved successfully");
    } else {
      notify.error(result.payload?.message || "Failed to approve");
    }
  };

  const handleReject = async (row) => {
    const reason = prompt("Enter rejection reason (optional):");
    setActionId(row.id);
    const result = await dispatch(updateDedicationStatus({ id: row.id, status: "Rejected", rejectionReason: reason || null }));
    setActionId(null);
    if (result.meta.requestStatus === "fulfilled") {
      notify.success("Child dedication rejected");
    } else {
      notify.error(result.payload?.message || "Failed to reject");
    }
  };

  const paginated = useMemo(() => {
    const startIndex = page * pageSize;
    return filtered.slice(startIndex, startIndex + pageSize);
  }, [filtered, page, pageSize]);

  const selectAllActive = selectionModel.type === "exclude";
  const selectedIds = selectionModel.ids;
  const selectedDedications = selectAllActive
    ? filtered
    : filtered.filter((d) => selectedIds.has(d.id));

  const pendingSelected = selectedDedications.filter(
    (d) => (d.status || "").toLowerCase() !== "approved" &&
           (d.status || "").toLowerCase() !== "rejected",
  );

  const handleBulkAction = async (status) => {
    if (pendingSelected.length === 0) {
      notify.error("None of the selected certificates are pending approval.");
      return;
    }
    setBulkAction(status === "Approved" ? "approve" : "reject");
    let successCount = 0;
    let failCount = 0;
    for (const item of pendingSelected) {
      try {
        await dispatch(updateDedicationStatus({ id: item.id, status })).unwrap();
        successCount += 1;
      } catch {
        failCount += 1;
      }
    }
    setBulkAction(null);
    setSelectionModel({ type: 'include', ids: new Set() });
    dispatch(fetchAllDedications());
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
            Child Dedication Certificates
          </Typography>

          <Typography
            variant="body1"
            color="#6b7280"
            sx={{
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            View and manage all child dedication certificates
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
  onClick={() => navigate(rolePath("/admin/power-portal/child/createForm"))}
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

      {/* Bulk Actions */}
      {canManage && selectedDedications.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedDedications.length}
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
    renderCell: (params) => (
      <Typography sx={{ fontSize: 14, fontWeight: 400, color: "#62748E" }}>
        {params.value}
      </Typography>
    ),
  },
  {
    field: "childName",
    headerName: "Child's Name",
    width: 170,
    headerClassName: "travel-header",
    renderCell: (params) => (
      <Typography sx={{ fontSize: 14, fontWeight: 400, color: "#62748E" }}>
        {params.value}
      </Typography>
    ),
  },
  {
    field: "parentName",
    headerName: "Parent/Guardian",
    width: 150,
    headerClassName: "travel-header",
    renderCell: (params) => (
      <Typography sx={{ fontSize: 14, fontWeight: 400, color: "#62748E" }}>
        {params.value}
      </Typography>
    ),
  },
  {
    field: "dedicationDate",
    headerName: "Dedication Date",
    width: 150,
    headerClassName: "travel-header",
    renderCell: (params) => (
      <Typography sx={{ fontSize: 14, fontWeight: 400, color: "#90A1B9" }}>
        {params.value}
      </Typography>
    ),
  },
  {
    field: "campus",
    headerName: "Campus",
    width: 180,
    headerClassName: "travel-header",
    renderCell: (params) => (
      <Box display="flex" alignItems="center" gap={1}>
        <MapPin size={14} color="#90A1B9" />
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 400,
            color: "#45556C",
          }}
        >
          {params.value}
        </Typography>
      </Box>
    ),
  },
  {
    field: "minister",
    headerName: "Minister",
    width: 150,
    headerClassName: "travel-header",
    renderCell: (params) => (
      <Typography sx={{ fontSize: 14, fontWeight: 400, color: "#90A1B9" }}>
        {params.value}
      </Typography>
    ),
  },
  
  {
    field: "submitted",
    headerName: "Submitted",
    width: 170,
    headerClassName: "travel-header",
    renderCell: (params) => (
      <Typography sx={{ fontSize: 14, fontWeight: 400, color: "#62748E" }}>
        {params.value}
      </Typography>
    ),
  },
  {
    field: "status",
    headerName: "Status",
    width: 120,
    headerClassName: "travel-header",
    renderCell: (params) => {
      const val = params.value;
      const isApproved = val === "Approved";
      const isRejected = val === "Rejected";
      return (
        <Box
          sx={{
            px: 1.5,
            py: 0.6,
            borderRadius: "999px",
            border: `1px solid ${isApproved ? "#A4F4CFCC" : isRejected ? "#FECACA" : "#FEE685CC"}`,
            bgcolor: isApproved ? "#ECFDF5" : isRejected ? "#FEF2F2" : "#FFFBEB",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 500,
              color: isApproved ? "#007A55" : isRejected ? "#991B1B" : "#BB4D00",
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
    headerName: "Actions",
    width: 150,
    headerClassName: "travel-header",
    sortable: false,
    renderCell: (params) => (
      <Box display="flex" gap={1} alignItems="center">
        {canManage && (
          <>
            <CheckCircle2
              size={18}
              color="#008236"
              style={{ cursor: params.row.status === "Pending" ? "pointer" : "not-allowed", opacity: params.row.status === "Pending" ? 1 : 0.4 }}
              onClick={(e) => {
                if (params.row.status !== "Pending") return;
                e.stopPropagation();
                handleApprove(params.row);
              }}
            />
            <XCircle
              size={18}
              color="#D4183D"
              style={{ cursor: params.row.status === "Pending" ? "pointer" : "not-allowed", opacity: params.row.status === "Pending" ? 1 : 0.4 }}
              onClick={(e) => {
                if (params.row.status !== "Pending") return;
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
    ),
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
        onClose={() => { setDeleteModalOpen(false); setFormToDelete(null); }}
        onConfirm={confirmDelete}
        title="Delete Child Dedication Certificate"
        message={`Are you sure you want to delete child dedication certificate ${formToDelete?.certificateNumber || ""}? This action cannot be undone.`}
      />

    </Box>
  );
};

export default ChildForm;
