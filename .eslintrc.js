module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],
  rules: {
    '@typescript-eslint/consistent-type-imports': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
  },
  globals: {
    page: true,
    REACT_APP_ENV: true,
  },
};
