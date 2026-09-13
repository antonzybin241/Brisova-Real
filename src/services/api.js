import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3344";

const client = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: { "Content-Type": "application/json" },
});

const unwrap = (res) => res.data?.data ?? res.data;

export const api = {
  getFeaturedProperties: () => client.get("/properties/featured").then(unwrap),

  getProperties: (params = {}) =>
    client.get("/properties", { params }).then((res) => ({
      data: res.data.data ?? [],
      total: res.data.pagination?.total ?? 0,
      page: res.data.pagination?.page ?? 1,
      limit: res.data.pagination?.limit ?? 12,
    })),

  getProperty: (id) => client.get(`/properties/${id}`).then(unwrap),

  createProperty: (payload) => client.post("/properties", payload).then(unwrap),

  approveProperty: (id) => client.patch(`/properties/${id}/approve`).then(unwrap),

  getDashboard: (wallet) => client.get(`/dashboard/${wallet}`).then(unwrap),

  getProfile: (wallet) => client.get(`/profile/${wallet}`).then(unwrap),

  updateProfile: (wallet, payload) =>
    client.patch(`/profile/${wallet}`, payload).then(unwrap),

  getInvestments: (wallet) => client.get(`/investments/${wallet}`).then(unwrap),

  createInvestment: (wallet, payload) =>
    client.post(`/investments/${wallet}`, payload).then(unwrap),

  sellInvestment: (wallet, investmentId, payload) =>
    client.post(`/investments/${wallet}/${investmentId}/sell`, payload).then(unwrap),

  getKycStatus: (wallet) => client.get(`/kyc/${wallet}/status`).then(unwrap),

  submitKyc: (wallet, payload) =>
    client.post(`/kyc/${wallet}/submit`, payload).then(unwrap),

  listPendingKyc: () => client.get("/kyc/pending").then(unwrap),

  reviewKyc: (id, payload) => client.patch(`/kyc/${id}/review`, payload).then(unwrap),

  getAdminAnalytics: () => client.get("/admin/analytics").then(unwrap),

  getAdminProperties: (params) =>
    client.get("/admin/properties", { params }).then((res) => ({
      data: res.data.data ?? [],
      total: res.data.pagination?.total ?? 0,
    })),

  getAdminUsers: (params) =>
    client.get("/admin/users", { params }).then((res) => ({
      data: res.data.data ?? [],
      total: res.data.pagination?.total ?? 0,
    })),

  getAdminTransactions: (params) =>
    client.get("/admin/transactions", { params }).then((res) => ({
      data: res.data.data ?? [],
      total: res.data.pagination?.total ?? 0,
    })),

  getFavorites: (wallet) => client.get(`/favorites/${wallet}`).then(unwrap),

  addFavorite: (wallet, propertyId) =>
    client.post(`/favorites/${wallet}`, { propertyId }).then(unwrap),

  removeFavorite: (wallet, propertyId) =>
    client.delete(`/favorites/${wallet}/${propertyId}`).then(unwrap),

  checkFavorite: (wallet, propertyId) =>
    client.get(`/favorites/${wallet}/${propertyId}`).then(unwrap),

  subscribeNewsletter: (email) =>
    client.post("/newsletter/subscribe", { email }).then(unwrap),
};
