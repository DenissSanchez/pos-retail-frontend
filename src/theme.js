import { createTheme } from "@mui/material/styles";

const theme = createTheme({

  palette: {

    primary: {
      main: "#2563eb",
    },

    secondary: {
      main: "#10b981",
    },

    background: {
      default: "#f4f6f8",
    },

  },

  typography: {

    fontFamily: "Inter, sans-serif",

    h4: {
      fontWeight: 700,
    },

    h5: {
      fontWeight: 600,
    },

  },

});

export default theme;