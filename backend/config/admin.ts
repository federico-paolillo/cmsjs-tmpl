import type { Core } from '@strapi/strapi';

declare const strapi: Core.Strapi;

const previewPaths = {
  'api::article.article': '/articles/',
  'api::news-item.news-item': '/news/',
} as const;

type PreviewContentType = keyof typeof previewPaths;

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Admin => {
  const previewClientUrl = requiredUrl(env('PREVIEW_CLIENT_URL'), 'PREVIEW_CLIENT_URL');
  const previewSecret = requiredValue(env('PREVIEW_SECRET'), 'PREVIEW_SECRET');

  return {
    auth: {
      secret: env('ADMIN_JWT_SECRET')!,
    },
    apiToken: {
      salt: env('API_TOKEN_SALT')!,
    },
    transfer: {
      token: {
        salt: env('TRANSFER_TOKEN_SALT')!,
      },
    },
    secrets: {
      encryptionKey: env('ENCRYPTION_KEY')!,
    },
    preview: {
      enabled: true,
      config: {
        allowedOrigins: [previewClientUrl.origin],
        async handler(uid, { documentId, status }) {
          if (!isPreviewContentType(uid) || !documentId || !isContentStatus(status)) {
            return null;
          }

          const entry = await strapi.documents(uid).findOne({
            documentId,
            status,
            populate: { identity: true },
          });
          if (!hasSlug(entry)) {
            return null;
          }

          const previewUrl = new URL('/preview', previewClientUrl);
          previewUrl.searchParams.set('url', `${previewPaths[uid]}${encodeURIComponent(entry.identity.slug)}`);
          previewUrl.searchParams.set('secret', previewSecret);
          previewUrl.searchParams.set('status', status);
          return previewUrl.href;
        },
      },
    },
    flags: {
      nps: env.bool('FLAG_NPS', true),
      promoteEE: env.bool('FLAG_PROMOTE_EE', true),
      docLinks: env.bool('FLAG_DOC_LINKS', true),
    },
  };
};

function requiredValue(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Env. var. ${name} is not set`);
  }

  return value;
}

function requiredUrl(value: string | undefined, name: string): URL {
  try {
    return new URL(requiredValue(value, name));
  } catch {
    throw new Error(`Env. var. ${name} must be an absolute URL`);
  }
}

function isPreviewContentType(uid: string): uid is PreviewContentType {
  return uid in previewPaths;
}

function isContentStatus(status: string | undefined): status is 'draft' | 'published' {
  return status === 'draft' || status === 'published';
}

function hasSlug(entry: unknown): entry is { identity: { slug: string } } {
  if (!entry || typeof entry !== 'object') {
    return false;
  }

  const identity = (entry as { identity?: unknown }).identity;
  return (
    !!identity &&
    typeof identity === 'object' &&
    typeof (identity as { slug?: unknown }).slug === 'string' &&
    (identity as { slug: string }).slug.length > 0
  );
}

export default config;
