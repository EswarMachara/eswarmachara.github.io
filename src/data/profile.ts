import type { RichText } from "./types";

export const site = {
  name: "Sai Manikanta Eswar Machara",
  shortName: "Eswar Machara",
  url: "https://eswarmachara.github.io",
  email: "macharasaimanikantaeswar@gmail.com",
  github: "https://github.com/EswarMachara",
  linkedin: "https://www.linkedin.com/in/sai-manikanta-eswar-machara/",
  scholar: "https://scholar.google.com/citations?user=WPB2pcwAAAAJ",
  cv: "/docs/Eswar_Machara_CV.pdf",
};

export const profile = {
  title: "Undergraduate Researcher",
  program: "B.Tech in Computer Science and Engineering",
  location: "Vijayawada, India",
  university: "RGUKT, Nuzvid",
  headshot: "/images/profile/headshot.png",
};

export const bio: RichText[] = [
  [
    { text: "Hello, I'm Sai Manikanta Eswar Machara, a third-year undergraduate researcher in Computer Science and Engineering at " },
    { text: "Rajiv Gandhi University of Knowledge Technologies (RGUKT)", href: "https://rguktn.ac.in/" },
    { text: " in Nuzvid, India. My research interests are in Medical Imaging, Computational Biology, and Computer Vision, areas where I have been spending most of my time over the past couple of years, learning, building, and slowly finding my direction." },
  ],
  [
    { text: "I started with Medical Imaging, working on problems like Cardiac analysis, Thyroid Nodule Segmentation, and Histopathology and more recently I have been getting into Computational Biology and Computational Pathology, which I find equally exciting. I am drawn to problems that are grounded in Clinical Reality, where the work has to hold up not just technically but in a setting where it actually affects people." },
  ],
  [
    { text: "Along the way, I have had some good experiences - a publication at " },
    { text: "ICCV 2025", bold: true },
    { text: ", a few competition placements, and research collaborations that have taught me how to think more carefully about the problems I pick and the methods I use. I am grateful for the mentors and collaborators who have guided me, and I am excited to continue learning and contributing to this field." },
  ],
  [
    { text: "I am working toward a PhD in Medical Imaging or Computational Biology. My goal is to do research that sits close to clinical practice, the kind of work where the questions come from real problems and the results can find their way back to them." },
  ],
];

export interface EducationEntry {
  program: string;
  years: string;
  institution: string;
  location: string;
  gpa: string;
}

export const education: EducationEntry[] = [
  {
    program: "B.Tech in Computer Science and Engineering",
    years: "2023 – 2027",
    institution: "Rajiv Gandhi University of Knowledge Technologies, Nuzvid",
    location: "Andhra Pradesh, India",
    gpa: "CGPA: 8.95/10",
  },
];
