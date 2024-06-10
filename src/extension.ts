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

        console.log(`소스 파일 ${sourceFile}`);
        console.log(`셀렉티드 ${selectedText}`);
        console.log(`도큐먼트 ${documentText}`);

        let variableValue: any = undefined;

        const isLiteral = (text: string) => {
          return (
            (text.startsWith("'") && text.endsWith("'")) ||
            (text.startsWith('"') && text.endsWith('"')) ||
            (text.startsWith("`") && text.endsWith("`")) ||
            !isNaN(Number(text))
          );
        };

        // 바뀐 부분: evaluateExpression 함수 수정
        const evaluateExpression = (expression: string, context: any) => {
          try {
            const func = new Function(
              "context",
              `with(context) { return ${expression}; }`
            );
            const result = func(context);
            return result;
          } catch (e) {
            return undefined;
          }
        };

        // 바뀐 부분: context 객체 및 findVariableValue 함수 추가
        const context: any = {};

        const findVariableValue = (node: ts.Node) => {
          if (ts.isVariableDeclaration(node)) {
            const name = node.name.getText();
            const initializer = node.initializer
              ? node.initializer.getText()
              : "undefined";
            context[name] = evaluateExpression(initializer, {});
          }
          ts.forEachChild(node, findVariableValue);
        };

        findVariableValue(sourceFile);

        if (isLiteral(selectedText)) {
          variableValue = selectedText;
        } else {
          // 바뀐 부분: evaluateExpression 함수 호출 시 context 전달
          variableValue = evaluateExpression(selectedText, context);
        }

        if (variableValue !== undefined) {
          console.log(variableValue);
          vscode.window.showInformationMessage(
            `결과를 콘솔에 출력했습니다: ${variableValue}`
          );
        } else {
          vscode.window.showErrorMessage(
            "변수를 찾을 수 없거나 표현식을 평가할 수 없습니다."
          );
        }
      } else {
        vscode.window.showErrorMessage("실행 중인 에디터 없음");
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
