const stringify = require('json-stringify-safe');

const log = (severity = "INFO", ...rest) => {
    const message = rest.reduce((acc, arg) => (`${acc} ${typeof arg === "string" ? arg : stringify(arg)}`), '');

    let write;
    switch(severity) {
        case "DEBUG":
            write = console.debug;
        case "INFO":
            write = console.info;
        case "ERROR":
            write = console.error;
        default:
            write = console.log;

    }
    write(message);
};

module.exports = {
    log: (...rest) => { log(undefined, ...rest) },
    debug: (...rest) => { log("DEBUG", ...rest) },
    info: (...rest) => { log("INFO", ...rest) },
    error: (...rest) => { log("ERROR", ...rest) },
};
