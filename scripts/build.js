"use strict";

const fse = require('fs-extra');
const path = require('path');
const ejs = require('ejs');
const { promisify } = require('util');
const marked = require('marked');
const frontMatter = require('front-matter');
const globP = promisify(require('glob'));
const config = require('../site.config');

const ejsRenderFile = promisify(ejs.renderFile);
const srcPath = './src';
const distPath = config.build.outputPath;

// clear destination folder
fse.emptyDirSync(distPath);

// copy assets folder
const filterFunc = (src, dest) => {
  if (process.argv[2] !== 'prod') {
    if (!src.match(/([a-zA-Z0-9\s_\\.\-\(\):])+(.scss)$/i)) {
      return true;
    }
  } else if (!src.match(/([a-zA-Z0-9\s_\\.\-\(\):])+(.css|.scss)$/i)) {
    return true;
  }
}

fse.copy(`${srcPath}/assets`, `${distPath}/assets`, { filter: filterFunc });

// read pages
globP('**/*.@(md|ejs|html)', { cwd: `${srcPath}/pages` })
  .then(files => {
    files.forEach(file => {
      const fileData = path.parse(file);
      const destPath = path.join(distPath, fileData.dir);

      // create destination directory
      fse
        .mkdirs(destPath)
        .then(() => {
          // read page file
          return fse.readFile(`${srcPath}/pages/${file}`, 'utf-8');
        })
        .then(data => {
          // render page
          const pageData = frontMatter(data);
          const templateConfig = Object.assign({}, config, {
            page: pageData.attributes
          });
          let pageContent;

          // generate page content according to file type
          switch (fileData.ext) {
            case '.md':
              pageContent = marked(pageData.body);
              break;
            case '.ejs':
              pageContent = ejs.render(pageData.body, templateConfig, {
                filename: `${srcPath}/pages/${file}`
              });
              break;
            default:
              pageContent = pageData.body;
          }

          // render layout with page contents
          const layout = pageData.attributes.layout || 'default';

          let returnedPage;

            returnedPage = [];

            const ejsPage = ejsRenderFile(
              `${srcPath}/layouts/${layout}.ejs`,
              Object.assign({}, templateConfig, { body: pageContent })
            );
        
          return returnedPage;
        })
        .then(str => {
          // save the html file
          if (str instanceof Array) {
            str.forEach((str, index) => {
              const resolvedStr = Promise.resolve(str);
              resolvedStr.then(function(value) {
                  fse.writeFile(`${destPath}/${fileData.name}.html`, value);
                
              });
            })
          } else {
            fse.writeFile(`${destPath}/${fileData.name}.html`, str);
          }
        })
        .catch(err => {
          console.error(err);
        });
    });
  })
  .catch(err => {
    console.error(err);
  });

