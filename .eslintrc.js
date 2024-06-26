module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended-type-checked',
        'plugin:@typescript-eslint/stylistic-type-checked',
        'plugin:@typescript-eslint/strict',
    ],
    rules: {
        "no-unused-vars": "off",
        "quotes": ["error", "single"],
        "semi": ["error", "always"],
    },
    // parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
    },
};
