// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { BranchProvider } from "./branch-provider";
import { registerEditCmd } from "./edit-cmd";
import { registerRefreshCmd } from "./refresh-cmd";
import { registerSwitchCmd } from "./switch-cmd";
import { registerRemoveCmd } from "./remove-cmd";

export function activate(context: vscode.ExtensionContext) {
  const tree = new BranchProvider().register(context);
  registerEditCmd(context, tree);
  registerRefreshCmd(context, tree);
  registerSwitchCmd(context, tree);
  registerRemoveCmd(context, tree);
}
