import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { IconButton, Stack, Typography } from "@mui/material";

export function SoftStepper({
  value,
  min,
  max,
  onChange,
  decreaseAria,
  increaseAria,
  valueAria,
  emphasized = false,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
  decreaseAria: string;
  increaseAria: string;
  valueAria: string;
  emphasized?: boolean;
}) {
  return (
    <Stack direction="row" spacing={0} sx={{ alignItems: "center" }}>
      <IconButton
        size="small"
        aria-label={decreaseAria}
        disabled={value <= min}
        onClick={() => {
          onChange(value - 1);
        }}
        sx={{ p: emphasized ? 0.35 : 0.2 }}
      >
        <RemoveIcon sx={{ fontSize: emphasized ? 18 : 15 }} />
      </IconButton>
      <Typography
        variant={emphasized ? "body2" : "caption"}
        component="span"
        aria-label={valueAria}
        sx={{
          minWidth: emphasized ? 22 : 14,
          textAlign: "center",
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        {value}
      </Typography>
      <IconButton
        size="small"
        aria-label={increaseAria}
        disabled={value >= max}
        onClick={() => {
          onChange(value + 1);
        }}
        sx={{ p: emphasized ? 0.35 : 0.2 }}
      >
        <AddIcon sx={{ fontSize: emphasized ? 18 : 15 }} />
      </IconButton>
    </Stack>
  );
}
