// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as request from 'request';

const ENDPOINT = 'https://api.tracker.adventureconseil.com/kitchecker/';
const LANG_REPORT: { [s: string]: string; } = {
	utms: "There's a missing utm in this link: ",
	utmIssue: "There's a problem with utms: ",
	href_malformed: "This link is poorly build: ",
	img_not_hosted: "This image is not hosted: ",
	encoding_meta: "This HTML kit is not well encoded: ",
	spaces_links: "This link has spaces in it: ",
	line_breaks_links: "This link has line breaks in it: ",
	css: "There's extern css links: ",
	js: "There's JS in this kit: ",
	mirrors: "There's a mirror link in this kit: ",
	unsubs: "There's unsubscribe links in this kit: ",
	multipleInterogationPoint: "This link has multiple interogation point in it: ",
	attr_without_quote: "These values don't have quotes surrounding them: ",
	interogation_and_link: "This link have an interogation point directly followed by a '&': ",
	and_interogation_link: "This link have a '&' directly followed by an interogation point: ",
	socials_tracked: "This social link is tracked: "
};

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
								vscode.window.showWarningMessage(`${LANG_REPORT[key]}${key2}; key: ${element2}`);
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
