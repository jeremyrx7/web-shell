import nextJest from "next/jest";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/cypress/",
  ],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{js,jsx,ts,tsx}",
    "!src/lib/widgetLoader.ts", // Skip widget loader for now as it depends on browser APIs
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  moduleDirectories: ["node_modules", "<rootDir>/"],
  testMatch: [
    "<rootDir>/(tests|src)/**/*.(test|spec).{js,jsx,ts,tsx}",
    "<rootDir>/(tests|src)/**/__tests__/**/*.{js,jsx,ts,tsx}",
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig);
