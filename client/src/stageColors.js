// Maps each pipeline stage to its tab/pill color + tint, echoing
// the die-cut divider tabs of a physical card-index drawer.
export const STAGE_STYLE = {
  Lead: { color: "#8b8579", tint: "#e9e4d8" },
  Contacted: { color: "#3f6e91", tint: "#dbe6ee" },
  Proposal: { color: "#bd8a2e", tint: "#f1e2c2" },
  Negotiation: { color: "#93691e", tint: "#f1e2c2" },
  Won: { color: "#56724f", tint: "#dde6d8" },
  Lost: { color: "#a8492f", tint: "#f0dcd4" },
};

export function stageStyle(stage) {
  return STAGE_STYLE[stage] || STAGE_STYLE.Lead;
}
