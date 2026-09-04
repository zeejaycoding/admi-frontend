/* eslint-disable no-unused-vars */
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
  Clock,
  Wallet,
  MapPin,
  DollarSign,
  BriefcaseBusiness,
  Download,
} from "lucide-react";

import { DataGrid, Button, StatsCard, BulkActionsBar } from "../../ui";
import DeleteConfirmationModal from "../../ui/DeleteConfirmationModal";
import {
  fetchAllReports,
  deleteReport,
  updateReportStatus,
  clearError,
  clearSuccess,
  getReportAnalytics,
} from "../../../store/slices/reportSlice";
import { notify } from "../../../services/utils/authUtils";
import EditReport from "../../reports/admin/reportEdit";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { getCurrencyByCode, DEFAULT_CURRENCY } from "../../../constants/currencies";
import useRoleBase from "../../../hooks/useRoleBase";

const ReportManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { rolePath } = useRoleBase();
  const currentUser = useSelector((state) => state.auth?.user);
  const roles = (currentUser?.roles || currentUser?.authorities || [])
    .map((r) => (typeof r === "string" ? r : r?.name || r?.role || ""))
    .filter(Boolean);
  const canManage = roles.includes("ADMIN") || roles.includes("SUPER_ADMIN");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEvents, setFilteredEvents] = useState([]);
  const { reports, analytics, isLoading, error } = useSelector(
    (state) => state.report,
  );
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [reportToEdit, setReportToEdit] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectionModel, setSelectionModel] = useState({ type: 'include', ids: new Set() });
  const [bulkAction, setBulkAction] = useState(null);

  const handleExportExcel = () => {
    const exportData = filteredEvents.map((report) => {
      const sym = getCurrencyByCode(report.currency || DEFAULT_CURRENCY).symbol;
      return {
        Date: report.date || "—",
        Country: report.country || "—",
        "Submitted By": report.submittedBy || "—",
        "National Leader": report.nationalLeader || "—",
        Campus: report.campus || "—",
        Coordinator: report.coordinator || "—",
        Currency: report.currency || DEFAULT_CURRENCY,
        Income: `${sym}${report.income ?? 0}`,
        Expenditure: `${sym}${report.expenditure ?? 0}`,
        Balance: `${sym}${report.balance ?? 0}`,
        Status: report.status || "Pending",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(fileData, "reports.xlsx");
  };
  const getRowSymbol = (row) => getCurrencyByCode(row.currency || DEFAULT_CURRENCY).symbol;

  const computedTotals = useMemo(() => {
    if (analytics) {
      return {
        totalIncome: analytics.totalIncome || 0,
        totalExpenditure: analytics.totalExpenditure || 0,
        totalBalance: analytics.totalBalance || 0,
      };
    }
    const totalIncome = reports.reduce((sum, r) => sum + (Number(r.income) || 0), 0);
    const totalExpenditure = reports.reduce((sum, r) => sum + (Number(r.expenditure) || 0), 0);
    return {
      totalIncome,
      totalExpenditure,
      totalBalance: totalIncome - totalExpenditure,
    };
  }, [reports, analytics]);

  const reportCurrency = reports.find((r) => r.currency)?.currency || DEFAULT_CURRENCY;

  const formatMoney = (val) => {
    const symbol = getCurrencyByCode(reportCurrency).symbol;
    return `${symbol}${Number(val || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  useEffect(() => {
    dispatch(fetchAllReports());
    dispatch(getReportAnalytics());
  }, [dispatch]);

  useEffect(() => {
    let filtered = reports;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();

      filtered = filtered.filter(
        (report) =>
          report.country?.toLowerCase().includes(term) ||
          report.nationalLeader?.toLowerCase().includes(term) ||
          report.campus?.toLowerCase().includes(term) ||
          report.coordinator?.toLowerCase().includes(term) ||
          report.submittedBy?.toLowerCase().includes(term),
      );
    }
    if (statusFilter === "approved") {
      filtered = filtered.filter(
        (report) => report.status?.toLowerCase() === "approved",
      );
    } else if (statusFilter === "rejected") {
      filtered = filtered.filter(
        (report) => report.status?.toLowerCase() === "rejected",
      );
    } else if (statusFilter === "pending") {
      filtered = filtered.filter(
        (report) => report.status?.toLowerCase() === "pending",
      );
    }

    setFilteredEvents(filtered);
  }, [reports, searchTerm, statusFilter]);

  const handleRefresh = () => {
    setSearchTerm("");
    setPage(0);
    dispatch(clearError());
    dispatch(clearSuccess());
    dispatch(fetchAllReports());
    dispatch(getReportAnalytics());
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
      await dispatch(deleteReport(eventToDelete.id)).unwrap();
      dispatch(fetchAllReports());
      dispatch(getReportAnalytics());
      setDeleteModalOpen(false);
      setEventToDelete(null);
      notify.success(`Report deleted successfully!`);
    } catch (error) {
      notify.error("Failed to delete report. Please try again.");
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setEventToDelete(null);
  };

  const handleCreateSuccess = () => {
    setCreateModalOpen(false);
    dispatch(fetchAllReports());
    dispatch(getReportAnalytics());
  };

  const handleEditEvent = (event) => {
    setReportToEdit(event);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    setReportToEdit(null);
    dispatch(fetchAllReports());
    dispatch(getReportAnalytics());
  };

  const handleCancelEdit = () => {
    setEditModalOpen(false);
    setReportToEdit(null);
  };

  const handleRowClick = (params) => {
    navigate(rolePath(`/admin/reports/${params.row.id}`), {
      state: { report: params.row },
    });
  };
  const paginatedEvents = useMemo(() => {
    const startIndex = page * pageSize;
    return filteredEvents.slice(startIndex, startIndex + pageSize);
  }, [filteredEvents, page, pageSize]);

  const selectAllActive = selectionModel.type === "exclude";
  const selectedIds = selectionModel.ids;
  const selectedReports = selectAllActive
    ? filteredEvents
    : filteredEvents.filter((r) => selectedIds.has(r.id));
  const pendingSelected = selectedReports.filter(
    (r) => (r.status || "").toLowerCase() !== "approved" &&
           (r.status || "").toLowerCase() !== "rejected",
  );

  const handleBulkAction = async (status) => {
    const pending = pendingSelected;
    if (pending.length === 0) {
      notify.error("None of the selected reports are pending approval.");
      return;
    }
    setBulkAction(status === "Approved" ? "approve" : "reject");
    let successCount = 0;
    let failCount = 0;
    for (const report of pending) {
      try {
        await dispatch(updateReportStatus({ id: report.id, status })).unwrap();
        successCount += 1;
      } catch {
        failCount += 1;
      }
    }
    setBulkAction(null);
    setSelectionModel({ type: 'include', ids: new Set() });
    dispatch(fetchAllReports());
    dispatch(getReportAnalytics());
    if (successCount > 0) {
      notify.success(`${successCount} report(s) ${status.toLowerCase()}.`);
    }
    if (failCount > 0) {
      notify.error(`${failCount} report(s) failed to update.`);
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
            Reports Dashboard
          </Typography>

          <Typography
            variant="body1"
            color="#6b7280"
            sx={{
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            Coordinator submissions — partnership, honour & general offerings
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
          {/* Export Excel */}
          <Button
            startIcon={<Download size={18} />}
            onClick={handleExportExcel}
            sx={{
              backgroundColor: "#FFFFFF",
              color: "#111827",
              border: "1px solid #D1D5DB",
              px: 3,
              py: 1.2,
              borderRadius: "10px",
              fontWeight: 600,
              textTransform: "none",
              width: { xs: "100%", sm: "auto" },
              "&:hover": {
                backgroundColor: "#F9FAFB",
              },
            }}
          >
            Export Excel
          </Button>

          {/* New Report */}
<Button
  startIcon={<Plus size={18} />}
  onClick={() => navigate(rolePath("/admin/reports/create"))}
  sx={{
    backgroundColor: "#011A5A",
    color: "#FFFFFF",
    px: 3,
    py: 1.2,
    borderRadius: "10px",
    fontWeight: 600,
    textTransform: "none",
    width: { xs: "100%", sm: "auto" },
    "&:hover": {
      backgroundColor: "#011A5A",
    },
  }}
>
  New Report
</Button>
        </Box>
      </Box>

      <Box
        sx={{
          width: "100%",
          backgroundColor: "#E5F0FF",
          border: "1px solid #EBEDF0",
          borderRadius: "14px",
          p: { xs: 2, sm: 3 },
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 1,
          }}
        >
          <Clock size={20} color="#2982FF" />

          <Typography
            sx={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#000000",
            }}
          >
            Submission Window
          </Typography>
        </Box>

        <Typography
          sx={{
            fontSize: "14px",
            color: "#474C59",
            lineHeight: 1.7,
          }}
        >
          Every coordinator must submit their monthly report between the{" "}
          <Box component="span" sx={{ fontWeight: 700, color: "#111827" }}>
            first Sunday and Tuesday midnight
          </Box>{" "}
          of each month. Final cut-off is{" "}
          <Box component="span" sx={{ fontWeight: 700, color: "#111827" }}>
            12:00 AM across all timezones
          </Box>
          .
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(3, minmax(0, 1fr))",
          },
          gap: 3,
          width: "100%",
          mb: 3,
        }}
      >
        {[
          {
            title: "Total Income",
            value: formatMoney(computedTotals.totalIncome),
            change: "12.5%",
            positive: true,
            icon: Wallet,
            bg: "#D5FDF0",
            color: "#02C787",
          },
          {
            title: "Total Expenditure",
            value: formatMoney(computedTotals.totalExpenditure),
            change: "4.2%",
            positive: false,
            icon: DollarSign,
            bg: "#E7590D26",
            color: "#E7000B",
          },
          {
            title: "Total Balance",
            value: formatMoney(computedTotals.totalBalance),
            change: "8.1%",
            positive: true,
            icon: BriefcaseBusiness,
            bg: "#0DA2E726",
            color: "#0883BB",
          },
        ].map((card, index) => {
          const Icon = card.icon;

          return (
            <Box
              key={index}
              sx={{
                width: "100%",
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                border: "1px solid #EBEDF0",
                p: 3,
                minHeight: "140px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              {/* Top Row — title left, icon right */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  height: "52px",
                  width: "100%",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "15px",
                    fontWeight: 500,
                    color: "#474C59",
                  }}
                >
                  {card.title}
                </Typography>

                <Box
                  sx={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "10px",
                    backgroundColor: card.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} color={card.color} />
                </Box>
              </Box>

              {/* Value */}
              <Typography
                sx={{
                  fontSize: "30px",
                  fontWeight: 700,
                  color: "#111827",
                }}
              >
                {card.value}
              </Typography>

              {/* Change */}
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: card.positive ? "#02C787" : "#E7000B",
                }}
              >
                {card.positive ? "↑" : "↓"} {card.change} vs last week
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Bulk Actions */}
      {canManage && selectedReports.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedReports.length}
          pendingCount={pendingSelected.length}
          itemLabel="reports"
          loading={!!bulkAction}
          approving={bulkAction === "approve"}
          rejecting={bulkAction === "reject"}
          onApprove={() => handleBulkAction("Approved")}
          onReject={() => handleBulkAction("Rejected")}
          onClear={() => setSelectionModel({ type: 'include', ids: new Set() })}
        />
      )}

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
            placeholder="Search"
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
              minWidth: { xs: 0, sm: 300 },
              width: { xs: "100%", sm: "auto" },
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
              width: { xs: "100%", sm: "auto" },
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
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="pending">Pending</option>
            </select>
          </Box>
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
            Error:{" "}
            {typeof error === "string"
              ? error
              : error.message || "An error occurred"}
          </Typography>
        </Paper>
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
          key={`events-${filteredEvents.length}-${searchTerm}-${page}`}
          rows={paginatedEvents}
          onRowClick={handleRowClick}
          getRowId={(row) => row.id}
          rowCount={filteredEvents.length}
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
              field: "date",
              headerName: "Date",
              width: 140,
              align: "left",
              headerAlign: "left",
              renderCell: (params) => (
                <Typography
                  sx={{ fontSize: "14px", fontWeight: 400, color: "#90A1B9" }}
                >
                  {params.row.date || "—"}
                </Typography>
              ),
            },
            {
              field: "country",
              headerName: "Country",
              width: 150,
              align: "left",
              headerAlign: "left",
              renderCell: (params) => (
                <Typography
                  sx={{ fontSize: "14px", fontWeight: 400, color: "#62748E" }}
                >
                  {params.row.country || "—"}
                </Typography>
              ),
            },
            {
              field: "nationalLeader",
              headerName: "National Leader",
              width: 180,
              align: "left",
              headerAlign: "left",
              renderCell: (params) => (
                <Typography
                  sx={{ fontSize: "14px", fontWeight: 400, color: "#62748E" }}
                >
                  {params.row.nationalLeader || "—"}
                </Typography>
              ),
            },
            {
              field: "campus",
              headerName: "Campus",
              width: 190,
              renderCell: (params) => (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    justifyContent: "flex-start",
                    width: "100%",
                  }}
                >
                  <MapPin size={14} color="#90A1B9" />
                  <Typography sx={{ fontSize: "14px", color: "#45556C" }}>
                    {params.row.campus || "—"}
                  </Typography>
                </Box>
              ),
            },
            {
              field: "coordinator",
              headerName: "Coordinator",
              width: 170,
              align: "left",
              headerAlign: "left",
              renderCell: (params) => (
                <Typography
                  sx={{ fontSize: "14px", fontWeight: 400, color: "#62748E" }}
                >
                  {params.row.coordinator || "—"}
                </Typography>
              ),
            },
            {
              field: "submittedBy",
              headerName: "Submitted By",
              width: 170,
              align: "left",
              headerAlign: "left",
              renderCell: (params) => (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    justifyContent: "flex-start",
                    width: "100%",
                  }}
                >
                  <Users size={14} color="#90A1B9" />
                  <Typography
                    sx={{ fontSize: "14px", fontWeight: 400, color: "#45556C" }}
                  >
                    {params.row.submittedBy || "—"}
                  </Typography>
                </Box>
              ),
            },
            {
              field: "income",
              headerName: "Income",
              width: 120,
              align: "left",
              headerAlign: "left",

              renderCell: (params) => (
                <Typography
                  sx={{ fontSize: "14px", fontWeight: 400, color: "#62748E" }}
                >
                  {getRowSymbol(params.row)}{Number(params.row.income || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              ),
            },
            {
              field: "expenditure",
              headerName: "Expenditure",
              width: 140,
              align: "left",
              headerAlign: "left",
              renderCell: (params) => (
                <Typography
                  sx={{ fontSize: "14px", fontWeight: 400, color: "#62748E" }}
                >
                  {getRowSymbol(params.row)}{Number(params.row.expenditure || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              ),
            },
            {
              field: "balance",
              headerName: "Balance",
              width: 130,
              align: "left",
              headerAlign: "left",
              renderCell: (params) => {
                const balance = params.row.balance ?? 0;
                const isPositive = balance > 0;

                return (
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 400,
                      color: isPositive ? "#15B07C" : "#111827",
                    }}
                  >
                    {getRowSymbol(params.row)}{Number(balance).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                );
              },
            },

            {
              field: "status",
              headerName: "Status",
              width: 160,
              align: "left",
              headerAlign: "left",
              sortable: false,
              renderCell: (params) => {
                const status = (params.row.status || "Pending").toLowerCase();
                const isApproved = status === "approved";
                const isRejected = status === "rejected";

                const bgColor = isApproved ? "#ECFDF5" : isRejected ? "#FEF2F2" : "#FFFBEB";
                const dotColor = isApproved ? "#007A55" : isRejected ? "#B91C1C" : "#BB4D00";
                const textColor = isApproved ? "#007A55" : isRejected ? "#B91C1C" : "#BB4D00";
                const label = isApproved ? "Approved" : isRejected ? "Rejected" : "Pending";

                return (
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      px: 1.5,
                      py: 0.7,
                      borderRadius: "999px",
                      backgroundColor: bgColor,
                      width: "fit-content",
                      minWidth: "110px",
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: dotColor,
                      }}
                    />

                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 400,
                        color: textColor,
                      }}
                    >
                      {label}
                    </Typography>
                  </Box>
                );
              },
            },
            {
              field: "actions",
              headerName: "Actions",
              width: 120,
              sortable: false,
              filterable: false,
              align: "left",
              headerAlign: "left",
              renderCell: (params) => (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    height: "100%",
                  }}
                >
                  {/* Edit */}
                  <Box
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditEvent(params.row);
                    }}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: "#F3F4F6",
                      },
                    }}
                  >
                    <Edit size={16} color="#374151" />
                  </Box>

                  {/* Delete */}
                  <Box
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEvent(params.row);
                    }}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: "#FEF2F2",
                      },
                    }}
                  >
                    <Trash2 size={16} color="#DC2626" />
                  </Box>
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
            height: 600,
            "& .MuiDataGrid-row": {
              cursor: "pointer",
            },

            "& .MuiDataGrid-cell": {
              borderBottom: "none",
              outline: "none",
              justifyContent: "flex-start !important",
              textAlign: "left !important",
              paddingLeft: "16px",
            },

            "& .MuiDataGrid-columnHeaderTitle": {
              textAlign: "left",
              width: "100%",
            },

            "& .MuiDataGrid-columnHeaders": {
              borderBottom: "none",
            },
            "& .MuiDataGrid-columnHeader": {
              borderRight: "none !important",
              outline: "none",
              paddingLeft: "16px",
            },
            "& .MuiDataGrid-columnHeaderTitleContainer": {
              justifyContent: "flex-start !important",
              paddingLeft: "16px",
            },

            "& .MuiDataGrid-iconSeparator": {
              display: "none !important",
            },
            "& .MuiDataGrid-columnSeparator": {
              display: "none !important",
            },

            "& .MuiDataGrid-row": {
              borderBottom: "none",
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

      {/* Edit Report Modal */}
      {editModalOpen && reportToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <EditReport
              report={reportToEdit}
              onSuccess={handleEditSuccess}
              onCancel={handleCancelEdit}
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

export default ReportManagement;
