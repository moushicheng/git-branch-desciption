import * as vscode from "vscode";
import { promisify } from "util";
import { exec } from "child_process";
import { BranchProvider } from "./branch-provider";

const execPromise = promisify(exec);
export function registerEditCmd(
  context: vscode.ExtensionContext,
  branchProvider: BranchProvider
) {
  // 注册编辑描述命令
  const editDescriptionCommand = vscode.commands.registerCommand(
    "extension.editBranchDescription",
    async (branchName: string) => {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage("请打开一个工作空间。");
        return;
      }

      const repoPath = workspaceFolder?.uri?.fsPath;

      // 获取当前描述
      let currentDescription = "";
      try {
        const { stdout } = await execPromise(
          `git config branch.${branchName}.description`,
          {
            cwd: repoPath,
          }
        );
        currentDescription = stdout.trim();
      } catch (e) {}

      // 弹出输入框让用户输入新的描述
      const newDescription = await vscode.window.showInputBox({
        prompt: "输入新的描述",
        value: currentDescription,
      });

      // 如果用户输入了新的描述，更新描述
      if (newDescription !== undefined) {
        try {
          await execPromise(
            `git config branch.${branchName}.description "${newDescription}"`,
            { cwd: repoPath }
          );
          vscode.window.showInformationMessage(`成功更新 ${branchName} 的描述`);
          branchProvider.refresh();
        } catch (error) {
          console.error(error);
          vscode.window.showErrorMessage(
            `更新 ${branchName} 的描述时出错: ${error}`
          );
        }
      }
    }
  );
  context.subscriptions.push(editDescriptionCommand);
}
