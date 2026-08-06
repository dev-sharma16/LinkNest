type JsonLdValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | JsonLdValue[]
  | { [key: string]: JsonLdValue | undefined };

/**
 * Renders a JSON-LD structured data script for search engines.
 * `<` is escaped so user-controlled content can never break out of the
 * script tag.
 */
export function JsonLd({
  data,
}: {
  data: JsonLdValue | JsonLdValue[];
}) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
