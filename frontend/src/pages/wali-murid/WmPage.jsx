import React from "react";

// ── Shared Loading Spinner ──────────────────────────────────────
export const WmLoading = ({ text = "Memuat data..." }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "60px 20px",
      gap: 16,
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        border: "4px solid #334155",
        borderTop: "4px solid #3b82f6",
        borderRadius: "50%",
        animation: "wm-spin 1s linear infinite",
      }}
    />
    <p style={{ color: "#94a3b8", fontSize: 14 }}>{text}</p>
    <style>{`@keyframes wm-spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}`}</style>
  </div>
);

// ── Shared Error Box ────────────────────────────────────────────
export const WmError = ({ message, onRetry }) => (
  <div
    style={{
      padding: 20,
      background: "rgba(239,68,68,0.1)",
      border: "1px solid rgba(239,68,68,0.3)",
      borderRadius: 10,
      margin: "20px 0",
    }}
  >
    <p style={{ color: "#fca5a5", margin: "0 0 12px" }}>⚠️ {message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        style={{
          background: "#3b82f6",
          color: "#fff",
          border: "none",
          padding: "8px 16px",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Coba Lagi
      </button>
    )}
  </div>
);

// ── Shared Empty State ──────────────────────────────────────────
export const WmEmpty = ({ text = "Tidak ada data" }) => (
  <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
    <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
    <p>{text}</p>
  </div>
);

// ── Stat Card ───────────────────────────────────────────────────
export const StatCard = ({
  icon,
  label,
  value,
  color = "#3b82f6",
  subtext,
}) => (
  <div
    style={{
      background: "#1e293b",
      border: "1px solid #334155",
      borderRadius: 12,
      padding: "16px 20px",
      display: "flex",
      alignItems: "center",
      gap: 16,
    }}
  >
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: `${color}22`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 22,
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#f1f5f9",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
        {label}
      </div>
      {subtext && (
        <div style={{ fontSize: 11, color: "#3b82f6", marginTop: 2 }}>
          {subtext}
        </div>
      )}
    </div>
  </div>
);

// ── Page Header ─────────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, actions }) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 24,
      flexWrap: "wrap",
      gap: 12,
    }}
  >
    <div>
      <h2
        style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", margin: 0 }}
      >
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>
          {subtitle}
        </p>
      )}
    </div>
    {actions && (
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{actions}</div>
    )}
  </div>
);

// ── Card ────────────────────────────────────────────────────────
export const Card = ({ children, style = {} }) => (
  <div
    style={{
      background: "#1e293b",
      border: "1px solid #334155",
      borderRadius: 12,
      padding: "20px 24px",
      marginBottom: 20,
      ...style,
    }}
  >
    {children}
  </div>
);

// ── Badge ───────────────────────────────────────────────────────
export const Badge = ({ text, color = "#3b82f6" }) => (
  <span
    style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
      background: `${color}22`,
      color,
    }}
  >
    {text}
  </span>
);

// ── Table ───────────────────────────────────────────────────────
export const WmTable = ({ headers, rows, emptyText }) => (
  <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th
              key={i}
              style={{
                padding: "10px 14px",
                textAlign: "left",
                background: "#0f172a",
                color: "#94a3b8",
                fontWeight: 600,
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                borderBottom: "1px solid #334155",
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td
              colSpan={headers.length}
              style={{ textAlign: "center", padding: 40, color: "#64748b" }}
            >
              {emptyText || "Tidak ada data"}
            </td>
          </tr>
        ) : (
          rows.map((row, i) => (
            <tr
              key={i}
              style={{ borderBottom: "1px solid #1e293b" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#1e293b")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  style={{
                    padding: "12px 14px",
                    color: "#cbd5e1",
                    verticalAlign: "middle",
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default {
  WmLoading,
  WmError,
  WmEmpty,
  StatCard,
  PageHeader,
  Card,
  Badge,
  WmTable,
};
