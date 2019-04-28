# json2el

<h3>simple code</h3>

```js
		let el = new El(document.body, [{
				name: 'title', // for $refs
				tag: 'h1',
				text: 'hello, world'
			},
			{
				tag: 'div',
				child: '$data.intro'
			},
			{
				tag: 'p',
				text: '$data.content'
			}
		])
		.setVal({
			'intro': [
				'hey,',
				{
					tag: 'span',
					attr: {style: 'color:#ccc;'},
					text: 'how are u'
				}
			],
			'content': 'nothing...'
		});
```

```js
 el.$data.content = 'data string';
 el.$refs.title // return dom object
 el.$data.intro = [
 	{
		tag: 'h3',
		text: 'u can easy binding data by this tool'
	}
 ];
```