import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { academyApi } from "../api/academy";
import { formatCurrency } from "../utils/formatUtils";
import SEO from "../components/SEO";

const CoursesPage: React.FC = () => {
  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: academyApi.getCourses,
  });

  // Shown as fallback when the DB has no courses yet
  const staticCourses = [
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
    <div className="py-12 sm:py-20">
      <SEO 
        title="Courses"
        description="Explore our available tech programs. Software Engineering, Data Analytics, and Data Science courses designed by industry experts."
      />
      
      <section className="mx-auto max-w-7xl px-4 space-y-8 sm:space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold tracking-widest uppercase mx-auto animate-pulse">
            <div className="h-2 w-2 rounded-full bg-red-600" />
            Limited Intake — Secure Your Future Today
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-none uppercase">
            Pick Your <span className="text-primary italic">Career Path</span>
          </h1>
          
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 max-w-lg mx-auto transform hover:scale-105 transition-transform duration-300 shadow-sm">
            <p className="text-primary font-bold text-sm sm:text-base flex items-center justify-center gap-2">
              <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter">New</span>
              Grab your installment payment option today! 💳
            </p>
          </div>

          <p className="text-slate-600 text-lg sm:text-xl max-w-2xl mx-auto font-medium">
            Join the elite 1% of tech talent. Choose a course and start your journey to a high-paying tech role in months, not years.
          </p>
          <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="aspect-video animate-pulse rounded-3xl bg-muted" />
            ))}
          </div>
        ) : courses && courses.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course: any) => (
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
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex flex-wrap justify-end gap-2">
                        <span className="text-[10px] text-slate-600 font-bold italic bg-slate-100 px-2 py-0.5 rounded-full">Installment available ✅</span>
                        <span className="text-[10px] text-red-500 font-bold animate-pulse text-right">Limited Seats Available</span>
                      </div>
                      <Link 
                        to={`/enroll/${course.id}`}
                        className="bg-primary text-white px-6 py-3 rounded-xl font-black text-xs tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-primary/20"
                      >
                        SECURE YOUR SPOT
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
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
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex flex-wrap justify-end gap-2">
                        <span className="text-[10px] text-slate-600 font-bold italic bg-slate-100 px-2 py-0.5 rounded-full">Installment available ✅</span>
                        <span className="text-[10px] text-red-500 font-bold animate-pulse text-right">Limited spots!</span>
                      </div>
                      <Link 
                        to="/register"
                        className="bg-primary text-white px-6 py-3 rounded-xl font-black text-xs tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-primary/20"
                      >
                        SECURE YOUR SPOT
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CoursesPage;
