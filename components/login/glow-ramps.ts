/**
 * The sign-in wash, from the reference's vectorised gradient (Fuse onboarding:
 * a 1179 × 1817 trace under a 126px blur), mirrored so its deep end hangs from
 * the top edge. Two layers:
 *
 * - `core`: the blue dome, as an ellipse from the top centre. #3063DB at the
 *   heart through #3269DB, #3F8AE4 and #4497E4 to #4EA1E8 at its rim.
 * - `base`: the band it sits in, top to bottom: cyan (#65C9F1, #62C2F5,
 *   #60C3F1), then sky #C0E6F9, the #F2F9FC flecks, and white.
 *
 * Stops are % of the layer. Red and green keep each stop's OKLCH lightness
 * and chroma and change only the hue (red = 25 + (259 − h) × 0.12, green =
 * 147 + (259 − h) × 0.35); near-white stops stay as they are.
 */
type Stops = [number, string][];

export const glowRamps = {
  blue: {
    core: [[0, "#3063db"], [20, "#3269db"], [38, "#3f8ae4"], [54, "#4497e4"], [68, "#4ea1e8"]] as Stops,
    base: [[0, "#65c9f1"], [24, "#62c2f5"], [44, "#60c3f1"], [64, "#c0e6f9"], [80, "#f2f9fc"], [94, "#ffffff"]] as Stops,
  },
  red: {
    core: [[0, "#c5272f"], [20, "#c63236"], [38, "#d75d57"], [54, "#db6c64"], [68, "#e1786e"]] as Stops,
    base: [[0, "#f9a092"], [24, "#f7998c"], [44, "#f6998d"], [64, "#fdd4ce"], [80, "#fdf6f5"], [94, "#ffffff"]] as Stops,
  },
  green: {
    core: [[0, "#068526"], [20, "#028929"], [38, "#33a250"], [54, "#46aa63"], [68, "#54b270"]] as Stops,
    base: [[0, "#7ad0a0"], [24, "#74cc96"], [44, "#74cc99"], [64, "#c6e9d3"], [80, "#f4faf6"], [94, "#ffffff"]] as Stops,
  },
};
