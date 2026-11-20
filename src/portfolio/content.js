export const initialContent = {
  profile: {
    name: "Syed Sufyan M",
    role: "Software developer · CSE undergraduate",
    headline: "Ideas into\nthings that\nmove.",
    intro:
      "I develop web applications for campus workflows, production systems and applied AI.",
    about:
      "I’m Syed, a Computer Science and Engineering student at National Engineering College. My work spans campus platforms, production systems and experiments in computational intelligence. I enjoy getting into the details: how a system works, where it breaks, and how to make it easier for the person using it.",
    location: "Tirunelveli, India",
    email: "syedsufyanpersonal@gmail.com",
    availability: "Open to internships & collaborations",
    photo: "/assets/portrait.webp",
    resume: "/assets/syed-sufyan-resume.pdf",
    github: "https://github.com/Syed-git-07",
    linkedin: "https://www.linkedin.com/in/syed-sufyan-297904323/",
    leetcode: "https://leetcode.com/u/Mightbe_Syed/",
  },
  projects: [
    {
      id: "kr-exports",
      title: "KR Exports",
      category: "Industry",
      subtitle: "Production, with a clearer picture.",
      description:
        "A production management system for KR Mill, bringing manufacturing information into a web application.",
      detail:
        "Production management for KR Mill, built with Next.js and MySQL. A related experiment, Mill VoiceAI, explores retrieving production information through conversation.",
      tags: "Next.js, MySQL",
      url: "https://krexports.org/kr-production-app/",
      source: "",
      image: "/assets/projects/kr-exports.webp",
      visual: "production",
    },
    {
      id: "fee-portal",
      title: "NEC Fee Portal",
      category: "Campus",
      subtitle: "A simpler path from fees to receipts.",
      description: "A fee payment portal for National Engineering College.",
      detail:
        "A web portal for fee payments at National Engineering College, developed alongside the NEC Fee Bot.",
      tags: "Web application, Payments",
      url: "https://nec.edu.in/SampleERP",
      source: "",
      image: "/assets/projects/fee-portal.webp",
      visual: "payment",
    },
    {
      id: "achuppori",
      title: "Autonomous Achuppori",
      category: "Campus",
      subtitle: "Self-service document printing.",
      description: "Upload a document, configure a print order and slide to pay.",
      detail: "Achuppori connects document uploads and checkout to campus print stations. Students choose their files and confirm the print order before payment.",
      tags: "Flutter, Python, Razorpay",
      url: "https://nec.edu.in/achuppori/",
      source: "https://github.com/RamPrasathM-2005/Autonomous-Printer",
      image: "/assets/projects/print-checkout.webp",
      visual: "printing",
    },
    {
      id: "sso",
      title: "NEC Single Sign-On",
      category: "Identity",
      subtitle: "One sign-in for campus applications.",
      description: "Central authentication for NEC applications using Keycloak.",
      detail: "A shared sign-in for campus systems, including the fee portal and institute management system. Keycloak manages identity while application grants determine which services a user can access.",
      tags: "Keycloak, OpenID Connect, Node.js",
      url: "",
      source: "https://github.com/Syed-git-07/SSO_NEC",
      image: "/assets/projects/nec-signin.webp",
      visual: "identity",
    },
    {
      id: "riskguard",
      title: "RiskGuard AI",
      category: "Intelligence",
      subtitle: "A closer look before a payment.",
      description: "An exploration of pre-payment fraud and anomaly detection.",
      detail:
        "A self-initiated project exploring fraud and anomaly detection before a payment. Developed in 2026.",
      tags: "AI, Anomaly detection",
      url: "",
      source: "https://github.com/Syed-git-07/RiskGuard-AI",
      image: "/assets/projects/riskguard.webp",
      visual: "risk",
    },
    {
      id: "scheduler",
      title: "Timetable Scheduler",
      category: "Campus",
      subtitle: "Less conflict. More structure.",
      description:
        "A scheduling application that coordinates teachers, rooms and subjects.",
      detail:
        "Developed with Spring Boot, Java and MySQL. Constraint-based scheduling logic helps resolve clashes between teachers, rooms and subjects and produces organized class timetables.",
      tags: "Java, Spring Boot, MySQL",
      url: "",
      source: "https://github.com/Syed-git-07/timetable_scheduler_system",
      image: "/assets/projects/scheduler.webp",
      visual: "schedule",
    },
    {
      id: "ims",
      title: "Institute Management System",
      category: "Campus",
      subtitle: "Connected campus workflows.",
      description:
        "An active contribution to the NEC institute management system.",
      detail:
        "An ongoing contribution to the institute management application at National Engineering College, supporting campus workflows.",
      tags: "MongoDB, Express, React, Node.js",
      url: "https://erp.nec.edu.in/ims/",
      source: "",
      image: "/assets/projects/ims.webp",
      visual: "campus",
    },
    {
      id: "youtube",
      title: "YouTube UI",
      category: "Interface",
      subtitle: "A study in responsive interfaces.",
      description:
        "A responsive frontend inspired by the familiar video browsing experience.",
      detail:
        "A frontend project exploring responsive grids, navigation, search and light and dark presentation across screen sizes.",
      tags: "HTML, CSS, JavaScript",
      url: "https://youtube-clone-dun-xi.vercel.app/",
      source: "https://github.com/Syed-git-07/Youtube_clone",
      image: "/assets/projects/youtube.webp",
      visual: "video",
    },
  ],
  skills: [
    {
      id: "web",
      title: "Web development",
      description: "Interfaces, services and the data that connects them.",
      items:
        "React, Next.js, Node.js, Express, Spring Boot, HTML, CSS, REST APIs",
    },
    {
      id: "languages",
      title: "Languages & data",
      description: "The tools I use to work through a problem.",
      items: "Java, JavaScript, Python, C, C++, SQL, MySQL, MongoDB",
    },
    {
      id: "intelligence",
      title: "Intelligent systems",
      description:
        "Exploring the intersection of software and computational intelligence.",
      items: "RAG, LLMs, OpenCV, NumPy, Scikit-learn, Deep learning",
    },
    {
      id: "workflow",
      title: "Working practice",
      description: "Version control, debugging and building with others.",
      items: "Git, GitHub, Postman, Problem solving, English, Tamil",
    },
  ],
  education: [
    {
      id: "college",
      period: "2024 — 2028",
      title: "B.E. Computer Science & Engineering",
      place: "National Engineering College, Kovilpatti",
      note: "8.67 CGPA · through semester 4",
    },
    {
      id: "hsc",
      period: "2023 — 2024",
      title: "Higher Secondary",
      place: "Bell Matric Hr. Sec. School, Tirunelveli",
      note: "90%",
    },
    {
      id: "sslc",
      period: "2021 — 2022",
      title: "Secondary School",
      place: "Seventh Day Adventist School, Srivaikundam",
      note: "89%",
    },
  ],
  certificates: [
    {
      id: "iiot",
      title: "Industry 4.0 & Industrial IoT",
      issuer: "NPTEL · IIT Kharagpur",
      score: "82%",
      file: "/others/NPTEL_IIOT4.0.pdf",
    },
    {
      id: "iot",
      title: "Introduction to Internet of Things",
      issuer: "NPTEL · IIT Kharagpur",
      score: "84%",
      file: "/others/NPTEL_Introduction to Internet of Things.pdf",
    },
    {
      id: "english",
      title: "Technical English",
      issuer: "NPTEL · IIT Madras",
      score: "78%",
      file: "/others/NPTEL_Technical English for engineers.pdf",
    },
    {
      id: "python",
      title: "The Joy of Computing using Python",
      issuer: "NPTEL · IIT Ropar",
      score: "73%",
      file: "/others/NPTEL_Joyofcomputing_using_python.pdf",
    },
    {
      id: "deep-learning",
      title: "Foundations of Deep Learning",
      issuer: "NPTEL · IIT Ropar",
      score: "70%",
      file: "/others/NPTEL_Foundations of Deep learning .pdf",
    },
  ],
  achievements: [
    {
      id: "project",
      title: "Project presentation",
      place: "KPR Institute of Engineering and Technology",
      award: "1st place",
    },
    {
      id: "quiz",
      title: "Technical quiz",
      place: "KPR Institute of Engineering and Technology",
      award: "1st place",
    },
    {
      id: "ctf",
      title: "Capture the Flag",
      place: "KPR Institute of Engineering and Technology",
      award: "2nd place",
    },
    {
      id: "enigma",
      title: "Enigma · Cryptography",
      place: "SSN College of Engineering",
      award: "3rd place",
    },
    {
      id: "mapathon",
      title: "FOSSEE Geospatial Mapathon",
      place: "IIT Bombay",
      award: "Notable participant",
    },
    {
      id: "codestorm",
      title: "CODE STORM 25",
      place: "NRCM, Hyderabad · National hackathon",
      award: "Recognition",
    },
  ],
  pages: [],
};

