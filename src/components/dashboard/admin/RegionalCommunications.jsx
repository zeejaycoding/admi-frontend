import React, { useState, useEffect, useCallback } from 'react';
import { Send, MessageSquare, Bell, Mail, Eye, Trash2, ChevronDown, Megaphone, X, FileText } from 'lucide-react';
import { useDispatch } from 'react-redux';
import campusService from '../../../services/api/campusService';
import {
  fetchAllAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from '../../../store/slices/announcementSlice';

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const RegionalCommunications = () => {
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState('compose');
  const [campuses, setCampuses] = useState([]);
  const [loadingCampuses, setLoadingCampuses] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');
  const [targetOpen, setTargetOpen] = useState(false);
  const [portalNotification, setPortalNotification] = useState(true);
  const [emailAlert, setEmailAlert] = useState(false);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsItem, setDetailsItem] = useState(null);
  const [resendState, setResendState] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingCampuses(true);
        const res = await campusService.getManagementList({ size: 100 });
        const payload = res?.data;
        const list = Array.isArray(payload) ? payload
          : Array.isArray(payload?.campuses) ? payload.campuses
          : Array.isArray(payload?.content) ? payload.content
          : [];
        if (mounted) setCampuses(list);
      } catch {
        if (mounted) setCampuses([]);
      } finally {
        if (mounted) setLoadingCampuses(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const result = await dispatch(fetchAllAnnouncements()).unwrap();
      setHistory(result || []);
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const resetForm = () => {
    setTitle('');
    setMessage('');
    setTargetAudience('all');
    setPortalNotification(true);
    setEmailAlert(false);
    setShowPreview(false);
  };

  const handleSend = async () => {
    if (!title.trim()) { showToast('Please enter an announcement title.', 'error'); return; }
    if (!message.trim()) { showToast('Please enter an announcement message.', 'error'); return; }
    if (!portalNotification && !emailAlert) { showToast('Select at least one delivery option.', 'error'); return; }

    const targetLabel = targetAudience === 'all'
      ? 'All Campuses'
      : campuses.find((c) => String(c.id) === targetAudience)?.name || targetAudience;

    setSending(true);
    try {
      await dispatch(createAnnouncement({
        title: title.trim(),
        body: message.trim(),
        target: targetLabel,
        targetValue: targetAudience,
        portalNotification,
        emailAlert,
      })).unwrap();
      resetForm();
      showToast('Announcement sent successfully!');
      await loadHistory();
    } catch (err) {
      const msg = err?.message || 'Failed to send announcement. Please try again.';
      showToast(msg, 'error');
    } finally {
      setSending(false);
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleClear = () => {
    resetForm();
  };

  const handleDeleteHistory = async (id) => {
    try {
      await dispatch(deleteAnnouncement(id)).unwrap();
      setHistory((prev) => prev.filter((h) => h.id !== id));
      showToast('Announcement deleted successfully.');
    } catch {
      showToast('Failed to delete announcement.', 'error');
    }
  };

  const handleViewDetails = (h) => {
    setDetailsItem(h);
    setDetailsOpen(true);
  };

  const handleResend = async (h) => {
    setResendState(h.id);
    try {
      await dispatch(createAnnouncement({
        title: h.title,
        body: h.body,
        target: h.target,
        targetValue: h.targetValue || 'all',
        portalNotification: h.portalNotification ?? true,
        emailAlert: h.emailAlert ?? false,
      })).unwrap();
      showToast('Announcement resent successfully!');
      await loadHistory();
    } catch {
      showToast('Failed to resend announcement.', 'error');
    } finally {
      setResendState(null);
    }
  };

  const targetLabel = () => {
    if (targetAudience === 'all') return 'All Campuses';
    const found = campuses.find((c) => String(c.id) === targetAudience);
    return found?.name || 'Select target';
  };

  const deliveryLabel = () => {
    const parts = [];
    if (portalNotification) parts.push('Portal Notification');
    if (emailAlert) parts.push('Email Alert');
    return parts.length ? parts.join(', ') : 'None';
  };

  const inputStyle = {
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
    fontWeight: 400,
    color: '#0A0A0A',
    background: '#F3F3F5',
    border: 'none',
    outline: 'none',
    width: '100%',
    padding: '12px 14px',
    borderRadius: '8px',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', minHeight: '100vh', background: '#fafafa' }}>
      {toast && (
        <div
          style={{
            position: 'fixed', top: 20, right: 20, zIndex: 9999,
            padding: '12px 24px', borderRadius: '8px',
            background: toast.type === 'error' ? '#FEF2F2' : '#ECFDF5',
            color: toast.type === 'error' ? '#B91C1C' : '#065F46',
            border: `1px solid ${toast.type === 'error' ? '#FECACA' : '#A7F3D0'}`,
            fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500,
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <Megaphone size={24} color="#155DFC" />
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '22px', fontWeight: 700, color: '#0A0A0A', margin: 0 }}>
            Regional Communications & Announcements
          </h1>
        </div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 400, color: '#717182', margin: 0, paddingLeft: '36px' }}>
          Send announcements and communications to all campus coordinators and leaders within your region
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('compose')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 24px', borderRadius: '8px 8px 0 0',
            background: activeTab === 'compose' ? '#FFFFFF' : 'transparent',
            border: '1px solid #E5E7EB', borderBottom: activeTab === 'compose' ? '1px solid #FFFFFF' : '1px solid #E5E7EB',
            fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 500,
            color: '#0A0A0A', cursor: 'pointer', position: 'relative', zIndex: activeTab === 'compose' ? 1 : 0,
            marginBottom: activeTab === 'compose' ? '-1px' : 0,
          }}
        >
          <MessageSquare size={18} color="#0A0A0A" />
          Compose Announcement
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 24px', borderRadius: '8px 8px 0 0',
            background: activeTab === 'history' ? '#FFFFFF' : 'transparent',
            border: '1px solid #E5E7EB', borderBottom: activeTab === 'history' ? '1px solid #FFFFFF' : '1px solid #E5E7EB',
            fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 500,
            color: '#0A0A0A', cursor: 'pointer', position: 'relative', zIndex: activeTab === 'history' ? 1 : 0,
            marginBottom: activeTab === 'history' ? '-1px' : 0,
          }}
        >
          <Bell size={18} color="#0A0A0A" />
          Announcement History
          {history.length > 0 && (
            <span style={{
              background: '#155DFC', color: '#fff', fontSize: '11px', fontWeight: 600,
              padding: '2px 7px', borderRadius: '999px', marginLeft: '4px',
            }}>
              {history.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '28px 32px' }}>

        {activeTab === 'compose' && (
          <div>
            {/* Compose Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Send size={20} color="#155DFC" />
              <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: 500, color: '#0A0A0A', margin: 0 }}>
                Compose New Announcement
              </h2>
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: 400, color: '#717182', margin: '0 0 24px 0', paddingLeft: '30px' }}>
              Create and send announcements to campus coordinators and leaders in your region
            </p>

            {/* Title */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: '#0A0A0A', display: 'block', marginBottom: '8px' }}>
                Announcement Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter announcement title"
                style={{
                  ...inputStyle,
                  fontWeight: title ? 500 : 400,
                  color: title ? '#0A0A0A' : '#717182',
                }}
              />
            </div>

            {/* Message */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: '#0A0A0A', display: 'block', marginBottom: '8px' }}>
                Message *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your announcement message here..."
                rows={5}
                style={{
                  ...inputStyle,
                  resize: 'vertical',
                  fontWeight: message ? 500 : 400,
                  color: message ? '#0A0A0A' : '#717182',
                }}
              />
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: '#0000001A', margin: '0 0 24px 0' }} />

            {/* Target Audience */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '18px', fontWeight: 600, color: '#0A0A0A', margin: '0 0 4px 0' }}>
                Target Audience
              </h3>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 400, color: '#717182', margin: '0 0 12px 0' }}>
                Select Target
              </p>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setTargetOpen(!targetOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', padding: '12px 14px', borderRadius: '8px',
                    background: '#F3F3F5', border: 'none', cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500,
                    color: '#0A0A0A',
                  }}
                >
                  {targetLabel()}
                  <ChevronDown size={18} color="#717182" style={{ transform: targetOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                </button>
                {targetOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                    background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px',
                    marginTop: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxHeight: '240px', overflowY: 'auto',
                  }}>
                    <button
                      onClick={() => { setTargetAudience('all'); setTargetOpen(false); }}
                      style={{
                        display: 'block', width: '100%', padding: '10px 14px', textAlign: 'left',
                        background: targetAudience === 'all' ? '#EFF6FF' : 'transparent',
                        border: 'none', cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500,
                        color: targetAudience === 'all' ? '#155DFC' : '#0A0A0A',
                      }}
                    >
                      All Campuses
                    </button>
                    {loadingCampuses ? (
                      <div style={{ padding: '10px 14px', color: '#717182', fontSize: '13px' }}>Loading campuses...</div>
                    ) : (
                      campuses.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => { setTargetAudience(String(c.id)); setTargetOpen(false); }}
                          style={{
                            display: 'block', width: '100%', padding: '10px 14px', textAlign: 'left',
                            background: targetAudience === String(c.id) ? '#EFF6FF' : 'transparent',
                            border: 'none', cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 400,
                            color: targetAudience === String(c.id) ? '#155DFC' : '#0A0A0A',
                          }}
                        >
                          {c.name}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: '#0000001A', margin: '0 0 24px 0' }} />

            {/* Delivery Options */}
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '18px', fontWeight: 600, color: '#0A0A0A', margin: '0 0 16px 0' }}>
                Delivery Options
              </h3>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {/* Portal Notification */}
                <div
                  onClick={() => setPortalNotification(!portalNotification)}
                  style={{
                    flex: '1 1 280px', padding: '16px 18px', borderRadius: '10px',
                    background: '#FFFFFF', border: '1px solid #0000001A',
                    cursor: 'pointer', transition: 'border-color 0.2s',
                    display: 'flex', flexDirection: 'column', gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Bell size={18} color="#155DFC" />
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: '#0A0A0A' }}>
                        Portal Notification
                      </span>
                    </div>
                    <div style={{
                      width: '40px', height: '22px', borderRadius: '11px', position: 'relative',
                      background: portalNotification ? '#0A0A0A' : '#D1D5DB',
                      transition: 'background 0.2s', cursor: 'pointer',
                    }}>
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '50%', background: '#FFFFFF',
                        position: 'absolute', top: '2px',
                        left: portalNotification ? '20px' : '2px',
                        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }} />
                    </div>
                  </div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 400, color: '#4A5565', margin: 0, paddingLeft: '28px' }}>
                    Recipients receive a notification in the portal
                  </p>
                </div>

                {/* Email Alert */}
                <div
                  onClick={() => setEmailAlert(!emailAlert)}
                  style={{
                    flex: '1 1 280px', padding: '16px 18px', borderRadius: '10px',
                    background: '#FFFFFF', border: '1px solid #0000001A',
                    cursor: 'pointer', transition: 'border-color 0.2s',
                    display: 'flex', flexDirection: 'column', gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Mail size={18} color="#00A63E" />
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: '#0A0A0A' }}>
                        Email Alert
                      </span>
                    </div>
                    <div style={{
                      width: '40px', height: '22px', borderRadius: '11px', position: 'relative',
                      background: emailAlert ? '#0A0A0A' : '#D1D5DB',
                      transition: 'background 0.2s', cursor: 'pointer',
                    }}>
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '50%', background: '#FFFFFF',
                        position: 'absolute', top: '2px',
                        left: emailAlert ? '20px' : '2px',
                        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }} />
                    </div>
                  </div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 400, color: '#4A5565', margin: 0, paddingLeft: '28px' }}>
                    Recipients also receive an email notification
                  </p>
                </div>
              </div>
            </div>

            {/* Announcement Preview */}
            {showPreview && (
              <div style={{
                background: '#EFF6FF', border: '1px solid #BEDBFF', borderRadius: '10px',
                padding: '20px 24px', marginBottom: '28px',
              }}>
                <h4 style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: '#0A0A0A', margin: '0 0 14px 0' }}>
                  Announcement Preview
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 400, color: '#4A5565', margin: 0 }}>
                    <span style={{ fontWeight: 600, color: '#0A0A0A' }}>Title: </span>{title || '—'}
                  </p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 400, color: '#4A5565', margin: 0 }}>
                    <span style={{ fontWeight: 600, color: '#0A0A0A' }}>Target: </span>{targetLabel()}
                  </p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 400, color: '#4A5565', margin: 0 }}>
                    <span style={{ fontWeight: 600, color: '#0A0A0A' }}>Delivery: </span>{deliveryLabel()}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                onClick={handleSend}
                disabled={sending}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 22px', borderRadius: '8px',
                  background: sending ? '#93B4F5' : '#155DFC',
                  color: '#FFFFFF', border: 'none', cursor: sending ? 'not-allowed' : 'pointer',
                  fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500,
                  transition: 'background 0.2s',
                }}
              >
                <Send size={16} />
                {sending ? 'Sending...' : 'Send Announcement'}
              </button>
              <button
                onClick={handlePreview}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 22px', borderRadius: '8px',
                  background: '#FFFFFF', color: '#0A0A0A',
                  border: '1px solid #E5E7EB', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500,
                }}
              >
                <Eye size={16} />
                Preview
              </button>
              <button
                onClick={handleClear}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 22px', borderRadius: '8px',
                  background: '#FFFFFF', color: '#0A0A0A',
                  border: '1px solid #E5E7EB', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500,
                }}
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <Bell size={20} color="#155DFC" />
              <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: 500, color: '#0A0A0A', margin: 0 }}>
                Announcement History
              </h2>
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 400, color: '#717182', margin: '0 0 24px 0', paddingLeft: '30px' }}>
              View all previously sent announcements and communications
            </p>

            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#717182' }}>
                <Megaphone size={48} color="#D1D5DB" style={{ marginBottom: '16px' }} />
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 500, color: '#9CA3AF', margin: '0 0 6px 0' }}>
                  No announcements sent yet
                </p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 400, color: '#D1D5DB', margin: 0 }}>
                  Your sent announcements will appear here
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {history.map((h) => (
                  <div key={h.id} style={{
                    padding: '20px 24px', borderRadius: '12px',
                    background: '#FFFFFF', border: '1px solid #E5E7EB',
                  }}>
                    {/* Top row: title (left) + method (right) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '12px' }}>
                      <h4 style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: 600, color: '#0A0A0A', margin: 0 }}>
                        {h.title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        {h.portalNotification && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            padding: '4px 10px', borderRadius: '999px',
                            background: '#EFF6FF', border: '1px solid #BEDBFF',
                            fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: '#155DFC',
                          }}>
                            <Bell size={13} /> Portal
                          </span>
                        )}
                        {h.emailAlert && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            padding: '4px 10px', borderRadius: '999px',
                            background: '#ECFDF5', border: '1px solid #A7F3D0',
                            fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: '#00A63E',
                          }}>
                            <Mail size={13} /> Email
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Meta row: target, recipient, sent */}
                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 400, color: '#4A5565' }}>
                        <span style={{ fontWeight: 600, color: '#0A0A0A' }}>Target:</span> {h.target}
                      </span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 400, color: '#4A5565' }}>
                        <span style={{ fontWeight: 600, color: '#0A0A0A' }}>Recipient:</span> {h.recipientCount || 1} {h.recipientCount > 1 || h.targetValue === 'all' ? 'campuses' : 'campus'}
                      </span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 400, color: '#4A5565' }}>
                        <span style={{ fontWeight: 600, color: '#0A0A0A' }}>Sent:</span> {formatDate(h.createdAt || h.sentAt)}
                      </span>
                    </div>

                    {/* Bottom row: View details + Resend (left) + Delete (right) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F0F0F2', paddingTop: '14px' }}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => handleViewDetails(h)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '8px 16px', borderRadius: '8px',
                            background: '#FFFFFF', color: '#0A0A0A',
                            border: '1px solid #E5E7EB', cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500,
                            transition: 'background 0.2s',
                          }}
                        >
                          <Eye size={15} />
                          View Details
                        </button>
                        <button
                          onClick={() => handleResend(h)}
                          disabled={resendState === h.id}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '8px 16px', borderRadius: '8px',
                            background: resendState === h.id ? '#93B4F5' : '#155DFC',
                            color: '#FFFFFF', border: 'none', cursor: resendState === h.id ? 'not-allowed' : 'pointer',
                            fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500,
                            transition: 'background 0.2s',
                          }}
                        >
                          <Send size={15} />
                          {resendState === h.id ? 'Resending...' : 'Resend'}
                        </button>
                      </div>
                      <button
                        onClick={() => handleDeleteHistory(h.id)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          padding: '8px', borderRadius: '8px', background: 'transparent',
                          border: 'none', cursor: 'pointer', color: '#9CA3AF',
                        }}
                        title="Delete announcement"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {detailsOpen && detailsItem && (
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 9998,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '20px',
            }}
            onClick={() => setDetailsOpen(false)}
          >
            <div
              style={{
                background: '#FFFFFF', borderRadius: '14px', width: '100%', maxWidth: '560px',
                padding: '28px 32px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                fontFamily: 'Inter, sans-serif',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileText size={20} color="#155DFC" />
                  <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '17px', fontWeight: 600, color: '#0A0A0A', margin: 0 }}>
                    Announcement Details
                  </h3>
                </div>
                <button
                  onClick={() => setDetailsOpen(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ border: '1px solid #E5E7EB', borderRadius: '10px', padding: '18px 20px', marginBottom: '20px' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 400, color: '#4A5565', margin: '0 0 8px 0' }}>
                  <span style={{ fontWeight: 600, color: '#0A0A0A' }}>Title: </span>{detailsItem.title}
                </p>
                <div style={{ height: '1px', background: '#F0F0F2', margin: '10px 0' }} />
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 400, color: '#717182', margin: 0, lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {detailsItem.body || detailsItem.message}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500, color: '#0A0A0A' }}>Target</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 400, color: '#717182' }}>{detailsItem.target}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500, color: '#0A0A0A' }}>Recipients</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 400, color: '#717182' }}>{detailsItem.recipientCount || 1} campuses</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500, color: '#0A0A0A' }}>Sent</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 400, color: '#717182' }}>{formatDate(detailsItem.createdAt || detailsItem.sentAt)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500, color: '#0A0A0A' }}>Method</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 400, color: '#717182' }}>
                    {[detailsItem.portalNotification && 'Portal Notification', detailsItem.emailAlert && 'Email Alert']
                      .filter(Boolean).join(', ') || detailsItem.delivery || 'None'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  onClick={() => setDetailsOpen(false)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '9px 18px', borderRadius: '8px',
                    background: '#FFFFFF', color: '#0A0A0A', border: '1px solid #E5E7EB', cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500,
                  }}
                >
                  Close
                </button>
                <button
                  onClick={() => { handleResend(detailsItem); setDetailsOpen(false); }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '9px 18px', borderRadius: '8px',
                    background: '#155DFC', color: '#FFFFFF', border: 'none', cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500,
                  }}
                >
                  <Send size={14} />
                  Resend
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegionalCommunications;
