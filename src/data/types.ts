/** A run of text, optionally rendered as a link or bolded. Used to model sentences that mix plain text, hyperlinks, and emphasis without resorting to raw HTML strings. */
export interface RichSegment {
  text: string;
  href?: string;
  bold?: boolean;
}

export type RichText = RichSegment[];
