const vscode = require('vscode');

/* 生成表格的行 */
function tableRow(col, startIdx = 0, placeHolder = 'text') {
    return Array.apply(null, { length: col }).reduce((line, _, colIdx) => {
        return `${line}| \$\{${startIdx + colIdx + 1}:${placeHolder}\} `;
    }, '') + '|';
}

/* 生成表格的 body */
function tableBody(raw, col, startIdx = 0) {
    return Array.apply(null, { length: raw }).reduce((table, _, rawIdx) => {
        return table + tableRow(col, startIdx + rawIdx * col) + '\n';
    }, '') + '\n';
}

/* 生成表格 header 和 body 的分割線 */
function sepline(col, align = 'left') {
    const line = align === 'right' ? '---:' : (align === 'center' ? ':---:' : '---');
    return Array.apply(null, { length: col + 1 }).fill('|').join(` ${line} `);
}

/* 生成 markdown 表格 */
function mdtable(raw = 2, col = 2, options = {}) {
    const { withHeader = true, align = 'left' } = options;
    return withHeader
        ? `${tableRow(col, 0, 'title')}\n${sepline(col, align)}\n${tableBody(raw - 1, col, col)}`
        : tableBody(raw, col);
}

/* 接收參數生成表格 */
async function createTable(align) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    const doc = editor.document;
    if (doc.languageId === 'markdown') {
        const position = editor.selection.active;
        const raw = await vscode.window.showInputBox({
            ignoreFocusOut: true,
            placeHolder: 'row',
            prompt: 'Enter size of row',
            value: '2',
        });
        const col = await vscode.window.showInputBox({
            ignoreFocusOut: true,
            placeHolder: 'col',
            prompt: 'Enter size of column',
            value: '2',
        });

        const tableSnippet = new vscode.SnippetString(mdtable(Number(raw), Number(col), { align }));
        editor.insertSnippet(tableSnippet, position);
    }
}

function activate(context) {
    let left = vscode.commands.registerTextEditorCommand('extension.orztableLeft', createTable.bind(this, 'left'));
    let right = vscode.commands.registerTextEditorCommand('extension.orztableRight', createTable.bind(this, 'right'));
    let center = vscode.commands.registerTextEditorCommand('extension.orztableCenter', createTable.bind(this, 'center'));
    context.subscriptions.push(left, right, center);
}

exports.activate = activate;
