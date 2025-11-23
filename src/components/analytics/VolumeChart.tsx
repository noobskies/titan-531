import React from "react";
import { useTheme } from "@mui/material/styles";
import { Card, CardContent, Typography, Box } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { format } from "date-fns";
import type { VolumeDataPoint } from "../../types/analytics";

interface VolumeChartProps {
  data: VolumeDataPoint[];
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { payload: VolumeDataPoint }[];
  label?: string;
}) => {
  if (active && payload && payload.length && label) {
    const data = payload[0].payload;
    return (
      <Box
        sx={{
          bgcolor: "background.paper",
          p: 1.5,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          boxShadow: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {format(new Date(label), "MMM d, yyyy")}
        </Typography>
        <Typography
          variant="subtitle2"
          sx={{ color: "primary.main", fontWeight: "bold" }}
        >
          {data.workoutName}
        </Typography>
        <Typography variant="body2">
          Total Volume: {data.totalVolume.toLocaleString()} lbs
        </Typography>
      </Box>
    );
  }
  return null;
};

// Colors for different lifts
const LIFT_COLORS = {
  Squat: "#FF5252",
  Bench: "#448AFF",
  Deadlift: "#69F0AE",
  Press: "#E040FB",
  Default: "#9E9E9E",
};

export const VolumeChart: React.FC<VolumeChartProps> = ({ data }) => {
  const theme = useTheme();

  if (!data || data.length === 0) {
    return (
      <Card
        sx={{
          height: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="text.secondary">
          No workout volume data available
        </Typography>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Volume Progression
        </Typography>
        <Box sx={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart
              data={data}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme.palette.divider}
              />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => format(new Date(date), "MMM d")}
                stroke={theme.palette.text.secondary}
                style={{ fontSize: "0.75rem" }}
              />
              <YAxis
                stroke={theme.palette.text.secondary}
                style={{ fontSize: "0.75rem" }}
                width={40}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="totalVolume" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.lift && entry.lift in LIFT_COLORS
                        ? LIFT_COLORS[entry.lift as keyof typeof LIFT_COLORS]
                        : LIFT_COLORS.Default
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};
