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
      } else {
        vscode.window.showErrorMessage("실행 중인 에디터 없음");
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
