/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-domain-to-api",
      comment: "domain/ must not import api/ — Backend §2.2",
      severity: "error",
      from: { path: "^src/(identity|action|contract|execution|complaint|trust)/domain" },
      to: { path: "^src/api" },
    },
    {
      name: "no-shared-upward",
      comment: "shared/ has zero engine dependencies",
      severity: "error",
      from: { path: "^src/shared" },
      to: {
        path: "^src/(identity|action|contract|execution|complaint|trust|platform|api)",
      },
    },
    {
      name: "complaint-no-trust-projection",
      comment: "complaint/ must not import trust/projection — Backend §2.2",
      severity: "error",
      from: { path: "^src/complaint" },
      to: { path: "^src/trust/projection" },
    },
  ],
  options: {
    doNotFollow: {
      path: "node_modules",
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: "tsconfig.json",
    },
  },
};
