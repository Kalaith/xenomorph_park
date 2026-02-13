import { useState, useEffect, useRef } from "react";
import { useGameStore } from "../../stores/gameStore";
import { Resources } from "../../types";

interface DataPoint {
  timestamp: number;
  day: number;
  resources: Resources;
}

interface TrendChartProps {
  data: DataPoint[];
  metric: keyof Resources;
  color: string;
  width?: number;
  height?: number;
}

interface ResourceTrendsProps {
  className?: string;
}

// Mini chart component using Canvas
function TrendChart({
  data,
  metric,
  color,
  width = 200,
  height = 80,
}: TrendChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size for retina displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Get values for this metric
    const values = data.map((d) => {
      const value = d.resources[metric];
      return typeof value === "number" ? value : 0;
    });

    if (values.length === 0) return;

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1; // Prevent division by zero

    // Draw grid lines
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 1;

    // Horizontal lines
    for (let i = 0; i <= 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Vertical lines
    for (let i = 0; i <= 4; i++) {
      const x = (width / 4) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw trend line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    values.forEach((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - minValue) / range) * height;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw data points
    ctx.fillStyle = color;
    values.forEach((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - minValue) / range) * height;

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw current value indicator
    if (values.length > 0) {
      const lastValue = values[values.length - 1];
      const x = width - 5;
      const y = height - ((lastValue - minValue) / range) * height;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    }
  }, [data, metric, color, width, height]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded border border-slate-600"
      style={{ width, height }}
    />
  );
}

// Sparkline component for inline trends
function Sparkline({
  data,
  metric,
  color,
}: {
  data: DataPoint[];
  metric: keyof Resources;
  color: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 60;
    const height = 20;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const values = data.slice(-10).map((d) => {
      const value = d.resources[metric];
      return typeof value === "number" ? value : 0;
    });

    if (values.length === 0) return;

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    values.forEach((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - minValue) / range) * height;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
  }, [data, metric, color]);

  return (
    <canvas
      ref={canvasRef}
      className="inline-block"
      style={{ width: 60, height: 20 }}
    />
  );
}

