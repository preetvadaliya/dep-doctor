export interface DependenciesList {
  dependencies: string[];
  devDependencies: string[];
}

export interface Package {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}
