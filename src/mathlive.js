
/**
 * 
 * The functions in this module are the main entry points to the MathLive 
 * public API.
 * 
 * To invoke these functions, use the global MathLive object. For example:
 * ```javascript
 * const markup = MathLive.toMarkup('e^{i\\pi}+1=0');
 * ```
 * 
 * @module mathlive
 */

define([
    'mathlive/core/lexer', 
    'mathlive/core/mathAtom', 
    'mathlive/core/parser', 
    'mathlive/core/span', 
    'mathlive/editor/editor-mathfield',
    'mathlive/addons/auto-render',
    ], 
    function(Lexer, MathAtom, ParserModule, Span, MathField, AutoRender) {

/**
 * Convert a LaTeX string to a string of HTML markup.
 * 
 * @param {string} text A string of valid LaTeX. It does not have to start 
 * with a mode token (i.e. `$$` or `\(`).
 * @param {string} displayMode If `'displaystyle'` the "display" mode of TeX
 * is used to typeset the formula. Most appropriate for formulas that are 
 * displayed in a standalone block. If `'textstyle'` is used, the "text" mode
 * of TeX is used, which is most appropriate when displaying math "inline" 
 * with other text.
 * @param {string} [format='html'] For debugging purposes, this function 
 * can also return a text representation of internal data structures
 * used to construct the markup. Valid values include `'mathlist'` and `'span'`
 * @function module:mathlive#latexToMarkup
 */
function toMarkup(text, mathstyle, format) {
    mathstyle = mathstyle || 'displaystyle'
    //
    // 1. Tokenize the text
    //
    const tokens = Lexer.tokenize(text);

    //
    // 2. Parse each token in the formula
    //    Turn the list of tokens in the formula into
    //    a tree of high-level MathAtom, e.g. 'genfrac'.
    //

    const mathlist = ParserModule.parseTokens(tokens);

    if (format === 'mathlist') return mathlist;



    //
    // 3. Transform the math atoms into elementary spans
    //    for example from genfrac to vlist.
    //
    let spans = MathAtom.decompose({mathstyle: mathstyle}, mathlist);


    // 
    // 4. Simplify by coalescing adjacent nodes
    //    for example, from <span>1</span><span>2</span> 
    //    to <span>12</span>
    //
    spans = Span.coalesce(spans);

    if (format === 'span') return spans;

    //
    // 5. Wrap the expression with struts
    //
    const base = Span.makeSpan(spans, 'ML__base');

    const topStrut = Span.makeSpan('', 'ML__strut');
    topStrut.setStyle('height', base.height, 'em');
    const bottomStrut = Span.makeSpan('', 'ML__strut ML__bottom');
    bottomStrut.setStyle('height', base.height + base.depth, 'em');
    bottomStrut.setStyle('vertical-align', -base.depth, 'em');
    const wrapper = Span.makeSpan([topStrut, bottomStrut, base], 'ML__mathlive');


    // 
    // 6. Generate markup
    //

    return wrapper.toMarkup();
}


/**
 * Convert a DOM element into an editable math field.
 * 
 * @param {Element|string} element An HTML DOM element, for example as obtained 
 * by `.getElementById()` or a string representing the ID of a DOM element.
 * @param {Object} [config]
 * @param {function} config.substituteTextArea - A function that returns a focusable element
 * that can be used to capture text input.
 * 
 * @param {mathfieldCallback} config.onFocus - Invoked when the mathfield has been focused
 * 
 * @param {mathfieldCallback} config.onBlur - Invoked when the mathfield has been blurred
 * 
 * @param {boolean} config.overrideDefaultInlineShorctus - If true, the default 
 * inline shortcuts (e.g. 'p' + 'i' = 'π') are ignored. Default false.
 * 
 * @param {Object} config.inlineShortcuts - A map of shortcuts -> replacement value.
 * For example `{ 'pi': '\\pi'}`. If `overrideDefaultInlineShorcuts` is false, 
 * these shortcuts are applied after any default ones, and can therefore replace
 * them.
 * 
 * @param {mathfieldWithDirectionCallback} config.onMoveOutOf - A handler called when 
 * keyboard navigation would cause the insertion point to leave the mathfield.
 * 
 * By default, the insertion point will wrap around.
 * 
 * @param {mathfieldWithDirectionCallback} config.onTabOutOf - A handler called when 
 * pressing tab (or shift-tab) would cause the insertion point to leave the mathfield.
 * 
 * By default, the insertion point jumps to the next point of interest.
 * 
 * @param {mathfieldWithDirectionCallback} config.onDeleteOutOf - A handler called when 
 * deleting an item would cause the insertion point to leave the mathfield.
 * 
 * By default, nothing happens. @todo
 * 
 * @param {mathfieldWithDirectionCallback} config.onSelectOutOf - A handler called when 
 * the selection is extended so that it would cause the insertion point to 
 * leave the mathfield.
 * 
 * By default, nothing happens. @todo
 * 
 * @param {mathfieldCallback} config.onUpOutOf - A handler called when 
 * the up arrow key is pressed with no element to navigate to.
 * 
 * By default, nothing happens. @todo
 * 
 * @param {mathfieldCallback} config.onDownOutOf - A handler called when 
 * the up down key is pressed with no element to navigate to.
 * 
 * By default, nothing happens. @todo
 * 
 * @param {mathfieldCallback} config.onEnter - A handler called when 
 * the enter/return key is pressed and it is not otherwise handled. @todo
 * 
 * @param {mathfieldCallback} config.onContentWillChange - A handler called 
 * just before the content is about to be changed. @todo
 * 
 * @param {mathfieldCallback} config.onContentDidChange - A handler called 
 * just after the content has been changed.@todo
 * 
 * @param {mathfieldCallback} config.onSelectionWillChange - A handler called 
 * just before the selection is about to be changed.
 * 
 * @param {mathfieldCallback} config.onSelectionDidChange - A handler called  
 * just after the selection has been changed. * @function module:mathlive#makeMathField
 * @function module:mathlive#makeMathField
 */
function makeMathField(element, config) {
    if (!MathField) {
        console.log('The MathField module is not loaded.');
        return null;
    }
    return new MathField.MathField(element, config)
}

/**
 * 
 * @function module:mathlive#latexToSpeakableText
 */
function toSpeakableText() {
    if (!MathAtom.toSpeakableText) {
        console.log('The SpokenText module is not loaded.');
        return;
    }
    MathAtom.toSpeakableText();
}

/**
 * Transform all the elements in the document body that contain LaTeX code 
 * into typeset math.
 * **See:** {@tutorial USAGE_GUIDE}
 * 
 * @param {Object} options See `renderMathInElement` for details
 * @function module:mathlive#renderMathInDocument
 */
function renderMathInDocument(options) {
    if (!AutoRender) {
        console.log('The AutoRender module is not loaded.');
        return;
    }
    AutoRender.renderMathInElement(document.body, options, toMarkup);
}

/**
 * Transform all the children of element, recursively, that contain LaTeX code 
 * into typeset math.
 * **See:** {@tutorial USAGE_GUIDE}
 * 
 * @param {Element|string} element An HTML DOM element, or a string containing
 * the ID an element.
 * @param {Object} [options]
 * @param {string[]} options.skipTags an array of tag names whose content will
 *  not be scanned for delimiters
 * @param {string} options.ignoreClass a string used as a resular expression of 
 * class names of elements whose content will not be scanned for delimiters 
 * (`'tex2jax_ignore'` by default)
 * @param {string} options.processClass   a string used as a resular expression 
 * of class names of elements whose content **will** be scanned for delimiters, 
 * even if their tag name or parent class name would have prevented them from 
 * doing so. (`'tex2jax_process'` by default)
 * @param {boolean} options.TeX.processEnvironments if false, math expression 
 * that start with `\begin{` will not automatically be rendered. (true by default)
 * @param {Array} options.TeX.delimiters.inline
 * @param {Array} options.TeX.delimiters.display `TeX.delimiters.display` arrays 
 * of delimitersthat will trigger a render of the content in 'textstyle' or 
 * 'displaystyle', respectively.
 * @function module:mathlive#renderMathInElement
 */
function renderMathInElement(element, options) {
    if (!AutoRender) {
        console.log('The AutoRender module is not loaded.');
        return;
    }
    AutoRender.renderMathInElement(element, options, toMarkup);
}

return {
    latexToMarkup: toMarkup,
    latexToSpeakableText: toSpeakableText,
    makeMathField: makeMathField,
    renderMathInDocument: renderMathInDocument,
    renderMathInElement: renderMathInElement
}


})
