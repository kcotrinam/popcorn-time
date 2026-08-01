import config from '@popcorn-time/eslint-config/node';

export default [
  ...config,
  {
    files: ['test/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json',
        projectService: false,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
