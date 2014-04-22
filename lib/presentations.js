(function ($, undefined) {
    'use strict';

    var namespace = 'presentations';
    var privatePresentationClass = 'presentation_state_enabled';
    var presentationFocusingElementClass = 'presentation-focused-element';
    var dataKeys = {
        handlers: namespace + '-handlers',
        count: namespace + '-count'
    };

    var defaultOptions = {
        activeSlide: 1,
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
        fullScreenClass: 'fullscreen-mode',
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

    function Presentation ($presentation) {
        this.$presentation = $presentation;
        this.cached = {
            $document: $(document),
            $body: $(document.body)
        };

        this.increasePresentaionsCount();
    }

    Presentation.prototype.increasePresentaionsCount = function () {
        var key = namespace + '-count';

        this.$body.data(key, this.$body.data(key) + 1);
    };

    Presentation.prototype.getPresentationsCount = function () {
        return this.cached.$body.data(namespace + '-count');
    };

    Presentation.prototype.bindGlobalHandlers = function () {
//        if (!this.cached.$body.data(dataKeys.handlers)) {
//            var lastFullScreenElement = null;
//
//            this.cached.$document.on('keyup.' + namespace, function (e) {
//                var elementForSliding = null;
//                var presentations = privateMethods.getPresentations();
//                var presentationsLength = presentations.length;
//                var fullScreenElement = privateMethods.getFullScreenElement();
//
//                if (fullScreenElement) {
//                    elementForSliding = $(fullScreenElement);
//                } else if (presentationsLength && presentationsLength < 2) {
//                    elementForSliding = $(presentations[0]);
//                } else if (presentationsLength > 1) {
//                    var $focusedPresentation = privateMethods.getFocusedPresentation();
//
//                    if ($focusedPresentation.length) {
//                        elementForSliding = $focusedPresentation;
//                    }
//                }
//
//                if (elementForSliding && elementForSliding.data(namespace).slideWithKeyboard) {
//                    if (e.keyCode === 37) {
//                        privateMethods.show.call(elementForSliding, false);
//                    } else if (e.keyCode === 39) {
//                        privateMethods.show.call(elementForSliding, true);
//                    }
//                }
//            });
//
//            if (privateMethods.supportsFullscreen()) {
//                $(window).on('keyup.' + namespace, function (event) {
//                    var presentations = privateMethods.getPresentations();
//                    var presentationsLength = presentations.length;
//                    var presentationToFullScreen = null;
//
//                    if (presentationsLength && presentationsLength < 2) {
//                        presentationToFullScreen = $(presentations[0]);
//                    } else {
//                        var fullScreenElement = privateMethods.getFullScreenElement();
//
//                        if (fullScreenElement) {
//                            presentationToFullScreen = $(fullScreenElement);
//                        } else {
//                            var $focusedPresentation = privateMethods.getFocusedPresentation();
//
//                            if ($focusedPresentation.length) {
//                                presentationToFullScreen = $focusedPresentation;
//                            }
//                        }
//                    }
//
//                    if (presentationToFullScreen) {
//                        var options = presentationToFullScreen.data(namespace);
//
//                        if (options.fullScreen && event.keyCode === options.fullScreenKey.toUpperCase().charCodeAt(0)) {
//                            privateMethods.toggleFullScreen.call(presentationToFullScreen);
//                        }
//                    }
//                });
//
//                $(document).on('webkitfullscreenchange mozfullscreenchange MSFullscreenChange fullscreenchange', function () {
//                    var fullScreenElement = privateMethods.getFullScreenElement();
//
//                    if (fullScreenElement) {
//                        lastFullScreenElement = $(fullScreenElement);
//                        $body.addClass(lastFullScreenElement.data(namespace).fullScreenClass);
//                    } else if (!fullScreenElement && lastFullScreenElement) {
//                        $body.removeClass(lastFullScreenElement.data(namespace).fullScreenClass);
//                        lastFullScreenElement = null;
//                    }
//                });
//            }
//
//            this.cached.$body.data(dataKeys.handlers, true);
//        }
    };

    Presentation.prototype.bindHandlers = function () {
        this.$presentation.on('click', function () {
            if (this.getPresentationsCount() > 1 && !this.getFullScreenElement()) {
                this.cached.$focusingElement.trigger('focus');
            }
        }.bind(this));
    };

    Presentation.prototype.clearHandlers = function () {
        this.$presentation.unbind('.' + namespace);

        if (this.getPresentationsCount() === 1) {
            this.cached.$document.unbind('.' + namespace);
            this.cached.$body.removeData(dataKeys.handlers);
        }
    };

    Presentation.prototype.addFocusingElement = function () {
        this.cached.$focusingElement = $('<input type="text" class="' + presentationFocusingElementClass + '">');
        this.$presentation.prepend(this.cached.$focusingElement);
    };

    Presentation.prototype.removeFocusingElement = function () {
        this.cached.$focusingElement.remove();
    };

    Presentation.prototype.getFocusedPresentation = function () {
        return $(document.activeElement).parents('.' + privatePresentationClass);
    };

    Presentation.prototype.getFullScreenElement = function () {
        var fullScreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;

        return fullScreenElement ? $(fullScreenElement) : fullScreenElement;
    };



    //Note: call all private methods bound to jQuery presentation container
    var privateMethods = {
        bindPresentationEvents: function () {
            this.on('click', function () {
                if (privateMethods.getPresentations().length > 1 && !privateMethods.getFullScreenElement()) {
                    $('.' + presentationFocusingElementClass, this).trigger('focus');
                }
            }.bind(this));
        },
        bindCommonEventHandlers: function () {
            var $body = $('body');

            if (!$body.data(namespace + '-handlers')) {
                var lastFullScreenElement = null;

                $(window).on('keyup.' + namespace, function (event) {
                    var elementForSliding = null;
                    var presentations = privateMethods.getPresentations();
                    var presentationsLength = presentations.length;
                    var fullScreenElement = privateMethods.getFullScreenElement();

                    if (fullScreenElement) {
                        elementForSliding = $(fullScreenElement);
                    } else if (presentationsLength && presentationsLength < 2) {
                        elementForSliding = $(presentations[0]);
                    } else if (presentationsLength > 1) {
                        var $focusedPresentation = privateMethods.getFocusedPresentation();

                        if ($focusedPresentation.length) {
                            elementForSliding = $focusedPresentation;
                        }
                    }

                    if (elementForSliding && elementForSliding.data(namespace).slideWithKeyboard) {
                        if (event.keyCode === 37) {
                            privateMethods.show.call(elementForSliding, false);
                        } else if (event.keyCode === 39) {
                            privateMethods.show.call(elementForSliding, true);
                        }
                    }
                });

                if (privateMethods.supportsFullscreen()) {
                    $(window).on('keyup.' + namespace, function (event) {
                        var presentations = privateMethods.getPresentations();
                        var presentationsLength = presentations.length;
                        var presentationToFullScreen = null;

                        if (presentationsLength && presentationsLength < 2) {
                            presentationToFullScreen = $(presentations[0]);
                        } else {
                            var fullScreenElement = privateMethods.getFullScreenElement();

                            if (fullScreenElement) {
                                presentationToFullScreen = $(fullScreenElement);
                            } else {
                                var $focusedPresentation = privateMethods.getFocusedPresentation();

                                if ($focusedPresentation.length) {
                                    presentationToFullScreen = $focusedPresentation;
                                }
                            }
                        }

                        if (presentationToFullScreen) {
                            var options = presentationToFullScreen.data(namespace);

                            if (options.fullScreen && event.keyCode === options.fullScreenKey.toUpperCase().charCodeAt(0)) {
                                privateMethods.toggleFullScreen.call(presentationToFullScreen);
                            }
                        }
                    });

                    $(document).on('webkitfullscreenchange mozfullscreenchange MSFullscreenChange fullscreenchange', function () {
                        var fullScreenElement = privateMethods.getFullScreenElement();

                        if (fullScreenElement) {
                            lastFullScreenElement = $(fullScreenElement);
                            $body.addClass(lastFullScreenElement.data(namespace).fullScreenClass);
                        } else if (!fullScreenElement && lastFullScreenElement) {
                            $body.removeClass(lastFullScreenElement.data(namespace).fullScreenClass);
                            lastFullScreenElement = null;
                        }
                    });
                }

                $body.data(namespace + '-handlers', true);
            }
        },
        unbindEventHandlers: function () {
            this.unbind('.' + namespace);

            if (this.length === privateMethods.getPresentations().length) {
                $(window).unbind('.' + namespace);
                $('body').data(namespace + '-handlers', null);
            }
        },
        addFocusedElement: function () {
            this.prepend('<input type="text" class="' + presentationFocusingElementClass + '">');
        },
        dropFocusElement: function () {
            $('.' + presentationFocusingElementClass, this).remove();
        },
        getFocusedPresentation: function () {
            return $(document.activeElement).parents('.' + privatePresentationClass);
        },
        getPresentations: function () {
            return $('.' + privatePresentationClass);
        },
        getSlides: function () {
            return $('.' + this.data(namespace).slideClass, this);
        },
        show: function (idOrNextPrevBool, callback) {
            var $slides = privateMethods.getSlides.call(this);
            var slidesLength = $slides.length;
            var $showSlide;
            var showIndex;
            var options = this.data(namespace);

            if ($.isNumeric(idOrNextPrevBool)) {
                if ((idOrNextPrevBool - 1) < 0 || (idOrNextPrevBool - 1) >= slidesLength) {
                    showIndex = 0;
                } else {
                    showIndex = idOrNextPrevBool - 1;
                }
            } else {
                for (var i = 0; i < slidesLength; i++) {
                    var $element = $($slides[i]);

                    if ($element.hasClass(options.activeSlideClass)) {
                        if (idOrNextPrevBool) {
                            if ((i + 1) < slidesLength) {
                                showIndex = i + 1;
                            } else if (options.loopMode) {
                                showIndex = 0;
                            } else {
                                return;
                            }

                            this.trigger('nextSlide.' + namespace, this, showIndex);
                        } else {
                            if ((i - 1) < 0) {
                                if (options.loopMode) {
                                    showIndex = slidesLength - 1;
                                } else {
                                    return;
                                }
                            } else {
                                showIndex = i - 1;
                            }

                            this.trigger('previousSlide.' + namespace, this, showIndex);
                        }
                        break;
                    }
                }
            }

            if (showIndex === 0) {
                this.trigger('firstSlide.' + namespace, this, showIndex);
            } else if (showIndex === slidesLength - 1) {
                this.trigger('lastSlide.' + namespace, this, showIndex);
            }

            this.trigger('changeSlide.' + namespace, this, showIndex);

            $showSlide = $($slides[showIndex]);

            $slides.removeClass(options.activeSlideClass);
            $showSlide.addClass(options.activeSlideClass);

            if (!options.loopMode) {
                privateMethods.updateArrows.call(this, showIndex === 0, showIndex === (slidesLength - 1));
            }

            if (options.progressBar) {
                privateMethods.updateProgressBar.call(this, (showIndex + 1) / slidesLength);
            }

            if (options.pagination) {
                privateMethods.updatePagination.call(this, (showIndex + 1), slidesLength);
            }

            if ($.isFunction(callback)) {
                callback($showSlide);
            }
        },
        buildPagination: function () {
            var options = this.data(namespace);
            var $navigationList = $('<ul class="' + options.paginationClass + '"></ul>');
            var self = this;

            options.paginationOptions.loopMode = options.loopMode;

            this.append($navigationList);

            //add clicks handlers
            $navigationList.on('click', 'a', function (event) {
                event.preventDefault();

                privateMethods.show.call(self, $(this).data('page'));
            });
        },
        updatePagination: function (activePage, pagesCount) {
            var options = this.data(namespace);
            var paginationData = paginator(activePage, pagesCount, options.paginationOptions);

            $('.' + options.paginationClass, this).html(privateMethods.getBuiltPaginationList.call(this, paginationData));
        },
        getBuiltPaginationList: function (paginationData) {
            var options = this.data(namespace);
            var $temporaryContainer = $('<div/>');

            for (var i = 0, length = paginationData.length; i < length; i++) {
                var elementClassPostfix = paginationData[i].page === null || paginationData[i].disabled || paginationData[i].current;

                var elementOptions = {
                    text: paginationData[i].text,
                    'class': options.paginationClass + (elementClassPostfix ? '__text' : '__link')
                };
                var $element = $((paginationData[i].disabled || paginationData[i].current) ? '<span/>' : '<a/>', elementOptions);

                if (paginationData[i].page) {
                    $element.prop('href', '#');
                    $element.attr('data-page', paginationData[i].page);
                }

                $temporaryContainer.append($('<li/>', {
                    'class': options.paginationItemClass + (paginationData[i].current ? (' ' + options.paginationItemClass + '_state_active') : '')
                }).append($element));
            }

            return $temporaryContainer.html();
        },
        dropPagination: function () {
            $('.' + this.data(namespace).paginationClass, this).remove();
        },
        buildProgressBar: function () {
            var options = this.data(namespace);
            var $progressBarCount = $('<div class="' + options.progressBarCountClass + '"></div>');
            var $progressBarContainer = $('<div class="' + options.progressBarClass + '"></div>');

            $progressBarCount.css({
                width: '0%'
            });

            this.append($progressBarContainer.append($progressBarCount));
        },
        updateProgressBar: function (count) {
            $('.' + this.data(namespace).progressBarCountClass, this).css({
                width: (count * 100) + '%'
            });
        },
        dropProgressBar: function () {
            $('.' + this.data(namespace).progressBarClass, this).remove();
        },
        buildArrows: function () {
            var options = this.data(namespace);

            this.prepend('<a class="' + options.previousButtonClass + '" href="#">' + options.previousButtonText + '</a>');
            this.append('<a class="' + options.nextButtonClass + '" href="#">' + options.nextButtonText + '</a>');

            this.on('click.' + namespace, '.' + options.previousButtonClass, function (event) {
                event.preventDefault();
                publicMethods.previous.apply(this);
            }.bind(this));
            this.on('click.' + namespace, '.' + options.nextButtonClass, function (event) {
                event.preventDefault();
                publicMethods.next.apply(this);
            }.bind(this));
        },
        updateArrows: function (previousDisabled, nextDisabled) {
            var options = this.data(namespace);

            $('.' + options.previousButtonClass, this)[(previousDisabled ? 'add' : 'remove') + 'Class'](options.previousButtonClass + '_state_disabled');
            $('.' + options.nextButtonClass, this)[(nextDisabled ? 'add' : 'remove') + 'Class'](options.nextButtonClass + '_state_disabled');
        },
        dropArrows: function () {
            var options = this.data(namespace);

            $('.' + options.previousButtonClass, this).remove();
            $('.' + options.nextButtonClass, this).remove();
        },
        buildFullScreen: function () {
            var options = this.data(namespace);

            var $fullscreenButton = $('<button class="' + options.fullScreenButtonClass + '">' + options.fullScreenButtonText + '</button>');
            var self = this;

            $fullscreenButton.on('click', function() {
                privateMethods.toggleFullScreen.call(self);
                $(this).trigger('blur');
            });

            this.append($fullscreenButton);
        },
        getFullScreenElement: function () {
            return document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
        },
        toggleFullScreen: function () {
            var options = this.data(namespace);
            var fullScreenElement = privateMethods.getFullScreenElement();

            if (fullScreenElement) {
                if(document.exitFullscreen) {
                    document.exitFullscreen();
                } else if(document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if(document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if(document.msExitFullscreen) {
                    document.msExitFullscreen();
                }

                this.trigger('fullScreenExit.' + namespace, this);
            } else {
                var domElement = this[0];

                if(domElement.requestFullscreen) {
                    domElement.requestFullscreen();
                } else if(domElement.webkitRequestFullscreen) {
                    domElement.webkitRequestFullscreen();
                } else if(domElement.mozRequestFullScreen) {
                    domElement.mozRequestFullScreen();
                } else if (domElement.msRequestFullscreen) {
                    domElement.msRequestFullscreen();
                }

                this.trigger('fullScreen.' + namespace, this);
            }

            $('.' + options.fullScreenButtonClass, this).html(fullScreenElement ? options.fullScreenButtonText : options.fullScreenButtonTextEnabled);
        },
        dropFullScreen: function () {
            $('.' + this.data(namespace).fullScreenButtonClass, this).remove();
        },
        supportsFullscreen: function () {
            return document.exitFullscreen || document.msExitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen;
        }
    };

    var publicMethods = {
        init: function (passedOptions) {
            var presentations = this.each(function () {
                var $this = $(this);
                var options = $this.data(namespace);

                if (!options) {
                    options = $.extend(true, {}, defaultOptions, passedOptions);
                    $this.data(namespace, options);
                    $this.addClass(privatePresentationClass);

                    if (options.arrows) {
                        privateMethods.buildArrows.call($this);
                    }

                    if (options.progressBar) {
                        privateMethods.buildProgressBar.call($this);
                    }

                    if (options.pagination) {
                        if (window.paginator) {
                            privateMethods.buildPagination.call($this);
                        } else {
                            $.error('For enable pagination you must include paginator.js before "' + namespace + '" lib');
                        }
                    }

                    if (options.fullScreen && privateMethods.supportsFullscreen()) {
                        privateMethods.buildFullScreen.call($this);
                    }

                    privateMethods.addFocusedElement.call($this);
                    privateMethods.bindPresentationEvents.call($this);

                    privateMethods.show.call($this, options.activeSlide);

                    $this.trigger('initEnd.' + namespace, $this);
                }
            });

            privateMethods.bindCommonEventHandlers();

            return presentations;
        },
        destroy: function () {
            this.each(function () {
                var $this = $(this);
                
                privateMethods.unbindEventHandlers.call($this);
                privateMethods.dropArrows.call($this);
                privateMethods.dropProgressBar.call($this);
                privateMethods.dropPagination.call($this);
                privateMethods.dropFullScreen.call($this);
                privateMethods.dropFocusElement.call($this);

                $this.removeData(namespace);
                $this.removeClass(privatePresentationClass);

                $this.trigger('destroyEnd.' + namespace, $this);
            });
        },
        next: function (callback) {
            return this.each(function () {
                privateMethods.show.call($(this), true, callback);
            });
        },
        previous: function (callback) {
            return this.each(function () {
                privateMethods.show.call($(this), false, callback);
            });
        },
        setActive: function (index, callback) {
            return this.each(function () {
                privateMethods.show.call($(this), index, callback);
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
