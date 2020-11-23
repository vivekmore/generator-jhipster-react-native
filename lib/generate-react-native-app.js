const chalk = require('chalk');
const fse = require('fs-extra');

function generateReactNativeApp() {
    const name = this.reactNativeAppName;
    this.info(chalk.green("Running 'npx react-native init', this will take some time..."));
    console.log(['npx', 'expo-cli', 'init', '--npm', '-t', 'expo-template-blank-typescript', '--no-install', name].join(' '));
    try {
        this.spawnCommandSync('npx', ['expo-cli', 'init', name, '--npm', '-t', 'expo-template-blank-typescript', '--no-install'], {
            stdio: this.options.debug ? 'inherit' : 'ignore',
        });

        // collapse generated RN folder into parent folder
        const rnFiles = ['.expo-shared', 'assets', '.gitignore', 'app.json', 'babel.config.js', 'package.json', 'tsconfig.json'];
        rnFiles.forEach(file => {
            this.fs.move(`${process.cwd()}/${name}/${file}`, `${process.cwd()}/${file}`, { overwrite: true });
        });
        fse.removeSync(`${process.cwd()}/${name}/`);
    } catch (e) {
        this.error('Something went wrong generating the React Native app, please try with the --debug flag for more info.');
    }
}

module.exports = { generateReactNativeApp };