// Everything the frame says about this effect: the same file on every branch
export const frame = {
  title: "Text reveals that survive font loading",
  // The tutorial is at davidfaure.eu/lab/<slug>
  slug: "text-reveals-font-loading",
  repo: "https://github.com/davidfaure/text-reveals-font-loading",
  // Branch -> its full-screen demo at davidfaure.eu/demos/<demo>/, in the order of the steps
  steps: {
    main: "text-reveals-font-loading-bug",
    ready: "text-reveals-font-loading-ready",
    autosplit: "text-reveals-font-loading-autosplit",
    both: "text-reveals-font-loading",
  } as Record<string, string>,
  tags: ["gsap", "splittext", "fonts"],
  // Empty until the effect ships in Alcide
  alcide: "",
};