// Preview URLs are editable alongside each certificate's original document.
initialContent.certificates = initialContent.certificates.map(c => ({...c,image:`/assets/certificates/${c.id}.webp`}));

export function safeUrl(value, kind = "link") {
  if (
    typeof value !== "string" ||
    [...value].some((c) => c.charCodeAt(0) < 32 || c === "\\")
  )
    return "";
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const u = new URL(value);
    return u.protocol === "https:" ||
      (kind === "link" && u.protocol === "mailto:")
      ? u.href
      : "";
  } catch {
    return "";
  }
}

export function validateContent(data) {
  if (!data || typeof data !== "object" || !data.profile)
    throw new Error("Missing profile.");
  for (const key of Object.keys(initialContent.profile)) {
    if (
      typeof data.profile[key] !== "string" ||
      data.profile[key].length > 6000
    )
      throw new Error(`Invalid profile field: ${key}`);
  }
  if (
    !data.profile.name.trim() ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.profile.email)
  )
    throw new Error("Enter a name and valid email.");
  for (const key of [
    "projects",
    "skills",
    "education",
    "certificates",
    "achievements",
    "pages",
  ]) {
    if (!Array.isArray(data[key]) || data[key].length > 100)
      throw new Error(`Invalid ${key}.`);
    const seen = new Set();
    const required =
      key === "pages"
        ? ["id", "title", "body", "image"]
        : Object.keys(initialContent[key][0]);
    for (const item of data[key]) {
      if(key === "certificates" && item && item.image === undefined) item.image = "";
      if (
        !item ||
        required.some((field) => typeof item[field] !== "string") ||
        Object.values(item).some(
          (v) => typeof v !== "string" || v.length > 20000,
        )
      )
        throw new Error(`Invalid fields in ${key}.`);
      if (
        !/^[a-z0-9-]+$/.test(item.id) ||
        seen.has(item.id) ||
        !item.title.trim()
      )
        throw new Error(`Use unique IDs and a title for ${key}.`);
      seen.add(item.id);
    }
  }
  return data;
}
