// MIT License
//
// Copyright (c) 2024 Marcel Joachim Kloubert (https://marcel.coffee)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// eslint-disable-next-line @typescript-eslint/naming-convention
import _ from 'lodash';
import * as crypto from 'node:crypto';
import * as ejs from 'ejs';
import * as vscode from 'vscode';

interface IDataItem {
	id: string;
	index: number;
	value: number;
}

const {
	fs
} = vscode.workspace;

function getNonce(size: number = 32, allowedChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"): string {
	let nonce = "";

	for (let i = 0; i < size; i++) {
		nonce += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
	}

	return nonce;
}

export async function activate(context: vscode.ExtensionContext) {
	const {
		extensionUri
	} = context;

	const colorMode = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark ? "dark" : "light";
	const nonce = getNonce();

	const mediaDirUri = vscode.Uri.joinPath(extensionUri, 'media');

	const mainEJSFile = vscode.Uri.joinPath(mediaDirUri, "main.ejs");
	const mainEJSContent = Buffer.from(
		await fs.readFile(mainEJSFile)
	).toString('utf8');

	// create a new 
	const panel = vscode.window.createWebviewPanel(
		"testHtmlView",
		`Test WebView with React`,
		vscode.ViewColumn.One,
		{
			"enableCommandUris": true,
			"enableForms": true,
			"enableScripts": true,
			"enableFindWidget": true,
			
			// to save memory, we can rerender the
			// view if its tab gets its focus back
			"retainContextWhenHidden": false,
		}
	);

	context.subscriptions.push(panel);

	const {
		webview
	} = panel;

	// listen from messages which come
	// from the UI inside the webview
	webview.onDidReceiveMessage((message) => {
		if (message?.type === 'requestData') {
			// UI in webview requests new data
			// ("Reload" button was pressed)

			webview.postMessage({
				type: 'data',
				data: {
					time: new Date().toISOString(),
					items: _.range(0, 100)
						.map((value) => {
							const newItem: IDataItem = {
								id: crypto.randomUUID(),
								index: value,
								value: Math.random()
							};

							return newItem;
						})
				}
			});
		}
	});

	const rootWebUri = webview.asWebviewUri(mediaDirUri);

	webview.html = ejs.render(mainEJSContent, {
		colorMode,
		nonce,
		rootUri: rootWebUri.toString()
	});
}
