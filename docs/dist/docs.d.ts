//#region src/docs.d.ts
interface PluginDocs {
  slug: string;
  name: string;
  packageName: string;
  description: string;
  repo?: string;
  npm?: string;
  install: {
    npm: string;
    pnpm: string;
    yarn: string;
  };
  usage: string;
  selectors?: string[];
  css?: {
    import: string;
    block: string;
    customProperties: string[];
    stateClasses: string[];
  };
  dataAttributes?: Array<{
    name: string;
    option: string;
    description: string;
  }>;
  keyboard?: Array<{
    key: string;
    description: string;
  }>;
  api: Array<{
    name: string;
    type: string;
    description: string;
  }>;
  options?: Array<{
    name: string;
    type: string;
    default: string;
    description: string;
  }>;
  methods?: Array<{
    name: string;
    type: string;
    description: string;
  }>;
  events?: Array<{
    name: string;
    description: string;
    cancelable?: boolean;
  }>;
  accessibility?: string[];
  limitations?: string[];
  examples?: Array<{
    name: string;
    description: string;
    path: string;
  }>;
}
declare const docs: {
  slug: string;
  name: string;
  packageName: string;
  description: string;
  repo: string;
  install: {
    npm: string;
    pnpm: string;
    yarn: string;
  };
  usage: string;
  selectors: string[];
  css: {
    import: string;
    block: string;
    customProperties: string[];
    stateClasses: string[];
  };
  dataAttributes: {
    name: string;
    option: string;
    description: string;
  }[];
  keyboard: {
    key: string;
    description: string;
  }[];
  api: {
    name: string;
    type: string;
    description: string;
  }[];
  options: {
    name: string;
    type: string;
    default: string;
    description: string;
  }[];
  methods: {
    name: string;
    type: string;
    description: string;
  }[];
  events: ({
    name: string;
    description: string;
    cancelable?: undefined;
  } | {
    name: string;
    description: string;
    cancelable: true;
  })[];
  accessibility: string[];
  limitations: string[];
  examples: {
    name: string;
    description: string;
    path: string;
  }[];
};
//#endregion
export { PluginDocs, docs };
//# sourceMappingURL=docs.d.ts.map