/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        customGray: "#949494",
        customBlue: "#2282B9",
        customGrayLight: "#FAFAFA",
        customGrayDark: 'rgb(242, 242, 242)',
        placeHolder: "#A1A1A1",
        lightWhite: "#FCFCFC",
      },
      fontFamily: {
        pretendard: ['Pretendard-Regular', 'sans-serif'],
      },
    },
  },
  variants: {},
  plugins: [],
};
