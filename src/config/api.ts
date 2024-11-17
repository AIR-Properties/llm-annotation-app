console.log("ENV::::", process.env.REACT_APP_API_URL);
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL,
  ENDPOINTS: {
    ASK: "/annotation/ask",
    FEEDBACK: "/arena/feedback",
    ARENA_DATA: "/arena/data",
    ANNOTATION: "/annotation/data",
    ANNOTATION_SUBMIT: "/annotation/feedback/submit",
  },
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${
      process.env.REACT_APP_AUTH_TOKEN ||
      "df0d4958e107a84f6a6e92d4b8ed259bfe427ae7"
    }`,
  },
};

export default API_CONFIG;
