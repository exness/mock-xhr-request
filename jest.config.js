// if there are dependencies that need to be transpiled, add them to this array
const transformDependecies = [
  '@babel\\runtime',
  '@babel/runtime',
].join('|');

const config = {
  roots: ['<rootDir>/src'],
  testPathIgnorePatterns: ['<rootDir>/(node_modules|build|dist|docs|config|typings)/'],
  testTimeout: 5000,
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [`node_modules/(?!(${transformDependecies})/)`],
};
module.exports = config;
