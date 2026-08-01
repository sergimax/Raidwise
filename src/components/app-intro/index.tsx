import { Box, Stack, Typography } from "@mui/material";
import type { MessageKey } from "../../i18n/translate.ts";
import { useTranslation } from "../../i18n/use-translation.ts";
import type { AppIntroProps } from "./types.ts";

type IntroScenario = {
  letter: "A" | "B" | "C";
  titleKey: MessageKey;
  stepKeys: MessageKey[];
  outcomeKey: MessageKey;
};

const INTRO_SCENARIOS: IntroScenario[] = [
  {
    letter: "A",
    titleKey: "intro.scenarioATitle",
    stepKeys: [
      "intro.scenarioAStep1",
      "intro.scenarioAStep2",
      "intro.scenarioAStep3",
    ],
    outcomeKey: "intro.scenarioAOutcome",
  },
  {
    letter: "B",
    titleKey: "intro.scenarioBTitle",
    stepKeys: [
      "intro.scenarioBStep1",
      "intro.scenarioBStep2",
      "intro.scenarioBStep3",
      "intro.scenarioBStep4",
      "intro.scenarioBStep5",
    ],
    outcomeKey: "intro.scenarioBOutcome",
  },
  {
    letter: "C",
    titleKey: "intro.scenarioCTitle",
    stepKeys: ["intro.scenarioCStep1"],
    outcomeKey: "intro.scenarioCOutcome",
  },
];

export function AppIntro({ visible = true }: AppIntroProps) {
  const { t } = useTranslation();

  if (!visible) {
    return null;
  }

  return (
    <Box
      sx={(theme) => ({
        px: { xs: 1.75, sm: 2.25 },
        py: { xs: 1.75, sm: 2.25 },
        borderRadius: 1,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow:
          theme.palette.mode === "light"
            ? "0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)"
            : "0 1px 2px rgba(0, 0, 0, 0.35)",
      })}
    >
      <Stack spacing={1.5}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
          {t("intro.title")}
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(3, minmax(0, 1fr))",
            },
            gap: { xs: 1.5, md: 2 },
          }}
        >
          {INTRO_SCENARIOS.map((scenario) => (
            <Box
              key={scenario.letter}
              sx={{
                minWidth: 0,
                pl: { md: scenario.letter === "A" ? 0 : 2 },
                borderLeft: {
                  xs: "none",
                  md: scenario.letter === "A" ? "none" : "1px solid",
                },
                borderColor: { md: "divider" },
                pt: { xs: scenario.letter === "A" ? 0 : 1.25, md: 0 },
                borderTop: {
                  xs: scenario.letter === "A" ? "none" : "1px solid",
                  md: "none",
                },
              }}
            >
              <Stack spacing={0.75}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, lineHeight: 1.35 }}
                >
                  <Box
                    component="span"
                    sx={{ color: "text.secondary", fontWeight: 700 }}
                  >
                    {scenario.letter}.{" "}
                  </Box>
                  {t(scenario.titleKey)}
                </Typography>
                <Box
                  component="ol"
                  sx={{
                    m: 0,
                    pl: 2.25,
                    color: "text.secondary",
                    "& > li": {
                      pl: 0.25,
                    },
                    "& > li + li": {
                      mt: 0.35,
                    },
                  }}
                >
                  {scenario.stepKeys.map((stepKey) => (
                    <Typography
                      key={stepKey}
                      component="li"
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.45 }}
                    >
                      {t(stepKey)}
                    </Typography>
                  ))}
                </Box>
                <Typography variant="body2" sx={{ lineHeight: 1.45 }}>
                  <Box
                    component="span"
                    sx={{ color: "text.secondary", fontWeight: 700 }}
                  >
                    {t("intro.whatYouGet")}:{" "}
                  </Box>
                  {t(scenario.outcomeKey)}
                </Typography>
              </Stack>
            </Box>
          ))}
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
          {t("intro.saveNote")}
        </Typography>
      </Stack>
    </Box>
  );
}
