export const ChartContainer = ({ children, className = "" }) => {
  return <div className={`w-full h-full ${className}`}>{children}</div>;
};

// Safe tooltip — avoids null errors
export const ChartTooltipContent = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { period, totalSales } = payload[0].payload || {};
    return (
      <div className="bg-white border shadow-md rounded p-2 text-xs">
        <p>{period}</p>
        <p className="font-semibold">₹{totalSales}</p>
      </div>
    );
  }
  return null;
};

// ✅ Optional ChartStyle (safe from null)
export const ChartStyle = ({ config = {} }) => {
  if (!config || typeof config !== "object") return null;

  const cssVars = Object.entries(config)
    .map(([key, value]) => `--chart-${key}: ${value};`)
    .join(" ");

  return <style>{`:root { ${cssVars} }`}</style>;
};