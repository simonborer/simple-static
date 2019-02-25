const data = require('./src/data/data');

module.exports = {
  site: {
    title: 'Title from site.config.js',
    description: 'description from site.config.js',
    basePath: process.env.NODE_ENV === 'production' ? '/prod-folder' : '/docs',
    data
  },
  build: {
    outputPath: process.env.NODE_ENV === 'production' ? './docs' : './docs'
  }
};
