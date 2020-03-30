import {HyperSchemaResource4} from '../types/hyper-schema';
import {assertDefined, inspect} from './misc';
import {getCommonPath} from './paths';

export function getCommonHref(resource: HyperSchemaResource4): string {
  return getCommonPath(resource.links.map((link) => assertDefined(link.href, `href missing in ${inspect(link)}`)));
}
