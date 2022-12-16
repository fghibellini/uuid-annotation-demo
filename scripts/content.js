
console.log("neo-vision loaded!")

const cssPrefix = 'neo-v';
const checkIntervalMs = 200;
const knownUUIDs = [
  { uuid: '7a18a230-f4d0-4fbb-b706-0a16479409a5', text: `The best UUID ever!` }
]

// https://stackoverflow.com/a/6640851
const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/

appendStyles(`
.${cssPrefix}-action-icon {
  position: relative;
  display: inline-block;
  color: #76d1ff;
  text-style = normal;
  margin: 0 0.2em;
}

.${cssPrefix}-action-icon:hover>.${cssPrefix}-tooltip {
  visibility: visible !important;
}


.${cssPrefix}-tooltip {
  position: absolute;
  display: inline-block;
  visibility: hidden;
  top: 25px;
  width: 400px;
  left: -400px;
  background: #000;
  color: #fff;
  padding: 1em 2em;
  textAlign: left;
  whiteSpace: pre;
  z-index: 999999;
}
`)

setInterval(() => {

const iterator = document.createNodeIterator(
  document.getRootNode(),
  NodeFilter.SHOW_TEXT,
  n => isSingleUuidNode(n) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
)

function isSingleUuidNode(node) {
  // ignore very big text nodes
  // (we are periodically iterating over the whole document)
  if (node.data.length > 1000) {
    return false;
  } else {
    // we don't perform an exact match (/^...$/) since we want to be able
    // to annotate things like the Nakadi event name: `availability-layer.retail-product_00f2a393-6889-4fc0-8cd9-86e454e6dfa3`
    const uuidsInNode = node.data.match(new RegExp(uuidRegex, 'g')) || []
    // more than 1 match not interesting as it wouldn't be clear which UUID the tooltip is for
    return (uuidsInNode.length === 1)
  }
}

while (currentNode = iterator.nextNode()) {
  const parent = currentNode.parentElement
  if (!isDecorated(parent)) {
    const uuid = currentNode.data.match(uuidRegex)[0];
    const actionIcon = createActionIcon(uuid)
    parent.appendChild(actionIcon);
  }
}

}, checkIntervalMs)

function isDecorated(element) {
  return Array.from(element.children).some(x => x.classList.contains(`${cssPrefix}-action-icon`))
}

function createActionIcon(contents) {
  const actionIcon = document.createElement("span")
  actionIcon.classList.add(`${cssPrefix}-action-icon`);
  actionIcon.textContent = `ℹ️`;
  const tooltip = createTooltip(contents);
  actionIcon.appendChild(tooltip);
  return actionIcon;
}

function createTooltip(uuid) {
  const tooltip = document.createElement("div")
  tooltip.classList.add(`${cssPrefix}-tooltip`);

  const matchingResult = knownUUIDs.find(x => x.uuid === uuid);

  const contents = matchingResult ? matchingResult.text : `UNKNOWN UUID`;
  tooltip.textContent = contents;
  return tooltip;
}

// =====================
// = UTILITY FUNCTIONS =
// =====================

function appendStyles(styles) {
  const style = document.createElement("style");
  style.innerHTML = styles;
  document.head.appendChild(style);
}

