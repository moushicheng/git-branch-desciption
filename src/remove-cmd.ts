import * as vscode from "vscode";
import { exec } from "child_process";
import { BranchProvider } from "./branch-provider";
import { promisify } from "util";

const execPromise = promisify(exec);

export function registerRemoveCmd(
  context: vscode.ExtensionContext,
  branchProvider: BranchProvider
) {
  const command = vscode.commands.registerCommand(
    "GitBranches.removeBranch",
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

      const result = await vscode.window.showWarningMessage(
        `确定删除分支"${branchName}"吗?`,
        { modal: true },
        "Yes",
        "No"
      );
      if (result !== "Yes") {
        return;
      }

      await execPromise(`git branch -D ${branchName}`, { cwd: repoPath });
      vscode.window.showInformationMessage(`成功删除分支: ${branchName}`);
      branchProvider.refresh();
      return;
    }
  );

  context.subscriptions.push(command);
}
