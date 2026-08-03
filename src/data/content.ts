/** Shared long-form "article" content model, used by both project write-ups and publication article pages. */

export interface ListItem {
  label?: string;
  text: string;
}

export type ContentBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "subheading"; text: string }
  | { kind: "list"; items: ListItem[] }
  | { kind: "image"; src: string; alt: string; caption?: string }
  | { kind: "table"; headers: string[]; rows: string[][] };

export interface ArticleSection {
  heading: string;
  blocks: ContentBlock[];
}

export interface ArticleAuthor {
  name: string;
  href?: string;
  affiliation: number;
}
