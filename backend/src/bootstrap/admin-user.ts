import type { Core } from "@strapi/strapi";
import { resolveSecret } from "./secrets";

export async function ensureDefaultAdmin(strapi: Core.Strapi): Promise<void> {
  const user = process.env.ADMIN_USER || "admin";
  const domain = process.env.ADMIN_DOMAIN || "example.com";
  const password = resolveSecret("ADMIN_PASSWORD");

  if (!password) {
    strapi.log.warn(
      "Skipping default admin creation: ADMIN_PASSWORD (or ADMIN_PASSWORD_FILE) is not set.",
    );
    return;
  }

  const userService = strapi.service("admin::user");

  if (await userService.exists()) {
    return;
  }

  const email = `${user}@${domain}`;

  await userService.createFirstAdmin({
    email,
    password,
    username: user,
  });

  strapi.log.info(`Created default admin user ${email}`);
}
