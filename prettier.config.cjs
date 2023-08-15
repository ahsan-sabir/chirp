/** @type {import("prettier").Config} */
const config = {
  plugins: [require.resolve('prettier-plugin-tailwindcss')],
  semi: false,
  singleQuote: true,
  arrowParens: 'avoid',
  // overrides: [
  //   {
  //     files: ['**/*.css', '**/*.scss'],
  //     options: {
  //       singleQuote: false,
  //     },
  //   },
  // ],
}

module.exports = config
