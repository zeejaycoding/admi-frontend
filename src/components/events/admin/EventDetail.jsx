import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  Tabs,
  Tab,
  Divider,
} from "@mui/material";

import {
  Share2,
  Download,
  Pencil,
  Ban,
  Users,
  User,
  DollarSign,
  UserCheck,
  Calendar,
  Clock,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";

import { useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getEventById,
  updateEvent,
  clearSelectedEvent,
  clearSuccess,
} from "../../../store/slices/eventSlice";
import { notify } from "../../../services/utils/authUtils";
import EventEdit from "./EventEdit";

const EventDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const { selectedEvent, isLoading, isUpdating } = useSelector((state) => state.event);

  const event = (selectedEvent && selectedEvent.id === Number(id)) ? selectedEvent : location.state?.event;

  useEffect(() => {
    if (id) {
      dispatch(getEventById(id));
    }
    return () => { dispatch(clearSelectedEvent()); };
  }, [id, dispatch]);

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    dispatch(clearSuccess());
    dispatch(getEventById(id));
    notify.success("Event updated successfully!");
  };

  const handleCancelEvent = async () => {
    try {
      await dispatch(
        updateEvent({
          id: id,
          updateData: { isActive: false },
          thumbnailFile: null,
        })
      ).unwrap();
      dispatch(getEventById(id));
      notify.success("Event cancelled successfully!");
    } catch (err) {
      notify.error(err.message || "Failed to cancel event");
    }
  };

  if (!event) {
    return (
      <Box p={4} display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography variant="h5" color="#6A7282">
          {isLoading ? "Loading event..." : "Event not found"}
        </Typography>
      </Box>
    );
  }

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const daysUntil = event.eventDate
    ? Math.ceil((new Date(event.eventDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 }, background: "#f7f8fc", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 3,
          alignItems: "center",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Box sx={{ width: "100%", textAlign: { xs: "left", sm: "inherit" } }}>
          <Box
            display="flex"
            alignItems="center"
            gap={2}
            mb={0.5}
            flexWrap="wrap"
          >
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ fontSize: { xs: "1.5rem", sm: "2rem" }, wordBreak: "break-word" }}
            >
              {event.title}
            </Typography>
            <Chip label={event.status} color="primary" size="small" />
          </Box>
          <Typography color="gray">Event ID: EVT-{event.id}</Typography>
        </Box>

        <Box
          display="flex"
          gap={1.5}
          flexWrap="wrap"
          sx={{ width: { xs: "100%", sm: "auto" }, justifyContent: { xs: "space-between", sm: "flex-start" } }}
        >
          <Button
            startIcon={<Share2 size={16} />}
            onClick={() => {
              const url = window.location.href;

              if (navigator.share) {
                navigator.share({
                  title: event.title,
                  text: `Check out this event: ${event.title}`,
                  url,
                });
              } else {
                navigator.clipboard.writeText(url);
                alert("Event link copied to clipboard!");
              }
            }}
            sx={{
              backgroundColor: "#fff",
              color: "#000",
              border: "1px solid #d1d5db",
              borderRadius: "10px",
              px: 2,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#f9fafb",
              },
            }}
          >
            Share
          </Button>

          <Button
            startIcon={<Download size={16} />}
            onClick={() => {
              const data = `
Event Details
-------------
Title: ${event.title}
ID: EVT-${event.id}
Status: ${event.isActive ? "Active" : "Inactive"}
Date: ${formatDate(event.eventDate || event.date)}
Time: ${event.timeEstimate || "—"}
Location: ${event.location || "—"}
Organizer: ${event.organizerName || "—"}
Ticket: ${event.ticketType === "PAID" ? `$${event.ticketPrice}` : "Free"}
      `;

              const blob = new Blob([data], { type: "text/plain" });
              const url = URL.createObjectURL(blob);

              const a = document.createElement("a");
              a.href = url;
              a.download = `event-${event.id}.txt`;
              a.click();

              URL.revokeObjectURL(url);
            }}
            sx={{
              backgroundColor: "#fff",
              color: "#000",
              border: "1px solid #d1d5db",
              borderRadius: "10px",
              px: 2,
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#f9fafb",
              },
            }}
          >
            Export
          </Button>

          <Button
            startIcon={<Pencil size={16} />}
            onClick={() => setEditModalOpen(true)}
            sx={{
              backgroundColor: "#011A5A",
              color: "#fff",
              borderRadius: "10px",
              px: 2.5,
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#011A5A",
              },
            }}
          >
            Edit Event
          </Button>
        </Box>
      </Box>

      {/* Stats */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            sm: "repeat(2, minmax(0, 1fr))",
            md: "repeat(4, minmax(0, 1fr))",
          },
          gap: { xs: 2, sm: 3 },
          mb: 3,
          width: "100%",
        }}
      >
        {[
          {
            title: "Registrations",
            value: event.users ?? "—",
            detail: "Total registered users",
            icon: Users,
            bg: "#DBEAFE",
            iconColor: "#155DFC",
          },
          {
            title: "Revenue",
            value: event.ticketType === "PAID" && event.ticketPrice ? `$${event.ticketPrice}` : "Free",
            detail: "Ticket price",
            icon: DollarSign,
            bg: "#DCFCE7",
            iconColor: "#00A63E",
          },
          {
            title: "Status",
            value: event.isActive ? "Active" : "Inactive",
            detail: "Current state",
            icon: UserCheck,
            bg: "#F3E8FF",
            iconColor: "#9810FA",
          },
          {
            title: "Days Until",
            value: daysUntil !== null ? (daysUntil >= 0 ? daysUntil : "Past") : "—",
            detail: daysUntil !== null && daysUntil >= 0 ? "Days remaining" : "Event date",
            icon: Calendar,
            bg: "#FFEDD4",
            iconColor: "#F54900",
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <Paper
              key={stat.title}
              sx={{
                p: 3,
                borderRadius: "20px",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0px 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: "14px",
                  background: stat.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2.5,
                }}
              >
                <Icon size={24} color={stat.iconColor} />
              </Box>

              <Typography
                sx={{
                  fontSize: 30,
                  fontWeight: 700,
                  lineHeight: 1.1,
                  mb: 0.5,
                }}
              >
                {stat.value}
              </Typography>

              <Typography
                sx={{
                  fontSize: 16,
                  fontWeight: 600,
                  lineHeight: 1.3,
                  mb: 0.5,
                }}
              >
                {stat.title}
              </Typography>

              <Typography
                sx={{
                  fontSize: 13,
                  color: "#6B7280",
                  lineHeight: 1.4,
                }}
              >
                {stat.detail}
              </Typography>
            </Paper>
          );
        })}
      </Box>

      {/* Main Container with Tabs */}
      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Tabs
          value={0}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ px: 3, pt: 1, borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Overview" />
          <Tab label="Attendees" />
          <Tab label="Analytics" />
        </Tabs>

        {/* Overview Tab Content */}
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Grid container spacing={3} alignItems="stretch">
            {/* LEFT: Event Details + Banner */}
            <Grid item xs={12} md={6} sx={{ display: "flex" }}>
              <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
                <Typography variant="h6" mb={2} sx={{ fontWeight: 700 }}>
                  Event Details
                </Typography>

                <Box display="flex" flexDirection="column" gap={2.5}>
                  <Box display="flex" gap={1.5} alignItems="flex-start">
                    <Calendar size={18} color="#6A7282" />
                    <Box>
                      <Typography sx={{ color: "#6A7282", fontWeight: 400 }}>
                        Date
                      </Typography>
                      <Typography sx={{ color: "#101828", fontWeight: 400 }}>
                        {formatDate(event.eventDate || event.date)}
                      </Typography>
                      <Typography sx={{ color: "#4A5565", fontSize: 13 }}>
                        Event scheduled date
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" gap={1.5} alignItems="flex-start">
                    <Clock size={18} color="#6A7282" />
                    <Box>
                      <Typography sx={{ color: "#6A7282", fontWeight: 400 }}>
                        Time
                      </Typography>
                      <Typography sx={{ color: "#101828", fontWeight: 400 }}>
                        {event.timeEstimate || "—"}
                      </Typography>
                      <Typography sx={{ color: "#4A5565", fontSize: 13 }}>
                        Event duration
                      </Typography>
                    </Box>
                  </Box>


                  <Box display="flex" gap={1.5} alignItems="flex-start">
                    <MapPin size={18} color="#6A7282" />
                    <Box>
                      <Typography sx={{ color: "#6A7282", fontWeight: 400 }}>
                        Location
                      </Typography>
                      <Typography sx={{ color: "#101828", fontWeight: 400 }}>
                        {event.location || "—"}
                      </Typography>
                      <Typography sx={{ color: "#4A5565", fontSize: 13 }}>
                        Event venue
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" gap={1.5} alignItems="flex-start">
                    <User size={18} color="#6A7282" />
                    <Box>
                      <Typography sx={{ color: "#6A7282", fontWeight: 400 }}>
                        Organizer
                      </Typography>
                      <Typography sx={{ color: "#101828", fontWeight: 400 }}>
                        {event.organizerName || "—"}
                      </Typography>
                      <Typography sx={{ color: "#4A5565", fontSize: 13 }}>
                        Event organizer
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" gap={1.5} alignItems="flex-start">
                    <Mail size={18} color="#6A7282" />
                    <Box>
                      <Typography sx={{ color: "#6A7282", fontWeight: 400 }}>
                        Contact Email
                      </Typography>
                      <Typography sx={{ color: "#155DFC", fontWeight: 400 }}>
                        {event.organizerEmail || "—"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" gap={1.5} alignItems="flex-start">
                    <Phone size={18} color="#6A7282" />
                    <Box>
                      <Typography sx={{ color: "#6A7282", fontWeight: 400 }}>
                        Contact Phone
                      </Typography>
                      <Typography sx={{ color: "#101828", fontWeight: 400 }}>
                        {event.organizerPhone || "—"}
                      </Typography>
                    </Box>
                  </Box>
                  </Box>


            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" mb={2} fontWeight={700}>
                  Event Banner
                </Typography>

                <Box
                  component="img"
                  src={event.thumbnailUrl}
                  alt="banner"
                  sx={{
                    width: "100%",
                    borderRadius: 2,
                    height: { xs: 160, sm: 250 },
                    objectFit: "cover",
                    bgcolor: "#e5e7eb",
                  }}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              </Box>
            </Grid>

        {/* RIGHT */}
<Grid item xs={12} md={6} sx={{ display: "flex" }}>
  <Paper
    sx={{
      p: 3,
      borderRadius: 3,
      width: "100%",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <Typography variant="h6" fontWeight={700} mb={2}>
      Description
    </Typography>

    <Typography sx={{ color: "#4A5565", lineHeight: 1.7 }}>
      {event.description}
    </Typography>

    <Divider sx={{ my: 3 }} />

    <Box display="flex" flexDirection="column" gap={1.5}>
      <Typography>
        <b>Category:</b> {event.module || "—"}
      </Typography>

      <Typography>
        <b>Ticket:</b> {event.ticketType === "PAID" ? `$${event.ticketPrice}` : "Free"}
      </Typography>
    </Box>

    <Divider sx={{ my: 3 }} />

    <Typography variant="h6" fontWeight={700} mb={2}>
      Quick Actions
    </Typography>

    <Box display="flex" flexDirection="column" gap={1.5}>
      <Button variant="outlined">Send Message</Button>
      <Button variant="outlined">Download QR Codes</Button>
      <Button
        color="error"
        variant="outlined"
        startIcon={<Ban size={16} />}
        disabled={!event.isActive || isUpdating}
        onClick={handleCancelEvent}
      >
        {isUpdating ? "Cancelling..." : "Cancel Event"}
      </Button>
    </Box>
  </Paper>
</Grid>
</Grid>

        </Box>
      </Paper>

      {editModalOpen && event && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <EventEdit
              event={event}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditModalOpen(false)}
            />
          </div>
        </div>
      )}
    </Box>
  );
};

export default EventDetail;
