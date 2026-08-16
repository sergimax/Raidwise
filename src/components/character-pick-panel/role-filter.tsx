import { Box, Checkbox, Stack, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { exportRoleIcons } from "../../assets/role-icons/role-icons.ts";
import type { TranslateFn } from "../../i18n/translate.ts";
import { useTranslation } from "../../i18n/use-translation.ts";
import type { ExportRoleFilter, ExportRoleFilterId } from "../../utils/export-spec-role.ts";

type ExportRoleFilterProps = {
  roleFilter: ExportRoleFilter;
  onRoleFilterChange: (roleFilter: ExportRoleFilter) => void;
};

const ROLE_FILTER_MESSAGE_KEYS: Record<
  ExportRoleFilterId,
  "roleTank" | "roleHealer" | "roleMeleeDps" | "roleRangedDps"
> = {
  tank: "roleTank",
  healer: "roleHealer",
  meleeDps: "roleMeleeDps",
  rangedDps: "roleRangedDps",
};

const ROLE_FILTER_ARIA_KEYS: Record<
  ExportRoleFilterId,
  | "roleTankAria"
  | "roleHealerAria"
  | "roleMeleeDpsAria"
  | "roleRangedDpsAria"
> = {
  tank: "roleTankAria",
  healer: "roleHealerAria",
  meleeDps: "roleMeleeDpsAria",
  rangedDps: "roleRangedDpsAria",
};

const ROLE_FILTER_GRID_ORDER: readonly ExportRoleFilterId[] = [
  "tank",
  "meleeDps",
  "healer",
  "rangedDps",
];

const roleFilterOptionSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "flex-start",
  gap: 0.25,
  width: "100%",
  minWidth: 0,
  cursor: "pointer",
  borderRadius: 1,
  px: 0.5,
  py: 0.25,
  boxSizing: "border-box",
  transition: (theme) =>
    theme.transitions.create(["background-color"], {
      duration: theme.transitions.duration.shortest,
    }),
  "&:hover": {
    backgroundColor: "action.hover",
    "& img": {
      filter: "brightness(1.12)",
    },
  },
  "& img": {
    transition: (theme) =>
      theme.transitions.create("filter", {
        duration: theme.transitions.duration.shortest,
      }),
  },
};

type RoleFilterOptionProps = {
  roleId: ExportRoleFilterId;
  checked: boolean;
  onCheckedChange: (included: boolean) => void;
  t: TranslateFn;
};

function RoleFilterOption({
  roleId,
  checked,
  onCheckedChange,
  t,
}: RoleFilterOptionProps) {
  return (
    <Box component="label" sx={roleFilterOptionSx}>
      <Checkbox
        size="small"
        checked={checked}
        onChange={(event) => {
          onCheckedChange(event.target.checked);
        }}
        slotProps={{
          input: {
            "aria-label": t(`characterPickPanel.${ROLE_FILTER_ARIA_KEYS[roleId]}`),
          },
        }}
        sx={{ alignSelf: "flex-start", mt: 0.25, p: 0.5, flexShrink: 0 }}
      />
      <Stack spacing={0.5} sx={{ alignItems: "center", flex: 1, minWidth: 0 }}>
        <Box
          component="img"
          src={exportRoleIcons[roleId]}
          alt=""
          width={32}
          height={32}
          sx={{ borderRadius: "50%", flexShrink: 0, display: "block" }}
        />
        <Typography
          variant="body2"
          component="span"
          sx={{ lineHeight: 1.2, textAlign: "center", width: "100%" }}
        >
          {t(`characterPickPanel.${ROLE_FILTER_MESSAGE_KEYS[roleId]}`)}
        </Typography>
      </Stack>
    </Box>
  );
}

export function CharacterPickRoleFilter({
  roleFilter,
  onRoleFilterChange,
}: ExportRoleFilterProps) {
  const { t } = useTranslation();

  const setRoleIncluded = (roleId: ExportRoleFilterId, included: boolean) => {
    onRoleFilterChange({
      ...roleFilter,
      [roleId]: included,
    });
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        columnGap: 1,
        rowGap: 0.75,
        width: "100%",
        minWidth: 0,
      }}
    >
      {ROLE_FILTER_GRID_ORDER.map((roleId) => (
        <RoleFilterOption
          key={roleId}
          roleId={roleId}
          checked={roleFilter[roleId]}
          onCheckedChange={(included) => {
            setRoleIncluded(roleId, included);
          }}
          t={t}
        />
      ))}
    </Box>
  );
}
