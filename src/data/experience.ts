export interface ExperienceEntry {
  institution: string;
  logo: string;
  role: string;
  person?: { name: string; href: string };
  duration: string;
  logoClassName?: string;
}

export const academicCollaborations: ExperienceEntry[] = [
  {
    institution: "Khalifa University",
    logo: "/images/experience/khalifa_logo.png",
    role: "Research Collaborator",
    person: { name: "Dr. Iyyakutti I. Ganapathi", href: "https://scholar.google.com/citations?user=TMpGqLEAAAAJ&hl=en" },
    duration: "Aug 2025 - Present",
    logoClassName: "max-w-[136px] max-h-[136px]",
  },
  {
    institution: "IISER, Trivandrum",
    logo: "/images/experience/iiser_logo.png",
    role: "Research Collaborator",
    person: { name: "Dr. Raji Susan Mathew", href: "https://www.iisertvm.ac.in/faculty/rajisusanmathew" },
    duration: "Apr 2024 - Sep 2024",
  },
];

export const extraCurricular: ExperienceEntry[] = [
  {
    institution: "RGUKT Nuzvid",
    logo: "/images/experience/rgukt_alumni.png",
    role: "Chief Coordinator - Alumni Relations",
    duration: "March 2023 - Oct 2025",
  },
];
