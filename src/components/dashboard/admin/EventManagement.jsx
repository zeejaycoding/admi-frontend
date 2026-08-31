import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  Paper,
  Chip,
} from "@mui/material";
import {
  Search,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Calendar,
  CheckCircle,
  XCircle,
  BookOpen,
  Filter,
  Users,
} from "lucide-react";

import { DataGrid, Button, StatsCard } from "../../ui";
import DeleteConfirmationModal from "../../ui/DeleteConfirmationModal";
import {
  fetchAllEvents,
  deleteEvent,
  clearError,
  clearSuccess,
  getEventAnalytics,
} from "../../../store/slices/eventSlice";
import { notify } from "../../../services/utils/authUtils";
import EventCreate from "../../events/admin/EventCreate";
import { useNavigate } from "react-router-dom";

const EventManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEvents, setFilteredEvents] = useState([]);
  const { events, analytics, isLoading, error } = useSelector((state) => state.event);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [statusFilter, setStatusFilter] = useState("all");

  const computedStats = useMemo(() => {
    const a = analytics || {};
    return {
      totalEvents: a.totalEvents || events.length || 0,
      activeEvents: a.activeEvents || events.filter((e) => e.isActive).length || 0,
      upcomingEvents: a.upcomingEvents || 0,
      completedEvents: a.completedEvents || 0,
    };
  }, [analytics, events]);

  useEffect(() => {
    dispatch(fetchAllEvents({}));
    dispatch(getEventAnalytics());
  }, [dispatch]);

  useEffect(() => {
    let filtered = events.filter((event) => event && event.title);

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          (event.title && event.title.toLowerCase().includes(term)) ||
          (event.location && event.location.toLowerCase().includes(term)) ||
          (event.createdBy && event.createdBy.toLowerCase().includes(term))
      );
    }

    if (statusFilter === "active") {
      filtered = filtered.filter((event) => event.isActive);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((event) => !event.isActive);
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, statusFilter]);

  const handleRefresh = () => {
    setSearchTerm("");
    setPage(0);
    dispatch(clearError());
    dispatch(clearSuccess());
    dispatch(fetchAllEvents({}));
    dispatch(getEventAnalytics());
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setPage(0);
  };

  const handleDeleteEvent = (event) => {
    setEventToDelete(event);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    try {
      await dispatch(deleteEvent(eventToDelete.id)).unwrap();
      dispatch(fetchAllEvents({}));
      dispatch(getEventAnalytics());
      setDeleteModalOpen(false);
      setEventToDelete(null);
      notify.success(`Event "${eventToDelete.title}" deleted successfully!`);
    } catch (error) {
      const msg =
        (error && (error.message || error.error)) ||
        "Failed to delete event. Please try again.";
      notify.error(msg);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setEventToDelete(null);
  };

  const handleCreateSuccess = () => {
    setCreateModalOpen(false);
    dispatch(fetchAllEvents({}));
    dispatch(getEventAnalytics());
  };

  const handleEditEvent = (event) => {
    notify.info("Event editing coming soon!");
  };

  const handleRowClick = (params) => {
    navigate(`/admin/events/${params.row.id}`, {
      state: { event: params.row },
    });
  };

  const paginatedEvents = useMemo(() => {
    const startIndex = page * pageSize;
    return filteredEvents.slice(startIndex, startIndex + pageSize);
  }, [filteredEvents, page, pageSize]);

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
      <Box sx={{ mb: { xs: 2, sm: 3 }, textAlign: "left" }}>
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
          Event Management
        </Typography>
        <Typography
          variant="body1"
          color="#6b7280"
          sx={{
            fontSize: { xs: "0.875rem", sm: "1rem" },
          }}
        >
          Manage events, registrations and details across the platform
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid
        container
        spacing={3}
        sx={{
          mb: 3,
          width: "100%",
          backgroundColor: "#F5F6FA !important",
          borderRadius: "14px",
          padding: "24px",
        }}
      >
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Events"
            value={computedStats.totalEvents}
            icon={Calendar}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Active Events"
            value={computedStats.activeEvents}
            icon={CheckCircle}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Upcoming Events"
            value={computedStats.upcomingEvents}
            icon={BookOpen}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Completed Events"
            value={computedStats.completedEvents}
            icon={Users}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Search and Actions */}
      <Paper
        elevation={1}
        sx={{
          mb: 3,
          p: 2,
          width: "100%",
          backgroundColor: "white",
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexDirection: { xs: "column", sm: "row" },
            width: "100%",
          }}
        >
          <TextField
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} style={{ color: "#6b7280" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              flex: 1,
              minWidth: 300,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
            size="small"
          />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: "auto",
              minWidth: "100px",
              height: "41px",
              px: 1.5,
              borderRadius: "8px",
              border: "1px solid #1f1f1f",
              backgroundColor: "#ffffff",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
            }}
          >
            <Filter size={16} color="#000" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                flex: 1,
                minWidth: 0,
                background: "transparent",
                color: "#000",
                border: "none",
                outline: "none",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </Box>

          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => setCreateModalOpen(true)}
            size="small"
            sx={{
              backgroundColor: "#011A5A",
              color: "white",
              px: 3,
              py: 1,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#011A5A",
              },
            }}
          >
            Add Event
          </Button>
        </Box>
      </Paper>

      {/* Error Display */}
      {error && (
        <Paper
          elevation={2}
          sx={{
            mb: 3,
            backgroundColor: "#fee2e2",
            border: "1px solid #dc2626",
            borderRadius: 2,
            width: "100%",
          }}
        >
          <Typography
            color="#dc2626"
            sx={{
              p: 2,
              textAlign: "center",
              fontWeight: 500,
            }}
          >
            Error: {typeof error === "string" ? error : error.message || "An error occurred"}
          </Typography>
        </Paper>
      )}

      {/* Events DataGrid */}
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
          key={`events-${filteredEvents.length}-${searchTerm}-${page}`}
          rows={paginatedEvents}
          onRowClick={handleRowClick}
          getRowId={(row) => row.id}
          rowCount={filteredEvents.length}
          paginationMode="client"
          columns={[
            {
              field: "checkbox",
              headerName: "",
              width: 50,
              sortable: false,
              disableColumnMenu: true,
              renderHeader: () => <input type="checkbox" />,
              renderCell: () => <input type="checkbox" />,
            },
            {
              field: "title",
  headerName: "Event",
  flex: 1.5,
  minWidth: 260,
  headerAlign: "left",
              renderCell: (params) => (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1 }}>
      <Box
        component="img"
        src={params.row.thumbnailUrl || ""}
        alt=""
        sx={{
          width: 44,
          height: 44,
          borderRadius: 1.5,
          objectFit: "cover",
          flexShrink: 0,
          backgroundColor: "#f0f0f0",
          display: params.row.thumbnailUrl ? "block" : "none",
        }}
      />
      {!params.row.thumbnailUrl && (
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 1.5,
            backgroundColor: "#e5e7eb",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            color: "#9ca3af",
          }}
        >
          <Calendar size={20} />
        </Box>
      )}
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3, color: "#111827" }}>
          {params.row.title || "—"}
        </Typography>
        <Typography sx={{ fontSize: 12, color: "#6b7280", mt: 0.3 }}>
          Created by {params.row.organizerName || params.row.createdBy || "—"}
        </Typography>
      </Box>
    </Box>

              ),
            },
            {
              field: "date",
              headerName: "Date",
              width: 140,
              headerAlign: "center",
              renderCell: (params) => (
                <Typography>{params.value || params.row.eventDate || "—"}</Typography>
              ),
            },
            {
              field: "location",
              headerName: "Location",
              flex: 1,
              minWidth: 180,
              headerAlign: "center",
              renderCell: (params) => (
                <Typography>{params.value || "—"}</Typography>
              ),
            },
            {
              field: "status",
              headerName: "Status",
              width: 120,
              headerAlign: "center",
              renderCell: (params) => (
                <Chip
                  label={params.value || (params.row.isActive ? "Active" : "Inactive")}
                  size="small"
                  color={
                    (params.value === "Active" || params.row.isActive)
                      ? "success"
                      : "error"
                  }
                  sx={{ fontSize: "0.75rem", fontWeight: 600 }}
                />
              ),
            },
            {
              field: "createdBy",
              headerName: "Created By",
              width: 160,
              headerAlign: "center",
              renderCell: (params) => (
                <Typography sx={{ fontWeight: 600 }}>
                  {params.value || "—"}
                </Typography>
              ),
            },
            {
              field: "actions",
              headerName: "Actions",
              width: 160,
              headerAlign: "center",
              renderCell: (params) => (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Edit
                    size={16}
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditEvent(params.row);
                    }}
                  />
                  <Trash2
                    size={16}
                    style={{ cursor: "pointer", color: "red" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEvent(params.row);
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
          getRowClassName={(params) =>
            !params.row.isActive ? "inactive-event" : ""
          }
          sx={{
            height: 600,
            "& .MuiDataGrid-row": {
              cursor: "pointer",
            },
            "& .MuiDataGrid-columnHeaders": {
              borderBottom: "none",
            },
            "& .MuiDataGrid-columnHeader": {
              borderRight: "none !important",
              outline: "none",
            },
            "& .MuiDataGrid-columnHeaderTitleContainer": {
              borderRight: "none !important",
            },
            "& .MuiDataGrid-iconSeparator": {
              display: "none !important",
            },
            "& .MuiDataGrid-columnSeparator": {
              display: "none !important",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "none",
              outline: "none",
            },
            "& .MuiDataGrid-row": {
              borderBottom: "none",
            },
            "& .inactive-event": {
              backgroundColor: "#fef2f2",
              "&:hover": {
                backgroundColor: "#fee2e2",
              },
            },
          }}
        />
      </Paper>

      {/* Create Event Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <EventCreate
              onSuccess={handleCreateSuccess}
              onCancel={() => setCreateModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Event"
        message="This will deactivate the event. You can reactivate it later."
        itemName={eventToDelete?.title}
        isLoading={isLoading}
      />
    </Box>
  );
};

export default EventManagement;
