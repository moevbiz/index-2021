const mix = require('laravel-mix');

// Compile SCSS
mix
  .sass('src/assets/sass/main.scss', 'docs/assets/css/style.css')
  .js('src/assets/js/main.js', 'docs/assets/js/scripts.js')
  .options({
    processCssUrls: false,
})

if (mix.inProduction()) {
    mix.options({
        terser: {
            terserOptions: {
                compress: {
                   drop_console: true
                }
            }
        }
    });
}