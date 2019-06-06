const glob = require("glob")
const util = require('util')
const fs = require('fs')
const yaml = require('js-yaml');

const globPromise = util.promisify(glob)
const fs_readFilePromise = util.promisify(fs.readFile)

const parser = module.exports;

function deepExtend(destination, source) {
  for (var property in source) {
     if (source[property] && source[property].constructor &&
     source[property].constructor === Object) {
       destination[property] = destination[property] || {};
       arguments.callee(destination[property], source[property]);
     } else {
       destination[property] = source[property];
     }
  }
};

parser.parse = config => new Promise(async (resolve, reject) => {
	try {
		// найти файлы js
		const files = await globPromise(config.input + "/**/*.js");
		const context = files.map(async (file) => {
			return await fs_readFilePromise(file, 'utf8')
		});
		const contents = (await Promise.all(context))
		let newcontents = []
		contents.map((data) => {
			// в файлах найти комменты с меткой
			const result = data.match(/\/\*\* @asyncApi.*?\*\//gs); 
			if (!result) return false;
			result.map(item => {
				const yamlString = item.split('\n').slice(1, -1).join('\n');
				try {
					newcontents.push(yaml.load(yamlString));
				} catch (e) {
					throw e;
				}
			})
		});
		const yamlDocs = newcontents
		let doc = {}
		// todo сортировать поля
		yamlDocs.map((item) => {
			deepExtend(doc, item);
		})
		// todo валидировать
		// сохранить
		// resolve(JSON.stringify(doc));
		resolve(yaml.safeDump(doc, {skipInvalid: true, toJSON: true}));
	} catch (err) {
		reject(err)
	}
});
