import { Core } from "@strapi/strapi";

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.TypeScript => ({
  autogenerate: true
});

export default config;