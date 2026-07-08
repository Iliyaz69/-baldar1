/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  safelist: [
    {
      pattern: /(bg|text|border)-role-(director|teacher|parent|medical|methodist|superadmin)(\/\d+)?/,
    },
    {
      pattern: /(bg|text|border)-brand(\/\d+)?/,
    },
    {
      pattern: /(from|via|to)-(role-(director|teacher|parent|medical|methodist|superadmin)|brand|canvas)(\/\d+)?/,
    },
  ],
  theme: {
    extend: {
      colors: {
        // Тёплый нейтральный фон вместо стерильно-белого
        canvas: "#FBF7F3",
        surface: "#FFFFFF",
        ink: "#2A2420",
        muted: "#8A7F76",
        border: "#EAE1D9",
        // Основной акцент бренда
        brand: {
          DEFAULT: "#B5544B",
          soft: "#F3E4E1",
        },
        // Ролевые акценты
        role: {
          director: "#3D3A6B",
          teacher: "#B5544B",
          parent: "#5C7A5E",
          medical: "#B0413E",
          methodist: "#B8863B",
          superadmin: "#2A2420",
        },
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};