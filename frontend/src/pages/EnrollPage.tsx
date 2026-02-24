import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { academyApi } from "../api/academy";
import { formatCurrency } from "../utils/formatUtils";
import { useAuth } from "../state/AuthContext";
import { Input } from "../components/forms/Input";
import { CheckoutButton } from "../components/Payment/CheckoutButton";
import { CheckCircle, CreditCard, ShieldCheck, BrainCircuit, Target, Users } from "lucide-react";

const EnrollPage: React.FC = () => {
    const { courseId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [firstName, setFirstName] = useState(user?.firstName || "");
    const [lastName, setLastName] = useState(user?.lastName || "");
    const [email, setEmail] = useState(user?.email || "");
    const [paymentPlan, setPaymentPlan] = useState<"one-time" | "installment">("one-time");
    const [installmentCount, setInstallmentCount] = useState<number>(3);

    const { data: courses, isLoading } = useQuery({
        queryKey: ["courses"],
        queryFn: academyApi.getCourses,
    });

    const course = courses?.find(c => c.id === parseInt(courseId || "0"));

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-slate-500 font-bold animate-pulse text-sm uppercase tracking-widest">Identifying Academic Record...</p>
        </div>
    );

    if (!course) return (
        <div className="max-w-2xl mx-auto py-32 text-center space-y-6">
            <div className="h-20 w-20 bg-secondary/10 rounded-3xl flex items-center justify-center mx-auto text-secondary">
                <ShieldCheck className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Access Restricted</h2>
            <p className="text-slate-500 font-medium">This enrollment link has expired or the course is no longer available in our curriculum.</p>
            <button onClick={() => navigate("/")} className="inline-block bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-all">
                Return to Academy
            </button>
        </div>
    );

    const installmentPrice = Math.round(course.price / installmentCount);

    return (
        <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12 px- sm:px-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16">
                {/* Left: Course Summary */}
                <div className="space-y-6 sm:space-y-8">
                    <div className="space-y-3 sm:space-y-4">
                        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Complete Your <span className="text-primary italic">Enrollment</span></h1>
                        <p className="text-slate-500 text-sm sm:text-base">Fast-track your tech career with {course?.title}. Finalize your spot in the upcoming cohort.</p>
                    </div>

                    <div className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 border border-slate-200 hide-scrollbar space-y-4 sm:space-y-6 shadow-sm">
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
                            <img 
                                src={course?.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop"} 
                                className="h-40 sm:h-24 w-full sm:w-40 object-cover rounded-xl sm:rounded-2xl shadow-md border-2 border-slate-100"
                                alt=""
                            />
                            <div>
                                <h3 className="text-xl sm:text-xl font-black text-slate-900">{course?.title}</h3>
                                <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Academy Track</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-slate-100">
                            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-bold text-slate-600 bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>
                                <span>3 Months Sprints</span>
                            </div>
                            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-bold text-slate-600 bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                                    <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>
                                <span>10:1 Student-Tutor Ratio</span>
                            </div>
                            <div className="flex flex-col gap-3 bg-slate-50 p-4 rounded-2xl">
                                <div className="flex items-center gap-4 text-xs sm:text-sm font-bold text-slate-800">
                                    <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                                        <BrainCircuit className="h-5 w-5" />
                                    </div>
                                    <span>Career & AI Readiness</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 pl-12">
                                     {["Resume Writing", "Presentation Skills", "Career Positioning", "AI Workflows"].map((skill) => (
                                         <div key={skill} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                             <div className="h-1 w-1 rounded-full bg-blue-400" />
                                             {skill}
                                         </div>
                                     ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-bold text-slate-600 bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>
                                <span>Access to Live Class Recordings</span>
                             </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 flex gap-4 sm:gap-6 items-start">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 bg-primary/20 rounded-xl sm:rounded-2xl flex items-center justify-center text-primary shrink-0">
                            <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div>
                            <h4 className="text-white font-black uppercase text-[10px] sm:text-xs tracking-widest mb-1">Veleon Trust Guarantee</h4>
                            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">Your data and payments are secured with enterprise-grade encryption through Paystack.</p>
                        </div>
                    </div>
                </div>

                {/* Right: Personal Info & Plan */}
                <div className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-slate-200 p-6 sm:p-12 shadow-2xl shadow-slate-200/50 space-y-8 sm:space-y-12">
                    <div className="space-y-6 sm:space-y-8">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm sm:text-base">1</div>
                            <h3 className="text-xl sm:text-2xl font-black text-slate-900">Student Profile</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-1.5 sm:space-y-2">
                                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">Legal First Name</label>
                                <Input disabled={!!user} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" />
                            </div>
                            <div className="space-y-1.5 sm:space-y-2">
                                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">Legal Last Name</label>
                                <Input disabled={!!user} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" />
                            </div>
                        </div>
                        <div className="space-y-1.5 sm:space-y-2">
                             <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Email</label>
                             <Input disabled={!!user} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" />
                             {!user && <p className="text-[9px] sm:text-[10px] text-primary font-bold italic mt-1">● Account will be auto-generated upon success.</p>}
                        </div>
                    </div>

                    <div className="space-y-6 sm:space-y-8">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm sm:text-base">2</div>
                            <h3 className="text-xl sm:text-2xl font-black text-slate-900">Enrollment Plan</h3>
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                            <button 
                                onClick={() => setPaymentPlan("one-time")}
                                className={`w-full flex items-center justify-between p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] border-2 transition-all ${paymentPlan === "one-time" ? 'border-primary bg-primary/5 shadow-xl scale-[1.01] sm:scale-[1.02]' : 'border-slate-100 hover:border-slate-200'}`}
                            >
                                <div className="flex items-center gap-4 sm:gap-6">
                                    <div className={`h-6 w-6 sm:h-8 sm:w-8 rounded-full border-[3px] sm:border-4 flex items-center justify-center ${paymentPlan === "one-time" ? 'border-primary' : 'border-slate-200'}`}>
                                        {paymentPlan === "one-time" && <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-primary" />}
                                    </div>
                                    <div className="text-left">
                                        <div className="font-black text-slate-900 text-base sm:text-lg">Full Tuition</div>
                                        <div className="text-[9px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest">Single Settlement</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{formatCurrency(course?.price || 0)}</div>
                                </div>
                            </button>

                            <div className={`w-full flex flex-col p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border-2 transition-all ${paymentPlan === "installment" ? 'border-secondary bg-secondary/5 shadow-xl scale-[1.01] sm:scale-[1.02]' : 'border-slate-100'}`}>
                                <button 
                                    onClick={() => setPaymentPlan("installment")}
                                    className="flex items-center justify-between w-full"
                                >
                                    <div className="flex items-center gap-4 sm:gap-6">
                                        <div className={`h-6 w-6 sm:h-8 sm:w-8 rounded-full border-[3px] sm:border-4 flex items-center justify-center ${paymentPlan === "installment" ? 'border-secondary' : 'border-slate-200'}`}>
                                            {paymentPlan === "installment" && <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-secondary" />}
                                        </div>
                                        <div className="text-left">
                                            <div className="font-black text-slate-900 text-base sm:text-lg">Flexible Plan</div>
                                            <div className="text-[9px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest">3 Month Cycle</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl sm:text-2xl font-black text-secondary tracking-tight">{formatCurrency(installmentPrice)}</div>
                                    </div>
                                </button>

                                {paymentPlan === "installment" && (
                                    <div className="mt-5 sm:mt-8 pt-5 sm:pt-8 border-t border-secondary/20 space-y-4 sm:space-y-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                          <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Split Payments:</div>
                                          <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{installmentCount} Installations</div>
                                        </div>
                                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
                                            {[3, 4, 5, 6, 10, 12].map(count => (
                                                <button
                                                    key={count}
                                                    onClick={() => setInstallmentCount(count)}
                                                    className={`py-3 sm:py-4 px-1 sm:px-2 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest border-2 transition-all ${installmentCount === count ? 'bg-secondary text-white border-secondary shadow-lg shadow-secondary/20 -translate-y-1' : 'bg-white text-slate-600 border-slate-100 hover:border-secondary/30'}`}
                                                >
                                                    {count}x
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase text-center tracking-widest">
                                            Note: Total balance must be cleared within 90 days.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 sm:pt-8 border-t border-slate-100">
                        <CheckoutButton 
                            amount={course!.price}
                            currency="NGN"
                            type={paymentPlan}
                            itemId={course?.id}
                            fullWidth
                            label={paymentPlan === "one-time" ? "AUTHORIZE FULL TUITION" : `AUTHORIZE ${formatCurrency(installmentPrice)} NOW`}
                            className={`h-16 sm:h-20 rounded-2xl sm:rounded-3xl font-black text-xs sm:text-sm tracking-[0.15em] sm:tracking-[0.2em] shadow-xl sm:shadow-2xl ${paymentPlan === 'one-time' ? 'shadow-primary/30' : 'shadow-secondary/30'}`}
                            provider="paystack"
                            guestCheckout={!user}
                            metadata={{
                                firstName,
                                lastName,
                                email,
                                courseId: course?.id.toString(),
                                paymentPlan,
                                installmentsTotal: paymentPlan === "installment" ? installmentCount.toString() : "1"
                            }}
                        />
                        <div className="flex items-center justify-center gap-4 sm:gap-6 mt-6 sm:mt-8 opacity-40 grayscale group-hover:grayscale-0 transition-all">
                             <img src="https://static.paystack.com/assets/img/logo/white.png" alt="Paystack" className="h-3 sm:h-4 invert" />
                             <ShieldCheck className="h-3 sm:h-4 w-3 sm:w-4" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnrollPage;
