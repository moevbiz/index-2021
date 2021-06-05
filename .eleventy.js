module.exports = function(config) {

    config.addLayoutAlias('default', 'layouts/base.njk');

    config.addPassthroughCopy('./src/assets/images');

    // ref the context
    let env = process.env.ELEVENTY_ENV;

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