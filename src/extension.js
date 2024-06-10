"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
var vscode = require("vscode");
var ts = require("typescript");
function activate(context) {
  var disposable = vscode.commands.registerCommand(
    "extension.logVariableValue",
    function () {
      var editor = vscode.window.activeTextEditor;
      if (editor) {
        var document_1 = editor.document;
        var selection = editor.selection;
        var selectedText_1 = document_1.getText(selection);
        var documentText = document_1.getText();
        var sourceFile = ts.createSourceFile(
          "temp.ts",
          documentText,
          ts.ScriptTarget.Latest,
          true
        );
        var variableValue_1 = undefined;
        var isLiteral = function (text) {
          try {
            JSON.parse(text);
            return true;
          } catch (_a) {
            return false;
          }
        };
        if (isLiteral(selectedText_1)) {
          variableValue_1 = selectedText_1;
        } else {
          var findVariableValue_1 = function (node) {
            if (
              ts.isVariableDeclaration(node) &&
              node.name.getText() === selectedText_1
            ) {
              if (node.initializer) {
                variableValue_1 = node.initializer.getText();
              }
            }
            ts.forEachChild(node, findVariableValue_1);
          };
          findVariableValue_1(sourceFile);
        }
        if (variableValue_1 !== undefined) {
          console.log(variableValue_1);
          vscode.window.showInformationMessage(
            "\uBCC0\uC218 \uAC12\uC744 \uCF58\uC194\uC5D0 \uCD9C\uB825\uD588\uC2B5\uB2C8\uB2E4: ".concat(
              variableValue_1
            )
          );
        } else {
          vscode.window.showErrorMessage("변수를 찾을 수 없습니다.");
        }
      } else {
        vscode.window.showErrorMessage("No active editor found.");
      }
    }
  );
  context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() {}
exports.deactivate = deactivate;
