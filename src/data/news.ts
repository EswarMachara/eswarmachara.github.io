import type { RichText } from "./types";

export interface NewsItem {
  year: string;
  segments: RichText;
}

export const news: NewsItem[] = [
  {
    year: "2025",
    segments: [
      { text: "Paper accepted at " },
      {
        text: "ICCV 2025",
        href: "https://openaccess.thecvf.com/content/ICCV2025W/CVAUI%20&%20AAMVEM/papers/Retta_DebrisVision_Bridging_the_Synthetic-to-Real_Gap_for_Enhanced_Underwater_Debris_Analysis_ICCVW_2025_paper.pdf",
      },
      { text: ": “DebrisVision: Bridging the Synthetic-to-Real Gap for Enhanced Underwater Debris Analysis”." },
    ],
  },
  {
    year: "2025",
    segments: [
      { text: "Finalist at " },
      {
        text: "IEEE EMBS BHI 2025 Data Competition",
        href: "https://www.linkedin.com/posts/sai-manikanta-eswar-machara_presentation-of-team-csosen-activity-7409841477511622656-tLNB?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAEq6X-EBaf7NE8cpnGRIqbGf4tCm3ACoE04",
      },
      { text: " — MINDER framework for depression score prediction." },
    ],
  },
  {
    year: "2025",
    segments: [
      { text: "Top 140 at " },
      {
        text: "ISRO Bharatiya Antariksha Hackathon",
        href: "https://www.linkedin.com/posts/sai-manikanta-eswar-machara_%F0%9D%90%93%F0%9D%90%9E%F0%9D%90%9A%F0%9D%90%A6-%F0%9D%90%94%F0%9D%90%A6%F0%9D%90%9B%F0%9D%90%AB%F0%9D%90%9A-%F0%9D%90%8B%F0%9D%90%A2%F0%9D%90%A0%F0%9D%90%A1%F0%9D%90%AD%F0%9D%90%A7%F0%9D%90%9E%F0%9D%90%AB-activity-7355656712659296259-l7R6?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAEq6X-EBaf7NE8cpnGRIqbGf4tCm3ACoE04",
      },
      { text: " — Selected among national top teams for remote sensing AI proposal." },
    ],
  },
  {
    year: "2025",
    segments: [
      { text: "Winner at " },
      {
        text: "AI4AP Police Hackathon 2025",
        href: "https://www.linkedin.com/posts/sai-manikanta-eswar-machara_aiforgovernance-hackathonwinners-computervision-activity-7350483463830921218-u91J?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAEq6X-EBaf7NE8cpnGRIqbGf4tCm3ACoE04",
      },
      { text: ", Guntur — 1st place in Use Case 6 (Personnel Evaluation)." },
    ],
  },
  {
    year: "2024",
    segments: [
      { text: "2nd Runner-up at " },
      {
        text: "IEEE INDICON Intel AI Hackathon",
        href: "https://www.linkedin.com/posts/sai-manikanta-eswar-machara_knowledge-ai-research-activity-7280185753156956160-Oikq?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAEq6X-EBaf7NE8cpnGRIqbGf4tCm3ACoE04",
      },
      { text: ", IIT Kharagpur — CardioLens project for echocardiogram analysis." },
    ],
  },
  {
    year: "2024",
    segments: [
      { text: "22nd Position at " },
      {
        text: "MAIC (Multimodal AI4TB Challenge)",
        href: "https://www.linkedin.com/posts/sai-manikanta-eswar-machara_hackathon-teammate-international-activity-7274379337334763520-7MN7?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAEq6X-EBaf7NE8cpnGRIqbGf4tCm3ACoE04",
      },
      { text: ", South Korea — Represented India in international AI competition." },
    ],
  },
];
