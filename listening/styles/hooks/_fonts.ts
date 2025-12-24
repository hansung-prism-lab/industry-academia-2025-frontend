export const FONTS = {
  THIN: "Pretendard-Thin",
  EXTRA_LIGHT: "Pretendard-ExtraLight",
  LIGHT: "Pretendard-Light",
  REGULAR: "Pretendard-Regular",
  MEDIUM: "Pretendard-Medium",
  SEMI_BOLD: "Pretendard-SemiBold",
  BOLD: "Pretendard-Bold",
  EXTRA_BOLD: "Pretendard-ExtraBold",
  BLACK: "Pretendard-Black",
  RECIPEKOREA: "Recipekorea",
} as const;

export const FONT_WEIGHTS = {
  thin: FONTS.THIN,
  extraLight: FONTS.EXTRA_LIGHT,
  light: FONTS.LIGHT,
  regular: FONTS.REGULAR,
  medium: FONTS.MEDIUM,
  semiBold: FONTS.SEMI_BOLD,
  bold: FONTS.BOLD,
  extraBold: FONTS.EXTRA_BOLD,
  black: FONTS.BLACK,
  recipekorea: FONTS.RECIPEKOREA,
} as const;

// TypeScript 타입 정의
export type FontWeight = keyof typeof FONT_WEIGHTS;
export type FontName = keyof typeof FONTS;
