module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true,
        "mocha" : true,
        "jest" : true,
        "jquery": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "windows"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "no-console" : "off",
        "no-unused-vars" : "off"

    }
};