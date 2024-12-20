// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { exec } from "child_process";
import * as vscode from "vscode";
import { promisify } from "util";

const execPromise = promisify(exec);

export class BranchProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    vscode.TreeItem | undefined | null
  > = new vscode.EventEmitter<vscode.TreeItem | undefined | null>();
  readonly onDidChangeTreeData: vscode.Event<
    vscode.TreeItem | undefined | null
  > = this._onDidChangeTreeData.event;

  constructor() {}

  refresh() {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: any): vscode.TreeItem {
    return new vscode.TreeItem(element.label || "Default Label");
  }

  getChildren(element?: any): Thenable<vscode.TreeItem[]> {
    return this.getBranches();
  }

  public register(context: vscode.ExtensionContext): any {
    // setup
    const options = {
      treeDataProvider: this,
      showCollapseAll: true,
    };

    // build
    vscode.window.registerTreeDataProvider("GitBranches", this);
    // create
    const tree = vscode.window.createTreeView("GitBranches", options);

    // setup: events
    tree.onDidChangeSelection((e) => {
      const selectedItem = e.selection[0]; // 获取选中的项
      if (selectedItem) {
        const branchName = selectedItem.command.arguments[0];
        vscode.commands.executeCommand(
          selectedItem.command.command,
          branchName?.trim()
        );
      }
    });
    tree.onDidCollapseElement((e) => {
      console.log(e); // breakpoint here for debug
      this.refresh();
    });
    tree.onDidChangeVisibility((e) => {
      console.log(e); // breakpoint here for debug
    });
    tree.onDidExpandElement((e) => {
      console.log(e); // breakpoint here for debug
      this.refresh();
    });

    // subscribe
    context.subscriptions.push(tree);
    return this;
  }

  private async getBranches(): Promise<vscode.TreeItem[]> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showErrorMessage("请打开一个工作空间。");
      return [];
    }

    const repoPath = workspaceFolder.uri.fsPath;

    try {
      const { stdout, stderr } = await execPromise("git branch", {
        cwd: repoPath,
      });
      if (stderr) {
        console.error(stderr);
        vscode.window.showErrorMessage("执行 git branch 时出错: " + stderr);
        return [];
      }

      const branches = stdout
        .split("\n")
        .map((branch) => branch.trim())
        .filter(Boolean);
      const branchItems: vscode.TreeItem[] = [];

      for (const branch of branches) {
        try {
          let branchName = branch.trim();
          const isCurrentBranch = branchName.startsWith("*");
          if (isCurrentBranch) {
            branchName = branchName.split("*").pop()?.trim() || "";
          }
          let description = "";
          try {
            const { stdout, stderr } = await execPromise(
              `git config branch.${branchName}.description`,
              {
                cwd: repoPath,
              }
            );
            description = stdout.slice(0, -1);
          } catch (e) {}

          const labelContent = `${isCurrentBranch ? "* " : ""}${branchName} ${description}`;
          const label: vscode.TreeItemLabel = {
            label: labelContent,
            highlights: description
              ? [
                  [
                    branchName.length + 1 + (isCurrentBranch ? 2 : 0),
                    labelContent.length,
                  ],
                ]
              : undefined, // 高亮当前分支名称
          };
          const treeItem = new vscode.TreeItem(label);
          treeItem.collapsibleState = vscode.TreeItemCollapsibleState.None; // 不可折叠

          // 添加命令以编辑描述
          treeItem.command = {
            command: "extension.editBranchDescription",
            title: `编辑 ${branchName} 的描述`,
            arguments: [branchName],
          };
          branchItems.push(treeItem);
        } catch (error) {
          console.error(
            `Error retrieving description for branch ${branch}:`,
            error
          );
        }
      }

      return branchItems;
    } catch (error) {
      console.error(`执行 git branch 时出错:`, error);
      vscode.window.showErrorMessage("执行 git branch 时出错: " + error);
      return [];
    }
  }
}
