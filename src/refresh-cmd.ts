import * as vscode from "vscode";
import { BranchProvider } from "./branch-provider";

export function registerRefreshCmd(
  context: vscode.ExtensionContext,
  branchProvider: BranchProvider
) {
  // 注册编辑描述命令
  const editDescriptionCommand = vscode.commands.registerCommand(
    "GitBranches.refreshEntry",
    async () => {
        console.log(111);
        
      branchProvider.refresh();
    }
);
  context.subscriptions.push(editDescriptionCommand);
}
