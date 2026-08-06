import CloseIcon from "@mui/icons-material/Close";
import { Box, IconButton, Paper, Stack, Typography } from "@mui/material";
import type { MessageKey } from "../../i18n/translate.ts";
import { useTranslation } from "../../i18n/use-translation.ts";
import { ExportFilterSection } from "../export-panel/export-filter-section.tsx";
import type { AppIntroProps } from "./types.ts";
import { renderIntroRichText } from "./render-intro-rich-text.tsx";

type IntroScenario = {
  step: 1 | 2 | 3;
  titleKey: MessageKey;
  stepKeys: MessageKey[];
  outcomeKey: MessageKey;
};

const INTRO_SCENARIOS: IntroScenario[] = [
  {
    step: 1,
    titleKey: "intro.scenarioATitle",
    stepKeys: [
      "intro.scenarioAStep1",
      "intro.scenarioAStep2",
      "intro.scenarioAStep3",
    ],
    outcomeKey: "intro.scenarioAOutcome",
  },
  {
    step: 2,
    titleKey: "intro.scenarioBTitle",
    stepKeys: [
      "intro.scenarioBStep1",
      "intro.scenarioBStep2",
      "intro.scenarioBStep3",
      "intro.scenarioBStep4",
      "intro.scenarioBStep5",
      "intro.scenarioBStep6",
    ],
    outcomeKey: "intro.scenarioBOutcome",
  },
  {
    step: 3,
    titleKey: "intro.scenarioCTitle",
    stepKeys: ["intro.scenarioCStep1"],
    outcomeKey: "intro.scenarioCOutcome",
  },
];

export function AppIntro({ visible = true, onDismiss }: AppIntroProps) {
  const { t } = useTranslation();

  if (!visible) {
    return null;
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 1,
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <Stack spacing={1.5}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              lineHeight: 1.3,
              pt: 0.25,
              color: "var(--brand)",
            }}
          >
            {t("intro.title")}
          </Typography>
          {onDismiss ? (
            <IconButton
              size="small"
              onClick={onDismiss}
              aria-label={t("intro.closeAria")}
              sx={{ mt: -0.5, mr: -0.75 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          ) : null}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(3, minmax(0, 1fr))",
            },
            gap: { xs: 1.25, md: 1.5 },
            alignItems: "stretch",
          }}
        >
          {INTRO_SCENARIOS.map((scenario) => (
            <ExportFilterSection
              key={scenario.step}
              step={scenario.step}
              title={t(scenario.titleKey)}
              contentSx={{ overflow: "visible" }}
            >
              <Stack spacing={1}>
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
                      sx={{ lineHeight: 1.55 }}
                    >
                      {renderIntroRichText(t(stepKey), t)}
                    </Typography>
                  ))}
                </Box>
                <Typography variant="body2" sx={{ lineHeight: 1.45 }}>
                  <Box
                    component="span"
                    sx={{
                      color: "var(--brand)",
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                    }}
                  >
                    {t("intro.whatYouGet")}:{" "}
                  </Box>
                  {t(scenario.outcomeKey)}
                </Typography>
              </Stack>
            </ExportFilterSection>
          ))}
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ lineHeight: 1.4 }}
        >
          {t("intro.saveNote")}
        </Typography>
      </Stack>
    </Paper>
  );
}
