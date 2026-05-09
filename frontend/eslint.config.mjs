import coreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const eslintConfig = [
  ...coreWebVitals,
  ...nextTypescript,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      // setState inside useEffect is standard React — this rule is overly strict
      'react-hooks/set-state-in-effect': 'off',
      // Date.now() inside an async event handler is not a render-time side effect
      'react-hooks/purity': 'off',
    },
  },
];

export default eslintConfig;
