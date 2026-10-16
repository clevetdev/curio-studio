import { Config } from "@remotion/cli/config";
import { globSync } from "node:fs";

// Cloud containers ship a Playwright headless shell; elsewhere Remotion downloads its own browser.
const shell = globSync("/opt/pw-browsers/chromium_headless_shell-*/*/headless_shell")[0];
if (shell) Config.setBrowserExecutable(shell);
Config.setConcurrency(4);
