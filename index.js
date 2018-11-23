#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const program = require('commander');
const inquirer = require('inquirer');

const packageJson = require('./package.json');

const targetPath = process.cwd(); // 目标路径
const bizTemplateDirPath = path.resolve(__dirname, './template/biz-template'); // 业务组件模板代码路径

const createBizAction = () => {
  inquirer
    .prompt([
      {
        type: 'input',
        message: '请输入业务组件名称(CamelCase命名风格):',
        name: 'name',
      },
    ])
    .then(answer => {
      const name = answer.name;

      if (!name || /[a-z]/.test(name[0])) {
        console.log('组件名称不符合要求!');
        return;
      }

      const ComponentName = name[0].toLowerCase() + name.slice(1);
      const ComponentNameWithCamelCase = name;
      const ComponentNameWithDash = ComponentNameWithCamelCase.split(
        /(?=[A-Z])/
      )
        .join('-')
        .toLowerCase();

      // console.log(ComponentName);
      // console.log(ComponentNameWithCamelCase);
      // console.log(ComponentNameWithDash);

      // 创建组件目录
      try {
        fs.mkdirSync(path.resolve(targetPath, ComponentNameWithDash));
      } catch (err) {
        if (err.code === 'EEXIST') {
          console.log('组件目录已存在!');
          return;
        } else {
          console.log('其它错误!');
          return;
        }
      }

      // 文件转换表
      const fileConversionTable = {
        'actions.template': 'actions.js',
        'dataAdapter.template': 'dataAdapter.js',
        'index.template': 'index.js',
        'reducer.template': 'reducer.js',
        'style.template': 'style.scss',
      };

      // 文件转换内容
      const allFileContent = [];

      // 读取模板文件
      const files = fs.readdirSync(bizTemplateDirPath).filter(fileName => {
        return fileConversionTable[fileName];
      });

      files.forEach(fileName => {
        const templateFilePath = path.resolve(bizTemplateDirPath, fileName);
        const fileContent = fs
          .readFileSync(templateFilePath)
          .toString()
          .replace(new RegExp(/{%ComponentName%}/, 'g'), ComponentName)
          .replace(
            new RegExp(/{%ComponentNameWithCamelCase%}/, 'g'),
            ComponentNameWithCamelCase
          )
          .replace(
            new RegExp(/{%ComponentNameWithDash%}/, 'g'),
            ComponentNameWithDash
          );
        allFileContent.push({
          fileName: fileConversionTable[fileName],
          content: fileContent,
        });
      });

      allFileContent.forEach(item => {
        fs.writeFileSync(
          path.resolve(targetPath, ComponentNameWithDash, item.fileName),
          item.content
        );
      });

      console.log('业务组件创建成功!');
    });
};
program.version(packageJson.version);

program
  .command('biz')
  .description('创建业务组件')
  .action(createBizAction);

program.parse(process.argv);
