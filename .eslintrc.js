module.exports =  {
	parser:  '@typescript-eslint/parser',
	plugins: [
		'@typescript-eslint',
	],
	extends: [
		'airbnb-typescript/base',
	],
	parserOptions:  {
		ecmaVersion:  2019,
		sourceType: 'module',
		project: './tsconfig.json',
		tsconfigRootDir: __dirname,
	},
	rules:  {
		// Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
		// e.g. '@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/indent': [
			'error',
			'tab',
			{
				'flatTernaryExpressions': true,
				'SwitchCase': 1
			}
		],
		'import/order': 'off',
		'no-tabs': 'off',
		'no-console': 'off',
		'max-len': [
			'error',
			{
				'code': 120
			}
		],
		'no-empty': [
			'error',
			{
				'allowEmptyCatch': true
			}
		],
		'object-curly-newline': 'off',
		'operator-linebreak': [
			'error',
			'after'
		],
		'import/extensions': 'off',
		'import/no-unresolved': 'off',
		'no-plusplus': [
			'error',
			{
				'allowForLoopAfterthoughts': true
			}
		],
		'lines-between-class-members': [
			'error',
			'always',
			{
				exceptAfterSingleLine: true
			}
		],
		'implicit-arrow-linebreak': 'off',
		'function-paren-newline': 'off',
		'@typescript-eslint/no-throw-literal': 'off',
	},
	env: {
		node: true
	}
};
