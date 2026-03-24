import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchUsers, sendBulkMessage } from "../../api/admin";
import { BackButton } from "../../components/ui/BackButton";
import toast from "react-hot-toast";
import { Send, Search, Loader2, Users } from "lucide-react";

export default function AdminBulkMessagingPage() {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState(`Hi {{name}},\n\n...`);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((u: any) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const toggleUser = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    const allFilteredIds = new Set<number>(filteredUsers.map((u: any) => u.id));
    if (selectedIds.size === filteredUsers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(allFilteredIds);
    }
  };

  const sendMutation = useMutation({
    mutationFn: (payload: { recipients: { email: string; name: string }[]; subject: string; body: string }) =>
      sendBulkMessage(payload),
    onSuccess: (data) => {
      toast.success(data.message || "Messages sent successfully");
      setSubject("");
      setBody("Hi {{name}},\n\n");
      setSelectedIds(new Set());
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to send messages");
    },
  });

  const handleSend = () => {
    if (!subject.trim() || !body.trim()) {
      return toast.error("Subject and body are required");
    }
    if (selectedIds.size === 0) {
      return toast.error("Please select at least one recipient");
    }

    const recipients = users
      .filter((u: any) => selectedIds.has(u.id))
      .map((u: any) => ({
        email: u.email,
        name: u.firstName || "Student",
      }));

    sendMutation.mutate({ recipients, subject, body });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <BackButton />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Send className="text-primary" size={24} />
            Bulk Messaging
          </h1>
          <p className="text-sm text-gray-500">Send direct emails to selected users.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Users Selection */}
        <div className="lg:col-span-1 border border-gray-200 bg-white rounded-2xl shadow-sm p-5 flex flex-col h-[600px]">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2"><Users size={18} /> Select Recipients</span>
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{selectedIds.size} Selected</span>
          </h2>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="flex items-center justify-between mb-3 px-1">
             <label className="flex items-center gap-2 text-sm font-medium cursor-pointer text-gray-700">
                <input 
                  type="checkbox"
                  checked={filteredUsers.length > 0 && selectedIds.size === filteredUsers.length}
                  onChange={selectAll}
                  className="rounded text-primary focus:ring-primary"
                />
                Select All
             </label>
             <span className="text-xs text-gray-400">{filteredUsers.length} results</span>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-2">
            {isLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-400" /></div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((u: any) => (
                <label key={u.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(u.id)}
                    onChange={() => toggleUser(u.id)}
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                  <div>
                    <p className="text-sm font-bold text-gray-900 capitalize">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                  <span className={`ml-auto text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'tutor' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{u.role}</span>
                </label>
              ))
            ) : (
              <div className="text-center text-sm text-gray-500 py-10">No users found.</div>
            )}
          </div>
        </div>

        {/* Message Composition */}
        <div className="lg:col-span-2 border border-gray-200 bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-6">
          <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
             <h3 className="text-blue-800 font-bold text-sm mb-1">Formatting Tips</h3>
             <ul className="text-xs text-blue-600 space-y-1 list-disc list-inside">
                <li>Use <code className="bg-white px-1 py-0.5 rounded font-bold text-primary">{"{{name}}"}</code> as a placeholder for the recipient's first name.</li>
                <li>You can use standard HTML tags like <code className="bg-white px-1 py-0.5 rounded">&lt;b&gt;bold&lt;/b&gt;</code> or <code className="bg-white px-1 py-0.5 rounded">&lt;a href="..."&gt;Link&lt;/a&gt;</code> for styling.</li>
             </ul>
          </div>

          <div className="space-y-4 flex-1 flex flex-col">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email Subject</label>
              <input
                type="text"
                placeholder="e.g. Action Required: Your Account Update"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
            </div>
            
            <div className="flex-1 flex flex-col">
              <label className="block text-sm font-bold text-gray-700 mb-1">Email Body (HTML/Text)</label>
              <textarea
                placeholder="Write your message here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all flex-1 min-h-[300px] resize-none font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              onClick={handleSend}
              disabled={sendMutation.isPending || selectedIds.size === 0}
              className="px-6 py-3 bg-primary text-white font-bold rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-sm shadow-primary/30"
            >
              {sendMutation.isPending ? <Loader2 className="animate-spin h-5 w-5" /> : <Send className="h-5 w-5" />}
              {sendMutation.isPending ? "Sending..." : `Send to ${selectedIds.size} Users`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
