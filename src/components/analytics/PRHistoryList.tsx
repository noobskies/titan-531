import React from "react";
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Box,
  Divider,
} from "@mui/material";
import {
  EmojiEvents as TrophyIcon,
  FitnessCenter as LiftIcon,
  TrendingUp as TrendIcon,
  Timer as TimeIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import type { PersonalRecord } from "../../types/analytics";

interface PRHistoryListProps {
  prs: PersonalRecord[];
  limit?: number;
}

export const PRHistoryList: React.FC<PRHistoryListProps> = ({ prs, limit }) => {
  const displayPRs = limit ? prs.slice(0, limit) : prs;

  if (!prs || prs.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Personal Records
          </Typography>
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography color="text.secondary">
              No PRs achieved yet. Keep training!
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const getRecordIcon = (type: string) => {
    switch (type) {
      case "e1rm":
        return <TrendIcon />;
      case "repMax":
        return <LiftIcon />;
      case "volumePR":
        return <TimeIcon />;
      default:
        return <TrophyIcon />;
    }
  };

  const getRecordLabel = (type: string) => {
    switch (type) {
      case "e1rm":
        return "Est. 1RM";
      case "repMax":
        return "Rep Max";
      case "volumePR":
        return "Volume PR";
      default:
        return "PR";
    }
  };

  return (
    <Card>
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">Recent Personal Records</Typography>
        </Box>
        <Divider />
        <List sx={{ p: 0 }}>
          {displayPRs.map((pr, index) => (
            <React.Fragment key={pr.id}>
              <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "secondary.main" }}>
                    {getRecordIcon(pr.recordType)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        component="span"
                        fontWeight="bold"
                      >
                        {pr.lift} {getRecordLabel(pr.recordType)}
                      </Typography>
                      <Chip
                        label={format(new Date(pr.date), "MMM d")}
                        size="small"
                        variant="outlined"
                        sx={{ height: 20, fontSize: "0.7rem" }}
                      />
                    </Box>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography
                        sx={{ display: "inline" }}
                        component="span"
                        variant="body2"
                        color="text.primary"
                        fontWeight="medium"
                      >
                        {pr.value} lbs
                      </Typography>
                      {pr.reps && pr.weight && (
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          sx={{ ml: 1 }}
                        >
                          ({pr.reps} reps @ {pr.weight} lbs)
                        </Typography>
                      )}
                    </React.Fragment>
                  }
                />
              </ListItem>
              {index < displayPRs.length - 1 && (
                <Divider component="li" variant="inset" />
              )}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};
