module.exports = {
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.+(js)", "**/?(*.)+(spec|test).+(js)"],
  transform: {
    "^.+\\.(ts|tsx|js)$": "babel-jest",
  },
  // This is so that we can use mock screeps game objects and game constants in tests
  testEnvironment: "screeps-jest",
};
