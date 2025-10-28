module.exports = {
  root: true,
  env: {
    node: true,
    'vue/setup-compiler-macros': true // Add this line
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended'
  ],
  parserOptions: {
    parser: '@babel/eslint-parser'
  },
  rules: {
    // Add any custom ESLint rules here
  }
};
