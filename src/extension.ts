import * as vscode from "vscode";
import * as ts from "typescript";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "extension.chainingTracker",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const document = editor.document;
        const selection = editor.selection;

        const selectedText = document.getText(selection).trim();

        const documentText = document.getText();

        const sourceFile = ts.createSourceFile(
          "temp.ts",
          documentText,
          ts.ScriptTarget.Latest,
          true
        );

        let variableValue: any = undefined;

        const evaluateExpression = (expression: string, context: any) => {
          try {
            const func = new Function(
              "context",
              `with(context) { return ${expression}; }`
            );
            const result = func(context);
            return result;
          } catch (e) {
            // console.error(`평가 중 오류 발생: ${e}`);
            return undefined;
          }
        };

        const context: any = {};

        const findVariableValue = (node: ts.Node) => {
          if (ts.isVariableDeclaration(node)) {
            const name = node.name.getText();
            const initializer = node.initializer
              ? node.initializer.getText()
              : "undefined";
            if (selectedText !== name) {
            }
            context[name] = evaluateExpression(initializer, {});
          }
          ts.forEachChild(node, findVariableValue);
        };

        findVariableValue(sourceFile);

        const parts = selectedText
          .split(".")
          .map((part) => part.replace("..", "."))
          .filter(Boolean);

        let expressionResult = "";
        parts.reduce((prevExpression, currentPart) => {
          const expression = prevExpression
            ? `${prevExpression}.${currentPart}`
            : currentPart;
          variableValue = evaluateExpression(expression, context);
          if (expression !== selectedText && variableValue !== undefined) {
            expressionResult += `${expression.replace(
              `;`,
              ""
            )}: ${variableValue}\n`;
          } else if (expression === selectedText) {
            expressionResult += `${expression.replace(
              `;`,
              ""
            )}: ${variableValue}\n`;
          }
          return expression;
        }, "");

        if (variableValue !== undefined) {
          console.log(expressionResult);
          vscode.window.showInformationMessage(`결과 출력: ${variableValue}`);
        } else {
          vscode.window.showErrorMessage("유효하지 않은 값");
        }
      } else {
        vscode.window.showErrorMessage("실행 중인 에디터 없음");
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
