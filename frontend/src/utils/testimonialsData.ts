export interface Testimonial {
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar: string;
}

export interface WhatsAppChat {
  bg: string;
  text: string;
  time: string;
  isReply?: boolean;
}

export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    name: "Tunde B.",
    role: "Software Engineering Alumnus",
    text: "I was worried about switching from Accounting to Tech, but the mentor-led sessions made it seamless. I landed a Junior Developer role at a top fintech firm 2 months after graduation!",
    rating: 5,
    avatar: "/testimonials/tunde.png"
  },
  {
    name: "Amaka O.",
    role: "Data Science Student",
    text: "The hands-on projects are real-world simulations. Building a predictive model for a real business was the highlight of my learning journey. Highly recommend Veleon!",
    rating: 5,
    avatar: "/testimonials/amaka.png"
  },
  {
    name: "Ibrahim Y.",
    role: "AI & ML Cohort",
    text: "Professional tutors and a very supportive community. The 10:1 student-to-tutor ratio actually works—I never felt left behind despite the intensive pace.",
    rating: 5,
    avatar: "/testimonials/ibrahim.png"
  }
];

export const WHATSAPP_CHATS_DATA: WhatsAppChat[] = [
  {
    bg: "bg-[#DCF8C6]",
    text: "Good afternoon! I just got the offer from the firm we discussed during the React module! 🙌🙌",
    time: "14:30"
  },
  {
    bg: "bg-white",
    text: "That's incredible news, Tunde! So happy for you. Sending the onboarding prep guide now.",
    time: "14:32",
    isReply: true
  },
  {
    bg: "bg-[#DCF8C6]",
    text: "Thank you! Does the graduate program still offer lifetime access to the community?",
    time: "14:35"
  }
];

export const TESTIMONIALS_CONFIG = {
  badge: "Joined by 500+ Tech Leaders",
  title: {
    main: "Real Success from the",
    accent: "Academy"
  },
  description: "Hear from our alumni who transformed their careers through our industry-immersion programs.",
  whatsapp: {
    mentorName: "Veleon Academy Mentor",
    status: "online",
    inputPlaceholder: "Type a message..."
  },
  cta: {
    title: "Become our next success story",
    description: "Limited seats available for the upcoming cohort. Secure your career future today.",
    buttonText: "ENROLL NOW"
  }
};
