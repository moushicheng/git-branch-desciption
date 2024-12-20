import * as vscode from "vscode";
import { exec } from "child_process";
import { BranchProvider } from "./branch-provider";
import { promisify } from "util";

const execPromise = promisify(exec);

export function registerSwitchCmd(
  context: vscode.ExtensionContext,
  branchProvider: BranchProvider
) {
  console.log("注册");

  const command = vscode.commands.registerCommand(
    "GitBranches.switchBranch",
    async (e) => {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      const repoPath = workspaceFolder?.uri?.fsPath;
      const branchName = e?.command?.arguments?.[0];

      if (!workspaceFolder) {
        vscode.window.showErrorMessage("请打开一个工作空间。");
        return;
      }

      if (!e) {
        return;
      }

      if (!branchName) {
        return;
      }

      await execPromise(`git switch ${branchName}`, { cwd: repoPath });
      vscode.window.showInformationMessage(`成功切换到分支: ${branchName}`);
      branchProvider.refresh();
    }
  );

  context.subscriptions.push(command);
}
