function render(input, values) {
    if (typeof input !== 'object' || typeof values !== 'object' || input === null || values === null) {
        throw new Error('InvalidType');
    }
    if (Object.keys(input).length === 0 && !Array.isArray(input)) return '';

    function renderNode(node) {
        if (typeof node === 'string') {
            return node.replace(/\$\{(.*?)\}/g, (_, key) => (key in values ? values[key] : ''));
        }
        const { tag, attrs = {}, children = [] } = node;
        if (!tag) return '';
        const attrStr = Object.entries(attrs)
            .map(([key, value]) => {
                if (typeof value === 'boolean') return value ? key : '';
                return `${key}="${String(value).replace(/\$\{(.*?)\}/g, (_, key) => (key in values ? values[key] : ''))}"`;
            })
            .filter(Boolean)
            .join(' ');
        const openTag = attrStr ? `<${tag} ${attrStr}>` : `<${tag}>`;
        const closeTag = `</${tag}>`;
        const childrenStr = (Array.isArray(children) ? children : [children]).map(renderNode).join('');
        return `${openTag}${childrenStr}${closeTag}`;
    }

    if (Array.isArray(input)) return input.map(renderNode).join('');
    return renderNode(input);
}

// Partea II — parse(markup) manual pentru Node.js
function parse(markup) {
    if (typeof markup !== 'string') throw new Error('InvalidType');
    markup = markup.trim();
    if (!markup) return [];

    let pos = 0;

    function skipWhitespace() {
        while (pos < markup.length && /\s/.test(markup[pos])) pos++;
    }

    function parseAttributes(str) {
        const attrs = {};
        const regex = /([a-zA-Z0-9\-]+)(?:="([^"]*)")?/g;
        let match;
        while ((match = regex.exec(str))) {
            const [, key, value] = match;
            attrs[key] = value !== undefined ? value : true;
        }
        return attrs;
    }

    function parseNodes() {
        const nodes = [];
        while (pos < markup.length) {
            if (markup[pos] === '<') {
                if (markup[pos + 1] === '/') {
                    return nodes;
                }
                const endTagPos = markup.indexOf('>', pos);
                if (endTagPos === -1) throw new Error('InvalidMarkup');
                const tagContent = markup.slice(pos + 1, endTagPos).trim();
                const spaceIdx = tagContent.indexOf(' ');
                let tagName, attrStr;
                if (spaceIdx === -1) {
                    tagName = tagContent;
                    attrStr = '';
                } else {
                    tagName = tagContent.slice(0, spaceIdx);
                    attrStr = tagContent.slice(spaceIdx + 1);
                }
                const attrs = parseAttributes(attrStr);
                pos = endTagPos + 1;
                const children = parseNodes();
                if (markup.slice(pos, pos + tagName.length + 3) !== `</${tagName}>`) {
                    throw new Error('InvalidMarkup');
                }
                pos += tagName.length + 3;
                nodes.push({ tag: tagName, attrs, children });
            } else {
                const nextTag = markup.indexOf('<', pos);
                const text = markup.slice(pos, nextTag === -1 ? markup.length : nextTag);
                pos += text.length;
                if (text) nodes.push(text);
            }
        }
        return nodes;
    }

    const result = parseNodes();
    if (result.length === 1) return result[0];
    return result;
}

module.exports = { render, parse };
