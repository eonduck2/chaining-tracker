"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
var vscode = require("vscode");
var ts = require("typescript");
function activate(context) {
    var disposable = vscode.commands.registerCommand("extension.logVariableValue", function () {
        var editor = vscode.window.activeTextEditor;
        if (editor) {
            var document_1 = editor.document;
            var selection = editor.selection;
            // 선택한 텍스트 가져오기
            var selectedText_1 = document_1.getText(selection);
            // 전체 문서 내용 가져오기
            var documentText = document_1.getText();
            // TypeScript 소스 파일 생성
            var sourceFile = ts.createSourceFile("temp.ts", documentText, ts.ScriptTarget.Latest, true);
            var variableValue_1 = undefined;
            // 선택한 텍스트가 리터럴인지 확인
            var isLiteral = function (text) {
                try {
                    JSON.parse(text);
                    return true;
                }
                catch (_a) {
                    return false;
                }
            };
            if (isLiteral(selectedText_1)) {
                variableValue_1 = selectedText_1;
            }
            else {
                // AST 탐색하여 선택한 변수 값 찾기
                var findVariableValue_1 = function (node) {
                    if (ts.isVariableDeclaration(node) &&
                        node.name.getText() === selectedText_1) {
                        if (node.initializer) {
                            // 모든 가능한 초기화 표현식을 처리하기 위해 아래와 같이 수정
                            variableValue_1 = node.initializer.getText();
                        }
                    }
                    ts.forEachChild(node, findVariableValue_1);
                };
                findVariableValue_1(sourceFile);
            }
            if (variableValue_1 !== undefined) {
                console.log(variableValue_1);
                vscode.window.showInformationMessage("\uBCC0\uC218 \uAC12\uC744 \uCF58\uC194\uC5D0 \uCD9C\uB825\uD588\uC2B5\uB2C8\uB2E4: ".concat(variableValue_1));
            }
            else {
                vscode.window.showErrorMessage("변수를 찾을 수 없습니다.");
            }
        }
        else {
            vscode.window.showErrorMessage("No active editor found.");
        }
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
