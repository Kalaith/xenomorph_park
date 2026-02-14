import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { Resources } from '../../types';

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

function TrendChart({ data, metric, color, width = 200, height = 80 }: TrendChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const values = data.map(point => {
      const value = point.resources[metric];
      return typeof value === 'number' ? value : 0;
    });

    if (values.length === 0) return;

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;

    for (let index = 0; index <= 4; index += 1) {
      const y = (height / 4) * index;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    for (let index = 0; index <= 4; index += 1) {
      const x = (width / 4) * index;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

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

    ctx.fillStyle = color;
    values.forEach((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - minValue) / range) * height;
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, 2 * Math.PI);
      ctx.fill();
    });
  }, [color, data, height, metric, width]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded border border-slate-600/80"
      style={{ width, height }}
    />
  );
}

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

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 60;
    const height = 20;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const values = data.slice(-10).map(point => {
      const value = point.resources[metric];
      return typeof value === 'number' ? value : 0;
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
  }, [color, data, metric]);

  return <canvas ref={canvasRef} className="inline-block" style={{ width: 60, height: 20 }} />;
}

export function ResourceTrends({ className = '' }: ResourceTrendsProps) {
  const { resources, day } = useGameStore();
  const [historicalData, setHistoricalData] = useState<DataPoint[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<keyof Resources>('credits');
  const [showDetailed, setShowDetailed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setHistoricalData(previous => {
        const nextPoint: DataPoint = {
          timestamp: Date.now(),
          day,
          resources: { ...resources },
        };
        return [...previous, nextPoint].slice(-50);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [day, resources]);

  const calculateTrend = (metric: keyof Resources): 'up' | 'down' | 'stable' => {
    if (historicalData.length < 5) return 'stable';

    const values = historicalData.slice(-5).map(point => {
      const value = point.resources[metric];
      return typeof value === 'number' ? value : 0;
    });

    const change = values[values.length - 1] - values[0];
    if (Math.abs(change) < 5) return 'stable';
    return change > 0 ? 'up' : 'down';
  };

  const getTrendLabel = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return 'Up';
    if (trend === 'down') return 'Down';
    return 'Stable';
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return '#34d399';
    if (trend === 'down') return '#f87171';
    return '#94a3b8';
  };

  const getMetricColor = (metric: keyof Resources) => {
    switch (metric) {
      case 'credits':
        return '#fbbf24';
      case 'power':
        return '#60a5fa';
      case 'research':
        return '#c084fc';
      case 'visitors':
        return '#34d399';
      default:
        return '#94a3b8';
    }
  };

  const formatValue = (metric: keyof Resources, value: Resources[keyof Resources]) => {
    if (typeof value !== 'number') return String(value ?? '');
    if (metric === 'credits') return `${value} cr`;
    if (metric === 'power' || metric === 'maxPower') return `${value} pw`;
    if (metric === 'research') return `${value} rs`;
    if (metric === 'visitors') return `${value} vs`;
    return value.toString();
  };

  const resourceMetrics: (keyof Resources)[] = ['credits', 'power', 'research', 'visitors'];
  const chartWidth = 520;

  return (
    <div className={`panel p-4 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="section-title text-lg">Resource Trends</h3>
        <button
          onClick={() => setShowDetailed(value => !value)}
          className="rounded px-2 py-1 text-sm text-slate-300 transition hover:bg-slate-700/50 hover:text-slate-100"
          type="button"
        >
          {showDetailed ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {resourceMetrics.map(metric => {
          const trend = calculateTrend(metric);
          const value = resources[metric];

          return (
            <button
              key={metric}
              type="button"
              className={`panel-muted p-3 text-left transition-colors ${
                selectedMetric === metric ? 'border-emerald-300/70 bg-emerald-300/10' : 'hover:bg-slate-700/40'
              }`}
              onClick={() => setSelectedMetric(metric)}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs capitalize text-slate-400">{metric}</span>
                <span className="text-xs" style={{ color: getTrendColor(trend) }}>
                  {getTrendLabel(trend)}
                </span>
              </div>
              <div className="text-sm font-semibold" style={{ color: getMetricColor(metric) }}>
                {formatValue(metric, value)}
              </div>
              <div className="mt-1">
                <Sparkline data={historicalData} metric={metric} color={getMetricColor(metric)} />
              </div>
            </button>
          );
        })}
      </div>

      {showDetailed && historicalData.length > 1 && (
        <div className="space-y-4">
          <div className="panel-muted p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-semibold" style={{ color: getMetricColor(selectedMetric) }}>
                {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Trend
              </h4>
              <select
                value={selectedMetric}
                onChange={event => setSelectedMetric(event.target.value as keyof Resources)}
                className="rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-200"
              >
                {resourceMetrics.map(metric => (
                  <option key={metric} value={metric}>
                    {metric.charAt(0).toUpperCase() + metric.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[320px]">
                <TrendChart
                  data={historicalData}
                  metric={selectedMetric}
                  color={getMetricColor(selectedMetric)}
                  width={chartWidth}
                  height={120}
                />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Current: </span>
                <span style={{ color: getMetricColor(selectedMetric) }}>
                  {formatValue(selectedMetric, resources[selectedMetric])}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Trend: </span>
                <span style={{ color: getTrendColor(calculateTrend(selectedMetric)) }}>
                  {getTrendLabel(calculateTrend(selectedMetric))}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Data Points: </span>
                <span className="text-slate-200">{historicalData.length}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {resourceMetrics.map(metric => {
              const values = historicalData.map(point => {
                const value = point.resources[metric];
                return typeof value === 'number' ? value : 0;
              });

              if (values.length === 0) return null;

              const min = Math.min(...values);
              const max = Math.max(...values);
              const avg = values.reduce((total, value) => total + value, 0) / values.length;

              return (
                <div key={metric} className="panel-muted p-3">
                  <div className="mb-2 text-xs capitalize text-slate-400">{metric} Stats</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Min:</span>
                      <span style={{ color: getMetricColor(metric) }}>{min.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max:</span>
                      <span style={{ color: getMetricColor(metric) }}>{max.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg:</span>
                      <span style={{ color: getMetricColor(metric) }}>{avg.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {historicalData.length === 0 && (
        <div className="py-8 text-center text-slate-400">
          <span>Collecting resource data...</span>
          <p className="mt-2 text-sm">Charts will appear once enough data is gathered.</p>
        </div>
      )}
    </div>
  );
}
