"use client";

import { createContext, useContext, useState, useEffect } from "react";

type Currency = "inr" | "usd" | "eur";

interface CurrencyContextType {
  currency: Currency;
  symbol: string;
  rate: number;
  setCurrency: (currency: Currency) => void;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "inr",
  symbol: "₹",
  rate: 1,
  setCurrency: () => {},
});

export const CurrencyProvider = ({
  children,
  initialCurrency = "inr",
}: {
  children: React.ReactNode;
  initialCurrency?: Currency;
}) => {
  const [currency, setCurrencyState] = useState<Currency>(initialCurrency);

  const [rates, setRates] = useState({
    usd: 0.012,
    eur: 0.011,
  });

  // ✅ Sync with wrapper (VERY IMPORTANT)
  useEffect(() => {
    setCurrencyState(initialCurrency);
  }, [initialCurrency]);

  // 🔥 Fetch live rates
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch(
          "https://api.exchangerate-api.com/v4/latest/INR",
        );
        const data = await res.json();

        const updatedRates = {
          usd: data.rates.USD,
          eur: data.rates.EUR,
        };

        // console.log("🔥 LIVE RATES FETCHED:", updatedRates);
        // console.log("📅 Last Updated:", data.date || "No date");

        setRates(updatedRates);
        localStorage.setItem("rates", JSON.stringify(updatedRates));
      } catch (err) {
        console.error("Rate fetch failed", err);

        const cached = localStorage.getItem("rates");
        if (cached) {
          setRates(JSON.parse(cached));
        }
      }
    };

    fetchRates();
  }, []);

  const getSymbol = (cur: Currency) => {
    if (cur === "usd") return "$";
    if (cur === "eur") return "€";
    return "₹";
  };

  const getRate = (cur: Currency) => {
    if (cur === "usd") return rates.usd || 0.012;
    if (cur === "eur") return rates.eur || 0.011;
    return 1;
  };

  const setCurrency = (cur: Currency) => {
    setCurrencyState(cur);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        symbol: getSymbol(currency),
        rate: getRate(currency),
        setCurrency,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
