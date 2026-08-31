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
} from "lucide-react";

import { DataGrid, Button } from "../../ui";
import DeleteConfirmationModal from "../../ui/DeleteConfirmationModal";
import {
  fetchAllTravelForms,
  deleteTravelForm,
} from "../../../store/slices/travelFormSlice";
import { notify } from "../../../services/utils/authUtils";
import { useNavigate } from "react-router-dom";

const TravellingForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filtered, setFiltered] = useState([]);
  const { travelForms, isLoading, error } = useSelector(
    (state) => state.travelForm,
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    dispatch(fetchAllTravelForms());
  }, [dispatch]);

  useEffect(() => {
    let result = travelForms;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (f) =>
          f.submitter?.toLowerCase().includes(term) ||
          f.country?.toLowerCase().includes(term) ||
          f.campus?.toLowerCase().includes(term),
      );
    }
    setFiltered(result);
  }, [travelForms, searchTerm]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setPage(0);
  };

  const handleRowClick = (params) => {
    navigate(`/admin/travel/${params.row.id}`, {
      state: { travelForm: params.row },
    });
  };

  const handleDeleteForm = (form) => {
    setFormToDelete(form);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!formToDelete) return;
    await dispatch(deleteTravelForm(formToDelete.id));
    setDeleteModalOpen(false);
    setFormToDelete(null);
  };

  const paginated = useMemo(() => {
    const startIndex = page * pageSize;
    return filtered.slice(startIndex, startIndex + pageSize);
  }, [filtered, page, pageSize]);


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
          key={`travel-${filtered.length}-${searchTerm}-${page}`}
          rows={paginated}
          onRowClick={handleRowClick}
          getRowId={(row) => row.id}
          rowCount={filtered.length}

          paginationMode="client"
         columns={[
  {
    field: "id",
    headerName: "ID",
    width: 90,
    headerClassName: "travel-header",
    renderCell: (params) => (
      <Typography sx={{ fontSize: 14, fontWeight: 400, color: "#62748E" }}>
        TRV-{String(params.value).padStart(5, "0")}
      </Typography>
    ),
  },
  {
    field: "submitter",
    headerName: "Submitter",
    width: 170,
    headerClassName: "travel-header",
    renderCell: (params) => (
      <Typography sx={{ fontSize: 14, fontWeight: 400, color: "#62748E" }}>
        {params.value}
      </Typography>
    ),
  },
  {
    field: "country",
    headerName: "Country",
    width: 150,
    headerClassName: "travel-header",
    renderCell: (params) => (
      <Typography sx={{ fontSize: 14, fontWeight: 400, color: "#62748E" }}>
        {params.value}
      </Typography>
    ),
  },
  {
    field: "travelDate",
    headerName: "Travel Date",
    width: 150,
    headerClassName: "travel-header",
    renderCell: (params) => (
      <Typography sx={{ fontSize: 14, fontWeight: 400, color: "#90A1B9" }}>
        {params.value}
      </Typography>
    ),
  },
  {
    field: "returnDate",
    headerName: "Return Date",
    width: 150,
    headerClassName: "travel-header",
    renderCell: (params) => (
      <Typography sx={{ fontSize: 14, fontWeight: 400, color: "#90A1B9" }}>
        {params.value}
      </Typography>
    ),
  },
  {
    field: "days",
    headerName: "Days",
    width: 90,
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
    field: "status",
    headerName: "Status",
    width: 140,
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
            border: `1px solid ${
              isApproved ? "#A4F4CFCC" : isRejected ? "#FECACA" : "#FEE685CC"
            }`,
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
    field: "actions",
    headerName: "Actions",
    width: 110,
    headerClassName: "travel-header",
    sortable: false,
    renderCell: (params) => (
      <Box display="flex" gap={1}>
        <Edit
          size={16}
          color="#374151"
          style={{ cursor: "pointer" }}
          onClick={(e) => {
            e.stopPropagation();
            notify.info("Editing coming soon!");
          }}
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
          page={page}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
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
        title="Delete Travel Form"
        message={`Are you sure you want to delete travel form TRV-${String(formToDelete?.id || "").padStart(5, "0")}? This action cannot be undone.`}
      />

    </Box>
  );
};

export default TravellingForm;
