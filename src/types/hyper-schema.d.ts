import {JSONSchema4} from 'json-schema';

export interface HyperSchemaLink4 {
  method?: string;
  href?: string;
  title?: string;
  schema?: {
    $ref: string;
  } | JSONSchema4;
  hrefSchema?: {
    $ref: string;
  } | JSONSchema4;
  targetSchema?: {
    $ref: string;
  } | JSONSchema4;
  'rel': string;
}

export interface HyperSchemaResource4 {
  id?: string;
  links: HyperSchemaLink4[];
}

export type HyperSchema4 = JSONSchema4 & {
  properties: {[k: string]: HyperSchemaResource4};
}
