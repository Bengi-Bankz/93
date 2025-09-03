import React, { useState } from "react";
import { betAmountStore } from "./Store2";

const step = (val: number) => {
  if (val < 1) return 0.1;
  if (val < 10) return 0.2;
  if (val < 100) return 1;
  if (val < 500) return 5;
  return 10;
};

const betOptions = [
  ...Array.from({ length: 10 }, (_, i) => +(0.1 * (i + 1)).toFixed(2)),
  ...Array.from({ length: 10 }, (_, i) => +(1 + 0.2 * i).toFixed(2)),
  ...Array.from({ length: 8 }, (_, i) => +(3 + i).toFixed(2)),
  12, 15, 20, 25, 50, 100, 200, 500, 1000,
];

export default function BetBar() {
  const [bet, setBet] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePlay = () => {
    setLoading(true);
    betAmountStore.set(bet);
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <div style={{
      position: "fixed",
      left: "50%",
      bottom: 32,
      transform: "translateX(-50%)",
      background: "rgba(255,255,255,0.95)",
      padding: "18px 24px",
      borderRadius: 12,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      boxShadow: "0 2px 16px rgba(0,0,0,0.12)",
      zIndex: 20,
    }}>
      <button onClick={() => setBet(Math.max(0.1, +(bet - step(bet)).toFixed(2)))}>-</button>
      <button onClick={() => setShowModal(true)}>{bet.toFixed(2)}</button>
      <button onClick={() => setBet(Math.min(1000, +(bet + step(bet)).toFixed(2)))}>+</button>
      <button onClick={handlePlay} disabled={loading}>Play</button>
      {showModal && (
        <div style={{ position: "fixed", top: 120, left: "50%", transform: "translateX(-50%)", background: "#fff", borderRadius: 12, padding: "24px 32px", zIndex: 22, boxShadow: "0 2px 16px rgba(0,0,0,0.18)" }}>
          <h3>Select Bet Amount</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
            {betOptions.map(option => (
              <button key={option} onClick={() => { setBet(+option); setShowModal(false); }}>{(+option).toFixed(2)}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
