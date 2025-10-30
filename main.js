class InvalidType extends Error {
    constructor(msg) {
        super(msg);
        this.name = "InvalidType";
    }
}

class InvalidInput extends Error {
    constructor(msg) {
        super(msg);
        this.name = "InvalidInput";
    }
}

function rle(value, encode = true) {
    if (typeof value !== "string" && !(value instanceof String)) {
        throw new InvalidType("InvalidType");
    }
    if (typeof encode !== "boolean") {
        throw new InvalidType("InvalidType");
    }

    const str = value.toString();

    if (encode) {
        if (/[0-9]/.test(str)) throw new InvalidInput("InvalidInput");
        if (str.length === 0) return "";

        let result = "";
        let count = 1;

        for (let i = 1; i <= str.length; i++) {
            if (str[i] === str[i - 1]) {
                count++;
            } else {
                result += count + str[i - 1];
                count = 1;
            }
        }

        return result;
    } else {
        if (!/^(\d+[A-Za-z\s]?)*$/.test(str)) {
            throw new InvalidInput("InvalidInput");
        }

        let res = "";
        let num = "";

        for (let c of str) {
            if (!isNaN(c)) {
                num += c;
            } else {
                const n = num ? parseInt(num) : 1;
                res += c.repeat(n);
                num = "";
            }
        }

        if (num) throw new InvalidInput("InvalidInput");

        return res;
    }
}

function caesar(value, encrypt = true, opt = {}) {
    if (typeof value !== "string" && !(value instanceof String)) {
        throw new InvalidType("InvalidType");
    }
    if (typeof encrypt !== "boolean") {
        throw new InvalidType("InvalidType");
    }
    if (typeof opt !== "object" || opt === null || typeof opt.shift !== "number") {
        throw new InvalidInput("InvalidInput");
    }

    const text = value.toString();
    const shift = ((opt.shift % 26) + 26) % 26;

    if (!/^[A-Za-z\s]*$/.test(text)) {
        throw new InvalidInput("InvalidInput");
    }

    let out = "";

    for (let ch of text) {
        if (/[A-Z]/.test(ch)) {
            const code = ((ch.charCodeAt(0) - 65 + (encrypt ? shift : -shift) + 26) % 26) + 65;
            out += String.fromCharCode(code);
        } else if (/[a-z]/.test(ch)) {
            const code = ((ch.charCodeAt(0) - 97 + (encrypt ? shift : -shift) + 26) % 26) + 97;
            out += String.fromCharCode(code);
        } else {
            out += ch;
        }
    }

    return out;
}

const textProcessor = (algo, op, val, opts) => {
    if (algo === "rle") return rle(val, op);
    if (algo === "caesar") return caesar(val, op, opts);
    throw new InvalidInput("InvalidInput");
};

module.exports = {
    textProcessor,
    InvalidType,
    InvalidInput
};