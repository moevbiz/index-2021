const cacheBuster = require('@mightyplow/eleventy-plugin-cache-buster');

module.exports = function(config) {

    config.addLayoutAlias('default', 'layouts/base.njk');

    config.addPassthroughCopy('./src/assets/images');
    
    // ref the context
    let env = process.env.ELEVENTY_ENV;
    
    // make the seed target act like prod
    env = (env=="seed") ? "prod" : env;
    
    // cache buster
    const cacheBusterOptions = {};

    // only run cache buster in prod
    if (env == 'prod') {
        config.addPlugin(cacheBuster(cacheBusterOptions));
    }

    // Base config
    return {
        passthroughFileCopy: true,
        dir: {
            input: "src",
            output: "docs",
            data: `_data/${env}`
        }
    };
}