const fs = require('fs-extra');

function patchOauth() {
    if (this.authenticationType === 'oauth2') {
        // if the backend path exists, patch for OAuth2
        if (fs.existsSync(`${this.directoryPath}`)) {
            const keycloakConfigFile = `${this.directoryPath}src/main/docker/realm-config/jhipster-realm.json`;
            if (fs.existsSync(keycloakConfigFile)) {
                this.patchInFile(keycloakConfigFile, {
                    replace: '"dev.localhost.ionic:*"',
                    insert: `"dev.localhost.ionic:*", "${this.reactNativeAppName.toLowerCase()}://*"`,
                });
            }
        }
    }
}

module.exports = {
    patchOauth,
};