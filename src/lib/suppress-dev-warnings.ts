/**
 * Filters a known dev-only false positive from React 19: next-themes'
 * ThemeProvider renders its inline theme-initializer as a `<script>` element
 * (no `type` attribute), which makes React's client build log
 * "Encountered a script tag while rendering React component" whenever that
 * element is (re)created on the client (e.g. during Fast Refresh).
 *
 * The warning is harmless here: the script is rendered into the SSR'd HTML
 * and executes during initial page parse, exactly as intended. Production
 * builds strip the check entirely, so this only ever affects `next dev`.
 *
 * Only this exact message is suppressed — every other console error passes
 * through untouched.
 */
const SCRIPT_TAG_WARNING =
  "Encountered a script tag while rendering React component";

if (typeof console !== "undefined" && typeof console.error === "function") {
  const originalError = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    const [first] = args;
    if (typeof first === "string" && first.includes(SCRIPT_TAG_WARNING)) {
      return;
    }
    originalError(...args);
  };
}
