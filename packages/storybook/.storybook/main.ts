import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: [{ directory: "../../design-system/src" }],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: { name: "@storybook/react-vite", options: {} },
  viteFinal: (config) => {
    config.server = { ...config.server, host: true, allowedHosts: true };
    return config;
  },
};

export default config;
