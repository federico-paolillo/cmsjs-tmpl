import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Server => {
  return ({
    host: env('HOST', '127.0.0.1'),
    port: env.int('PORT', 1337),
    app: {
      keys: env.array('APP_KEYS')!,
    },
    webhooks: {
      populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', true),
      defaultHeaders: {
        [`x-${env('WEBHOOKS_SECRET_HEADER')}`]: `${env("WEBHOOKS_SECRET_HEADER_VALUE")}`
      }
    },
  })
};

export default config;
