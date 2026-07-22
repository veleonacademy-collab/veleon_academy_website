import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BackButton } from "../../components/ui/BackButton";
import toast from "react-hot-toast";
import { http } from "../../api/http";
import {
  Users,
  Trophy,
  Plus,
  Trash2,
  Edit2,
  Upload,
  Calendar,
  Layers,
  FileText,
  Save,
  X,
  Eye,
  Check
} from "lucide-react";

interface Partner {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  referralCode: string;
  createdAt: string;
  clicks: number;
  leads: number;
  enrollments: number;
  commission: number;
  bonuses: number;
  totalEarnings: number;
}

interface Campaign {
  id: number;
  title: string;
  description: string;
  isActive: boolean;
  copies?: CopyCreative[];
}

interface CopyCreative {
  id: number;
  campaignId: number;
  title: string;
  flyerUrl?: string;
  flyer_url?: string;
  messages?: CopyMessage[];
}

interface CopyMessage {
  id: number;
  copyId: number;
  categoryName: string;
  messageText?: string;
  message_text?: string;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

const AdminPartnersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"performance" | "campaigns">("performance");

  // Fetch partners
  const { data: partners, isLoading: partnersLoading } = useQuery<Partner[]>({
    queryKey: ["admin-partners-performance"],
    queryFn: () => http.get("/partners/admin/partners-performance").then(res => res.data)
  });

  // Fetch campaigns
  const { data: campaigns, isLoading: campaignsLoading } = useQuery<Campaign[]>({
    queryKey: ["admin-campaigns"],
    queryFn: () => http.get("/partners/admin/campaigns").then(res => res.data)
  });

  // Stats
  const totalPartners = partners?.length ?? 0;
  const totalClicks = partners?.reduce((sum, p) => sum + p.clicks, 0) ?? 0;
  const totalEnrollments = partners?.reduce((sum, p) => sum + p.enrollments, 0) ?? 0;
  const totalCommissions = partners?.reduce((sum, p) => sum + p.totalEarnings, 0) ?? 0;

  // --- Campaign Mutators ---
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [campaignTitle, setCampaignTitle] = useState("");
  const [campaignDesc, setCampaignDesc] = useState("");
  const [campaignActive, setCampaignActive] = useState(true);
  const [showAddCampaign, setShowAddCampaign] = useState(false);

  const createCampaignMutation = useMutation({
    mutationFn: (payload: any) => http.post("/partners/admin/campaigns", payload),
    onSuccess: () => {
      toast.success("Campaign created");
      setShowAddCampaign(false);
      setCampaignTitle("");
      setCampaignDesc("");
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
    }
  });

