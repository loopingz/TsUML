import { HeritageClause, MethodDetails, PropertyDetails } from "./interfaces";
import { Templates } from "./templates";

export function emitSingleClass(name: string, properties: PropertyDetails[], methods: MethodDetails[]) {
  return Templates.class(name, properties, methods);
}

export function emitSingleInterface(name: string, properties: PropertyDetails[], methods: MethodDetails[]) {
  return Templates.interface(name, properties, methods);
}

export function emitHeritageClauses(heritageClauses: HeritageClause[]) {
  return heritageClauses.map(heritageClause =>
    Templates.implementsOrExtends(heritageClause.clause, heritageClause.className)
  );
}
