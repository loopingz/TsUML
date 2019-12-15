import { ClassDeclaration, InterfaceDeclaration, Project, Symbol } from "ts-morph";
import { HeritageClause, MethodDetails, PropertyDetails } from "./interfaces";

export function getAst(tsConfigPath: string, sourceFilesPaths?: string[]) {
  const project = new Project({
    tsConfigFilePath: tsConfigPath,
    addFilesFromTsConfig: !Array.isArray(sourceFilesPaths)
  });
  if (sourceFilesPaths) {
    project.addSourceFilesAtPaths(sourceFilesPaths);
  }
  return project;
}

function symbolTransform(sym: Symbol) {
  let scope = "public";
  if (sym.compilerSymbol.valueDeclaration.modifiers) {
    sym.compilerSymbol.valueDeclaration.modifiers.forEach(s => {
      switch (s.kind) {
        case 116:
          scope = "private";
          break;
        case 117:
          scope = "protected";
          break;
      }
    });
  }
  return {
    name: sym.getName(),
    scope
  };
}

export function parseClasses(classDeclaration: ClassDeclaration) {
  const className = classDeclaration.getSymbol()!.getName();
  const propertyDeclarations = classDeclaration.getProperties();
  const methodDeclarations = classDeclaration.getMethods();

  const properties = propertyDeclarations
    .map(property => {
      const sym = property.getSymbol();
      if (sym) {
        return symbolTransform(sym);
      }
    })
    .filter(p => p !== undefined) as PropertyDetails[];

  const methods = methodDeclarations
    .map(method => {
      const sym = method.getSymbol();
      if (sym) {
        return symbolTransform(sym);
      }
    })
    .filter(p => p !== undefined) as MethodDetails[];

  return { className, properties, methods };
}

export function parseInterfaces(interfaceDeclaration: InterfaceDeclaration) {
  const interfaceName = interfaceDeclaration.getSymbol()!.getName();
  const propertyDeclarations = interfaceDeclaration.getProperties();
  const methodDeclarations = interfaceDeclaration.getMethods();

  const properties = propertyDeclarations
    .map(property => {
      const sym = property.getSymbol();
      if (sym) {
        return symbolTransform(sym);
      }
    })
    .filter(p => p !== undefined) as PropertyDetails[];

  const methods = methodDeclarations
    .map(method => {
      const sym = method.getSymbol();
      if (sym) {
        return symbolTransform(sym);
      }
    })
    .filter(p => p !== undefined) as MethodDetails[];

  return { interfaceName, properties, methods };
}

export function parseHeritageClauses(classDeclaration: ClassDeclaration) {
  const className = classDeclaration.getSymbol()!.getName();
  const extended = classDeclaration.getExtends();
  const implemented = classDeclaration.getImplements();
  let heritageClauses: HeritageClause[] = [];
  if (extended) {
    // 75 is the class identifier, was ts.SyntaxKind.Identifier (71)
    const identifier = extended.getChildrenOfKind(75)[0];
    if (identifier) {
      const sym = identifier.getSymbol();
      if (sym) {
        heritageClauses.push({
          clause: sym.getName(),
          className
        });
      }
    }
  }

  if (implemented) {
    implemented.forEach(i => {
      // 75 is the class identifier, was ts.SyntaxKind.Identifier (71)
      const identifier = i.getChildrenOfKind(75)[0];
      if (identifier) {
        const sym = identifier.getSymbol();
        if (sym) {
          heritageClauses.push({
            clause: sym.getName(),
            className
          });
        }
      }
    });
  }

  return heritageClauses;
}
