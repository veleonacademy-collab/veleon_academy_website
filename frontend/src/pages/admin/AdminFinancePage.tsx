import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { academyApi } from "../../api/academy";
import { BackButton } from "../../components/ui/BackButton";
import { formatCurrency, formatDate } from "../../utils/formatUtils";
import { Receipt, TrendingUp, Users, GraduationCap, ArrowUpDown, Search, Filter } from "lucide-react";

interface FinanceStats {
  total_revenue: number;
  total_students: number;
  total_enrollments: number;
}

interface Transaction {
  id: number;
  user_id: number;
  enrollment_id: number;
  amount: number;
  status: string;
  reference: string;
  provider: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  course_title?: string;
}

const AdminFinancePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: stats, isLoading: statsLoading } = useQuery<FinanceStats>({
    queryKey: ["admin-finance-stats"],
    queryFn: academyApi.getAdminFinance,
  });

  const { data: transactions, isLoading: txLoading } = useQuery<Transaction[]>({
    queryKey: ["admin-transactions"],
    queryFn: () => academyApi.getAdminTransactions(),
  });

  const filteredTransactions = transactions?.filter((tx: Transaction) => {
    const matchesSearch = 
      tx.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || tx.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4">
        <BackButton />
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Academy Finance</h1>
            <p className="text-gray-500 font-medium">Monitor revenue and student payments across the academy.</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative overflow-hidden group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
            <TrendingUp size={120} />
          </div>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-primary/10 rounded-2xl text-primary">
              <TrendingUp size={24} />
            </div>
            <span className="font-black uppercase tracking-[0.2em] text-[10px] text-gray-400">Total Revenue</span>
          </div>
          <div className="flex flex-col">
            <span className="text-4xl font-black text-gray-900">
              {statsLoading ? "..." : formatCurrency(stats?.total_revenue || 0)}
            </span>
            <span className="text-xs font-bold text-approve mt-2 flex items-center gap-1">
              <TrendingUp size={12} /> Live from all enrollments
            </span>
          </div>
        </div>

        <div className="relative overflow-hidden group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
            <Users size={120} />
          </div>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600">
              <Users size={24} />
            </div>
            <span className="font-black uppercase tracking-[0.2em] text-[10px] text-gray-400">Total Students</span>
          </div>
          <div className="flex flex-col">
            <span className="text-4xl font-black text-gray-900">
              {statsLoading ? "..." : stats?.total_students || 0}
            </span>
            <span className="text-xs font-bold text-gray-400 mt-2">Enrolled across all courses</span>
          </div>
        </div>

        <div className="relative overflow-hidden group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
            <GraduationCap size={120} />
          </div>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-amber-50 rounded-2xl text-amber-600">
              <GraduationCap size={24} />
            </div>
            <span className="font-black uppercase tracking-[0.2em] text-[10px] text-gray-400">Total Enrollments</span>
          </div>
          <div className="flex flex-col">
            <span className="text-4xl font-black text-gray-900">
              {statsLoading ? "..." : stats?.total_enrollments || 0}
            </span>
            <span className="text-xs font-bold text-gray-400 mt-2">Course registrations</span>
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
            <Receipt className="text-primary" />
            Payment History
          </h2>

          <div className="flex items-center gap-3">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Search students or ref..." 
                  className="pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <div className="relative flex items-center bg-white border border-gray-200 rounded-2xl px-4 py-3 group focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary transition-all">
                <Filter className="text-gray-400" size={18} />
                <select 
                  className="bg-transparent text-sm font-bold outline-none border-none cursor-pointer pl-2"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="success">Success</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
             </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">Student & Course</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">Transaction ID</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">Amount</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">Date</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {txLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-8 py-6 h-20 bg-gray-50/30"></td>
                    </tr>
                  ))
                ) : filteredTransactions?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 text-gray-400">
                         <Receipt size={48} className="opacity-20" />
                         <p className="font-black uppercase tracking-widest text-xs">No transactions found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions?.map((tx: Transaction) => (
                    <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-black text-gray-900">{tx.first_name} {tx.last_name}</span>
                          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{tx.course_title || 'General Payment'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs font-medium text-gray-500">#{tx.reference || tx.id}</span>
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{tx.provider}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-black text-gray-900">{formatCurrency(tx.amount)}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-bold text-gray-500">{formatDate(tx.created_at)}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-center">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            tx.status === 'success' || tx.status === 'paid' 
                              ? 'bg-approve/10 text-approve border border-approve/20' 
                              : tx.status === 'failed' 
                              ? 'bg-secondary/10 text-secondary border border-secondary/20'
                              : 'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                            {tx.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFinancePage;
