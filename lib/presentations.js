(function ($, undefined) {
    'use strict';

    var namespace = 'presentations';
    var focusedPresentationClass = 'presentation_state_focused';
    var bodyFullScreenStateClass = 'body_state_fullscreen';
    var globalCache = {
        $document: $(document),
        $body: $(document.body)
    };
    var dataKeys = {
        presentation: namespace.slice(0, -1),
        handlers: namespace + '-handlers',
        count: namespace + '-count',
        options: namespace + '-options'
    };
    var presentations = [];
    var browserSupportsFullScreen = !!(document.exitFullscreen || document.msExitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen);

    var defaultOptions = {
        startSlideIndex: 0,
        slideWithKeyboard: true,
        loopMode: false,
        pagination: true,
        paginationOptions: {
            afterFirst: 1,
            beforeLast: 1,
            beforeCurrent: 1,
            afterCurrent: 1,
            prevText: 'Prev',
            nextText: 'Next'
        },
        progressBar: true,
        arrows: true,
        fullScreen: true,
        fullScreenKey: 'f',
        containerClass: 'presentation',
        nextButtonClass: 'presentation__button_action_next',
        nextButtonText: 'Next',
        previousButtonClass: 'presentation__button_action_previous',
        previousButtonText: 'Previous',
        slidesListClass: 'presentation-slides',
        slideClass: 'presentation-slides__slide',
        activeSlideClass: 'presentation-slides__slide_state_active',
        paginationClass: 'presentation-navigation',
        paginationItemClass: 'presentation-navigation__item',
        progressBarClass: 'presentation-progress-bar',
        progressBarCountClass: 'presentation-progress-bar__count',
        fullScreenButtonClass: 'presentation__button_action_fullscreen',
        fullScreenButtonText: 'Fullscreen (f)',
        fullScreenButtonTextEnabled: 'Exit from fullscreen (f)'
    };


    /**
     * Presentation constructor
     *
     * @param $presentation - presentation dom element
     * @param options
     * @constructor
     */
    function Presentation ($presentation, options) {
        presentations.push(this);

        this.$presentation = $presentation;
        this.$presentation.data(dataKeys.options, options);
        this.options = options;
        this.$slides = this.prepareSlides();

        this.cached = {};

        if (options.arrows) {
            this.buildArrows();
        }

        if (options.progressBar) {
            this.buildProgressBar();
        }

        if (options.pagination) {
            if (window.paginator) {
                this.buildPagination();
            } else {
                $.error('For enable pagination you must include paginator.js before "' + namespace + '" lib');
            }
        }

        if (options.fullScreen && browserSupportsFullScreen) {
            this.buildFullScreen();
        }

        this.bindHandlers();

        this.show(options.startSlideIndex);
    }

    Presentation.prototype.destroy = function () {
        this.clearHandlers();
        this.$current.removeClass(this.options.activeSlideClass);
        this.$presentation.removeClass(focusedPresentationClass);
        this.destroyArrows();
        this.destroyProgressBar();
        this.destroyPagination();
        this.destroyFullScreen();

        presentations.splice(presentations.indexOf(this), 1);
    };

    Presentation.prototype.bindGlobalHandlers = function () {
        if (!globalCache.$body.data(dataKeys.handlers)) {
            var lastFullScreenElement = null;

            //sliding keys
            globalCache.$document.on('keyup.' + namespace, function (e) {
                var $presentationToSliding = Presentation.prototype.getFocusedOrFullScreenPresentation();

                if ($presentationToSliding && $presentationToSliding.data(dataKeys.options).slideWithKeyboard) {
                    var presentationConstructor = $presentationToSliding.data(dataKeys.presentation);

                    if (e.keyCode === 37) {
                        presentationConstructor.showPrevious();
                    } else if (e.keyCode === 39) {
                        presentationConstructor.showNext();
                    }
                }
            });

            if (browserSupportsFullScreen) {
                globalCache.$document.on('keyup.' + namespace, function (e) {
                    var $presentationToFullScreen = Presentation.prototype.getFocusedOrFullScreenPresentation();

                    if ($presentationToFullScreen) {
                        var options = $presentationToFullScreen.data(dataKeys.options);

                        if (options.fullScreen && e.keyCode === options.fullScreenKeyCode) {
                            $presentationToFullScreen.data(dataKeys.presentation).toggleFullScreen();
                        }
                    }
                });

                globalCache.$document.on('webkitfullscreenchange mozfullscreenchange MSFullscreenChange fullscreenchange', function () {
                    var $fullScreenElement = Presentation.prototype.getFullScreenElement();

                    if ($fullScreenElement) {
                        globalCache.$body.addClass(bodyFullScreenStateClass);
                        lastFullScreenElement = $fullScreenElement;
                    } else if (!$fullScreenElement && lastFullScreenElement) {
                        globalCache.$body.removeClass(bodyFullScreenStateClass);
                        lastFullScreenElement = null;
                    }
                });
            }

            globalCache.$body.data(dataKeys.handlers, true);
        }
    };

    Presentation.prototype.prepareSlides = function () {
        var $slides = $('.' + this.options.slideClass, this.$presentation);

        for (var i = 0, slidesLength = $slides.length; i < slidesLength; i++) {
            $($slides[i]).data('id', i);
        }

        this.$current = $slides[this.options.startSlideIndex] ? $($slides[this.options.startSlideIndex]) : $($slides[0]);
        this.$current.addClass(this.options.activeSlideClass);

        return $slides;
    };

    Presentation.prototype.bindHandlers = function () {
        this.$presentation.on('click.' + namespace, $.proxy(function () {
            if (!this.$presentation.hasClass(focusedPresentationClass)) {
                var $focused = this.getFocusedPresentation();

                if ($focused) {
                    $focused.removeClass(focusedPresentationClass);
                }

                this.$presentation.addClass(focusedPresentationClass);
            }
        }, this));
    };

    Presentation.prototype.clearHandlers = function () {
        this.$presentation.unbind('.' + namespace);

        if (presentations.length === 1) {
            globalCache.$document.unbind('.' + namespace);
            globalCache.$body.removeData(dataKeys.handlers);
        }
    };

    Presentation.prototype.getFocusedPresentation = function () {        
        for (var i = 0, presentationsLength = presentations.length; i < presentationsLength; i++) {
            if (presentations[i].$presentation.hasClass(focusedPresentationClass)) {
                return presentations[i].$presentation;
            }
        }

        return null;
    };

    /**
     * Call only from prototype!
     *
     * @returns {*}
     */
    Presentation.prototype.getFocusedOrFullScreenPresentation = function () {
        var $presentationToSliding = null;
        var $fullScreenElement = Presentation.prototype.getFullScreenElement();
        var presentationsLength = presentations.length;

        if ($fullScreenElement) {
            $presentationToSliding = $fullScreenElement;
        } else if (presentationsLength === 1) {
            $presentationToSliding = presentations[0].$presentation;
        } else if (presentationsLength > 1) {
            var $focusedPresentation = Presentation.prototype.getFocusedPresentation();

            if ($focusedPresentation) {
                $presentationToSliding = $focusedPresentation;
            }
        }

        return $presentationToSliding;
    };

    Presentation.prototype.show = function (showIndex, callback) {
        var slidesLength = this.$slides.length;
        var currentIndex = this.$current.data('id');

        if (showIndex < 0 || showIndex >= slidesLength) {
            $.error('Wrong slide index: ' + showIndex + '. Total count of slides: ' + slidesLength);
        }

        if (currentIndex + 1 === showIndex || (this.options.loopMode && currentIndex + 1 === slidesLength && showIndex === 0)) {
            this.$presentation.trigger('nextSlide.' + namespace, this.$presentation, showIndex);
        } else if (currentIndex - 1 === showIndex || (this.options.loopMode && currentIndex - 1 < 0 && showIndex === slidesLength - 1)) {
            this.$presentation.trigger('previousSlide.' + namespace, this.$presentation, showIndex);
        }

        if (showIndex === 0) {
            this.$presentation.trigger('firstSlide.' + namespace, this.$presentation, showIndex);
        } else if (showIndex === slidesLength - 1) {
            this.$presentation.trigger('lastSlide.' + namespace, this.$presentation, showIndex);
        }

        this.$presentation.trigger('changedSlide.' + namespace, this.$presentation, showIndex);

        this.$current.removeClass(this.options.activeSlideClass);
        this.$current = $(this.$slides[showIndex]);
        this.$current.addClass(this.options.activeSlideClass);

        if (!this.options.loopMode) {
            this.updateArrows(showIndex === 0, showIndex === (slidesLength - 1));
        }

        if (this.options.progressBar) {
            this.updateProgressBar((showIndex + 1) / slidesLength);
        }

        if (this.options.pagination) {
            this.updatePagination(showIndex + 1, slidesLength);
        }

        if ($.isFunction(callback)) {
            callback(this.$current);
        }
    };

    Presentation.prototype.showPrevious = function (callback) {
        var currentIndex = this.$current.data('id');
        var previousIndex = currentIndex - 1;

        if (previousIndex < 0) {
            if (this.options.loopMode) {
                previousIndex = this.$slides.length - 1;
            } else {
                return;
            }
        }

        this.show(previousIndex, callback);
    };

    Presentation.prototype.showNext = function (callback) {
        var currentIndex = this.$current.data('id');
        var nextIndex = currentIndex + 1;

        if (nextIndex >= this.$slides.length) {
            if (this.options.loopMode) {
                nextIndex = 0;
            } else {
                return;
            }
        }

        this.show(nextIndex, callback);
    };

    //pagination
    Presentation.prototype.buildPagination = function () {
        var self = this;
        this.options.paginationOptions.loopMode = this.options.loopMode;

        this.cached.$pagination = $('<ul class="' + this.options.paginationClass + '"></ul>');
        this.$presentation.append(this.cached.$pagination);

        this.cached.$pagination.on('click', 'a', function (event) {
            event.preventDefault();
            self.show($(this).data('page') - 1);
        });
    };

    Presentation.prototype.updatePagination = function (newPage, totalPages) {
        var paginationData = paginator(newPage, totalPages, this.options.paginationOptions);

        this.cached.$pagination.html(this.getBuiltPaginationList(paginationData));
    };

    Presentation.prototype.getBuiltPaginationList = function (paginationData) {
        var $temporaryContainer = $('<div/>');
        var elementClassPostfix;
        var elementOptions;
        var $element;

        for (var i = 0, length = paginationData.length; i < length; i++) {
            elementClassPostfix = paginationData[i].page === null || paginationData[i].disabled || paginationData[i].current;

            elementOptions = {
                text: paginationData[i].text,
                'class': this.options.paginationClass + (elementClassPostfix ? '__text' : '__link')
            };
            $element = $((paginationData[i].disabled || paginationData[i].current) ? '<span/>' : '<a/>', elementOptions);

            if (paginationData[i].page) {
                $element.prop('href', '#');
                $element.attr('data-page', paginationData[i].page);
            }

            $temporaryContainer.append($('<li/>', {
                'class': this.options.paginationItemClass + (paginationData[i].current ? (' ' + this.options.paginationItemClass + '_state_active') : '')
            }).append($element));
        }

        return $temporaryContainer.children();
    };

    Presentation.prototype.destroyPagination = function () {
        this.cached.$pagination.unbind().remove();
    };


    //progress bar
    Presentation.prototype.buildProgressBar = function () {
        this.cached.$progressBarCount = $('<div class="' + this.options.progressBarCountClass + '"></div>');
        this.cached.$progressBarContainer = $('<div class="' + this.options.progressBarClass + '"></div>');

        this.cached.$progressBarCount.css({width: '0%'});
        this.cached.$progressBarContainer.append(this.cached.$progressBarCount);
        this.$presentation.append(this.cached.$progressBarContainer);
    };

    Presentation.prototype.updateProgressBar = function (ratio) {
        this.cached.$progressBarCount.css({width: (ratio * 100) + '%'});
    };

    Presentation.prototype.destroyProgressBar = function () {
        this.cached.$progressBarContainer.remove();
    };


    //arrows
    Presentation.prototype.buildArrows = function () {
        this.cached.$arrowPrevious = $('<a class="' + this.options.previousButtonClass + '" href="#">' + this.options.previousButtonText + '</a>');
        this.cached.$arrowNext = $('<a class="' + this.options.nextButtonClass + '" href="#">' + this.options.nextButtonText + '</a>');

        this.$presentation.prepend(this.cached.$arrowPrevious);
        this.$presentation.append(this.cached.$arrowNext);

        this.cached.$arrowPrevious.on('click.' + namespace, $.proxy(function (e) {
            e.preventDefault();
            this.showPrevious();
        }, this));

        this.cached.$arrowNext.on('click.' + namespace, $.proxy(function (event) {
            event.preventDefault();
            this.showNext();
        }, this));
    };

    Presentation.prototype.updateArrows = function (previousDisabled, nextDisabled) {
        this.cached.$arrowPrevious[(previousDisabled ? 'add' : 'remove') + 'Class'](this.options.previousButtonClass + '_state_disabled');
        this.cached.$arrowNext[(nextDisabled ? 'add' : 'remove') + 'Class'](this.options.nextButtonClass + '_state_disabled');
    };

    Presentation.prototype.destroyArrows = function () {
        this.cached.$arrowPrevious.unbind().remove();
        this.cached.$arrowNext.unbind().remove();
    };


    //fullscreen
    Presentation.prototype.buildFullScreen = function () {
        var self = this;
        this.options.fullScreenKeyCode = this.options.fullScreenKey.toUpperCase().charCodeAt(0);
        this.cached.$fullscreenButton = $('<button class="' + this.options.fullScreenButtonClass + '">' + this.options.fullScreenButtonText + '</button>');

        this.cached.$fullscreenButton.on('click', function() {
            self.toggleFullScreen();
            $(this).trigger('blur');
        });

        this.$presentation.append(this.cached.$fullscreenButton);
    };

    Presentation.prototype.getFullScreenElement = function () {
        var fullScreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;

        return fullScreenElement ? $(fullScreenElement) : fullScreenElement;
    };

    Presentation.prototype.toggleFullScreen = function () {
        var $fullScreenElement = this.getFullScreenElement();

        if ($fullScreenElement) {
            if(document.exitFullscreen) {
                document.exitFullscreen();
            } else if(document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if(document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if(document.msExitFullscreen) {
                document.msExitFullscreen();
            }

            this.$presentation.trigger('fullScreenExit.' + namespace, this.$presentation);
        } else {
            var presentationClearDomElement = this.$presentation[0];

            if(presentationClearDomElement.requestFullscreen) {
                presentationClearDomElement.requestFullscreen();
            } else if(presentationClearDomElement.webkitRequestFullscreen) {
                presentationClearDomElement.webkitRequestFullscreen();
            } else if(presentationClearDomElement.mozRequestFullScreen) {
                presentationClearDomElement.mozRequestFullScreen();
            } else if (presentationClearDomElement.msRequestFullscreen) {
                presentationClearDomElement.msRequestFullscreen();
            }

            this.$presentation.trigger('fullScreen.' + namespace, this.$presentation);
        }

        this.cached.$fullscreenButton.html($fullScreenElement ? this.options.fullScreenButtonText : this.options.fullScreenButtonTextEnabled);
    };

    Presentation.prototype.destroyFullScreen = function () {
        this.cached.$fullscreenButton.unbind().remove();
    };


    var publicMethods = {
        init: function (passedOptions) {
            var $presentations = this.each(function () {
                var $this = $(this);
                var presentation = $this.data(dataKeys.presentation);

                if (!presentation) {
                    var options = $.extend(true, {}, defaultOptions, passedOptions);
                    $this.data(dataKeys.presentation, new Presentation($($this[0]), options));

                    $this.trigger('initEnd.' + namespace, $this);
                }
            });

            Presentation.prototype.bindGlobalHandlers();

            return $presentations;
        },
        destroy: function () {
            this.each(function () {
                var $this = $(this);
                var presentation = $this.data(dataKeys.presentation);

                presentation.destroy();
                $this.removeData(dataKeys.presentation);

                $this.trigger('destroyEnd.' + namespace, $this);
            });
        },
        previous: function (callback) {
            return this.each(function () {
                $(this).data(dataKeys.presentation).showPrevious(callback);
            });
        },
        next: function (callback) {
            return this.each(function () {
                $(this).data(dataKeys.presentation).showNext(callback);
            });
        },
        setActive: function (index, callback) {
            return this.each(function () {
                $(this).data(dataKeys.presentation).show(index, callback);
            });
        }
    };

    if ($.fn[namespace]) {
        $.error('You trying include "' + namespace + '" plugin again.');
    }

    $.fn[namespace] = function (method) {
        if (publicMethods[method]) {
            return publicMethods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if ($.isPlainObject(method) || !method) {
            return publicMethods.init.apply(this, arguments);
        } else {
            $.error('Method with name ' +  method + ' doesn\'t exist for "' + namespace + '" plugin. Check documentation.');
        }
    };
})(jQuery);
