import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { academyApi } from "../../../api/academy";
import { BackButton } from "../../../components/ui/BackButton";
import toast from "react-hot-toast";
import Modal from "../../../components/Modal";
import { FormField } from "../../../components/forms/FormField";
import { Input } from "../../../components/forms/Input";

const AdminCurriculumPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState({ title: "", content: "", orderIndex: "0" });

  const { data: curriculum, isLoading } = useQuery({
    queryKey: ["curriculum", courseId],
    queryFn: () => academyApi.getCurriculum(parseInt(courseId!)),
    enabled: !!courseId,
  });

  const addMutation = useMutation({
    mutationFn: (data: any) => academyApi.addCurriculumItem(data),
    onSuccess: () => {
      toast.success("Item added successfully");
      queryClient.invalidateQueries({ queryKey: ["curriculum", courseId] });
      setModalOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to add item"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; payload: any }) => academyApi.updateCurriculumItem(data.id, data.payload),
    onSuccess: () => {
      toast.success("Item updated successfully");
      queryClient.invalidateQueries({ queryKey: ["curriculum", courseId] });
      setModalOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to update item"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => academyApi.deleteCurriculumItem(id),
    onSuccess: () => {
      toast.success("Item deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["curriculum", courseId] });
    },
    onError: () => toast.error("Failed to delete item"),
  });

  const resetForm = () => {
    setFormData({ title: "", content: "", orderIndex: "0" });
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      courseId: parseInt(courseId!),
      title: formData.title,
      content: formData.content,
      orderIndex: parseInt(formData.orderIndex),
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, payload });
    } else {
      addMutation.mutate(payload);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      content: item.content || "",
      orderIndex: item.order_index.toString(),
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <BackButton />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Course Curriculum</h1>
            <p className="text-sm text-gray-500">Manage lessons and structure for this course.</p>
          </div>
          <button
            onClick={() => { resetForm(); setModalOpen(true); }}
            className="rounded-full bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-primary/90 transition-colors"
          >
            ADD ITEM
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-8 py-4 w-16">Order</th>
                <th className="px-8 py-4">Title</th>
                <th className="px-8 py-4">Content Preview</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && (
                <tr>
                   <td colSpan={4} className="px-8 py-10 text-center text-gray-400">Loading curriculum...</td>
                </tr>
              )}
              {curriculum?.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-4 font-bold text-gray-400">#{item.order_index}</td>
                  <td className="px-8 py-4 font-bold text-gray-900">{item.title}</td>
                  <td className="px-8 py-4 text-gray-500 line-clamp-1 max-w-xs">{item.content}</td>
                  <td className="px-8 py-4 text-right space-x-4">
                    <button 
                       onClick={() => handleEdit(item)}
                       className="text-xs font-bold text-primary uppercase tracking-widest hover:underline"
                    >
                      Edit
                    </button>
                    <button 
                       onClick={() => { if(confirm("Are you sure?")) deleteMutation.mutate(item.id); }}
                       className="text-xs font-bold text-red-500 uppercase tracking-widest hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {curriculum?.length === 0 && !isLoading && (
                 <tr>
                    <td colSpan={4} className="px-8 py-10 text-center text-gray-400">No curriculum items found. Start by adding one.</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? "Edit Item" : "Add Curriculum Item"}>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <FormField label="Item Title" name="title" required>
            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Introduction to HTML" />
          </FormField>
          <FormField label="Content / Description" name="content">
            <textarea 
               className="w-full rounded-xl border border-gray-200 p-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
               rows={6} 
               value={formData.content} 
               onChange={(e) => setFormData({ ...formData, content: e.target.value })} 
               placeholder="What will students learn in this lesson?..." 
            />
          </FormField>
          <FormField label="Order Index" name="orderIndex" required>
            <Input type="number" value={formData.orderIndex} onChange={(e) => setFormData({ ...formData, orderIndex: e.target.value })} />
          </FormField>
          <button type="submit" disabled={addMutation.isPending || updateMutation.isPending} className="w-full bg-primary text-white py-4 rounded-xl font-bold text-sm tracking-widest hover:opacity-90 transition-all mt-6">
            {addMutation.isPending || updateMutation.isPending ? "SAVING..." : "SAVE ITEM"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCurriculumPage;
