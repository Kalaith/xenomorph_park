import { useGameStore } from "../../stores/gameStore";
import { securityColors } from "../../constants/gameConstants";
import { Tooltip, TooltipContent } from "../ui/Tooltip";

export function ResourceCounter() {
  const { resources } = useGameStore();

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="bg-slate-900/80 border border-green-400/30 rounded-lg p-4 mb-4">
      <div className="grid grid-cols-6 gap-4 text-sm">
        <Tooltip
          content={
            <TooltipContent
              title="Credits"
              description="Primary currency used to build facilities and purchase upgrades"
              stats={[
                {
                  label: "Current",
                  value: resources.credits.toLocaleString(),
                  color: "text-green-400",
                },
                {
                  label: "Daily Revenue",
                  value: `+${resources.dailyRevenue.toLocaleString()}`,
                  color: "text-green-400",
                },
                {
                  label: "Daily Expenses",
                  value: `-${resources.dailyExpenses.toLocaleString()}`,
                  color: "text-red-400",
                },
              ]}
            />
          }
          rich={true}
          position="auto"
        >
          <div className="flex items-center space-x-2 cursor-help">
            <span className="text-green-400 text-lg">💰</span>
            <div>
              <div className="text-green-400 font-mono">Credits</div>
              <div className="text-white font-bold">
                {formatNumber(resources.credits)}
              </div>
            </div>
          </div>
        </Tooltip>

        <Tooltip
          content={
            <TooltipContent
              title="Power"
              description="Required to operate facilities. Generate more with Power Generators."
              stats={[
                {
                  label: "Used",
                  value: `${resources.power}/${resources.maxPower}`,
                  color:
                    resources.power >= resources.maxPower
                      ? "text-red-400"
                      : "text-yellow-400",
                },
                {
                  label: "Utilization",
                  value: `${Math.round((resources.power / resources.maxPower) * 100)}%`,
                },
              ]}
              actions={[
                { label: "Build Power Generator to increase capacity" },
              ]}
            />
          }
          rich={true}
          position="auto"
        >
          <div className="flex items-center space-x-2 cursor-help">
            <span className="text-yellow-400 text-lg">⚡</span>
            <div>
              <div className="text-green-400 font-mono">Power</div>
              <div className="text-white font-bold">
                {resources.power}/{resources.maxPower}
              </div>
            </div>
          </div>
        </Tooltip>

        <Tooltip
          content={
            <TooltipContent
              title="Research Points"
              description="Used to unlock new xenomorph species and facility upgrades"
              stats={[
                {
                  label: "Available",
                  value: resources.research,
                  color: "text-blue-400",
                },
              ]}
              actions={[{ label: "Build Research Labs to generate more" }]}
            />
          }
          rich={true}
          position="auto"
        >
          <div className="flex items-center space-x-2 cursor-help">
            <span className="text-blue-400 text-lg">🔬</span>
            <div>
              <div className="text-green-400 font-mono">Research</div>
              <div className="text-white font-bold">{resources.research}</div>
            </div>
          </div>
        </Tooltip>

        <Tooltip
          content={
            <TooltipContent
              title="Security Level"
              description="Determines containment effectiveness and emergency response capabilities"
              stats={[
                {
                  label: "Current Level",
                  value: resources.security,
                  color: securityColors[resources.security],
                },
                {
                  label: "Status",
                  value:
                    resources.security === "Maximum"
                      ? "All systems operational"
                      : "Can be improved",
                },
              ]}
              actions={[{ label: "Build Security Stations to increase" }]}
            />
          }
          rich={true}
          position="auto"
        >
          <div className="flex items-center space-x-2 cursor-help">
            <span className="text-orange-400 text-lg">🛡️</span>
            <div>
              <div className="text-green-400 font-mono">Security</div>
              <div
                className={`font-bold ${securityColors[resources.security]}`}
              >
                {resources.security}
              </div>
            </div>
          </div>
        </Tooltip>

        <Tooltip
          content={
            <TooltipContent
              title="Visitors"
              description="Guests visiting your park. They generate revenue but require safety measures."
              stats={[
                {
                  label: "Current",
                  value: `${resources.visitors}/${resources.maxVisitors}`,
                  color: "text-purple-400",
                },
                {
                  label: "Capacity",
                  value: `${Math.round((resources.visitors / resources.maxVisitors) * 100)}%`,
                },
              ]}
              actions={[
                { label: "Build Visitor Centers to increase capacity" },
              ]}
            />
          }
          rich={true}
          position="auto"
        >
          <div className="flex items-center space-x-2 cursor-help">
            <span className="text-purple-400 text-lg">👥</span>
            <div>
              <div className="text-green-400 font-mono">Visitors</div>
              <div className="text-white font-bold">
                {resources.visitors}/{resources.maxVisitors}
              </div>
            </div>
          </div>
        </Tooltip>

        <Tooltip
          content={
            <TooltipContent
              title="Daily Profit & Loss"
              description="Net daily income from operations"
              stats={[
                {
                  label: "Revenue",
                  value: `+$${resources.dailyRevenue.toLocaleString()}`,
                  color: "text-green-400",
                },
                {
                  label: "Expenses",
                  value: `-$${resources.dailyExpenses.toLocaleString()}`,
                  color: "text-red-400",
                },
                {
                  label: "Net",
                  value: `$${(resources.dailyRevenue - resources.dailyExpenses).toLocaleString()}`,
                  color:
                    resources.dailyRevenue - resources.dailyExpenses >= 0
                      ? "text-green-400"
                      : "text-red-400",
                },
              ]}
            />
          }
          rich={true}
          position="auto"
        >
          <div className="flex items-center space-x-2 cursor-help">
            <span className="text-cyan-400 text-lg">📊</span>
            <div>
              <div className="text-green-400 font-mono">Daily P&L</div>
              <div
                className={`font-bold ${resources.dailyRevenue - resources.dailyExpenses >= 0 ? "text-green-400" : "text-red-400"}`}
              >
                {formatNumber(resources.dailyRevenue - resources.dailyExpenses)}
              </div>
            </div>
          </div>
        </Tooltip>
      </div>
    </div>
  );
}
