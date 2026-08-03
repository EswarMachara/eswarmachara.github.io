import type { RichText } from "./types";

export type BadgeVariant = "conf" | "workshop" | "journal" | "preprint" | "award" | "research";

export interface Publication {
  slug: string;
  title: string;
  paperHref?: string;
  venueBadge: { label: string; variant: BadgeVariant };
  authors: RichText;
  venue: string;
  thumbnail: string;
  links: { label: string; href: string }[];
}

export const publications: Publication[] = [
  {
    slug: "debrisvision",
    title: "DebrisVision: Bridging the Synthetic-to-Real Gap for Enhanced Underwater Debris Analysis",
    paperHref:
      "https://openaccess.thecvf.com/content/ICCV2025W/CVAUI%20&%20AAMVEM/papers/Retta_DebrisVision_Bridging_the_Synthetic-to-Real_Gap_for_Enhanced_Underwater_Debris_Analysis_ICCVW_2025_paper.pdf",
    venueBadge: { label: "ICCV 2025", variant: "conf" },
    authors: [
      { text: "Sivaji Retta, " },
      { text: "Sai Manikanta Eswar Machara", bold: true },
      { text: ", Iyyakutti Iyappan Ganapathi, Divya Velayudhan, Naoufel Werghi" },
    ],
    venue: "International Conference on Computer Vision (CVAUI & AAMVEM Workshop), 2025",
    thumbnail: "/images/publications/debris_vision.png",
    links: [
      {
        label: "Paper",
        href: "https://openaccess.thecvf.com/content/ICCV2025W/CVAUI%20&%20AAMVEM/papers/Retta_DebrisVision_Bridging_the_Synthetic-to-Real_Gap_for_Enhanced_Underwater_Debris_Analysis_ICCVW_2025_paper.pdf",
      },
      { label: "Code", href: "https://github.com/EswarMachara/DebrisVision" },
    ],
  },
  {
    slug: "cips-net",
    title: "CIPS-Net: A Comprehensive Framework for Histopathology Image Analysis",
    venueBadge: { label: "MICCAI 2026", variant: "conf" },
    authors: [
      { text: "Sai Manikanta Eswar Machara", bold: true },
      { text: "†, Nikhileswara Rao Sulake†, Sivaji Retta, Iyyakutti Iyappan Ganapathi, Naoufel Werghi" },
    ],
    venue: "29th Medical Image Computing and Computer Assisted Intervention (MICCAI), 2026 [*Under Review]",
    thumbnail: "/images/publications/cips_net_paper.png",
    links: [],
  },
  {
    slug: "minder",
    title:
      "MINDER: Machine LearnIng Framework for DepressioN Score Analysis in MinDfulness IntERventions across Medically Complex Patients",
    venueBadge: { label: "IEEE CONNECT 2026", variant: "conf" },
    authors: [
      { text: "Nikhileswara Rao Sulake, " },
      { text: "Sai Manikanta Eswar Machara", bold: true },
      { text: ", Divya Katam, Sivalal Kethavath" },
    ],
    venue: "12th IEEE International Conference on Electronics, Computing and Communication Technologies 2026 [*Under Review]",
    thumbnail: "/images/publications/minder_paper.png",
    links: [],
  },
];

export interface OngoingResearchItem {
  title: string;
  description: string;
}

export const ongoingResearch: OngoingResearchItem[] = [
  {
    title: "HuMAR",
    description:
      "Working on developing efficient and scalable text-instructed vision-language model for multimodal and multitasking Human Centric detection.",
  },
  {
    title: "PDS with H&E slides",
    description:
      "Working on predicting the P53 Deficiency Score (PDS) of Breast cancer patients using H&E stained histopathology slides to improve prognostic accuracy and treatment planning.",
  },
  {
    title: "DeepFake MRI Detection",
    description: "Working on Zero shot or Few shot methods for Deepfake image detection in Medical Data.",
  },
  {
    title: "Tiny Object Detection",
    description: "Working on improving Detection accuracy for tiny-scale objects in Aerial imagery.",
  },
];

export interface Competition {
  rank: string;
  rankHref: string;
  name: RichText;
}

export const competitions: Competition[] = [
  {
    rank: "Top 10",
    rankHref:
      "https://www.linkedin.com/posts/sai-manikanta-eswar-machara_presentation-of-team-csosen-activity-7409841477511622656-tLNB/?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAEq6X-EBaf7NE8cpnGRIqbGf4tCm3ACoE04",
    name: [
      { text: "Track 1, IEEE EMBS " },
      { text: "Biomedical & Health Informatics", href: "https://bhi.embs.org/2025/" },
      { text: " (BHI) Conference Data Competition, 2025" },
    ],
  },
  {
    rank: "Top 22",
    rankHref:
      "https://www.linkedin.com/posts/sai-manikanta-eswar-machara_hackathon-teammate-international-activity-7274379337334763520-7MN7?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAEq6X-EBaf7NE8cpnGRIqbGf4tCm3ACoE04",
    name: [
      { text: "Multimodal AI4TB Challenge (MAIC), " },
      { text: "Seoul National University Hospital", href: "http://www.snuh.org/global/en/main.do" },
      { text: ", 2024" },
    ],
  },
  {
    rank: "Top 3",
    rankHref:
      "https://www.linkedin.com/posts/sai-manikanta-eswar-machara_knowledge-ai-research-activity-7280185753156956160-Oikq?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAEq6X-EBaf7NE8cpnGRIqbGf4tCm3ACoE04",
    name: [
      { text: "Intel AI Hackathon 2024, IEEE Indicon", href: "https://ieeeindicon.org/" },
      { text: " at IIT Kharagpur, 2024" },
    ],
  },
];
