// @ts-check
import { FlatCompat } from '@eslint/eslintrc'
import tseslintParser from '@typescript-eslint/parser'
import eslintPrettier from 'eslint-config-prettier'
import eslintNode from 'eslint-plugin-n'
import unicorn from 'eslint-plugin-unicorn'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const compat = new FlatCompat()

export default tseslint.config(
  ...compat.extends('eslint-config-standard'),
  ...tseslint.configs.recommended,
  eslintNode.configs['flat/recommended-script'],
  // @ts-expect-error flat/recommendedの返すpluginsがstring[]なことでエラーになるため
  unicorn.configs['flat/recommended'],
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      globals: {
        ...globals.es2020,
        ...globals.node,
      },
      parser: tseslintParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'unicorn/prefer-top-level-await': 'off',
      'unicorn/no-null': 'off',
      'no-console': 'off',
    },
    ignores: ['dist', 'output', 'node_modules', 'data', 'logs'],
  },
  eslintPrettier
)
