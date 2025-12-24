/* Color */
// type Colors = keyof (typeof darkColors | typeof lightColors);
type Colors = keyof typeof lightColors;
type ColorSet = {
  [key in Colors]: string;
};

export const lightColors = {
  main: "#5cb338",
  sub1: "#253900",
  sub2: "#eeeeee",
  red: "#fb4141",
  orange: "#ff6600",
  yellow: "#ece852",
  green: "#5cb338",
  gray: "#969696",
  white: "#ffffff",
  black: "#000000",
};

// const darkColors = {
//   main: "rgb(255, 255, 255)",
//   sub: "rgb(255, 255, 255)",
//   light: "#f3f3f3",
//   inverse: "rgb(23, 31, 45)",
//   primary: "rgb(80, 74, 237)",
//   secondary: "rgb(187, 198, 254)",
//   success: "rgb(28, 174, 110)",
//   caution: "rgb(241, 141, 14)",
//   error: "rgb(238, 37, 76)",
//   active: "rgb(110, 115, 126)",
//   inactive: "rgb(179, 186, 196)",
//   line: "rgb(208, 215, 225)",
//   // ...
// };

// const DefaultColors: ColorSet = Object.keys(darkColors).reduce((s, c) => {
//   return { ...s, [c]: "" };
// }, {} as ColorSet);

// const getColorSet = (mode: "dark" | "light") =>
//   mode === "dark" ? darkColors : lightColors;
