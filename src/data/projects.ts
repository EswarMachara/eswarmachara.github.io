import type { BadgeVariant } from "./research";
import type { ArticleAuthor, ArticleSection } from "./content";

export interface Project {
  slug: string;
  title: string;
  summary: string;
  thumbnail: string;
  badges: { label: string; variant: BadgeVariant }[];
  githubHref: string;
  comingSoon?: boolean;
  tags?: string[];
  authors?: ArticleAuthor[];
  affiliations?: string[];
  links?: { label: string; href: string; icon: "pdf" | "slides" | "code" }[];
  sections?: ArticleSection[];
}

export const projects: Project[] = [
  {
    slug: "cardiolens",
    title: "CardioLens: Comprehensive Cardiac AI Analysis Platform",
    summary:
      "An integrated AI-powered cardiac analysis platform for echocardiogram view classification, ejection fraction estimation, cardiomyopathy detection, and CTA-based coronary segmentation. Developed for the Intel AI Hackathon at IEEE INDICON 2024.",
    thumbnail: "/images/projects/cardiolens.png",
    badges: [
      { label: "2nd Runner-up @ IEEE INDICON 2024", variant: "award" },
      { label: "IIT Kharagpur", variant: "award" },
      { label: "Medical Imaging", variant: "research" },
    ],
    githubHref: "https://github.com/Nikhil-Rao20/Three_of_Hearts",
    authors: [
      { name: "Sai Manikanta Eswar Machara", affiliation: 1 },
      { name: "Nikhileswara Rao Sulake", href: "https://nikhil-rao20.github.io", affiliation: 1 },
      { name: "Aravind Pyli", affiliation: 2 },
      { name: "Sivalal Kethavath", affiliation: 2 },
    ],
    affiliations: ["Dept. of CSE, RGUKT Nuzvid", "Dept. of ECE, RGUKT Nuzvid"],
    links: [
      { label: "Report", href: "https://drive.google.com/file/d/180zWWF3xryS2JB3naXf1FNXH-BptQSk5/view?usp=sharing", icon: "pdf" },
      { label: "Slides", href: "https://docs.google.com/presentation/d/1PnEVrAEdt5EtYE1fIP79S1Vvm_9crvM5/edit?usp=sharing", icon: "slides" },
      { label: "Code", href: "https://github.com/Nikhil-Rao20/Three_of_Hearts", icon: "code" },
    ],
    sections: [
      {
        heading: "Problem Statement",
        blocks: [
          {
            kind: "paragraph",
            text: "Echocardiography is the primary non-invasive imaging modality for assessing cardiac function. Left ventricle (LV) segmentation and ejection fraction (EF) estimation are critical measurements that inform clinical decisions. Manual analysis is time-consuming, subject to inter-observer variability, and requires specialized expertise. Automated analysis systems can improve consistency and throughput in clinical settings.",
          },
        ],
      },
      {
        heading: "Motivation",
        blocks: [
          {
            kind: "paragraph",
            text: "Cardiovascular diseases remain the leading cause of mortality worldwide. Early and accurate assessment of cardiac function through echocardiography can significantly improve patient outcomes. An AI-assisted system that automates LV segmentation and EF calculation addresses the growing demand for efficient cardiac diagnostics, particularly in resource-constrained healthcare settings.",
          },
        ],
      },
      {
        heading: "Dataset",
        blocks: [
          {
            kind: "paragraph",
            text: "The system is developed and evaluated on the Stanford EchoNet-Dynamic dataset, a large-scale echocardiography video dataset containing:",
          },
          {
            kind: "list",
            items: [
              { text: "10,030 apical-4-chamber echocardiography videos" },
              { text: "Expert annotations for end-systolic and end-diastolic frames" },
              { text: "Frame-level left ventricle segmentation masks" },
              { text: "Clinically validated ejection fraction measurements" },
            ],
          },
        ],
      },
      {
        heading: "Methodology",
        blocks: [
          {
            kind: "paragraph",
            text: "CardioLens employs a multi-stage pipeline combining spatial segmentation with temporal regression:",
          },
          {
            kind: "list",
            items: [
              { label: "Stage 1:", text: "Frame-level LV segmentation using Intel DPT Large and ResNet-101 encoders with dense prediction heads" },
              { label: "Stage 2:", text: "Video-level EF regression using R2plus1D spatiotemporal convolutional network" },
              { label: "Stage 3:", text: "Cardiomyopathy classification from echocardiogram sequences" },
              { label: "Stage 4:", text: "CTA-based coronary artery segmentation for calcification detection" },
              { label: "Report Generation:", text: "Automated diagnostic reports combining segmentation metrics and EF estimates" },
            ],
          },
        ],
      },
      {
        heading: "Architecture Overview",
        blocks: [
          {
            kind: "image",
            src: "/images/projects/cardiolens_arch.png",
            alt: "CardioLens Architecture",
            caption: "CardioLens Pipeline: Frame Segmentation → Volume Estimation → EF Regression → Report Generation",
          },
          { kind: "subheading", text: "Segmentation Module" },
          {
            kind: "paragraph",
            text: "Two segmentation architectures are evaluated: Intel DPT Large (Dense Prediction Transformer) and ResNet-101 with a Feature Pyramid Network decoder. Both models produce pixel-level LV masks for each video frame.",
          },
          { kind: "subheading", text: "EF Regression Module" },
          {
            kind: "paragraph",
            text: "The R2plus1D network processes temporally sampled video clips to directly predict ejection fraction. The factored 3D convolution (separate spatial and temporal components) enables efficient spatiotemporal feature extraction.",
          },
        ],
      },
      {
        heading: "Results",
        blocks: [
          {
            kind: "table",
            headers: ["Model", "Dice (ES)", "Dice (ED)", "MAE (EF)"],
            rows: [
              ["DPT Large", "0.78", "0.90", "4.2%"],
              ["ResNet-101 FPN", "0.76", "0.88", "4.5%"],
            ],
          },
        ],
      },
      {
        heading: "Key Achievements",
        blocks: [
          {
            kind: "list",
            items: [
              { text: "Achieved 2nd Runner-up position at IEEE INDICON 2024 Intel AI Hackathon, IIT Kharagpur" },
              { text: "Integrated multi-task cardiac analysis: view classification, LV segmentation, EF estimation, cardiomyopathy detection" },
              { text: "Developed automated report generation for clinical deployment" },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "doc2data",
    title: "Doc2Data: AP Police Document Digitization",
    summary:
      "An AI-powered system for automated information extraction from unstructured handwritten and printed documents for the Andhra Pradesh Police Department. Combines custom OCR, NLP-based extraction, and fine-tuned language models.",
    thumbnail: "/images/projects/doc2data.jpg",
    badges: [
      { label: "NLP", variant: "research" },
      { label: "OCR", variant: "research" },
      { label: "Document AI", variant: "research" },
    ],
    githubHref: "https://github.com/Nikhil-Rao20/TripleD-AI4AP-Police_Doc2Data",
    comingSoon: true,
    tags: ["NLP", "OCR", "Document AI", "Information Extraction", "Structured Data"],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
