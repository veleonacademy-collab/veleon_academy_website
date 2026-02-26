import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import AdSection from "../components/AdSection";
import { TestimonialsSection } from "../components/TestimonialsSection";
import { Code, Database, LineChart, Cpu, BookOpen, Users, Award, ShieldCheck, Sparkles, Briefcase, CheckCircle, Target, BrainCircuit } from "lucide-react";
import { academyApi } from "../api/academy";
import { formatCurrency } from "../utils/formatUtils";
import { useAuth } from "../state/AuthContext";
import SEO from "../components/SEO";

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: academyApi.getCourses,
  });

  const featuredCourses = [
    { name: "Frontend Dev", icon: Code, color: "bg-cyan-50 text-cyan-600", border: "border-cyan-100", description: "Master React, Next.js and modern CSS." },
    { name: "Backend Dev", icon: Database, color: "bg-red-50 text-red-600", border: "border-red-100", description: "Node.js, PostgreSQL and System Design." },
    { name: "Data Analysis", icon: LineChart, color: "bg-blue-50 text-blue-600", border: "border-blue-100", description: "Python, SQL and PowerBI." },
    { name: "Data Science", icon: Cpu, color: "bg-purple-50 text-purple-600", border: "border-purple-100", description: "Machine Learning and AI fundamentals." },
  ];

  // Shown as fallback when the DB has no courses yet
  const staticCourses: {
    slug: string;
    title: string;
    description: string;
    price: number;
    thumbnail: string;
  }[] = [
    {
      slug: "frontend-dev",
      title: "Frontend Development",
      description: "Master React, Next.js, TypeScript, and modern CSS. Build real-world UIs that employers love.",
      price: 150000,
      thumbnail: "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=2064&auto=format&fit=crop",
    },
    {
      slug: "backend-dev",
      title: "Backend Development",
      description: "Node.js, Express, PostgreSQL, REST APIs and System Design — from fundamentals to production.",
      price: 150000,
      thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2034&auto=format&fit=crop",
    },
    {
      slug: "data-analysis",
      title: "Data Analysis",
      description: "Python, SQL, Excel, and Power BI. Turn raw data into insights that drive business decisions.",
      price: 120000,
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
    },
    {
      slug: "data-science",
      title: "Data Science & ML",
      description: "Machine Learning, Deep Learning, and AI fundamentals using Python, Scikit-learn, and TensorFlow.",
      price: 180000,
      thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2065&auto=format&fit=crop",
    },
  ];
  
  return (
    <div className="space-y-8 sm:space-y-12 pb-10 sm:pb-20">
      <SEO 
        title="Home"
        description="Master the future of technology with Veleon Academy. Industry-led training in Software Engineering, Data Analytics, and Data Science."
      />
      {/* Hero Section */}
      <section className="relative min-h-[70vh] sm:h-[80vh] w-full overflow-hidden flex items-center">
        <div className="absolute inset-0 bg-slate-900">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/10" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </div>
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-6 animate-fade-in">
            <Sparkles className="h-3 w-3" />
            Empowering Tech Leaders
          </div>
          <h1 className="font-heading text-4xl sm:text-7xl md:text-7xl font-black text-white tracking-tighter mb-4 sm:mb-6 leading-[0.95] sm:leading-[0.9]">
            MASTER THE <span className="text-primary">FUTURE</span> OF TECHNOLOGY
          </h1>
          <p className="max-w-2xl text-base sm:text-lg md:text-xl text-slate-300 mb-8 sm:mb-10 font-medium px-2">
            Join Veleon Academy. Industry-led training in Software Engineering, Data Analytics, and Data Science. From Zero to Job-Ready.
          </p>

          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mb-8 sm:mb-12 max-w-4xl animate-fade-in-up">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">
              <div className="bg-primary/20 p-1 rounded-full"><BrainCircuit className="h-4 w-4 text-primary" /></div>
              <span className="text-white text-xs sm:text-sm font-semibold tracking-tight">AI Leverage</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">
              <div className="bg-blue-500/20 p-1 rounded-full"><Target className="h-4 w-4 text-blue-400" /></div>
              <span className="text-white text-xs sm:text-sm font-semibold tracking-tight">Career Positioning</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">
              <div className="bg-green-500/20 p-1 rounded-full"><Users className="h-4 w-4 text-green-400" /></div>
              <span className="text-white text-xs sm:text-sm font-semibold tracking-tight">10:1 Student-Tutor Ratio</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">
              <div className="bg-purple-500/20 p-1 rounded-full"><Award className="h-4 w-4 text-purple-400" /></div>
              <span className="text-white text-xs sm:text-sm font-semibold tracking-tight">Resume & Presentation</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto text-center ">
             {user ? (
               <a
                  href="#courses"
                  className="w-full sm:w-auto rounded-xl bg-primary text-white px-10 py-5 font-bold text-sm tracking-widest hover:bg-primary/90 transition-all duration-300 shadow-2xl shadow-primary/20 hover:scale-105"
               >
                  REGISTER NOW
               </a>
             ) : (
               <Link
                  to="/register"
                  className="w-full sm:w-auto rounded-xl bg-primary text-white px-10 py-5 font-bold text-sm tracking-widest hover:bg-primary/90 transition-all duration-300 shadow-2xl shadow-primary/20 hover:scale-105"
               >
                  REGISTER NOW
               </Link>
             )}
             <a
                href="#courses"
                className="w-full sm:w-auto rounded-xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm text-white px-10 py-5 font-bold text-sm tracking-widest hover:bg-slate-700 transition-all duration-300"
            >
                EXPLORE COURSES
            </a>
          </div>
        </div>
      </section>
      
      {/* Featured Learning Path */}
      <section className="mx-auto max-w-7xl px-4 -mt-10 sm:-mt-16 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredCourses.map((fc) => (
                <div
                    key={fc.name}
                    className="flex flex-col p-6 sm:p-8 rounded-2xl border bg-white shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary/10 transition-all hover:-translate-y-2 group"
                >
                    <div className={`h-14 w-14 rounded-2xl ${fc.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                        <fc.icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{fc.name}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-4">{fc.description}</p>
                    <div className="mt-auto h-1 w-12 bg-gray-100 group-hover:bg-primary transition-colors" />
                </div>
            ))}
        </div>
      </section>

      {/* Ads Banner */}
      <AdSection />


      {/* Courses Grid */}
      <section id="courses" className="mx-auto max-w-7xl px-4 space-y-8 sm:space-y-12">
        <div className="text-center space-y-3 sm:space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Available <span className="text-primary italic">Programs</span></h2>
            <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto">Choose from our curriculum designed by industry experts to get you hired.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="aspect-video animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : courses && courses.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div key={course.id} className="group relative bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500">
                <div className="aspect-video overflow-hidden relative">
                    <img 
                        src={course.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop"} 
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-6 sm:p-8">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl sm:text-xl font-bold text-slate-900 leading-tight">{course.title}</h3>
                        <span className="text-primary font-black text-lg sm:text-xl">{formatCurrency(course.price)}</span>
                    </div>
                    <p className="text-slate-600 line-clamp-2 text-xs sm:text-sm mb-6 sm:mb-8">{course.description}</p>
                    <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <Users className="h-4 w-4" />
                            Active Cohort
                        </div>
                        <Link 
                            to={`/enroll/${course.id}`}
                            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-xs tracking-widest hover:bg-primary transition-colors"
                        >
                            ENROLL NOW
                        </Link>
                    </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Fallback static cards shown when DB has no courses yet */
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {staticCourses.map((course) => (
              <div key={course.slug} className="group relative bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500">
                <div className="aspect-video overflow-hidden relative">
                    <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-6 sm:p-8">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">{course.title}</h3>
                        <span className="text-primary font-black text-lg sm:text-xl">{formatCurrency(course.price)}</span>
                    </div>
                    <p className="text-slate-600 line-clamp-2 text-xs sm:text-sm mb-6 sm:mb-8">{course.description}</p>
                    <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <Users className="h-4 w-4" />
                            Active Cohort
                        </div>
                        <Link 
                            to="/register"
                            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-xs tracking-widest hover:bg-primary transition-colors"
                        >
                            ENROLL NOW
                        </Link>
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Us */}
      <section className="bg-slate-50 py-12 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
            <div className="space-y-6 sm:space-y-8">
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-[1.15] sm:leading-[1.1]">Why Students Choose <span className="text-primary">Veleon Academy</span></h2>
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900">Project-Based Learning</h4>
                            <p className="text-sm text-slate-500">Build real-world applications that fill your portfolio.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                            <Award className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900">Recognized Certification</h4>
                            <p className="text-sm text-slate-500">Earn a certificate that validates your expertise.</p>
                        </div>
                    </div>
                     <div className="flex gap-4">
                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900">Lifetime Support</h4>
                            <p className="text-sm text-slate-500">Get access to our mentorship community even after graduation.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                            <Briefcase className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900">Career & AI Readiness</h4>
                            <p className="text-sm text-slate-500">Learn presentation, resume writing, career positioning, and how to leverage AI in this evolving ecosystem.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                            <Target className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900">10:1 Personalized Monitoring</h4>
                            <p className="text-sm text-slate-500">Max 10 students per tutor ensuring proper monitoring, interaction, and personalized growth.</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="relative mt-8 md:mt-0">
                <div className="aspect-square rounded-3xl bg-primary/20 absolute -top-4 -right-4 -z-10" />
                <img 
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
                    alt="Students collaborating" 
                    className="rounded-3xl shadow-2xl"
                />
            </div>
        </div>
      </section>

      {/* Social Proof Section - Hidden until tech-related testimonials are ready */}
      {/* <TestimonialsSection /> */}
    </div>
  );
};

export default LandingPage;
