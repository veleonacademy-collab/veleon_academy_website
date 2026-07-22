import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Copy, Image, ChevronLeft, LogOut, Menu, X, HelpCircle, ArrowLeft, Download, Sparkles
} from "lucide-react";
import { http } from "../api/http";
import { useAuth } from "../state/AuthContext";
import SEO from "../components/SEO";

/* ─── Blob Helper for Forced File Download ───────────────────────────────── */
const downloadFlyerFile = async (url: string, filename?: string) => {
  const loadingToast = toast.loading("Downloading flyer...");
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch image");
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename || url.split("/").pop() || "veleon-partner-flyer.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
    toast.dismiss(loadingToast);
    toast.success("Flyer downloaded successfully!");
  } catch (err) {
    toast.dismiss(loadingToast);
    toast.error("Direct download failed. Opening flyer in new tab...");
    window.open(url, "_blank");
  }
};

const copyText = (text: string, label = "Copied!") => {
  navigator.clipboard.writeText(text).then(() => toast.success(label));
};

const PAGE_STYLES = `
  .pc-campaign-card { background: #fff; border: 1.5px solid #f3f4f6; border-radius: 16px; padding: 24px; margin-bottom: 24px; }
  .pc-copy-layout { display: grid; grid-template-columns: 220px 1fr; gap: 24px; align-items: start; margin-top: 20px; }
  .pc-flyer-box { display: flex; flex-direction: column; gap: 12px; }

  @media (max-width: 768px) {
    .pc-campaign-card { padding: 16px; border-radius: 12px; margin-bottom: 16px; }
    .pc-copy-layout { grid-template-columns: 1fr; gap: 16px; margin-top: 16px; }
    .pc-flyer-box { max-width: 280px; margin: 0 auto; width: 100%; }
  }
`;

