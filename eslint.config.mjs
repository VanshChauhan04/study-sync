import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "prisma/seed.js", "tsconfig.tsbuildinfo"]
  },
  ...nextVitals,
  ...nextTypescript
];

export default eslintConfig;
