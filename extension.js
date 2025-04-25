const vscode = require('vscode');
const path = require('path');

class BookmarkProvider {
	constructor() {
		this.bookmarks = [];
		this._onDidChangeTreeData = new vscode.EventEmitter();
		this.onDidChangeTreeData = this._onDidChangeTreeData.event;
	}

	refresh() {
		this._onDidChangeTreeData.fire();
	}

	addBookmark(filePath) {
		if (!this.bookmarks.includes(filePath)) {
			this.bookmarks.push(filePath);
			this.refresh();
		}
	}

	removeBookmark(filePath) {
		this.bookmarks = this.bookmarks.filter(bookmark => bookmark !== filePath);
		this.refresh();
	}

	// must implement this method 
	getTreeItem(element) {
		const fileName = path.basename(element);
		const treeItem = new vscode.TreeItem(fileName);
		treeItem.iconPath = new vscode.ThemeIcon('file'); // Add a file icon
		treeItem.tooltip = element; // Show the full path as a tooltip

		treeItem.command = {
			command: 'vscode.open',
			title: 'Open File',
			arguments: [vscode.Uri.file(element)]
		};
		treeItem.contextValue = 'bookmark';
		return treeItem;
	}

	getChildren() {
		return this.bookmarks;
	}
}

function activate(context) {
	const bookmarkProvider = new BookmarkProvider();
	vscode.window.registerTreeDataProvider('bookmarkExplorer', bookmarkProvider);

	context.subscriptions.push(
		vscode.commands.registerCommand('bookmark-files.addBookmark', () => {
			const activeEditor = vscode.window.activeTextEditor;
			if (activeEditor) {
				bookmarkProvider.addBookmark(activeEditor.document.fileName);
			}
		}),
		vscode.commands.registerCommand('bookmark-files.removeBookmark', (filePath) => {
			bookmarkProvider.removeBookmark(filePath || vscode.window.activeTextEditor.document.fileName);
		})
	);



}

function deactivate() { }

module.exports = {
	activate,
	deactivate
};