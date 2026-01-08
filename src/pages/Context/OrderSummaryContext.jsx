// src/context/OrderSummaryContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { request } from "../../util/request";
import { profileStore } from "../../store/ProfileStore";

const OrderSummaryContext = createContext(null);

const toNum = (x) => {
  const n = parseFloat(String(x ?? 0).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export const OrderSummaryProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(
    profileStore.getState().access_token
  );
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const { access_token } = profileStore.getState();
  const refresh = async (params = {}) => {
    if (!access_token) return;
    setLoading(true);
    try {
      // same params you used in OrderList
      const query = new URLSearchParams({
        page: "1",
        limit: "50",
        ...(params.text_search ? { text_search: params.text_search } : {}),
        ...(params.status ? { status: params.status } : {}),
        ...(params.date_from ? { date_from: params.date_from } : {}),
        ...(params.date_to ? { date_to: params.date_to } : {}),
      }).toString();

      const res = await request(`orders?${query}`, "get");

      const list = Array.isArray(res?.list)
        ? res.list
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.orders)
        ? res.orders
        : [];

      setOrders(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = profileStore.subscribe((state) =>
      setAccessToken(state.access_token)
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    if (accessToken) {
      refresh();
    }
  }, [accessToken]);

  const summary = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];

    let totalRevenue = 0;
    let todayOrders = 0;

    orders.forEach((o) => {
      const status = String(o.status || "").toLowerCase();
      if (status === "paid" || status === "completed") {
        totalRevenue += toNum(o.total_amount);
      }

      const orderDate = o.created_at?.split("T")[0];
      if (orderDate === today) todayOrders += 1;
    });

    return {
      totalOrders: orders.length,
      totalRevenue,
      todayOrders,
    };
  }, [orders]);

  return (
    <OrderSummaryContext.Provider value={{ orders, summary, loading, refresh }}>
      {children}
    </OrderSummaryContext.Provider>
  );
};

export const useOrderSummary = () => {
  const ctx = useContext(OrderSummaryContext);
  if (!ctx)
    throw new Error("useOrderSummary must be used within OrderSummaryProvider");
  return ctx;
};