const PartnerCampaignsPage: React.FC = () => {
  const { user, clearAuth } = useAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeCopyIdMap, setActiveCopyIdMap] = useState<Record<number, number>>({});

  const { data: dashboardData } = useQuery({
    queryKey: ["partner-dashboard"],
    queryFn: () => http.get("/partners/dashboard").then(r => r.data),
  });

  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ["partner-campaigns"],
    queryFn: () => http.get("/partners/campaigns").then(res => res.data),
  });

  const handleLogout = () => { clearAuth(); navigate("/partners"); };

  const fontFamily = "'Plus Jakarta Sans', sans-serif";
  const containerStyle: React.CSSProperties = { maxWidth: 1100, margin: "0 auto", padding: "0 16px" };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily }}>
      <style>{PAGE_STYLES}</style>
      <SEO title="Promotional Campaigns — Growth Partner Program" description="Access customized marketing graphics, copy angles, and high-converting message templates." />

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f3f4f6", padding: "0 16px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ ...containerStyle, display: "flex", alignItems: "center", justifyContent: "space-between", height: 58 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link to="/partners/dashboard" style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none", color: "#374151", fontWeight: 700, fontSize: 13 }}>
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link to="/partners/dashboard" style={{ fontSize: 12, fontWeight: 700, color: "#f97316", textDecoration: "none", background: "#fff7ed", padding: "6px 12px", borderRadius: 8 }}>
              Dashboard
            </Link>
            <button onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600 }}>
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ ...containerStyle, padding: "24px 16px 40px" }}>
        {/* Page Hero */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fff7ed", color: "#ea580c", padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            <Sparkles size={12} /> Marketing Toolkit
          </div>
          <h1 style={{ fontSize: "clamp(22px, 5vw, 32px)", fontWeight: 900, color: "#111827", margin: "0 0 6px", fontFamily }}>
            Promotional Campaigns Library
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280", margin: 0, maxWidth: 680, lineHeight: 1.6 }}>
            Select any copy angle below, download custom high-res graphics, and copy pre-formatted WhatsApp & social messages (pre-loaded with your custom tracking link).
          </p>
        </div>

        {/* Campaigns List */}
        {campaignsLoading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ display: "inline-block", width: 36, height: 36, border: "3px solid #f3f4f6", borderTopColor: "#f97316", borderRadius: "50%", animation: "pc-spin 0.8s linear infinite" }} />
            <p style={{ color: "#9ca3af", marginTop: 12, fontSize: 14 }}>Loading promotional campaigns…</p>
            <style>{`@keyframes pc-spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : !campaigns || campaigns.length === 0 ? (
          <div style={{ background: "#fff", border: "1.5px solid #f3f4f6", borderRadius: 16, padding: "48px 20px", textAlign: "center" }}>
            <p style={{ color: "#94a3b8", fontSize: 15, margin: 0 }}>No active promotional campaigns found right now. Check back soon!</p>
          </div>
        ) : (
          campaigns.map((camp: any) => (
            <div key={camp.id} className="pc-campaign-card">
              <div style={{ borderBottom: "1.5px solid #f8fafc", paddingBottom: 16 }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 900, color: "#111827", margin: 0, fontFamily }}>{camp.title}</h2>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#16a34a", background: "#dcfce7", padding: "4px 10px", borderRadius: 100, textTransform: "uppercase" }}>
                    Active Campaign
                  </span>
                </div>
                {camp.description && (
                  <p style={{ fontSize: 13, color: "#64748b", margin: "6px 0 0", lineHeight: 1.5 }}>{camp.description}</p>
                )}
              </div>

              {/* Copy Angles */}
              {!camp.copies || camp.copies.length === 0 ? (
                <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 16 }}>No creative materials uploaded yet for this campaign.</p>
              ) : (
                <div style={{ marginTop: 18 }}>
                  {/* Select Angle Tab Row */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
                    {camp.copies.map((cp: any) => {
                      const activeCopyId = activeCopyIdMap[camp.id] ?? camp.copies[0].id;
                      const isActive = activeCopyId === cp.id;
                      return (
                        <button
                          key={cp.id}
                          onClick={() => setActiveCopyIdMap(prev => ({ ...prev, [camp.id]: cp.id }))}
                          style={{
                            padding: "8px 16px", border: isActive ? "1.5px solid #ea580c" : "1.5px solid #e2e8f0",
                            borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: "pointer",
                            background: isActive ? "#fff7ed" : "#fff", color: isActive ? "#ea580c" : "#64748b",
                            transition: "all 0.15s ease"
                          }}
                        >
                          {cp.title}
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Copy Content */}
                  {(() => {
                    const activeCopyId = activeCopyIdMap[camp.id] ?? camp.copies[0].id;
                    const copy = camp.copies.find((c: any) => c.id === activeCopyId);
                    if (!copy) return null;

                    const partnerRefCode = dashboardData?.partner?.referralCode || "";
                    const appUrl = window.location.origin;
                    const defaultRefLink = dashboardData?.partner?.referralLink || `${appUrl}/data?ref=${partnerRefCode}`;

                    return (
                      <div className="pc-copy-layout">
                        {/* Flyer Column */}
                        {copy.flyer_url ? (
                          <div className="pc-flyer-box">
                            <div style={{ border: "1.5px solid #f1f5f9", borderRadius: 12, overflow: "hidden", background: "#f8fafc", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                              <img src={copy.flyer_url} alt="Flyer Preview" style={{ width: "100%", display: "block" }} />
                            </div>
                            <button
                              onClick={() => downloadFlyerFile(copy.flyer_url, `${camp.title}-${copy.title}.png`)}
                              style={{
                                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                                padding: "10px 14px", borderRadius: 10, background: "#ea580c", color: "#fff",
                                border: "none", fontSize: 13, fontWeight: 800, cursor: "pointer",
                                boxShadow: "0 4px 12px rgba(234, 88, 12, 0.2)", width: "100%"
                              }}
                            >
                              <Download size={15} /> Download Graphic Flyer
                            </button>
                          </div>
                        ) : (
                          <div style={{ padding: 16, background: "#f8fafc", borderRadius: 12, border: "1.5px dashed #e2e8f0", textAlign: "center", color: "#94a3b8", fontSize: 12 }}>
                            No flyer image attached to this copy angle.
                          </div>
                        )}

                        {/* Message Templates Column */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                          {!copy.messages || copy.messages.length === 0 ? (
                            <p style={{ fontSize: 13, color: "#94a3b8" }}>No share templates added for this copy angle.</p>
                          ) : (
                            copy.messages.map((msg: any) => {
                              const campaignReferralLink = `${defaultRefLink}&c=${camp.id}&cp=${copy.id}`;
                              const renderedText = msg.message_text?.replace(/\{\{referral_link\}\}/g, campaignReferralLink);

                              return (
                                <div key={msg.id} style={{ border: "1.5px solid #f1f5f9", borderRadius: 12, padding: 16, background: "#fff" }}>
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                    <span style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                      {msg.category_name}
                                    </span>
                                    <button
                                      onClick={() => copyText(renderedText, "Message template copied!")}
                                      style={{
                                        background: "#fff7ed", border: "1px solid #ffedd5", borderRadius: 6,
                                        padding: "5px 10px", cursor: "pointer", color: "#ea580c",
                                        fontSize: 12, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 5
                                      }}
                                    >
                                      <Copy size={13} /> Copy Template
                                    </button>
                                  </div>
                                  <div style={{
                                    margin: 0, padding: 14, background: "#f8fafc", borderRadius: 8,
                                    fontSize: 13, fontFamily: "monospace", whiteSpace: "pre-wrap",
                                    color: "#334155", border: "1px solid #f1f5f9", lineHeight: 1.6
                                  }}>
                                    {renderedText}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PartnerCampaignsPage;
