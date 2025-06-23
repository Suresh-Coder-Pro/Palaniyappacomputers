export const fetchWithAuth = async (url, options = {}, navigate, redirectOnFail = true) => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    if (redirectOnFail) navigate?.("/login");
    throw new Error("No token found. Redirecting...");
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 403) {
      localStorage.removeItem("authToken");
      if (redirectOnFail) navigate?.("/login");
      throw new Error("Session expired. Redirecting...");
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Request failed");
    }

    return await response.json();
  } catch (err) {
    console.error("API error:", err.message);
    throw err;
  }
};
