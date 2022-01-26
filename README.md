1. Extract websites from HakuNeko
`JSON.stringify(Engine.Connectors.filter(c => c.url).map(c => { return { id: c.id, title: c.label, url: c.url }; }), null, 2);`
2. Store the extracted JSON in `/websites.json`
3. Get analytics for each website `npm start` (takes a lot of time ...)
5. Start local webserver `npx serve ./docs` and check result in browser