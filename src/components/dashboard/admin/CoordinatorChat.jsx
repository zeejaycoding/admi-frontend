import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  InputAdornment,
  Menu,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItemButton,
  ListItemText,
  Avatar,
  CircularProgress,
} from "@mui/material";
import {
  MessagesSquare,
  Search,
  Send,
  Paperclip,
  Smile,
  Phone,
  MoreVertical,
  Video,
  Plus,
  X,
} from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import coordinatorChatService, { coordinatorChatSocket } from "../../../services/api/coordinatorChatService";

const countryOptions = [
  { code: "ALL", name: "All Countries", flag: null },
  { code: "NG", name: "Nigeria", flag: "https://flagcdn.com/w40/ng.png" },
  { code: "US", name: "USA", flag: "https://flagcdn.com/w40/us.png" },
  { code: "UK", name: "UK", flag: "https://flagcdn.com/w40/gb.png" },
  { code: "ZA", name: "South Africa", flag: "https://flagcdn.com/w40/za.png" },
  { code: "GH", name: "Ghana", flag: "https://flagcdn.com/w40/gh.png" },
];

const formatTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const CoordinatorChat = () => {
  const { user } = useAuth();
  const accessToken = useSelector((s) => s.auth.accessToken);
  const currentUserId = user?.id;

  const [stats, setStats] = useState({ activeChats: 0, unreadMessages: 0, onlineNow: 0 });
  const [country, setCountry] = useState("ALL");
  const [search, setSearch] = useState("");
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const [newChatOpen, setNewChatOpen] = useState(false);
  const [coordinators, setCoordinators] = useState([]);
  const [loadingCoordinators, setLoadingCoordinators] = useState(false);

  const [typing, setTyping] = useState({});
  const [call, setCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);

  const messagesEndRef = useRef(null);
  const draftChanged = useRef(false);

  const activeChat = useMemo(() => chats.find((c) => c.id === activeChatId) || null, [chats, activeChatId]);

  // Load stats + conversations + connect websocket
  useEffect(() => {
    if (!accessToken) return;
    let alive = true;

    const loadData = async () => {
      try {
        const [statsRes, convRes] = await Promise.all([
          coordinatorChatService.getStats(),
          coordinatorChatService.getConversations(),
        ]);
        if (!alive) return;
        setStats(statsRes?.data || { activeChats: 0, unreadMessages: 0, onlineNow: 0 });
        setChats(convRes?.data || []);
        setLoading(false);
        // Auto-open first conversation if none selected and none open
        setActiveChatId((prev) => prev || (convRes?.data?.[0]?.id || null));
      } catch {
        if (!alive) return;
        setLoading(false);
      }
    };

    loadData();

    coordinatorChatSocket.connect(accessToken);

    return () => {
      alive = false;
      coordinatorChatSocket.close();
    };
  }, [accessToken]);

  // Websocket event handlers
  useEffect(() => {
    const onMessageDelivered = (data) => {
      if (!data?.conversationId) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev.filter((m) => m.conversationId === data.conversationId), data];
      });
      setChats((prev) => upserialConversation(prev, data, currentUserId, true));
    };

    const onNewMessage = (data) => {
      if (!data?.conversationId) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        const isActive = activeChatId === data.conversationId;
        if (isActive) {
          return [...prev, data];
        }
        return prev;
      });
      setChats((prev) => upserialConversation(prev, data, currentUserId, true));
      // If incoming and not active, bump unread
      if (data.senderId !== currentUserId && activeChatId !== data.conversationId) {
        setStats((s) => ({ ...s, unreadMessages: s.unreadMessages + 1 }));
      }
    };

    const onPresence = (data) => {
      setChats((prev) =>
        prev.map((c) => (c.otherUser?.id === data.userId ? { ...c, online: data.online } : c))
      );
    };

    const onTyping = (data) => {
      if (data.conversationId === activeChatId) {
        setTyping((prev) => ({ ...prev, [data.userId]: data.typing }));
      }
    };

    const onCall = (data) => {
      const callData = data?.call;
      if (!callData) return;
      setCall(callData);
      if (data.action === "offer" && callData.recipientId === currentUserId) {
        setIncomingCall(callData);
      }
      if (data.action !== "offer") setIncomingCall(null);
      setStats((s) => ({ ...s, activeChats: s.activeChats }));
    };

    const onCallAck = (data) => {
      if (data?.call) {
        setCall(data.call);
        if (data.action === "cancel" || data.action === "end" || data.action === "reject") {
          setIncomingCall(null);
        }
      }
    };

    coordinatorChatSocket.on("message_delivered", onMessageDelivered);
    coordinatorChatSocket.on("new_message", onNewMessage);
    coordinatorChatSocket.on("presence", onPresence);
    coordinatorChatSocket.on("typing", onTyping);
    coordinatorChatSocket.on("call", onCall);
    coordinatorChatSocket.on("call_ack", onCallAck);
  }, [activeChatId, currentUserId, accessToken]);

  const upserialConversation = (prev, message, currentUserId, refresh) => {
    return prev.map((c) =>
      c.id === message.conversationId
        ? {
            ...c,
            lastMessage: message.content,
            lastSenderId: message.senderId,
            lastMessageAt: message.createdAt,
            ...(message.senderId !== currentUserId ? { unreadCount: (c.unreadCount || 0) + 1 } : {}),
          }
        : c
    );
  };

  // Load messages when active chat changes + mark as read
  useEffect(() => {
    setMessages([]);
    setTyping({});
    if (!activeChatId) return;
    let alive = true;
    coordinatorChatService
      .getMessages(activeChatId)
      .then((res) => {
        if (alive) setMessages(res?.data || []);
      })
      .catch(() => {});
    coordinatorChatService.markAsRead(activeChatId).catch(() => {});
    coordinatorChatSocket.markRead(activeChatId);
    return () => {
      alive = false;
    };
  }, [activeChatId]);

  const stopTyping = useCallback((convId) => {
    coordinatorChatSocket.typing(convId, false);
  }, []);

  // Debounced typing indicator
  useEffect(() => {
    if (!draftChanged.current || !activeChatId) return;
    draftChanged.current = false;
    coordinatorChatSocket.typing(activeChatId, true);
    const t = setTimeout(() => stopTyping(activeChatId), 1500);
    return () => clearTimeout(t);
  }, [draft, activeChatId, stopTyping]);

  const handleSelectChat = (chat) => {
    setActiveChatId(chat.id);
    setChats((prev) => prev.map((c) => (c.id === chat.id ? { ...c, unreadCount: 0 } : c)));
  };

  const handleSend = () => {
    const text = draft.trim();
    if (!text || !activeChatId) return;
    coordinatorChatSocket.sendMessage(activeChatId, text);
    setDraft("");
  };

  const openNewChat = async () => {
    setNewChatOpen(true);
    setLoadingCoordinators(true);
    setCoordinators([]);
    try {
      const res = await coordinatorChatService.searchCoordinators({});
      setCoordinators(res?.data || []);
    } catch {
      setCoordinators([]);
    } finally {
      setLoadingCoordinators(false);
    }
  };

  const startNewChat = async (coordinatorId) => {
    try {
      const res = await coordinatorChatService.startConversation(coordinatorId);
      const conv = res?.data;
      if (!conv) return;
      setChats((prev) => {
        if (prev.some((c) => c.id === conv.id)) return prev;
        return [conv, ...prev];
      });
      setActiveChatId(conv.id);
      setNewChatOpen(false);
      // Refresh stats
      coordinatorChatService.getStats().then((s) => setStats(s?.data || stats));
    } catch {
      // ignore
    }
  };

  const handleCall = (action) => {
    if (!activeChatId) return;
    if (action === "offer") {
      coordinatorChatSocket.call("offer", { conversationId: activeChatId, callType: "AUDIO" });
    } else if (action === "cancel") {
      if (call?.id) coordinatorChatSocket.call("cancel", { conversationId: activeChatId, callId: call.id });
    }
  };

  const handleIncomingCall = (accept) => {
    if (!incomingCall || !activeChatId) return;
    coordinatorChatSocket.call(accept ? "accept" : "reject", {
      conversationId: activeChatId,
      callId: incomingCall.id,
    });
    setIncomingCall(null);
  };

  const filteredChats = useMemo(() => {
    const term = search.trim().toLowerCase();
    return chats
      .filter((c) => {
        if (country !== "ALL") {
          const name = (c.otherUser?.region || "").toLowerCase();
          const target = countryOptions.find((o) => o.code === country)?.name.toLowerCase();
          if (target && !name.includes(target)) return false;
        }
        if (term) {
          const n = (c.otherUser?.fullName || "").toLowerCase();
          if (!n.includes(term)) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
  }, [chats, country, search]);

  const selectedCountry = countryOptions.find((c) => c.code === country) || countryOptions[0];

  const statsCards = [
    { label: "Active chats", value: String(stats.activeChats) },
    { label: "Unread Messages", value: String(stats.unreadMessages) },
    { label: "Online Now", value: String(stats.onlineNow) },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", maxWidth: "100%", minHeight: "100vh", backgroundColor: "#fafafa" }}>
      {/* Hero box */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #244AAE 0%, #011A5A 100%)",
          boxShadow: "0px 10px 30px #0000001A",
          borderRadius: "20px",
          p: { xs: 3, sm: 4, md: 5 },
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "10px",
              background: "#FFFFFF33",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <MessagesSquare size={24} color="#FFFFFF" />
          </Box>
          <Typography sx={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: { xs: "24px", sm: "30px" }, color: "#FFFFFF" }}>
            Coordinator Chat
          </Typography>
        </Box>

        <Typography sx={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "16px", color: "#F3E8FF", mt: 1.5 }}>
          Connect and communicate with campus coordinators across your region
        </Typography>

        <Box display="flex" gap={2} mt={4} flexWrap="wrap">
          {statsCards.map((stat, index) => (
            <Box
              key={index}
              sx={{
                width: stat.label === "Unread Messages" ? "140px" : "93px",
                background: "#FFFFFF1A",
                border: "1px solid #FFFFFF33",
                borderRadius: "14px",
                p: 2,
              }}
            >
              <Typography sx={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "12px", color: "#F3E8FF", whiteSpace: "nowrap" }}>
                {stat.label}
              </Typography>
              <Typography sx={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "18px", color: "#FFFFFF", mt: 0.5 }}>
                {stat.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Chat interface */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "340px 1fr" }, gap: 3, mt: 4 }}>
        {/* Left panel */}
        <Box sx={{ background: "#FFFFFF", border: "1px solid #EBEDF0", borderRadius: "16px", boxShadow: "0px 4px 16px #0000000A", overflow: "hidden" }}>
          {/* Country dropdown + new chat */}
          <Box sx={{ p: 2, borderBottom: "1px solid #F0F1F3" }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography sx={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px", color: "#364153" }}>
                Select Country
              </Typography>
              <IconButton onClick={openNewChat} size="small" sx={{ color: "#011A5A", bgcolor: "#EEF3FF", "&:hover": { bgcolor: "#DDE8FF" } }} title="Start new chat">
                <Plus size={18} />
              </IconButton>
            </Box>
            <Select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{
                height: 42,
                borderRadius: "10px",
                backgroundColor: "#F3F3F5",
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#AEC7ED" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#AEC7ED" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#AEC7ED" },
                fontSize: "14px",
                fontWeight: 500,
              }}
              renderValue={() => (
                <Box display="flex" alignItems="center" gap={1.5}>
                  {selectedCountry.flag && (
                    <img src={selectedCountry.flag} alt={selectedCountry.name} style={{ width: 20, height: 15, objectFit: "cover", borderRadius: 2 }} />
                  )}
                  <span style={{ color: "#0A0A0A" }}>{selectedCountry.name}</span>
                </Box>
              )}
            >
              {countryOptions.map((c) => (
                <MenuItem key={c.code} value={c.code}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    {c.flag && <img src={c.flag} alt={c.name} style={{ width: 20, height: 15, objectFit: "cover", borderRadius: 2 }} />}
                    <span style={{ color: "#0A0A0A" }}>{c.name}</span>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* Search */}
          <Box sx={{ p: 2, borderBottom: "1px solid #F0F1F3" }}>
            <TextField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="search for coordinators"
              fullWidth
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} color="#98A2B3" />
                  </InputAdornment>
                ),
                sx: {
                  height: 40,
                  borderRadius: "10px",
                  fontSize: "13px",
                  bgcolor: "#F9FAFB",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E4E7EC" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#011A5A" },
                  "& fieldset": { border: "none" },
                },
              }}
            />
          </Box>

          {/* Conversation list */}
          <Box sx={{ maxHeight: "520px", overflowY: "auto" }}>
            {filteredChats.map((chat) => (
              <Box
                key={chat.id}
                onClick={() => handleSelectChat(chat)}
                sx={{
                  p: 2,
                  cursor: "pointer",
                  borderBottom: "1px solid #F7F8FA",
                  backgroundColor: activeChat?.id === chat.id ? "#EEF3FF" : "transparent",
                  borderLeft: activeChat?.id === chat.id ? "3px solid #011A5A" : "3px solid transparent",
                  transition: "background-color 0.15s",
                  "&:hover": { backgroundColor: activeChat?.id === chat.id ? "#EEF3FF" : "#FAFBFC" },
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box minWidth={0}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography sx={{ fontFamily: "Inter, sans-serif", fontWeight: chat.unreadCount > 0 ? 700 : 500, fontSize: "14px", color: "#101828", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {chat.otherUser?.fullName || "Unknown"}
                      </Typography>
                      <Box
                        sx={{
                          mt: 0.5,
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: chat.online ? "#00C950" : "#CBD2DC",
                          flexShrink: 0,
                        }}
                      />
                    </Box>
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: chat.unreadCount > 0 ? 600 : 400,
                        fontSize: "12px",
                        color: chat.unreadCount > 0 ? "#011A5A" : "#98A2B3",
                        mt: 0.3,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {chat.lastMessage || (chat.otherUser?.region ? `${chat.otherUser.region} coordinator` : "Start a conversation")}
                    </Typography>
                  </Box>

                  <Box display="flex" flexDirection="column" alignItems="flex-end" gap={0.6} flexShrink={0}>
                    <Typography sx={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "11px", color: "#98A2B3" }}>
                      {formatTime(chat.lastMessageAt)}
                    </Typography>
                    {chat.unreadCount > 0 && (
                      <Box
                        sx={{
                          minWidth: "24px",
                          height: "22px",
                          borderRadius: "11px",
                          bgcolor: "#011A5A",
                          border: "1px solid #00000000",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          px: "7px",
                        }}
                      >
                        <Typography sx={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "12px", color: "#FFFFFF", lineHeight: 1 }}>
                          {chat.unreadCount}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            ))}

            {filteredChats.length === 0 && (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography sx={{ fontSize: "14px", color: "#98A2B3" }}>
                  No conversations found
                </Typography>
                <Button onClick={openNewChat} sx={{ mt: 1, color: "#011A5A", textTransform: "none" }} size="small">
                  Start a new chat
                </Button>
              </Box>
            )}
          </Box>
        </Box>

        {/* Right panel - opened chat */}
        <Box
          sx={{
            background: "#FFFFFF",
            border: "1px solid #EBEDF0",
            borderRadius: "16px",
            boxShadow: "0px 4px 16px #0000000A",
            display: "flex",
            flexDirection: "column",
            minHeight: "600px",
            overflow: "hidden",
          }}
        >
          {!activeChat ? (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" flex={1} sx={{ p: 6, color: "#98A2B3" }}>
              <MessagesSquare size={48} color="#CBD2DC" />
              <Typography sx={{ mt: 2, fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "16px", color: "#364153" }}>
                Select a conversation
              </Typography>
              <Typography sx={{ mt: 1, fontFamily: "Inter, sans-serif", fontSize: "13px" }}>
                Choose a coordinator to start messaging, or click + to begin a new chat
              </Typography>
            </Box>
          ) : (
            <>
              {/* Chat header */}
              <Box sx={{ p: 2.5, borderBottom: "1px solid #E5E7EB", backgroundColor: "#EEF3FF", display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    bgcolor: "#011A5A",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    fontSize: "16px",
                    flexShrink: 0,
                  }}
                >
                  {activeChat.otherUser?.fullName?.charAt(0) || "C"}
                </Box>
                <Box flex={1} minWidth={0}>
                  <Typography sx={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "16px", color: "#101828" }}>
                    {activeChat.otherUser?.fullName || "Unknown"}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1.5} mt={0.4}>
                    <Typography sx={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "12px", color: "#98A2B3", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {activeChat.otherUser?.region || "Coordinator"}
                    </Typography>
                    {typing[activeChat.otherUser?.id] && (
                      <Typography sx={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "12px", color: "#011A5A", fontStyle: "italic" }}>
                        typing...
                      </Typography>
                    )}
                    <Box sx={{ bgcolor: activeChat.online ? "#00C950" : "#EF4444", borderRadius: "4px", px: "6px", py: "1px", flexShrink: 0 }}>
                      <Typography sx={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "10px", color: "#FFFFFF", lineHeight: 1.4, textTransform: "uppercase" }}>
                        {activeChat.online ? "Online" : "Offline"}
                      </Typography>
                    </Box>
                  </Box>
                  {call && call.conversationId === activeChat.id && (
                    <Typography sx={{ mt: 0.4, fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "11px", color: call.status === "ACCEPTED" ? "#00C950" : "#011A5A" }}>
                      Call {call.status.toLowerCase()} {call.callType?.toLowerCase()}
                    </Typography>
                  )}
                </Box>

                {/* Actions */}
                <Box display="flex" alignItems="center" gap={0.5} flexShrink={0}>
                  <IconButton onClick={() => handleCall(call?.id && call.status === "REQUESTED" ? "cancel" : "offer")} sx={{ color: "#011A5A", p: 0.5, "&:hover": { bgcolor: "#FFFFFF99" } }} title="Audio call">
                    <Phone size={18} />
                  </IconButton>
                  <IconButton onClick={() => coordinatorChatSocket.call("offer", { conversationId: activeChat.id, callType: "VIDEO" })} sx={{ color: "#011A5A", p: 0.5, "&:hover": { bgcolor: "#FFFFFF99" } }} title="Video call">
                    <Video size={18} />
                  </IconButton>
                  <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} sx={{ color: "#011A5A", p: 0.5, "&:hover": { bgcolor: "#FFFFFF99" } }}>
                    <MoreVertical size={18} />
                  </IconButton>
                  <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }}>
                    {["Clear Chat", "Report"].map((option) => (
                      <MenuItem key={option} onClick={() => setMenuAnchor(null)} sx={{ fontSize: "14px", fontFamily: "Inter, sans-serif" }}>
                        {option}
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>
              </Box>

              {/* Incoming call banner */}
              {incomingCall && (
                <Box sx={{ p: 2, bgcolor: "#011A5A", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography sx={{ color: "#FFFFFF", fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600 }}>
                    Incoming {incomingCall.callType?.toLowerCase()} call...
                  </Typography>
                  <Box display="flex" gap={1}>
                    <Button size="small" variant="contained" sx={{ bgcolor: "#00C950", textTransform: "none" }} onClick={() => handleIncomingCall(true)}>
                      Accept
                    </Button>
                    <Button size="small" variant="contained" sx={{ bgcolor: "#EF4444", textTransform: "none" }} onClick={() => handleIncomingCall(false)}>
                      Decline
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Messages */}
              <Box ref={messagesEndRef} sx={{ flex: 1, p: 3, display: "flex", flexDirection: "column", gap: 1.5, overflowY: "auto", bgcolor: "#FAFBFC", maxHeight: "440px" }}>
                {messages.map((msg) => {
                  const mine = msg.senderId === currentUserId;
                  return (
                    <Box key={msg.id} sx={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "70%", display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start" }}>
                      <Box
                        sx={{
                          px: 2,
                          py: 1.2,
                          borderRadius: mine ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                          backgroundColor: mine ? "#011A5A" : "#EEF3FF",
                          borderLeft: mine ? "none" : "3px solid #011A5A",
                          color: mine ? "#FFFFFF" : "#101828",
                          fontSize: "14px",
                          fontFamily: "Inter, sans-serif",
                          wordBreak: "break-word",
                        }}
                      >
                        {msg.content}
                      </Box>
                      <Typography sx={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "12px", color: "#99A1AF", mt: 0.3 }}>
                        {formatTime(msg.createdAt)}
                      </Typography>
                    </Box>
                  );
                })}
                {messages.length === 0 && (
                  <Typography sx={{ textAlign: "center", color: "#98A2B3", mt: 4, fontFamily: "Inter, sans-serif", fontSize: "13px" }}>
                    No messages yet. Say hello!
                  </Typography>
                )}
                {typing[activeChat.otherUser?.id] && (
                  <Typography sx={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#011A5A", fontStyle: "italic" }}>
                    {activeChat.otherUser?.fullName} is typing...
                  </Typography>
                )}
              </Box>

              {/* Input */}
              <Box sx={{ p: 2, borderTop: "1px solid #F0F1F3", display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box onClick={() => {}} sx={{ width: 38, height: 38, borderRadius: "10px", bgcolor: "#F3F3F5", border: "1px solid #E4E7EC", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, "&:hover": { bgcolor: "#EAEBEF" } }}>
                  <Paperclip size={18} color="#011A5A" />
                </Box>
                <TextField
                  value={draft}
                  onChange={(e) => { setDraft(e.target.value); draftChanged.current = true; }}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="type your message"
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputProps={{
                    sx: {
                      height: 44,
                      borderRadius: "10px",
                      fontSize: "14px",
                      bgcolor: "#F9FAFB",
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E4E7EC" },
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#011A5A" },
                      "& fieldset": { border: "none" },
                    },
                  }}
                />
                <Box onClick={() => {}} sx={{ width: 38, height: 38, borderRadius: "10px", bgcolor: "#F3F3F5", border: "1px solid #E4E7EC", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, "&:hover": { bgcolor: "#EAEBEF" } }}>
                  <Smile size={18} color="#011A5A" />
                </Box>
                <Box onClick={handleSend} sx={{ width: 44, height: 44, borderRadius: "10px", bgcolor: draft.trim() ? "#011A5A" : "#CBD2DC", display: "flex", alignItems: "center", justifyContent: "center", cursor: draft.trim() ? "pointer" : "not-allowed", flexShrink: 0, transition: "background-color 0.15s", "&:hover": draft.trim() ? { bgcolor: "#0a2a7a" } : {} }}>
                  <Send size={18} color="#FFFFFF" />
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Box>

      {/* New chat dialog */}
      <Dialog open={newChatOpen} onClose={() => setNewChatOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Start a new chat
          <IconButton onClick={() => setNewChatOpen(false)} size="small"><X size={18} /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {loadingCoordinators ? (
            <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
          ) : (
            <List disablePadding>
              {coordinators.map((c) => {
                const alreadyOpen = chats.some((ch) => ch.otherUser?.id === c.id);
                return (
                  <ListItemButton key={c.id} onClick={() => startNewChat(c.id)} disabled={alreadyOpen} sx={{ borderRadius: "8px" }}>
                    <Avatar sx={{ bgcolor: "#011A5A", width: 36, height: 36, mr: 1.5, fontSize: 15 }}>
                      {c.fullName?.charAt(0)}
                    </Avatar>
                    <ListItemText primary={c.fullName} secondary={`${c.email} · ${c.region}`} primaryTypographyProps={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px" }} secondaryTypographyProps={{ fontFamily: "Inter, sans-serif", fontSize: "12px" }} />
                  </ListItemButton>
                );
              })}
              {coordinators.length === 0 && (
                <Box textAlign="center" py={4} color="#98A2B3" fontFamily="Inter, sans-serif">No other coordinators available</Box>
              )}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewChatOpen(false)} sx={{ color: "#011A5A", textTransform: "none" }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CoordinatorChat;
