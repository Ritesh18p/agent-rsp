import axios from "axios";

// Check if running on localhost or deployed
const isLocal =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

const API = axios.create({
  baseURL: isLocal ? "http://localhost:5000/api" : "/api",
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// In-memory mock storage for demo visitors on Vercel
let demoNotes = [
  {
    _id: "demo-1",
    title: "Welcome to Agent RSP",
    content: "This is an intelligent note management workspace with natural language agent interactions.",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo-2",
    title: "Frontend Intern Architecture",
    content: "Built with React, Vite, Tailwind CSS, and Lucide icons.",
    createdAt: new Date().toISOString(),
  },
];

// Fallback interceptor to gracefully handle offline/demo calls on Vercel
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If not local, provide mock responses instead of throwing Network Error
    if (!isLocal) {
      const { url, method, data } = error.config || {};
      const parsedData = typeof data === "string" ? JSON.parse(data || "{}") : data || {};

      // Mock Notes fetching
      if (url?.includes("/notes") && method === "get") {
        return Promise.resolve({ data: demoNotes, status: 200 });
      }

      // Mock Note creation
      if (url?.includes("/notes") && method === "post") {
        const newNote = {
          _id: "demo-" + Date.now(),
          title: parsedData.title || "New Note",
          content: parsedData.content || parsedData.prompt || "Generated Note Content",
          createdAt: new Date().toISOString(),
        };
        demoNotes.unshift(newNote);
        return Promise.resolve({ data: newNote, status: 201 });
      }

      // Mock AI Agent action
      if (url?.includes("/agent") || url?.includes("/chat")) {
        return Promise.resolve({
          data: {
            message: "Action completed successfully by Agent RSP (Demo Mode).",
            notes: demoNotes,
          },
          status: 200,
        });
      }
    }

    return Promise.reject(error);
  }
);

export default API;
