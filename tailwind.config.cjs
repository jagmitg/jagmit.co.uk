const Color = require("color");

const darken = (clr, val) => Color(clr).darken(val).hex();

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,md,mdx}"],
  theme: {
    fontFamily: {
      body: [
        "system-ui",
        "Arial",
        "Helvetica",
        "'Hiragino Sans'",
        "'Hiragino Kaku Gothic ProN'",
        "'Meiryo,sans-serif'",
        "sans-serif",
      ],
    },
    listStyleType: {
      none: "none",
      hyphen: "'-  '",
    },
    extend: {
      width: {
        custom: "52rem",
      },
      colors: {
        profile_blue: "#b9e1ff",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": {
            opacity: 0,
          },
          "100%": {
            opacity: 1,
          },
        },
      },
    },
  },
  plugins: [],
};
