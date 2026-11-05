import { mergeConfig } from "vitest/config";
import config from "../../../vite.config.ts";

const auditConfig = mergeConfig(config, {});
auditConfig.test = {
  ...auditConfig.test,
  include: ["docs/audits/2026-11-05/probes.test.ts"],
};
export default auditConfig;
