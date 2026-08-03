export interface ExperienceEntry {
  institution: string;
  logo: string;
  role: string;
  /** Advisor/PI. href left unset until a scholar or faculty profile link is confirmed. */
  person?: { name: string; href?: string };
  duration: string;
  /** Override for the logo's container box, e.g. a taller "h-32" for a logo that needs more room. */
  logoClassName?: string;
}

export const academicCollaborations: ExperienceEntry[] = [
  {
    institution: "TANUH, IISc Bangalore",
    logo: "/images/experience/iisc_logo.webp",
    role: "Research Intern, Renal Health",
    person: { name: "Prof. Phaneendra K. Yalavarthy", href: "https://scholar.google.co.in/citations?user=a7qDlNQAAAAJ&hl=en" },
    duration: "2026 - Present",
  },
  {
    institution: "MBZUAI",
    logo: "/images/experience/mbzuai_logo.webp",
    role: "Remote Research Assistant, Computational Biology",
    person: { name: "Prof. Yanding Zhao", href: "https://scholar.google.com/citations?user=5GJ_1iIAAAAJ&hl=en" },
    duration: "2026 - Present",
  },
  {
    institution: "Khalifa University",
    logo: "/images/experience/khalifa_logo.webp",
    role: "Research Collaborator",
    person: { name: "Dr. Iyyakutti I. Ganapathi", href: "https://scholar.google.com/citations?user=TMpGqLEAAAAJ&hl=en" },
    duration: "Aug 2025 - Present",
    logoClassName: "h-32",
  },
  {
    institution: "IISER, Trivandrum",
    logo: "/images/experience/iiser_logo.webp",
    role: "Research Collaborator",
    person: { name: "Dr. Raji Susan Mathew", href: "https://www.iisertvm.ac.in/faculty/rajisusanmathew" },
    duration: "Apr 2024 - Sep 2024",
  },
];

export const extraCurricular: ExperienceEntry[] = [
  {
    institution: "RGUKT Nuzvid",
    logo: "/images/experience/rgukt_alumni.webp",
    role: "Chief Coordinator - Alumni Relations",
    duration: "March 2023 - Oct 2025",
  },
];
