import React from "react";
import { useAuth } from "../state/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { fetchMyTransactions, fetchMyTasks } from "../api/users";
import { UserTransactionsTable } from "../components/Dashboard/UserTransactionsTable";
import { UserTasksList } from "../components/Dashboard/UserTasksList";
import { CompleteProfileCard } from "../components/Dashboard/CompleteProfileCard";
import { Wallet, BookOpen, ArrowRight, Code, Terminal, Cpu } from "lucide-react";
import { AcademyLoader } from "../components/ui/FashionLoader";
import { Link } from "react-router-dom";

const UserDashboardPage: React.FC = () => {
  const { user } = useAuth();

  const { data: transactions, isLoading: loadingTX } = useQuery({
    queryKey: ["my-transactions"],
    queryFn: fetchMyTransactions,
  });

  const { data: tasks, isLoading: loadingTasks } = useQuery({
    queryKey: ["my-tasks"],
    queryFn: fetchMyTasks,
  });

  if (!user) return null;

  if (loadingTX || loadingTasks) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
         <AcademyLoader />
         <p className="text-slate-500 font-bold animate-pulse text-xs uppercase tracking-[0.3em] mt-4">Syncing Portal...</p>
      </div>
    );
  }

  const hasData = (transactions && transactions.length > 0) || (tasks && tasks.length > 0);

  return (
    <div className="space-y-6 md:space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Access <span className="text-primary italic">Terminal</span></h1>
          <p className="text-slate-500 font-medium">Welcome to Veleon Academy. Your tech journey starts here.</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">
                <Terminal className="h-3 w-3" /> System Online
            </div>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-[10px] font-black uppercase tracking-widest text-primary">
                <Cpu className="h-3 w-3" /> Core v1.0
            </div>
        </div>
      </div>

      {!hasData ? (
        <div className="bg-white rounded-[2rem] p-16 text-center border border-slate-200 shadow-xl max-w-3xl mx-auto mt-10 overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
          <div className="h-24 w-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 text-primary rotate-3 group-hover:rotate-0 transition-transform duration-500">
            <Code className="h-12 w-12" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 mb-4">Initialize Your Tech Career</h3>
          <p className="text-slate-500 mb-10 leading-relaxed text-lg max-w-xl mx-auto">
            You haven't enrolled in any courses or started any tech projects yet. Explore our high-impact bootcamps in Frontend, Backend, and Data Science.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/" className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-primary text-white px-10 py-5 rounded-2xl font-black text-sm tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/30">
                EXPLORE COURSES <ArrowRight className="h-5 w-5" />
              </Link>
            
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-12">
              {tasks && tasks.length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                    <BookOpen className="h-6 w-6 text-primary" /> Current Modules
                  </h2>
                  <UserTasksList tasks={tasks} />
                </div>
              )}

              {transactions && transactions.length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                    <Wallet className="h-6 w-6 text-primary" /> Tuition History
                  </h2>
                  <UserTransactionsTable transactions={transactions} />
                </div>
              )}
           </div>

           <div className="space-y-8">
              <CompleteProfileCard />
           </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboardPage;
