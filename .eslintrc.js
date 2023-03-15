module.exports = {
  'env': {
    'browser': false,
    'es2021': true
  },
  'parserOptions': {
    'ecmaVersion': 'latest',
    'sourceType': 'module'
  },
  'rules': {
    'semi': ['error', 'always'],
    'quotes': ['error', 'single'],
    'comma-spacing': ['error', { 'before': false, 'after': true }],
    'indent': ['error', 2]
  }
};
