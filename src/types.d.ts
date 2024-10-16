export interface DependenciesList {
  dependencies: string[];
  devDependencies: string[];
}

export interface Package {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

export interface PackageInfo {
  name: string;
  description: string;
  version: string;
  license: string;
}