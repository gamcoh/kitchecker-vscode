// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as request from 'request';

const ENDPOINT = 'http://api.tracker.adventureconseil.com/kitchecker/';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('extension.kitchecker', () => {
		const activeTextEditor = vscode.window.activeTextEditor;
		if (activeTextEditor === undefined) {
			vscode.window.showErrorMessage("Can't find any current file");
			return false;
		}

		// check if html
		if (activeTextEditor.document.languageId !== 'html') {
			vscode.window.showErrorMessage('The current file is not html');
			return false;
		}

		// Display a message box to the user
		const filepath = activeTextEditor.document.fileName;
		
		var req = request.post(ENDPOINT, (err, res, body) => {
			if (err) {
				throw err;
			}

			const response = JSON.parse(body);
			
			if (response.code !== 0) {
				vscode.window.showErrorMessage(response.data);
				return false;
			}

			if (response.data.code !== 0) {
				vscode.window.showErrorMessage(response.data.data);
				return false;
			}

			for (const key in response.data.data) {
				if (response.data.data.hasOwnProperty(key)) {
					const element = response.data.data[key];
					if (typeof element === 'string') {
						vscode.window.showWarningMessage(element);
					} else {
						for (const key2 in element) {
							if (element.hasOwnProperty(key2)) {
								const element2 = element[key2];
								vscode.window.showWarningMessage(`l'utm: "${element2}" n'est pas dans le lien: ${key2}`);
							}
						}
					}
				}
			}
		});
		var form = req.form();
		form.append('file', fs.createReadStream(filepath));
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
