/**
 * Gate for user-entered links.
 *
 * Every URL in the tracker is typed by the user and then rendered as an `href`
 * or written into a calendar file. Restricting to http and https means a
 * `javascript:` or `data:` value pasted into a link field cannot become a
 * clickable vector, and keeps the calendar export to values a calendar client
 * will treat as a web address.
 */
export function safeExternalUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (trimmed === "") return undefined;
  return /^https?:\/\//i.test(trimmed) ? trimmed : undefined;
}
