import { Box, Container, Stack, Typography } from "@mui/material";
import { useTranslation } from "../../i18n/use-translation.ts";
import changelog from "../../../CHANGELOG.md?raw";
import { AppHeader } from "../app-header/index.tsx";
import { AppNavigation } from "../app-navigation/index.tsx";

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, index) => {
    const bold = part.match(/^\*\*(.+)\*\*$/);
    if (bold) return <strong key={index}>{bold[1]}</strong>;

    const code = part.match(/^`(.+)`$/);
    if (code) return <code key={index}>{code[1]}</code>;

    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return (
        <a key={index} href={link[2]} target="_blank" rel="noreferrer">
          {link[1]}
        </a>
      );
    }

    return part;
  });
}

function ChangelogContent() {
  const lines = changelog.split(/\r?\n/);
  const blocks: Array<{ type: "heading" | "paragraph" | "list"; level?: number; lines: string[] }> = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length, lines: [heading[2]] });
      continue;
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      const current = blocks.at(-1);
      if (current?.type === "list") current.lines.push(line);
      else blocks.push({ type: "list", lines: [line] });
      continue;
    }

    const current = blocks.at(-1);
    if (current?.type === "paragraph") current.lines.push(line);
    else blocks.push({ type: "paragraph", lines: [line] });
  }

  return (
    <Stack spacing={1.5} component="article" aria-label="Changelog">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const level = block.level ?? 2;
          if (level === 1) return null;
          const variant = level === 2 ? "h6" : "subtitle2";
          const headingTag = (["h1", "h2", "h3", "h4", "h5", "h6"] as const)[level - 1] ?? "h2";
          return (
            <Typography key={index} component={headingTag} variant={variant} sx={{ fontWeight: 700 }}>
              {renderInlineMarkdown(block.lines[0] ?? "")}
            </Typography>
          );
        }

        if (block.type === "list") {
          return (
            <Box component="ul" key={index} sx={{ my: 0, pl: 3 }}>
              {block.lines.map((line, itemIndex) => (
                <li key={itemIndex}>
                  <Typography component="span" variant="body2">
                    {renderInlineMarkdown(line.replace(/^\s*[-*+]\s+/, ""))}
                  </Typography>
                </li>
              ))}
            </Box>
          );
        }

        return (
          <Typography key={index} component="p" variant="body2" color="text.secondary" sx={{ my: 0 }}>
            {block.lines.map((line, lineIndex) => (
              <span key={lineIndex}>
                {lineIndex > 0 && " "}
                {renderInlineMarkdown(line)}
              </span>
            ))}
          </Typography>
        );
      })}
    </Stack>
  );
}

export function ChangelogPage() {
  const { t } = useTranslation();

  return (
    <div className="app-shell">
      <AppHeader />
      <AppNavigation />
      <Container component="main" maxWidth="md" sx={{ py: 2 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
              {t("changesPage.pageTitle")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("changesPage.pageDescription")}
            </Typography>
          </Box>
          <ChangelogContent />
        </Stack>
      </Container>
    </div>
  );
}
