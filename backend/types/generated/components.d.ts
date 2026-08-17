import type { Schema, Struct } from '@strapi/strapi';

export interface IdentitySlug extends Struct.ComponentSchema {
  collectionName: 'components_identity_slugs';
  info: {
    displayName: 'slug';
  };
  attributes: {
    slug: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 16;
        minLength: 8;
      }>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 8;
      }>;
  };
}

export interface SharedHero extends Struct.ComponentSchema {
  collectionName: 'components_shared_heroes';
  info: {
    displayName: 'hero';
  };
  attributes: {
    cta: Schema.Attribute.String;
    headline: Schema.Attribute.String & Schema.Attribute.Required;
    subheading: Schema.Attribute.String;
    visual: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

export interface SharedSection extends Struct.ComponentSchema {
  collectionName: 'components_shared_sections';
  info: {
    displayName: 'section';
  };
  attributes: {
    content: Schema.Attribute.Blocks & Schema.Attribute.Required;
    header: Schema.Attribute.String;
    hero: Schema.Attribute.Media<'images'>;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'identity.slug': IdentitySlug;
      'shared.hero': SharedHero;
      'shared.section': SharedSection;
    }
  }
}
