const wxPlayDOM = {
	nodeToVdom(nodes){
		if (nodes.length === 0) return [];
		nodes = Array.from(nodes);
		const vdoms = [];
		for (const node of nodes) {
			const vdom = Object.create(null);
			switch (node.nodeType) {
				case '1':
				vdom.type = 'node';
				vdom.name = node.nodeName;
				vdom.attrs = Object.create(null);
				if (node.attributes.length !== 0) {
					const attrs = Array.from(node.attributes);
					for (const attr of attrs) {
						vdom.attrs[attr.name] = attr.value;
					}
				}
				vdom.children = this.nodeToVdom(node.childNodes);
				break;
				case '3':
				vdom.type = 'text';
				vdom.text = node.textContent;
				break;
			}
			vdoms.push(vdom);
		}
		return vdoms;
	},
	vdomToNode(vdoms){
		if (vdoms.length === 0) return;
		const frag = document.createDocumentFragment();
		for (const vdom of vdoms) {
			let node = null;
			switch (vdom.type) {
				case 'node':
					node = document.createElement(vdom.name);
					const attrs = vdom.attrs;
					for (const name of Object.keys(attrs)) {
						node.setAttribute(name, attrs[name]);
					}
					vdom.children.length !== 0 && node.appendChild(this.vdomToNode(vdom.children));
					break;
				case 'text':
					node = document.createTextNode(vdom.text);
					break;
			}
			frag.appendChild(node);
		}
		return frag;
	},
}