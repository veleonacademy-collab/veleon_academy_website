import React from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { academyApi } from "../../api/academy";
import { BackButton } from "../../components/ui/BackButton";
import toast from "react-hot-toast";
import { Book, CheckCircle, Circle } from "lucide-react";

const TutorCurriculumPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const queryClient = useQueryClient();

  const { data: curriculum, isLoading } = useQuery({
    queryKey: ["tutor-curriculum", courseId],
    queryFn: () => academyApi.getCurriculum(parseInt(courseId!)),
    enabled: !!courseId,
  });

  const toggleMutation = useMutation({
    mutationFn: (data: { curriculumId: number; isCompleted: boolean }) => 
        academyApi.toggleCurriculumProgress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutor-curriculum", courseId] });
      toast.success("Progress updated");
    },
    onError: () => toast.error("Failed to update progress"),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <BackButton />
        <div>
           <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
             <Book className="text-primary h-6 w-6" /> Course Progress
           </h1>
           <p className="text-sm text-gray-500">Mark topics as completed for your assigned students.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="divide-y divide-gray-100">
          {isLoading && <div className="p-10 text-center text-gray-400">Loading curriculum...</div>}
          {curriculum?.map((item: any) => (
            <div key={item.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-6">
                 <button 
                   onClick={() => toggleMutation.mutate({ curriculumId: item.id, isCompleted: !item.is_completed })}
                   disabled={toggleMutation.isPending}
                   className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                     item.is_completed 
                       ? "bg-approve/10 text-approve hover:bg-approve/20" 
                       : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                   }`}
                 >
                    {item.is_completed ? <CheckCircle className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                 </button>
                 <div>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Topic #{item.order_index}</span>
                        {item.is_completed && <span className="text-[10px] font-black text-approve uppercase tracking-widest italic">Completed</span>}
                    </div>
                    <h4 className={`font-bold transition-all ${item.is_completed ? "text-gray-400 line-through" : "text-gray-900"}`}>
                        {item.title}
                    </h4>
                    <p className="text-xs text-gray-400 line-clamp-1">{item.content}</p>
                 </div>
              </div>
              <div className="hidden md:block">
                 <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                    item.is_completed ? "bg-approve/10 text-approve" : "bg-gray-100 text-gray-400"
                 }`}>
                    {item.is_completed ? "Done" : "Pending"}
                 </span>
              </div>
            </div>
          ))}
          {curriculum?.length === 0 && !isLoading && (
             <div className="p-10 text-center text-gray-400">No curriculum items found for this course.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorCurriculumPage;
