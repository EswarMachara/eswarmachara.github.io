import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import PageHeader from "@/components/PageHeader";
import ProjectCard from "@/components/ProjectCard";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Projects by Sai Manikanta Eswar Machara in computer vision, medical imaging, and deep learning.",
  keywords: ["Eswar Machara", "projects", "computer vision", "medical imaging", "deep learning", "CardioLens"],
  alternates: { canonical: "/projects" },
  openGraph: {
    title: "Projects | Sai Manikanta Eswar Machara",
    description: "Projects by Sai Manikanta Eswar Machara",
    url: "/projects",
  },
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-14 sm:py-20">
      <PageHeader kicker="Selected Work" title="Projects">
        Here are some of the research and engineering projects I have worked on. These span medical imaging,
        computer vision, and multimodal AI systems. Click on a project for more details.
      </PageHeader>

      <div className="mt-14 space-y-5">
        {projects.map((project, index) => (
          <Reveal key={project.slug} delay={index * 0.06}>
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
