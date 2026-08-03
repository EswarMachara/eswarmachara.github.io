import { FaGithub, FaLinkedin } from "react-icons/fa6";
import { SiGooglescholar } from "react-icons/si";
import { site } from "@/data/profile";

const SOCIAL_LINKS = [
  { href: site.scholar, label: "Google Scholar", Icon: SiGooglescholar },
  { href: site.linkedin, label: "LinkedIn", Icon: FaLinkedin },
  { href: site.github, label: "GitHub", Icon: FaGithub },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-5 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} {site.name}</p>
        <ul className="flex items-center gap-4">
          {SOCIAL_LINKS.map(({ href, label, Icon }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-navy/70 transition-colors hover:text-blue"
              >
                <Icon size={22} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
