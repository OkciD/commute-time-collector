module.exports =  {
	parser:  '@typescript-eslint/parser',
	extends:  [
		'plugin:@typescript-eslint/recommended',
	],
	parserOptions:  {
		ecmaVersion:  2019,
		sourceType: 'module',
	},
	rules:  {
		// Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
		// e.g. "@typescript-eslint/explicit-function-return-type": "off",
	},
};
