import React from "react";
import { useTheme } from "@mui/material/styles";
import { Card, CardContent, Typography, Box } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import type { E1RMDataPoint } from "../../types/analytics";

interface E1RMChartProps {
  data: E1RMDataPoint[];
  liftName: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { payload: E1RMDataPoint }[];
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
          E1RM: {data.estimatedMax} lbs
        </Typography>
        <Typography variant="caption" display="block">
          {data.actualReps} reps @ {data.weight} lbs
        </Typography>
      </Box>
    );
  }
  return null;
};

export const E1RMChart: React.FC<E1RMChartProps> = ({ data, liftName }) => {
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
          No data available for {liftName}
        </Typography>
      </Card>
    );
  }

  // Calculate domain padding for Y-axis to make chart look better
  const minVal = Math.min(...data.map((d) => d.estimatedMax));
  const maxVal = Math.max(...data.map((d) => d.estimatedMax));
  const domainMin = Math.floor((minVal * 0.9) / 5) * 5; // Round down to nearest 5
  const domainMax = Math.ceil((maxVal * 1.1) / 5) * 5; // Round up to nearest 5

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {liftName} Estimated 1RM
        </Typography>
        <Box sx={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
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
                domain={[domainMin, domainMax]}
                stroke={theme.palette.text.secondary}
                style={{ fontSize: "0.75rem" }}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="estimatedMax"
                stroke={theme.palette.primary.main}
                strokeWidth={3}
                dot={{ r: 4, fill: theme.palette.primary.main }}
                activeDot={{ r: 6 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};
