import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { academyApi } from "../../../api/academy";
import { BackButton } from "../../../components/ui/BackButton";
import toast from "react-hot-toast";
import { Input } from "../../../components/forms/Input";
import { FormField } from "../../../components/forms/FormField";
import { Course } from "../../../types/academy";
import Modal from "../../../components/Modal";
import { SmartImage } from "../../../components/ui/SmartImage";
import { FileUpload } from "../../../components/forms/FileUpload";
import { formatCurrency } from "../../../utils/formatUtils";

const AdminCoursesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({ title: "", description: "", price: "", thumbnail_url: "", timetable_url: "" });

  const { data: courses, isLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: academyApi.getCourses,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Course>) => academyApi.createCourse(data),
    onSuccess: () => {
      toast.success("Course added successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      setModalOpen(false);
      setFormData({ title: "", description: "", price: "", thumbnail_url: "", timetable_url: "" });
    },
    onError: () => toast.error("Failed to add course"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; payload: Partial<Course> }) => academyApi.updateCourse(data.id, data.payload),
    onSuccess: () => {
      toast.success("Course updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      setModalOpen(false);
      setEditingCourse(null);
      setFormData({ title: "", description: "", price: "", thumbnail_url: "", timetable_url: "" });
    },
    onError: () => toast.error("Failed to update course"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      thumbnail_url: formData.thumbnail_url,
      timetable_url: formData.timetable_url,
    };

    if (editingCourse) {
      updateMutation.mutate({ id: editingCourse.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEditClick = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description || "",
      price: course.price.toString(),
      thumbnail_url: course.thumbnail_url || "",
      timetable_url: (course as any).timetable_url || "",
    });
    setModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingCourse(null);
    setFormData({ title: "", description: "", price: "", thumbnail_url: "", timetable_url: "" });
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <BackButton />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Courses</h1>
            <p className="text-sm text-gray-500">Create and update academy courses.</p>
          </div>
          <button
            onClick={handleAddClick}
            className="rounded-full bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-primary/90 transition-colors"
          >
            ADD COURSE
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && <div className="col-span-full text-center py-10">Loading courses...</div>}
        {courses?.map((course) => (
          <div key={course.id} className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="aspect-video relative">
              <SmartImage 
                 src={course.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop"} 
                 alt={course.title} 
                 className="w-full h-full object-cover" 
                 containerClassName="h-full w-full" 
              />
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4">{course.description}</p>
              <div className="flex items-center justify-between mb-6">
                <span className="font-black text-primary text-xl">
                  {formatCurrency(course.price)}
                </span>
                <button 
                  onClick={() => handleEditClick(course)}
                  className="text-xs font-bold text-gray-400 hover:text-primary uppercase tracking-widest transition-colors"
                >
                  Edit Course
                </button>
              </div>
              <Link 
                to={`/admin/courses/${course.id}/curriculum`}
                className="block w-full text-center bg-gray-50 hover:bg-primary hover:text-white text-gray-900 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border border-gray-100"
              >
                Manage Curriculum
              </Link>
            </div>
          </div>
        ))}
        {courses?.length === 0 && !isLoading && <div className="col-span-full text-center py-10 text-gray-400">No courses found.</div>}
      </div>

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingCourse ? "Edit Course" : "Add New Course"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <FormField label="Course Title" name="title" required>
            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Fullstack Web Dev" />
          </FormField>
          <FormField label="Description" name="description">
            <textarea 
               className="w-full rounded-xl border border-gray-200 p-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
               rows={4} 
               value={formData.description} 
               onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
               placeholder="Course details..." 
            />
          </FormField>
          <FormField label="Price (NGN)" name="price" required>
            <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="e.g. 500000" />
          </FormField>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FileUpload 
              label="Course Thumbnail" 
              value={formData.thumbnail_url} 
              onChange={(url) => setFormData({ ...formData, thumbnail_url: url })} 
              type="image"
              folder="courses"
            />
            <FileUpload 
              label="Course Timetable" 
              value={formData.timetable_url} 
              onChange={(url) => setFormData({ ...formData, timetable_url: url })} 
              type="document"
              folder="timetables"
            />
          </div>
          <button 
            type="submit" 
            disabled={createMutation.isPending || updateMutation.isPending} 
            className="w-full bg-primary text-white py-4 rounded-xl font-bold text-sm tracking-widest hover:opacity-90 transition-all mt-6"
          >
            {createMutation.isPending || updateMutation.isPending ? "SAVING..." : "SAVE COURSE"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCoursesPage;
