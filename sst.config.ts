/// <reference path="./.sst/platform/config.d.ts" />
export default $config({
  app() {
    return {
      name: "studyhub",
      removal: "retain",
      home: "cloudflare",
      providers: { cloudflare: "6.3.1" },
    };
  },
  async run() {
    const secrets = new sst.cloudflare.Kv("Secrets");

    const hono = new sst.cloudflare.Worker("StudyHub", {
      url: true,
      handler: "./server/src/index.ts",
      assets: { directory: "./dist" },
      domain: "studyhub.mwyndham.dev",
      link: [secrets],
    });

    new sst.x.DevCommand("LocalVite", {
      dev: {
        autostart: false,
        directory: "client",
        command: "npm run dev",
      },
    });

    new sst.x.DevCommand("RebuildClient", {
      dev: {
        autostart: false,
        directory: "client",
        command: "npm run build",
      },
    });

    return { api: hono.url };
  },
});
