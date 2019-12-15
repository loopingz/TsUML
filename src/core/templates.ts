import { Arguments } from "yargs";
import { MethodDetails, PropertyDetails } from "./interfaces";
import { download } from "./io";

interface TemplateEngine {
  implementsOrExtends(abstraction: string, implementation: string): string;
  class(name: string, props: PropertyDetails[], methods: MethodDetails[]): string;
  interface(name: string, props: PropertyDetails[], methods: MethodDetails[]): string;
  finalize(dsl: string, args: Arguments): Promise<void>;
  getSeparator(): string;
}

export const mermaidTemplates = {
  composition: "+->",
  implementsOrExtends: (abstraction: string, implementation: string) => {
    return (
      `${mermaidTemplates.plainClassOrInterface(abstraction)}` +
      ` <|-- ${mermaidTemplates.plainClassOrInterface(implementation)}\n`
    );
  },
  plainClassOrInterface: (name: string) => `${name}`,
  colorClass: (name: string) => `class ${name}`,
  colorInterface: (name: string) => `class ${name}`,
  getScope(info: PropertyDetails | MethodDetails) {
    switch (info.scope) {
      case "private":
        return "-";
      case "protected":
        return "#";
    }
    return "+";
  },
  propertyTemplate: (property: PropertyDetails) => {
    return `${mermaidTemplates.getScope(property)}${property.name}`;
  },
  methodTemplate: (method: MethodDetails) => {
    return `${mermaidTemplates.getScope(method)}${method.name}()`;
  },
  class: (name: string, props: PropertyDetails[], methods: MethodDetails[]) => {
    return (
      `${mermaidTemplates.colorClass(name)} {\n\t` +
      `${props.map(mermaidTemplates.propertyTemplate).join("\n\t")}\n\t${methods
        .map(mermaidTemplates.methodTemplate)
        .join("\n\t")}\n}\n`
    );
  },
  interface: (name: string, props: PropertyDetails[], methods: MethodDetails[]) => {
    return (
      `${mermaidTemplates.colorInterface(name)} {\n\t<<interface>>\n` +
      `${props.map(mermaidTemplates.propertyTemplate).join("\n")}\n\t${methods
        .map(mermaidTemplates.methodTemplate)
        .join("\n")}\n}\n`
    );
  },
  finalize: async (dsl: string, args: Arguments): Promise<void> => {
    let finalDsl = `classDiagram\n${dsl}`;
    if (args.output) {
      const fs = require("fs");
      fs.writeFileSync(args.output, finalDsl);
    } else {
      console.log(finalDsl);
    }
  },
  getSeparator: () => ""
};

export const yumlTemplates = {
  composition: "+->",
  implementsOrExtends: (abstraction: string, implementation: string) => {
    return (
      `${yumlTemplates.plainClassOrInterface(abstraction)}` + `^-${yumlTemplates.plainClassOrInterface(implementation)}`
    );
  },
  plainClassOrInterface: (name: string) => `[${name}]`,
  colorClass: (name: string) => `[${name}{bg:skyblue}]`,
  colorInterface: (name: string) => `[${name}{bg:palegreen}]`,
  class: (name: string, props: PropertyDetails[], methods: MethodDetails[]) => {
    console.log(props);
    const pTemplate = (property: PropertyDetails) => `${property.name};`;
    const mTemplate = (method: MethodDetails) => `${method.name}();`;
    return (
      `${yumlTemplates.colorClass(name)}` +
      `[${name}|${props.map(pTemplate).join("")}|${methods.map(mTemplate).join("")}]`
    );
  },
  interface: (name: string, props: PropertyDetails[], methods: MethodDetails[]) => {
    const pTemplate = (property: PropertyDetails) => `${property.name};`;
    const mTemplate = (method: MethodDetails) => `${method.name}();`;
    return (
      `${yumlTemplates.colorInterface(name)}` +
      `[${name}|${props.map(pTemplate).join("")}|${methods.map(mTemplate).join("")}]`
    );
  },
  finalize: async (dsl: string, args: Arguments): Promise<void> => {
    const opn = require("opn");
    opn(await download(dsl));
  },
  getSeparator: () => ","
};

export class Templates {
  static type = "mermaid";
  static types: { [key: string]: TemplateEngine } = {
    mermaid: mermaidTemplates,
    yuml: yumlTemplates
  };

  static setType(type: string) {
    Templates.type = type;
  }

  static implementsOrExtends(abstraction: string, implementation: string) {
    return Templates.types[Templates.type].implementsOrExtends(abstraction, implementation);
  }
  static class(name: string, props: PropertyDetails[], methods: MethodDetails[]): string {
    return Templates.types[Templates.type].class(name, props, methods);
  }
  static interface(name: string, props: PropertyDetails[], methods: MethodDetails[]): string {
    return Templates.types[Templates.type].interface(name, props, methods);
  }
  static async finalize(dsl: string, args: Arguments): Promise<void> {
    return Templates.types[Templates.type].finalize(dsl, args);
  }
  static getSeparator(): string {
    return Templates.types[Templates.type].getSeparator();
  }
}
