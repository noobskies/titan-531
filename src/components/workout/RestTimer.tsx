import {
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  CircularProgress,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ReplayIcon from "@mui/icons-material/Replay";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import { WORKOUT_UI_CONSTANTS } from "../../constants/workout";

interface RestTimerProps {
  remaining: number;
  totalDuration: number;
  isRunning: boolean;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onAddTime: (seconds: number) => void;
  onSkip: () => void;
}

export function RestTimer({
  remaining,
  totalDuration,
  isRunning,
  onPause,
  onResume,
  onReset,
  onAddTime,
  onSkip,
}: RestTimerProps) {
  // Format MM:SS
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  // Progress percentage (inverse, goes down)
  const progress = (remaining / totalDuration) * 100;

  return (
    <Box
      sx={{ position: "relative", width: "100%", py: 4, textAlign: "center" }}
    >
      {/* Timer Display */}
      <Box sx={{ position: "relative", display: "inline-flex", mb: 3 }}>
        <CircularProgress
          variant="determinate"
          value={progress}
          size={180}
          thickness={3}
          sx={{
            color: isRunning ? "primary.main" : "text.disabled",
            transition: "color 0.3s, value 0.3s linear",
          }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <Typography
            variant="h2"
            component="div"
            sx={{
              fontWeight: "bold",
              fontSize: WORKOUT_UI_CONSTANTS.TIMER_FONT_SIZE,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {timeDisplay}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            RESTING
          </Typography>
        </Box>
      </Box>

      {/* Controls */}
      <Stack spacing={2} alignItems="center">
        {/* Time Adjustments */}
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={() => onAddTime(-30)}>
            -30s
          </Button>
          <Button variant="outlined" onClick={() => onAddTime(30)}>
            +30s
          </Button>
        </Stack>

        {/* Play/Pause/Skip */}
        <Stack direction="row" spacing={3} alignItems="center">
          <IconButton onClick={onReset} size="large">
            <ReplayIcon />
          </IconButton>

          {isRunning ? (
            <IconButton
              onClick={onPause}
              color="primary"
              sx={{ p: 2, border: 2 }}
            >
              <PauseIcon fontSize="large" />
            </IconButton>
          ) : (
            <IconButton
              onClick={onResume}
              color="primary"
              sx={{ p: 2, border: 2 }}
            >
              <PlayArrowIcon fontSize="large" />
            </IconButton>
          )}

          <IconButton onClick={onSkip} size="large" color="error">
            <SkipNextIcon />
          </IconButton>
        </Stack>

        <Typography
          variant="caption"
          color="text.secondary"
          onClick={onSkip}
          sx={{ cursor: "pointer" }}
        >
          SKIP REST
        </Typography>
      </Stack>
    </Box>
  );
}