export function ResourceTrends({ className = "" }: ResourceTrendsProps) {
  const { resources, day } = useGameStore();
  const [historicalData, setHistoricalData] = useState<DataPoint[]>([]);
  const [selectedMetric, setSelectedMetric] =
    useState<keyof Resources>("credits");
  const [showDetailed, setShowDetailed] = useState(false);

  // Record resource data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setHistoricalData((prev) => {
        const newDataPoint: DataPoint = {
          timestamp: Date.now(),
          day,
          resources: { ...resources },
        };

        // Keep last 50 data points
        const updated = [...prev, newDataPoint].slice(-50);
        return updated;
      });
    }, 2000); // Record every 2 seconds

    return () => clearInterval(interval);
  }, [resources, day]);

  const calculateTrend = (
    metric: keyof Resources,
  ): "up" | "down" | "stable" => {
    if (historicalData.length < 5) return "stable";

    const recent = historicalData.slice(-5);
    const values = recent.map((d) => {
      const value = d.resources[metric];
      return typeof value === "number" ? value : 0;
    });

    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const change = lastValue - firstValue;

    if (Math.abs(change) < 5) return "stable";
    return change > 0 ? "up" : "down";
  };

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return "📈";
      case "down":
        return "📉";
      default:
        return "➡️";
    }
  };

  const getTrendColor = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return "#10b981";
      case "down":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getMetricColor = (metric: keyof Resources) => {
    switch (metric) {
      case "credits":
        return "#fbbf24";
      case "power":
        return "#3b82f6";
      case "maxPower":
        return "#8b5cf6";
      case "research":
        return "#a855f7";
      case "visitors":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const formatValue = (
    metric: keyof Resources,
    value: Resources[keyof Resources],
  ) => {
    if (typeof value === "number") {
      return metric === "credits"
        ? `💰 ${value}`
        : metric === "power" || metric === "maxPower"
          ? `⚡ ${value}`
          : metric === "research"
            ? `🔬 ${value}`
            : metric === "visitors"
              ? `👥 ${value}`
              : value.toString();
    }
    return String(value ?? "");
  };

  const resourceMetrics: (keyof Resources)[] = [
    "credits",
    "power",
    "research",
    "visitors",
  ];

  return (
    <div
      className={`bg-slate-900/80 border border-green-400/30 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-green-400 font-bold text-lg">Resource Trends</h3>
        <button
          onClick={() => setShowDetailed(!showDetailed)}
          className="text-sm text-slate-400 hover:text-green-400 transition-colors"
        >
          {showDetailed ? "Hide Details" : "Show Details"}
        </button>
      </div>

      {/* Quick Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {resourceMetrics.map((metric) => {
          const trend = calculateTrend(metric);
          const value = resources[metric];

          return (
            <div
              key={metric}
              className={`
                bg-slate-800 rounded p-3 cursor-pointer transition-all duration-200
                ${selectedMetric === metric ? "ring-2 ring-green-400" : "hover:bg-slate-700"}
              `}
              onClick={() => setSelectedMetric(metric)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400 capitalize">
                  {metric}
                </span>
                <span>{getTrendIcon(trend)}</span>
              </div>
              <div
                className="text-sm font-semibold"
                style={{ color: getMetricColor(metric) }}
              >
                {formatValue(metric, value)}
              </div>
              <div className="mt-1">
                <Sparkline
                  data={historicalData}
                  metric={metric}
                  color={getMetricColor(metric)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Chart */}
      {showDetailed && historicalData.length > 1 && (
        <div className="space-y-4">
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4
                className="font-semibold"
                style={{ color: getMetricColor(selectedMetric) }}
              >
                {selectedMetric.charAt(0).toUpperCase() +
                  selectedMetric.slice(1)}{" "}
                Trend
              </h4>
              <select
                value={selectedMetric}
                onChange={(e) =>
                  setSelectedMetric(e.target.value as keyof Resources)
                }
                className="bg-slate-700 border border-slate-600 text-slate-300 rounded px-2 py-1 text-sm"
              >
                {resourceMetrics.map((metric) => (
                  <option key={metric} value={metric}>
                    {metric.charAt(0).toUpperCase() + metric.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <TrendChart
              data={historicalData}
              metric={selectedMetric}
              color={getMetricColor(selectedMetric)}
              width={400}
              height={120}
            />

            <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Current: </span>
                <span style={{ color: getMetricColor(selectedMetric) }}>
                  {formatValue(selectedMetric, resources[selectedMetric])}
                </span>
              </div>
              {historicalData.length > 0 && (
                <>
                  <div>
                    <span className="text-slate-400">Trend: </span>
                    <span
                      style={{
                        color: getTrendColor(calculateTrend(selectedMetric)),
                      }}
                    >
                      {calculateTrend(selectedMetric)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Data Points: </span>
                    <span className="text-slate-300">
                      {historicalData.length}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {resourceMetrics.map((metric) => {
              const values = historicalData.map((d) => {
                const value = d.resources[metric];
                return typeof value === "number" ? value : 0;
              });

              if (values.length === 0) return null;

              const min = Math.min(...values);
              const max = Math.max(...values);
              const avg = values.reduce((a, b) => a + b, 0) / values.length;

              return (
                <div key={metric} className="bg-slate-800 rounded p-3">
                  <div className="text-xs text-slate-400 mb-2 capitalize">
                    {metric} Stats
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Min:</span>
                      <span style={{ color: getMetricColor(metric) }}>
                        {min.toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max:</span>
                      <span style={{ color: getMetricColor(metric) }}>
                        {max.toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg:</span>
                      <span style={{ color: getMetricColor(metric) }}>
                        {avg.toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {historicalData.length === 0 && (
        <div className="text-center text-slate-400 py-8">
          <span>📊 Collecting resource data...</span>
          <p className="text-sm mt-2">
            Charts will appear once enough data is gathered
          </p>
        </div>
      )}
    </div>
  );
}
