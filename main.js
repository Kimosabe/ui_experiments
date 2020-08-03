//-----------------------Utils from autolayout.js------------------

var AutoLayout = window.AutoLayout;

/**
 * Set the absolute size and position for a DOM element.
 *
 * The DOM element must have the following CSS styles applied to it:
 * - position: absolute;
 * - padding: 0;
 * - margin: 0;
 *
 * @param {Element} elm DOM element.
 * @param {Number} left left position.
 * @param {Number} top top position.
 * @param {Number} width width.
 * @param {Number} height height.
 */
var transformAttr = ('transform' in document.documentElement.style) ? 'transform' : undefined;
transformAttr = transformAttr || (('-webkit-transform' in document.documentElement.style) ? '-webkit-transform' : 'undefined');
transformAttr = transformAttr || (('-moz-transform' in document.documentElement.style) ? '-moz-transform' : 'undefined');
transformAttr = transformAttr || (('-ms-transform' in document.documentElement.style) ? '-ms-transform' : 'undefined');
transformAttr = transformAttr || (('-o-transform' in document.documentElement.style) ? '-o-transform' : 'undefined');
function setAbsoluteSizeAndPosition(elm, left, top, width, height) {
    elm.setAttribute('style', 'width: ' + width + 'px; height: ' + height + 'px; ' + transformAttr + ': translate3d(' + left + 'px, ' + top + 'px, 0px);');
}

/**
 * Lays out the child elements of a parent element absolutely
 * using the visual format language.
 *
 * When the window is resized, the AutoLayout view is re-evaluated
 * and the child elements are resized and repositioned.
 *
 * @param {Element} parentElm Parent DOM element
 * @param {String|Array} visualFormat One or more visual format strings
 */
function autoLayout(parentElm, visualFormat) {
    var view = new AutoLayout.View();
    view.addConstraints(AutoLayout.VisualFormat.parse(visualFormat, {extended: true}));
    var elements = {};
    for (var key in view.subViews) {
        var elm = document.getElementById(key);
        if (elm) {
            elm.className += elm.className ? ' abs' : 'abs';
            elements[key] = elm;
        }
    }
    var updateLayout = function() {
        view.setSize(parentElm ? parentElm.clientWidth : window.innerWidth, parentElm ? parentElm.clientHeight : window.innerHeight);
        for (key in view.subViews) {
            var subView = view.subViews[key];
            if (elements[key]) {
                setAbsoluteSizeAndPosition(elements[key], subView.left, subView.top, subView.width, subView.height);
            }
        }
    };
    window.addEventListener('resize', updateLayout);
    updateLayout();
    return updateLayout;
}


//-----------------------------------------------------------------


function makeBlockId(row, col) {
    return 'block_' + row + '_' + col;
}

function makeBlocks(rows, cols) {
    var fieldElem = document.getElementById('field');
    var layoutLines = [];
    var blocks = [];
    var verticalLayout = 'V:|-';
    for (var row = 0; row < rows; ++row) {
        var rowLayout = `H:|-[row_${row}:`;
        for (var col = 0; col < cols; ++col) {
            var blockId = makeBlockId(row, col);
            blocks.push(blockId);
            rowLayout += `[${blockId}]-`;

            var blockElem = document.createElement('div');
            blockElem.id = blockId;
            blockElem.innerText = ' ';
            blockElem.className = 'block';
            fieldElem.appendChild(blockElem);
        }
        rowLayout += ']-|';
        layoutLines.push(rowLayout);
        verticalLayout += `[row_${row}]-`;
    }
    verticalLayout += '|'
    layoutLines.push(verticalLayout)
    //layoutLines.push(`HV:[${blocks[0]}(10)]`)

    for (var i = 1; i < blocks.length; ++i) {
        layoutLines.push(`HV:[${blocks[i]}(${blocks[0]})]`);
    }

    return layoutLines;
}

var fieldHeight = 9;
var fieldWidth = 5;
var fieldLayout = makeBlocks(fieldHeight, fieldWidth);
var mainLayout = [
    'HV:|[game]|',
    'HV:|[gameOver]|',
    'HV:|[menu]|',
    'Z:[game][gameOver][menu]',
];
var menuLayout = [
    'H:|~[newGame(100)]~|',
    'H:|~[options(100)]~|',
    'H:|~[exit(100)]~|',
    'V:|~[newGame(options,exit)]-[options]-[exit(20)]~|',
];
var gameLayout = [
    'H:|[left(right.width)]-[right]|',
    'V:|[left]|',
    'V:|[right]|',
];
// Aspect ratio
var leftLayout = [
    `H:|->[field(field.height/${fieldHeight/fieldWidth})]|`,
    'V:|[field]|',
];
var rightLayout = [
    'H:|-[nextFigure(50)]->|',
    'H:|-[points(200)]->|',
    'H:|-[clock(200)]->|',
    'V:|-[nextFigure(60)]-[points(20)]-[clock(20)]->|',
];

autoLayout(undefined, mainLayout);
autoLayout(document.getElementById('menu'), menuLayout);

document.getElementById("newGame").onclick = function() {
    //document.getElementById("menu").className = "hidden";
    //document.getElementById("game").className = "";
    document.getElementById("menu").hidden = true;
    document.getElementById("game").hidden = false;
    autoLayout(document.getElementById('game'), gameLayout);
    autoLayout(document.getElementById('left'), leftLayout);
    autoLayout(document.getElementById('field'), fieldLayout);
    autoLayout(document.getElementById('right'), rightLayout);
};


//-----------------------------------------------------------------
