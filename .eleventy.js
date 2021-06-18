const cacheBuster = require('@mightyplow/eleventy-plugin-cache-buster');

module.exports = function(config) {

    config.addLayoutAlias('default', 'layouts/base.njk');

    config.addPassthroughCopy('./src/assets/images');
    config.addPassthroughCopy('./src/assets/fonts');

    config.addFilter("plz", function(num) {
        if (num < 10) {
            num = `0${num}`
        }
        const PLZ = `1${num}0`
        return PLZ;
    });
    
    // ref the context
    let env = process.env.ELEVENTY_ENV;

    // cache buster
    const cacheBusterOptions = {
        outputDirectory: "docs",
    };

    // only run cache buster in prod
    if (env == 'prod') {
        config.addPlugin(cacheBuster(cacheBusterOptions));
    }
    
    // make the seed target act like prod
    env = (env=="seed") ? "prod" : env;

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