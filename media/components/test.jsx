/*
	MIT License

	Copyright (c) 2024 Marcel Joachim Kloubert (https://marcel.coffee)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/


// define the functional component ...
const MyReactTestComponent = () => {
    const [data, setData] = React.useState(null);

    const handleReloadClick = React.useCallback(() => {
        vscode.postMessage({
            type: 'requestData',
        });
    }, []);

    const renderData = React.useCallback(() => {
        if (!data) {
            // no data available yet

            return (
                <div>Please wait ...</div>
            );
        }

        // demonstrates the use of day.js
        // which is bound as `dayjs` at
        // `window` object
        const time = dayjs(data.time);

        // demonstrates the use of lodash
        // which is bound as `_` at
        // `window` object
        const sortedItems = _(data.items)
            .sortBy(({
                value
            }) => {
                return value;
            })
            .value();

        return (
            <React.Fragment>
                <div>Last update: {time.format('YYYY-MM-DD HH:mm:ss')}</div>

                <br />

                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Index</th>
                            <th>Value</th>
                        </tr>
                    </thead>

                    <tbody>
                        {sortedItems.map(({
                            id,
                            index,
                            value
                        }) => {
                            return (
                                <tr
                                    key={`data-item-${id}`}
                                >
                                    <td>{id}</td>
                                    <td>{index}</td>
                                    <td>{value}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </React.Fragment>   
        );
    }, [data]);

    React.useEffect(() => {
        // listen for messages
        // from VSCode instance
        const messageHandler = (ev) => {
            const {
                data: msg
            } = ev;

            if (msg?.type === 'data') {
                setData(msg.data);
            }
        };
        window.addEventListener('message', messageHandler);

        // wait 1.5 seconds before we request
        // the first data
        const to = setTimeout(handleReloadClick, 1500);
        
        return () => {
            clearTimeout(to);

            window.removeEventListener('message', messageHandler);
        };
    }, [handleReloadClick]);

    return (
        <div
            style={{
                padding: '2rem',
            }}
        >
            {renderData()}

            <br />

            <button
                disabled={!data}
                onClick={handleReloadClick}
            >Reload</button>
        </div>
    );
};

// render it into `#tgf-content`
// of `main.ejs`
ReactDOM.createRoot(document.querySelector("#tgf-content"))
    .render(<MyReactTestComponent />);
