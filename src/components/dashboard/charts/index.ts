import dynamic from "next/dynamic";

// Dynamic imports with SSR disabled to prevent hydration errors with recharts
export const CompletionBarChart = dynamic(
  () =>
    import("./completion-bar-chart").then((mod) => ({
      default: mod.CompletionBarChart,
    })),
  {
    ssr: false,
  }
);

export const OnTimeRatioPieChart = dynamic(
  () =>
    import("./on-time-ratio-pie-chart").then((mod) => ({
      default: mod.OnTimeRatioPieChart,
    })),
  {
    ssr: false,
  }
);

export const CompletionTrendChart = dynamic(
  () =>
    import("./completion-trend-chart").then((mod) => ({
      default: mod.CompletionTrendChart,
    })),
  {
    ssr: false,
  }
);
