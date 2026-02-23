export const APP_CONSTANTS = {
  API: {
    BASE_URL: "http://localhost:5000/api",
    ENDPOINTS: {
      WORKSHOPS: "/workshops",
      APPOINTMENTS: "/appointments",
    },
  },
  UI: {
    SNACKBAR_DURATION: 3000,
    SNACKBAR_ERROR_DURATION: 5000,
    SPINNER_DIAMETER: 20,
  },
  DATE: {
    CURRENT_YEAR: new Date().getFullYear(),
  },
} as const;