  const updateCampaignMutation = useMutation({
    mutationFn: ({ id, payload }: any) => http.put(`/partners/admin/campaigns/${id}`, payload),
    onSuccess: () => {
      toast.success("Campaign updated");
      setEditingCampaign(null);
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
    }
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: (id: number) => http.delete(`/partners/admin/campaigns/${id}`),
    onSuccess: () => {
      toast.success("Campaign deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
    }
  });

  // --- Copy Mutators ---
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [copyTitle, setCopyTitle] = useState("");
  const [copyFlyerUrl, setCopyFlyerUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const [editingCopy, setEditingCopy] = useState<CopyCreative | null>(null);
  const [editCopyTitle, setEditCopyTitle] = useState("");
  const [editCopyFlyerUrl, setEditCopyFlyerUrl] = useState("");

  const createCopyMutation = useMutation({
    mutationFn: ({ campaignId, payload }: any) =>
      http.post(`/partners/admin/campaigns/${campaignId}/copies`, payload),
    onSuccess: () => {
      toast.success("Copy added");
      setCopyTitle("");
      setCopyFlyerUrl("");
      setSelectedCampaignId(null);
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
    }
  });

  const updateCopyMutation = useMutation({
    mutationFn: ({ id, payload }: any) => http.put(`/partners/admin/copies/${id}`, payload),
    onSuccess: () => {
      toast.success("Copy angle updated successfully");
      setEditingCopy(null);
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
    }
  });

  const deleteCopyMutation = useMutation({
    mutationFn: (id: number) => http.delete(`/partners/admin/copies/${id}`),
    onSuccess: () => {
      toast.success("Copy deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
    }
  });

  // --- Message Mutators ---
  const [selectedCopyId, setSelectedCopyId] = useState<number | null>(null);
  const [msgCategory, setMsgCategory] = useState("");
  const [msgText, setMsgText] = useState("");

  const [editingMessage, setEditingMessage] = useState<CopyMessage | null>(null);
  const [editMsgCategory, setEditMsgCategory] = useState("");
  const [editMsgText, setEditMsgText] = useState("");

  const createMessageMutation = useMutation({
    mutationFn: ({ copyId, payload }: any) =>
      http.post(`/partners/admin/copies/${copyId}/messages`, payload),
    onSuccess: () => {
      toast.success("Message template added");
      setMsgCategory("");
      setMsgText("");
      setSelectedCopyId(null);
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
    }
  });

  const updateMessageMutation = useMutation({
    mutationFn: ({ id, payload }: any) => http.put(`/partners/admin/messages/${id}`, payload),
    onSuccess: () => {
      toast.success("Message template updated successfully");
      setEditingMessage(null);
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
    }
  });

  const deleteMessageMutation = useMutation({
    mutationFn: (id: number) => http.delete(`/partners/admin/messages/${id}`),
    onSuccess: () => {
      toast.success("Message template deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
    }
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, onComplete?: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "partners");

    setUploading(true);
    try {
      const res = await http.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (onComplete) {
        onComplete(res.data.imageUrl);
      } else {
        setCopyFlyerUrl(res.data.imageUrl);
      }
      toast.success("Flyer uploaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Growth Partners Hub</h1>
            <p className="text-sm text-slate-500">Manage referral campaigns, creatives, and partner commissions.</p>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Partners</span>
            <Users size={16} />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{totalPartners}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Clicks</span>
            <Users size={16} />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{totalClicks}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Enrollments</span>
            <Trophy size={16} />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{totalEnrollments}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Commissions</span>
            <Trophy size={16} />
          </div>
          <p className="mt-2 text-2xl font-black text-primary">{fmt(totalCommissions)}</p>
        </div>
      </div>

      {/* Tab Row */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("performance")}
          className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all ${
            activeTab === "performance" ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Partner Performance
        </button>
        <button
          onClick={() => setActiveTab("campaigns")}
          className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all ${
            activeTab === "campaigns" ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Campaigns & Creative Builder
        </button>
      </div>

      {/* Tab Content 1: Performance */}
      {activeTab === "performance" && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Active Growth Partners</h2>
          </div>
          {partnersLoading ? (
            <div className="p-10 text-center text-slate-400">Loading partner data...</div>
          ) : !partners || partners.length === 0 ? (
            <div className="p-10 text-center text-slate-400">No Growth Partners registered yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="py-3 px-5">Partner</th>
                    <th className="py-3 px-5">Code</th>
                    <th className="py-3 px-5">Clicks</th>
                    <th className="py-3 px-5">Leads</th>
                    <th className="py-3 px-5">Enrollments</th>
                    <th className="py-3 px-5">Total Paid</th>
                    <th className="py-3 px-5">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {partners.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900">{p.firstName} {p.lastName}</div>
                        <div className="text-xs text-slate-400">{p.email}</div>
                      </td>
                      <td className="py-4 px-5 font-mono text-xs font-bold text-primary">{p.referralCode}</td>
                      <td className="py-4 px-5 font-semibold text-slate-700">{p.clicks}</td>
                      <td className="py-4 px-5 text-slate-600">{p.leads}</td>
                      <td className="py-4 px-5 text-slate-600">
                        <span className="font-bold text-emerald-600">{p.enrollments}</span>
                      </td>
                      <td className="py-4 px-5 font-bold text-slate-900">{fmt(p.totalEarnings)}</td>
                      <td className="py-4 px-5 text-xs text-slate-400">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab Content 2: Campaigns Builder */}
      {activeTab === "campaigns" && (
        <div className="space-y-6">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Campaigns</h2>
            <button
              onClick={() => setShowAddCampaign(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow hover:opacity-90 transition"
            >
              <Plus size={16} /> Create Campaign
            </button>
          </div>

          {/* Create/Edit Campaign Form */}
          {(showAddCampaign || editingCampaign) && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
              <h3 className="text-sm font-black uppercase text-slate-800 tracking-wider">
                {editingCampaign ? "Edit Campaign" : "Create New Campaign"}
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Campaign Title</label>
                  <input
                    type="text"
                    value={editingCampaign ? editingCampaign.title : campaignTitle}
                    onChange={e =>
                      editingCampaign
                        ? setEditingCampaign({ ...editingCampaign, title: e.target.value })
                        : setCampaignTitle(e.target.value)
                    }
                    placeholder="e.g. August Enrollment Campaign"
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                  <select
                    value={editingCampaign ? (editingCampaign.isActive ? "active" : "inactive") : campaignActive ? "active" : "inactive"}
                    onChange={e =>
                      editingCampaign
                        ? setEditingCampaign({ ...editingCampaign, isActive: e.target.value === "active" })
                        : setCampaignActive(e.target.value === "active")
                    }
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                <textarea
                  rows={2}
                  value={editingCampaign ? editingCampaign.description : campaignDesc}
                  onChange={e =>
                    editingCampaign
                      ? setEditingCampaign({ ...editingCampaign, description: e.target.value })
                      : setCampaignDesc(e.target.value)
                  }
                  placeholder="Short brief about this campaign..."
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowAddCampaign(false);
                    setEditingCampaign(null);
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (editingCampaign) {
                      updateCampaignMutation.mutate({
                        id: editingCampaign.id,
                        payload: {
                          title: editingCampaign.title,
                          description: editingCampaign.description,
                          isActive: editingCampaign.isActive
                        }
                      });
                    } else {
                      createCampaignMutation.mutate({
                        title: campaignTitle,
                        description: campaignDesc,
                        isActive: campaignActive
                      });
                    }
                  }}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow hover:opacity-90"
                >
                  Save Campaign
                </button>
              </div>
            </div>
          )}

          {/* Campaigns List */}
          {campaignsLoading ? (
            <div className="text-center text-slate-400 py-6">Loading campaigns...</div>
          ) : !campaigns || campaigns.length === 0 ? (
            <div className="text-center text-slate-400 py-6">No campaigns found. Create one above.</div>
          ) : (
            <div className="space-y-6">
              {campaigns.map(camp => (
                <div key={camp.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                  {/* Campaign Header */}
                  <div className="bg-slate-50 p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-lg">{camp.title}</h3>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          camp.isActive ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-slate-100 text-slate-500"
                        }`}>
                          {camp.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{camp.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setEditingCampaign(camp)}
                        className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Are you sure? This will delete all copies and messages inside.")) {
                            deleteCampaignMutation.mutate(camp.id);
                          }
                        }}
                        className="p-2 border border-slate-200 rounded-lg text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Campaign copies section */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Flyers & Copies ({camp.copies?.length ?? 0})</span>
                      <button
                        onClick={() => setSelectedCampaignId(camp.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                      >
                        <Plus size={14} /> Add Copy Angle
                      </button>
                    </div>

                    {/* Add Copy angle form */}
                    {selectedCampaignId === camp.id && (
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 uppercase">Add Copy Angle</span>
                          <button onClick={() => setSelectedCampaignId(null)} className="text-slate-400 hover:text-slate-600">
                            <X size={16} />
                          </button>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Angle Title</label>
                            <input
                              type="text"
                              value={copyTitle}
                              onChange={e => setCopyTitle(e.target.value)}
                              placeholder="e.g. Salary Growth Focus"
                              className="w-full rounded-md border border-slate-200 bg-white p-2 text-sm focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Flyer Image</label>
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-md cursor-pointer text-xs font-bold text-slate-600 hover:bg-slate-50">
                                <Upload size={14} /> {uploading ? "Uploading..." : "Upload File"}
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                              </label>
                              {copyFlyerUrl && (
                                <div className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                                  <Check size={14} /> Uploaded
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => createCopyMutation.mutate({ campaignId: camp.id, payload: { title: copyTitle, flyerUrl: copyFlyerUrl } })}
                            disabled={!copyTitle}
                            className="rounded bg-primary px-3 py-1.5 text-xs font-bold text-white shadow hover:opacity-90 disabled:opacity-50"
                          >
                            Add Copy Angle
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Copies List */}
                    {!camp.copies || camp.copies.length === 0 ? (
                      <div className="text-xs text-slate-400 text-center py-4">No copy angles added yet.</div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2">
                        {camp.copies.map(copy => {
                          const flyerUrl = copy.flyer_url || copy.flyerUrl || "";
                          return (
                          <div key={copy.id} className="rounded-lg border border-slate-100 p-4 space-y-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-bold text-slate-900 text-sm">{copy.title}</h4>
                                {flyerUrl && (
                                  <a href={flyerUrl} target="_blank" rel="noreferrer" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 mt-1">
                                    <Eye size={12} /> View Flyer File
                                  </a>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    setEditingCopy(copy);
                                    setEditCopyTitle(copy.title);
                                    setEditCopyFlyerUrl(flyerUrl);
                                  }}
                                  className="text-slate-500 hover:bg-slate-100 p-1 rounded"
                                  title="Edit Copy & Reupload Flyer"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm("Delete this copy angle?")) {
                                      deleteCopyMutation.mutate(copy.id);
                                    }
                                  }}
                                  className="text-red-500 hover:bg-red-50 p-1 rounded"
                                  title="Delete Copy Angle"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>

                            {/* Edit Copy Angle Form */}
                            {editingCopy?.id === copy.id && (
                              <div className="rounded border border-primary/30 bg-orange-50/50 p-3 space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-slate-800 uppercase">Edit Copy & Flyer</span>
                                  <button onClick={() => setEditingCopy(null)} className="text-slate-400 hover:text-slate-600">
                                    <X size={14} />
                                  </button>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Angle Title</label>
                                  <input
                                    type="text"
                                    value={editCopyTitle}
                                    onChange={e => setEditCopyTitle(e.target.value)}
                                    className="w-full rounded border border-slate-200 bg-white p-1.5 text-xs focus:outline-none"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Re-upload Flyer Image</label>
                                  <div className="flex items-center gap-2">
                                    <label className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded cursor-pointer text-[11px] font-bold text-slate-600 hover:bg-slate-50">
                                      <Upload size={12} /> {uploading ? "Uploading..." : "Upload New File"}
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={e => handleFileUpload(e, url => setEditCopyFlyerUrl(url))}
                                        disabled={uploading}
                                      />
                                    </label>
                                    {editCopyFlyerUrl && (
                                      <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-0.5">
                                        <Check size={12} /> Ready
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-1">
                                  <button onClick={() => setEditingCopy(null)} className="text-[11px] font-bold text-slate-400 hover:text-slate-600">
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() =>
                                      updateCopyMutation.mutate({
                                        id: copy.id,
                                        payload: { title: editCopyTitle, flyerUrl: editCopyFlyerUrl }
                                      })
                                    }
                                    disabled={!editCopyTitle}
                                    className="rounded bg-primary px-2.5 py-1 text-[11px] font-bold text-white shadow hover:opacity-90 disabled:opacity-50"
                                  >
                                    Update Copy
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Message Categories Builder */}
                            <div className="border-t border-slate-100 pt-3 space-y-2">
                              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
                                <span>Message Categories ({copy.messages?.length ?? 0})</span>
                                <button
                                  onClick={() => setSelectedCopyId(copy.id)}
                                  className="text-primary hover:underline flex items-center gap-0.5"
                                >
                                  <Plus size={12} /> Add Msg
                                </button>
                              </div>

                              {selectedCopyId === copy.id && (
                                <div className="rounded border border-slate-200 bg-slate-50 p-3 space-y-3">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Category Name</label>
                                    <input
                                      type="text"
                                      value={msgCategory}
                                      onChange={e => setMsgCategory(e.target.value)}
                                      placeholder="e.g. WhatsApp Groups, Friends & Family"
                                      className="w-full rounded border border-slate-200 bg-white p-1.5 text-xs focus:outline-none"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                                      Message Template Text (Use <code>{"{{referral_link}}"}</code>)
                                    </label>
                                    <textarea
                                      rows={3}
                                      value={msgText}
                                      onChange={e => setMsgText(e.target.value)}
                                      placeholder="Write template message here..."
                                      className="w-full rounded border border-slate-200 bg-white p-1.5 text-xs focus:outline-none"
                                    />
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <button onClick={() => setSelectedCopyId(null)} className="text-[10px] font-bold text-slate-400 hover:text-slate-600">
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() =>
                                        createMessageMutation.mutate({
                                          copyId: copy.id,
                                          payload: { category_name: msgCategory, message_text: msgText }
                                        })
                                      }
                                      disabled={!msgCategory || !msgText}
                                      className="rounded bg-primary px-2 py-1 text-[10px] font-bold text-white shadow hover:opacity-90 disabled:opacity-50"
                                    >
                                      Save Message
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Message Templates List */}
                              {copy.messages?.map(msg => {
                                const messageContent = msg.message_text || msg.messageText || "";
                                return (
                                <div key={msg.id} className="rounded bg-slate-50 p-2.5 text-xs border border-slate-100 space-y-1.5">
                                  <div className="flex items-center justify-between font-bold text-slate-700">
                                    <span>{msg.category_name}</span>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => {
                                          setEditingMessage(msg);
                                          setEditMsgCategory(msg.category_name);
                                          setEditMsgText(messageContent);
                                        }}
                                        className="text-slate-500 hover:bg-slate-200 p-0.5 rounded"
                                        title="Edit Message Template"
                                      >
                                        <Edit2 size={11} />
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (confirm("Delete this message?")) {
                                            deleteMessageMutation.mutate(msg.id);
                                          }
                                        }}
                                        className="text-red-500 hover:bg-red-100 p-0.5 rounded"
                                        title="Delete Message"
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Edit Message Form */}
                                  {editingMessage?.id === msg.id ? (
                                    <div className="rounded border border-primary/30 bg-white p-2.5 space-y-2 mt-1">
                                      <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Category Name</label>
                                        <input
                                          type="text"
                                          value={editMsgCategory}
                                          onChange={e => setEditMsgCategory(e.target.value)}
                                          className="w-full rounded border border-slate-200 p-1 text-xs focus:outline-none"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Message Text</label>
                                        <textarea
                                          rows={4}
                                          value={editMsgText}
                                          onChange={e => setEditMsgText(e.target.value)}
                                          className="w-full rounded border border-slate-200 p-1 text-xs focus:outline-none font-mono"
                                        />
                                      </div>
                                      <div className="flex justify-end gap-2 pt-1">
                                        <button onClick={() => setEditingMessage(null)} className="text-[10px] font-bold text-slate-400 hover:text-slate-600">
                                          Cancel
                                        </button>
                                        <button
                                          onClick={() =>
                                            updateMessageMutation.mutate({
                                              id: msg.id,
                                              payload: { categoryName: editMsgCategory, messageText: editMsgText }
                                            })
                                          }
                                          disabled={!editMsgCategory || !editMsgText}
                                          className="rounded bg-primary px-2 py-1 text-[10px] font-bold text-white shadow hover:opacity-90 disabled:opacity-50"
                                        >
                                          Save Changes
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-slate-500 font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-24 overflow-y-auto bg-white p-1.5 border border-slate-100 rounded">
                                      {messageContent}
                                    </p>
                                  )}
                                </div>
                              );
                              })}
                            </div>
                          </div>
                        );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPartnersPage;
