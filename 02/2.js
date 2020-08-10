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
    elm.setAttribute('style', 'width: ' + width + 'px; line-height: ' + height + 'px; height: ' + height + 'px; ' + transformAttr + ': translate3d(' + left + 'px, ' + top + 'px, 0px);');
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


var byId = document.getElementById.bind(document);

var carouselElements = [
    "elem_0",
    "elem_1",
    "elem_2",
    "elem_3",
    "elem_4",
    "elem_5",
];

var spacerSize = 8;
var carouselWidth = 400;
var carouselHeight = 200;
var carouselButtonWidth = 10;
var carouselElementWidth = 100;
var carouselElementHeight = 100;
var carouselElementIndex = 0;

var carouselElementIndexSubject = new rxjs.Subject();

var lowerBound = 0;
var upperBound = carouselElements.length - Math.floor(carouselWidth/(carouselElementWidth + spacerSize));
var carouselLayout = [
    `V:|~[carousel(${carouselHeight})]~|`,
    'V:|~[leftButton(carousel)]~|',
    'V:|~[rightButton(carousel)]~|',
    `H:|~[leftButton(rightButton)]-[carousel(${carouselWidth})]-[rightButton(${carouselButtonWidth})]~|`,
];

/*
V:|~[carousel(200)]~|
H:|~[carousel(400)]~|
H:|~[row:-(-100)-[elem1(elem2,elem3,elem4,100)]-[elem2]-[elem3]-[elem4]]~|
V:|~[elem1(elem2,elem3,elem4,100)]~|
V:|~[elem2]~|
V:|~[elem3]~|
V:|~[elem4]~|
Z:[row][carousel]
*/
function makeCarouselLayout() {
    var layout = [];
    var exceptFirst = carouselElements.slice(1);
    var offset = (carouselElementWidth + spacerSize) * carouselElementIndex;
    var widthConstraint = exceptFirst.join(',') + `,${carouselElementWidth}`;
    var heightConstraint = exceptFirst.join(',') + `,${carouselElementHeight}`;
    var layoutExceptFirst = exceptFirst.map(x => `-[${x}]`).join('');
    var horizontalLayout = `H:|[row:-(-${offset})-[${carouselElements[0]}(${widthConstraint})]${layoutExceptFirst}]->|`;
    var verticalLayout0 = `V:|~[${carouselElements[0]}(${heightConstraint})]~|`;
    layout.push(horizontalLayout);
    layout.push(verticalLayout0);
    exceptFirst.forEach(x => layout.push(`V:|~[${x}]~|`));
    return layout;
}

function incrementIndex() {
    if (carouselElementIndex >= upperBound) carouselElementIndex = lowerBound;
    else carouselElementIndex += 1;
    carouselElementIndexSubject.next(carouselElementIndex);
}

function decrementIndex() {
    if (carouselElementIndex == lowerBound) carouselElementIndex = upperBound;
    else carouselElementIndex -= 1;
    carouselElementIndexSubject.next(carouselElementIndex);
}

function updateElementsLayout() {
    var carouselElementsLayout = makeCarouselLayout();
    autoLayout(byId('carousel'), carouselElementsLayout);
}

autoLayout(undefined, carouselLayout);
updateElementsLayout();

rxjs.fromEvent(byId('leftButton'), 'click').subscribe(function() {
    decrementIndex();
});
rxjs.fromEvent(byId('rightButton'), 'click').subscribe(function() {
    incrementIndex();
});

carouselElementIndexSubject.subscribe(() => {
    updateElementsLayout();
});


//-----------------------------------------------------------------
