import {HyperSchemaLink4} from '../types/hyper-schema';
import {assertDefined, inspect} from './misc';
import {getCommonPath} from './paths';

export function getCommonHref(links: HyperSchemaLink4[]): string {
  return getCommonPath(links.map((link) => assertDefined(link.href, `href missing in ${inspect(link)}`)));
}
