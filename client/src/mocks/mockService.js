import api from "../services/api";
import {
  mockProfile,
  mockSessionStart,
  mockCheckInResponses,
  mockSessionEnd,
  mockSessionReport,
  mockDashboardData,
  mockMedicationResponse,
} from "./data";

let checkInCount = 0;

function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function setupMocks() {
  api.interceptors.request.use(async (config) => {
    const { url, method, data } = config;
    const body = typeof data === "string" ? JSON.parse(data) : data;

    // POST /api/profile
    if (url === "/api/profile" && method === "post") {
      await delay(300);
      const profile = {
        id: "user-1",
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return Promise.reject({
        __MOCK__: true,
        response: { data: profile, status: 201 },
      });
    }

    // GET /api/profile/:id
    if (url?.startsWith("/api/profile/") && method === "get") {
      await delay(200);
      return Promise.reject({
        __MOCK__: true,
        response: { data: mockProfile, status: 200 },
      });
    }

    // PUT /api/profile/:id
    if (url?.startsWith("/api/profile/") && method === "put") {
      await delay(300);
      const updated = { ...mockProfile, ...body, updated_at: new Date().toISOString() };
      return Promise.reject({
        __MOCK__: true,
        response: { data: updated, status: 200 },
      });
    }

    // POST /api/session/start
    if (url === "/api/session/start" && method === "post") {
      await delay(800);
      checkInCount = 0;
      return Promise.reject({
        __MOCK__: true,
        response: { data: mockSessionStart, status: 200 },
      });
    }

    // POST /api/session/checkin
    if (url === "/api/session/checkin" && method === "post") {
      await delay(300);
      const resp =
        mockCheckInResponses[checkInCount] ||
        mockCheckInResponses[mockCheckInResponses.length - 1];
      checkInCount++;
      return Promise.reject({
        __MOCK__: true,
        response: { data: resp, status: 200 },
      });
    }

    // POST /api/session/end
    if (url === "/api/session/end" && method === "post") {
      await delay(500);
      return Promise.reject({
        __MOCK__: true,
        response: { data: mockSessionEnd, status: 200 },
      });
    }

    // GET /api/session/report/:id
    if (url?.startsWith("/api/session/report/") && method === "get") {
      await delay(600);
      return Promise.reject({
        __MOCK__: true,
        response: { data: mockSessionReport, status: 200 },
      });
    }

    // GET /api/dashboard/:id
    if (url?.startsWith("/api/dashboard/") && method === "get") {
      await delay(500);
      return Promise.reject({
        __MOCK__: true,
        response: { data: mockDashboardData, status: 200 },
      });
    }

    // GET /api/medications
    if (url?.startsWith("/api/medications") && method === "get") {
      await delay(400);
      return Promise.reject({
        __MOCK__: true,
        response: { data: mockMedicationResponse, status: 200 },
      });
    }

    // Pass through unmatched requests
    return config;
  });

  // Intercept mock rejections and convert to successful responses
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.__MOCK__) {
        return Promise.resolve(error.response);
      }
      return Promise.reject(error);
    }
  );

  console.log("[FocusFlow] Mock service layer active");
}
