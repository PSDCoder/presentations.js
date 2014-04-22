function paginator(page, pages, options) {
    'use strict';

    var defaultOptions = {
            needPrevNextLinks: true,
            needDottedElements: true,
            prevText: 'Prev',
            nextText: 'Next',
            dottedText: '...',
            afterFirst: 2,
            beforeLast: 2,
            beforeCurrent: 2,
            afterCurrent: 2,
            loopMode: false,
            renderCallback: null // callback function
        },
        result = [];

    if (!options) {
        options = {};
    }

    //extend default  options
    if (typeof options === 'object') {
        for (var param in defaultOptions) {
            if (!options.hasOwnProperty(param)) {
                options[param] = defaultOptions[param];
            }
        }
    }

    var getNewElement = function () {
        return {
            text: '',
            page: null,
            current: false,
            disabled: false
        };
    };

    /*
     * Object element structure
     * {
     *   text: '',
     *   page: int,
     *   current: bool,
     *   disabled: bool
     * }
     */
    var element,
        i,
        length;

    if (pages > 0) {
        //dots

        var rangeStart = page - options.beforeCurrent,
            rangeFinish = page + options.afterCurrent;


        if (rangeStart - options.afterFirst > 2 && options.needDottedElements) {
            options.leftDots = 1;
        } else {
            options.leftDots = 0;
        }

        if (rangeFinish + options.beforeLast < pages && options.needDottedElements) {
            options.rightDots = 1;
        } else {
            options.rightDots = 0;
        }

        //Previous page
        if (options.needPrevNextLinks && page > 1 || options.loopMode) {
            element = getNewElement();
            element.text = options.prevText;
            element.page = (page - 1) <= 0 ? pages : page - 1;

            result.push(element);
        }

        //first page
        element = getNewElement();
        element.text = '1';
        element.page = 1;
        if (page === 1) {
            element.current = true;
        }

        result.push(element);

        if (rangeStart - options.leftDots > 1) {

            for (i = 2, length = i + options.afterFirst; i < length; i++) {
                if (i < rangeStart + options.leftDots) {
                    element = getNewElement();
                    element.text = '' + i;
                    element.page = i;

                    result.push(element);
                }
            }
        }

        if (options.leftDots) {
            element = getNewElement();
            element.text = options.dottedText;
            element.disabled = true;

            result.push(element);
        }

        for (i = rangeStart; i <= rangeFinish; i++) {
            if (i > 1 + options.leftDots && i < pages - options.rightDots) {
                element = getNewElement();
                element.text = '' + i;
                element.page = i;

                if (i === page) {
                    element.current = true;
                }

                result.push(element);
            }
        }

        if (options.rightDots) {
            element = getNewElement();
            element.text = options.dottedText;
            element.disabled = true;

            result.push(element);
        }

        if (rangeFinish + options.rightDots < pages) {
            for (i = pages - options.afterFirst, length = i + options.afterFirst; i < length; i++) {
                if (i > rangeFinish + options.rightDots) {
                    element = getNewElement();
                    element.text = '' + i;
                    element.page = i;

                    result.push(element);
                }
            }
        }

        //last page
        if (pages > 1) {
            element = getNewElement();
            element.text = '' + pages;
            element.page = pages;
            if (page === pages) {
                element.current = true;
            }

            result.push(element);
        }

        //Next page
        if (options.needPrevNextLinks && page < pages || options.loopMode) {
            element = getNewElement();
            element.text = options.nextText;
            element.page = (page + 1) > pages ? 1 : page + 1;

            result.push(element);
        }
    }

    if (options.renderCallback !== null) {
        return options.renderCallback(result);
    } else {
        return result;
    }
}