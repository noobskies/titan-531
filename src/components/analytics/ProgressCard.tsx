import React from "react";
import { Card, CardContent, Typography, Grid, Box } from "@mui/material";
import {
  FitnessCenter as WorkoutIcon,
  Timeline as VolumeIcon,
  EmojiEvents as TrophyIcon,
  LocalFireDepartment as StreakIcon,
} from "@mui/icons-material";
import type { ProgressSummary } from "../../types/analytics";

interface ProgressCardProps {
  summary: ProgressSummary;
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, label, value, color }) => (
  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
    <Box
      sx={{
        bgcolor: `${color}20`, // 20% opacity
        color: color,
        p: 1,
        borderRadius: 2,
        mr: 2,
        display: "flex",
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1 }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  </Box>
);

export const ProgressCard: React.FC<ProgressCardProps> = ({ summary }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Cycle Summary
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 6 }}>
            <StatItem
              icon={<WorkoutIcon />}
              label="Workouts"
              value={`${summary.completedWorkouts}/${summary.totalWorkouts}`}
              color="#2196F3"
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <StatItem
              icon={<VolumeIcon />}
              label="Avg Volume"
              value={`${(summary.averageVolume / 1000).toFixed(1)}k`}
              color="#4CAF50"
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <StatItem
              icon={<TrophyIcon />}
              label="PRs Set"
              value={summary.prsAchieved}
              color="#FFC107"
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <StatItem
              icon={<StreakIcon />}
              label="Current Streak"
              value={summary.currentStreak}
              color="#FF5722"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
