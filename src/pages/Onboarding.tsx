import { useState } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Card,
  CardContent,
  Container,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useProgram } from "../hooks/useProgram";

// Step components will be imported here
// For now we'll define placeholders inline and refactor later

// Step 1: Welcome
const WelcomeStep = ({ onNext }: { onNext: () => void }) => (
  <Box sx={{ textAlign: "center", py: 4 }}>
    <Typography variant="h3" gutterBottom sx={{ fontWeight: "bold" }}>
      Welcome to Titan 531
    </Typography>
    <Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 4 }}>
      The most effective way to build strength, optimized for the gym.
    </Typography>
    <Box sx={{ maxWidth: 600, mx: "auto", textAlign: "left", mb: 4 }}>
      <Typography paragraph>
        We'll help you set up your <strong>Training Maxes (TM)</strong> so your
        program is perfectly tailored to your strength level.
      </Typography>
      <Typography paragraph>
        The 5/3/1 program is built on slow, steady progress. Don't let the
        starting weights fool you - you will get stronger.
      </Typography>
    </Box>
    <Button
      variant="contained"
      size="large"
      onClick={onNext}
      sx={{ height: 64, px: 6, fontSize: "1.25rem" }}
    >
      Let's Get Started
    </Button>
  </Box>
);

// Step 2: TM Input (Placeholder)
const TMInputStep = ({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) => (
  <Box>
    <Typography variant="h4" gutterBottom>
      Set Your Training Maxes
    </Typography>
    <Typography color="text.secondary" paragraph>
      Enter a weight you can lift for 3-5 reps with good form. We'll calculate
      your training max (90% of 1RM) automatically.
    </Typography>
    {/* Inputs will go here */}
    <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
      <Button onClick={onBack}>Back</Button>
      <Button variant="contained" onClick={onNext}>
        Next
      </Button>
    </Box>
  </Box>
);

// Step 3: Schedule (Placeholder)
const ScheduleStep = ({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) => (
  <Box>
    <Typography variant="h4" gutterBottom>
      Training Schedule
    </Typography>
    <Typography color="text.secondary" paragraph>
      Which days do you plan to train? We'll create your schedule accordingly.
    </Typography>
    {/* Schedule inputs here */}
    <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
      <Button onClick={onBack}>Back</Button>
      <Button variant="contained" onClick={onNext}>
        Next
      </Button>
    </Box>
  </Box>
);

// Step 4: Preview (Placeholder)
const PreviewStep = ({
  onFinish,
  onBack,
}: {
  onFinish: () => void;
  onBack: () => void;
}) => (
  <Box>
    <Typography variant="h4" gutterBottom>
      Ready to Lift?
    </Typography>
    <Typography color="text.secondary" paragraph>
      Here's a preview of your first cycle.
    </Typography>
    {/* Preview cycle here */}
    <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
      <Button onClick={onBack}>Back</Button>
      <Button
        variant="contained"
        size="large"
        onClick={onFinish}
        sx={{ height: 64, px: 6 }}
      >
        Start Training
      </Button>
    </Box>
  </Box>
);

const steps = ["Welcome", "Training Maxes", "Schedule", "Preview"];

export default function Onboarding() {
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();
  const { startNewCycle } = useProgram();

  const handleNext = () => {
    // Phase 2a Placeholder - Mock Data for testing
    // In real implementation, this will happen in TMInputStep
    if (activeStep === 1) {
      // Mock TMs for testing
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleFinish = () => {
    // In the real implementation, we'll validate TMs are set
    // For now, assume they are handled in the steps
    startNewCycle("original-531"); // This requires TMs to be set
    navigate("/");
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <WelcomeStep onNext={handleNext} />;
      case 1:
        return <TMInputStep onNext={handleNext} onBack={handleBack} />;
      case 2:
        return <ScheduleStep onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <PreviewStep onFinish={handleFinish} onBack={handleBack} />;
      default:
        return "Unknown step";
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 4, backgroundColor: "transparent" }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Card
        sx={{
          minHeight: 400,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <CardContent>{getStepContent(activeStep)}</CardContent>
      </Card>
    </Container>
  );
}
