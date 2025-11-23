import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Box,
} from "@mui/material";
import { FitnessCenter, TrendingUp, CalendarMonth } from "@mui/icons-material";

export default function Home() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome back!
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardActionArea sx={{ p: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <FitnessCenter sx={{ fontSize: 60, color: "primary.main" }} />
              </Box>
              <CardContent>
                <Typography
                  gutterBottom
                  variant="h5"
                  component="div"
                  textAlign="center"
                >
                  Start Workout
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                >
                  Begin a new training session
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardActionArea sx={{ p: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <TrendingUp sx={{ fontSize: 60, color: "secondary.main" }} />
              </Box>
              <CardContent>
                <Typography
                  gutterBottom
                  variant="h5"
                  component="div"
                  textAlign="center"
                >
                  Progress
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                >
                  View your stats and history
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardActionArea sx={{ p: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <CalendarMonth sx={{ fontSize: 60, color: "success.main" }} />
              </Box>
              <CardContent>
                <Typography
                  gutterBottom
                  variant="h5"
                  component="div"
                  textAlign="center"
                >
                  Schedule
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                >
                  Plan your workouts
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
