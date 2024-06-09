import * as vscode from "vscode";
import * as ts from "typescript";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "extension.logVariableValue",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const document = editor.document;
        const selection = editor.selection;

        // 선택한 텍스트 가져오기
        const selectedText = document.getText(selection).trim();

        // 전체 문서 내용 가져오기
        const documentText = document.getText();

        // TypeScript 소스 파일 생성
        const sourceFile = ts.createSourceFile(
          "temp.ts",
          documentText,
          ts.ScriptTarget.Latest,
          true
        );

        let variableValue: any = undefined;

        // 선택한 텍스트가 리터럴인지 확인
        const isLiteral = (text: string) => {
          return (
            (text.startsWith("'") && text.endsWith("'")) ||
            (text.startsWith('"') && text.endsWith('"')) ||
            (text.startsWith("`") && text.endsWith("`")) ||
            !isNaN(Number(text))
          );
        };

        const evaluateExpression = (expression: string) => {
          try {
            // Function 생성자를 사용하여 표현식 실행
            const func = new Function(`return ${expression}`);
            const result = func();
            return result;
          } catch (e) {
            return undefined;
          }
        };

        if (isLiteral(selectedText)) {
          variableValue = selectedText;
        } else {
          // AST 탐색하여 선택한 변수 값 찾기
          const findVariableValue = (node: ts.Node) => {
            if (
              ts.isVariableDeclaration(node) &&
              node.name.getText() === selectedText
            ) {
              if (node.initializer) {
                variableValue = node.initializer.getText();
              }
            }
            ts.forEachChild(node, findVariableValue);
          };

          findVariableValue(sourceFile);

          if (variableValue === undefined) {
            // 선택된 텍스트가 변수명만이 아닌 표현식일 경우
            variableValue = evaluateExpression(selectedText);
          }
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
        vscode.window.showErrorMessage("No active editor found.");
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
