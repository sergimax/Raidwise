import type { ReactNode } from "react";
import type { MessageKey, TranslateFn } from "../../i18n/translate.ts";
import { IntroFeatureMention } from "./intro-feature-mention.tsx";

type IntroFeatureToken =
  | "addFromTemplate"
  | "addCharacter"
  | "addDungeon"
  | "bisLists"
  | "editCharacter";

type IntroFeatureTokenConfig = {
  labelKey: MessageKey;
  emphasis?: "default" | "secondary";
};

const INTRO_FEATURE_TOKENS: Record<IntroFeatureToken, IntroFeatureTokenConfig> =
  {
    addFromTemplate: {
      labelKey: "toolbar.addFromTemplate",
      emphasis: "secondary",
    },
    addCharacter: { labelKey: "toolbar.addCharacter" },
    addDungeon: { labelKey: "toolbar.addDungeon" },
    bisLists: { labelKey: "toolbar.bisLists" },
    editCharacter: { labelKey: "intro.featureEditCharacter" },
  };

const FEATURE_TOKEN_PATTERN = /\{\{(addFromTemplate|addCharacter|addDungeon|bisLists|editCharacter)\}\}/g;

function isIntroFeatureToken(value: string): value is IntroFeatureToken {
  return value in INTRO_FEATURE_TOKENS;
}

/** Renders intro copy with `{{feature}}` placeholders as toolbar-like chips. */
export function renderIntroRichText(
  template: string,
  t: TranslateFn,
): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let matchIndex = 0;

  for (const match of template.matchAll(FEATURE_TOKEN_PATTERN)) {
    const token = match[1];
    const matchStart = match.index ?? 0;
    if (!isIntroFeatureToken(token)) {
      continue;
    }

    if (matchStart > lastIndex) {
      nodes.push(template.slice(lastIndex, matchStart));
    }

    const config = INTRO_FEATURE_TOKENS[token];
    nodes.push(
      <IntroFeatureMention
        key={`${token}-${matchIndex}`}
        label={t(config.labelKey)}
        emphasis={config.emphasis}
      />,
    );

    lastIndex = matchStart + match[0].length;
    matchIndex += 1;
  }

  if (lastIndex < template.length) {
    nodes.push(template.slice(lastIndex));
  }

  return nodes;
}
