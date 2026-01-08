import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { request } from "../../util/request";
import { profileStore } from "../../store/ProfileStore";

const ExpenseSummaryContext = createContext(null);
const toNum = (x) => {
  const n = parseFloat(String(x ?? 0).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export const ExpenseSummaryProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(
    profileStore.getState().access_token
  );
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const { access_token } = profileStore.getState();
  const refresh = async () => {
    if (!access_token) return;
    setLoading(true);
    try {
      const res = await request("expense?page=1", "get");
      if (res && !res.errors) setList(res.list || []);
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
    const total = list.reduce((s, i) => s + toNum(i.amount), 0);
    const paid = list
      .filter((i) => i.expense_status === "paid")
      .reduce((s, i) => s + toNum(i.amount), 0);
    const pending = list
      .filter((i) => i.expense_status === "pending")
      .reduce((s, i) => s + toNum(i.amount), 0);
    const cancel = list
      .filter((i) => i.expense_status === "cancel")
      .reduce((s, i) => s + toNum(i.amount), 0);

    return {
      total,
      paid,
      pending,
      cancel,
      count: list.length,
    };
  }, [list]);

  return (
    <ExpenseSummaryContext.Provider value={{ summary, refresh, loading }}>
      {children}
    </ExpenseSummaryContext.Provider>
  );
};

export const useExpenseSummary = () => {
  const ctx = useContext(ExpenseSummaryContext);
  if (!ctx)
    throw new Error(
      "useExpenseSummary must be used inside ExpenseSummaryProvider"
    );
  return ctx;
};
