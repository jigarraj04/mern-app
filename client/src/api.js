const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body.error) message = body.error;
    } catch {
      /* ignore non-JSON error bodies */
    }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}

// Customers
export const getCustomers = (search = "") =>
  request(`/customers${search ? `?search=${encodeURIComponent(search)}` : ""}`);
export const getCustomer = (id) => request(`/customers/${id}`);
export const createCustomer = (data) =>
  request("/customers", { method: "POST", body: JSON.stringify(data) });
export const updateCustomer = (id, data) =>
  request(`/customers/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteCustomer = (id) =>
  request(`/customers/${id}`, { method: "DELETE" });

// Deals
export const getDeals = (customerId = "") =>
  request(`/deals${customerId ? `?customerId=${encodeURIComponent(customerId)}` : ""}`);
export const createDeal = (data) =>
  request("/deals", { method: "POST", body: JSON.stringify(data) });
export const updateDeal = (id, data) =>
  request(`/deals/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteDeal = (id) => request(`/deals/${id}`, { method: "DELETE" });

// Activities
export const getActivities = (customerId = "") =>
  request(`/activities${customerId ? `?customerId=${encodeURIComponent(customerId)}` : ""}`);
export const createActivity = (data) =>
  request("/activities", { method: "POST", body: JSON.stringify(data) });
export const deleteActivity = (id) =>
  request(`/activities/${id}`, { method: "DELETE" });

// Dashboard
export const getStats = () => request("/stats");

export const STAGES = ["Lead", "Contacted", "Proposal", "Negotiation", "Won", "Lost"];
export const ACTIVITY_TYPES = ["call", "email", "meeting", "note"];
