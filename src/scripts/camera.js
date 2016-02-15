'use strict';
/**
* @author       Adam Kucharik <akucharik@gmail.com>
* @copyright    Adam Kucharik
* @license      {@link https://github.com/akucharik/backbone.cameraView/license.txt|MIT License}
*/

/**
* Factory: Creates {@link http://backbonejs.org/#View|Backbone.View} height and width sizing functionality used for object composition.
* Requires {@link http://lodash.com|lodash} or {@link http://underscorejs.org|underscore} and {@link http://jquery.com|jQuery} or {@link http://zeptojs.com|Zepto}.
*
* @constructs SizableView
* @extends Backbone.View
* @returns {SizableView} A new SizableView object.
*/
var SizableView = function () {
    /**
    * @lends SizableView.prototype
    */
    var instance = {};

    /**
    * Sets the height of the view.
    *
    * @param {number|string|Element} height - A number will be converted to pixels. A valid CSS string may also be used. If an Element is provided, the dimension will be sized to match the Element.
    * @returns {this} The view.
    */
    instance.setHeight = function (height) {
        if (_.isNumber(height)) {
            this.$el.height(height);
        }
        else if (_.isElement(height)) {
            this.$el.height(height.clientHeight);
        }
        else if (_.isFunction(height)) {
            this.$el.height(height());
        }
        
        return this;
    };

    /**
    * Sets the width of the view.
    *
    * @param {number|string|Element} width - A number will be converted to pixels. A valid CSS string may also be used. If an Element is provided, the dimension will be sized to match the Element.
    * @returns {this} The view.
    */
    instance.setWidth = function (width) {
        if (_.isNumber(width)) {
            this.$el.width(width);
        }
        else if (_.isElement(width)) {
            this.$el.width(width.clientWidth);
        }
        else if (_.isFunction(width)) {
            this.$el.width(width());
        }
        
        return this;
    };

    return instance;
};

/**
* @namespace constants
*/
var constants = {
    /**
    * @namespace
    * @memberof constants
    */
    defaults: {
        /**
        * @readonly
        * @constant {number}
        * @default
        */
        PIXEL_PRECISION: 2,
        TRANSITION: {
            /**
            * @readonly
            * @constant {string}
            * @default
            */
            DELAY: '0s',
            /**
            * @readonly
            * @constant {string}
            * @default
            */
            DURATION: '500ms',
            PROPERTY: 'transform',
            /**
            * @readonly
            * @constant {string}
            * @default
            */
            TIMING_FUNCTION: 'ease-out'
        }
    },
    /**
    * Enum for zoom direction.
    * @enum {number}
    * @memberof constants
    */
    zoom: {
        /**
        * Zoom in.
        * @readonly
        */
        IN: 1,
        /**
        * Zoom out.
        * @readonly
        */
        OUT: 0
    }
};

/**
* Factory: Creates a CameraView's model.
* Requires {@link http://lodash.com|lodash} or {@link http://underscorejs.org|underscore} and {@link http://jquery.com|jQuery} or {@link http://zeptojs.com|Zepto}.
*
* @constructs CameraModel
* @extends Backbone.Model
* @param {Object} [options] - An object of options. See {@link http://backbonejs.org/#Model|Backbone.Model}.
* @param {number} [options.increment] - The base {@link CameraModel.defaults.increment|scale increment}.
* @param {number} [options.minScale] - The {@link CameraModel.defaults.minScale|minimum scale}.
* @param {number} [options.maxScale] - The {@link CameraModel.defaults.maxScale|maximum scale}.
* @param {Object} [options.transition] - The default transition. A {@link CameraModel.defaults.transition|transition} object.
* @param {Object} [options.state] - The starting state. A camera {@link CameraModel.defaults.state|state} object.

* @returns {CameraModel} A new CameraModel object.
*/
var CameraModel = function (options) {
    /**
    * @lends CameraModel.prototype
    */
    let prototype = {
        /**
        * The default camera properties.
        * @namespace CameraModel.defaults
        */
        defaults: {
            /**
            * The base increment at which the content will be scaled.
            * @property {number} - See {@link CameraModel.defaults.state.scale|scale}.
            * @memberOf CameraModel.defaults
            * @default
            */
            increment: 0.02,
            /**
            * The minimum value the content can be scaled.
            * @property {number} - See {@link CameraModel.defaults.state.scale|scale}.
            * @memberOf CameraModel.defaults
            * @default
            */
            minScale: 0.25,
            /**
            * The maximum value the content can be scaled.
            * @property {number} - See {@link CameraModel.defaults.state.scale|scale}.
            * @memberOf CameraModel.defaults
            * @default
            */
            maxScale: 6.0,
            /**
            * The default transition.
            * @property {Object} - An object of transition properties.
            * @memberOf CameraModel.defaults
            * @namespace CameraModel.defaults.transition
            */
            transition: {
                /**
                * The default transition delay.
                * @property {string} - A valid CSS transition-delay value.
                * @memberOf CameraModel.defaults.transition
                * @default
                */
                delay: '0s',
                /**
                * The default transition duration.
                * @property {string} - A valid CSS transition-duration value.
                * @memberOf CameraModel.defaults.transition
                * @default
                */
                duration: '500ms',
                /**
                * The default transition property.
                * @private
                * @property {string} - A valid CSS transition-property value.
                * @memberOf CameraModel.defaults.transition
                * @default
                */
                property: 'transform',
                /**
                * The default transition timing function.
                * @property {string} - A valid CSS transition-timing-function value.
                * @memberOf CameraModel.defaults.transition
                * @default
                */
                timingFunction: 'ease-out'
            },
            /**
            * The camera's current state.
            * @property {Object} - An object of camera state properties.
            * @memberOf CameraModel.defaults
            * @namespace CameraModel.defaults.state
            */
            state: {
                /**
                * The current scale.
                * @property {number} - A scale ratio where 1 = 100%;
                * @memberOf CameraModel.defaults.state
                * @default
                */
                scale: 1,
                /**
                * The current focus.
                * @property {Object|Element} - An 'x' {number}, 'y' {number} pixel coordinate object or an Element.
                * @memberOf CameraModel.defaults.state
                * @default
                */
                focus: {
                    x: 501,
                    y: 251
                },
                /**
                * The current transition.
                * @property {Object} - A camera {@link CameraModel.defaults.transition|transition} object.
                * @memberOf CameraModel.defaults.state
                * @default See {@link CameraModel.defaults.transition|transition}.
                */
                transition: {
                    delay: '0s',
                    duration: '500ms',
                    property: 'transform',
                    timingFunction: 'ease-out'
                }
            }
        },
        
        /**
        * Sets the camera's state.
        *
        * @param {Object} [state] - A camera {@link CameraModel.defaults.state|state} object.
        * @param {Object} [transition] - A camera {@link CameraModel.defaults.transition|transition} object.
        */
        setState: function (state, transition) {
            console.log('state set');
            instance.set({
                state: Object.assign({}, 
                    instance.get('state'), 
                    _.pick(state, ['scale', 'focus']),
                    { transition: _.pick(transition, ['delay', 'duration', 'timingFunction']) })
            });
        }
    };
    
    // Compose the object.
    let instance = Object.create(Object.assign(
        Backbone.Model.prototype, 
        prototype
    ));

    Backbone.Model.call(instance, options);

    return instance;
};

/**
* Factory: Creates a camera to pan and zoom content.
* Requires {@link http://lodash.com|lodash} or {@link http://underscorejs.org|underscore} and {@link http://jquery.com|jQuery} or {@link http://zeptojs.com|Zepto}.
* 
* @constructs CameraView
* @extends Backbone.View
* @extends SizableView
* @param {Object} [options] - An object of options. Includes all Backbone.View options. See {@link http://backbonejs.org/#View|Backbone.View}.
* @param {CameraModel} [options.model] - The view's model.
* @param {number|string|Element} [options.width] - The view's width. See {@link SizableView#setWidth|SizableView.setWidth}.
* @param {number|string|Element} [options.height] - The view's height. See {@link SizableView#setHeight|SizableView.setHeight}.
* @returns {CameraView} The newly created CameraView object.
*/
var CameraView = function (options) {
    /**
    * @lends CameraView.prototype
    */
    let prototype = {
        /**
        * Get the x/y offset in order to focus on a specific point.
        *
        * @private
        * @param {Object|Element} focus - A camera {@link CameraModel.defaults.state.focus|focus} object.
        * @param {number} scale - A {@link CameraModel.defaults.state.scale|scale} ratio.
        * @returns {Object} The focal offset: an 'x' {number}, 'y' {number} pixel coordinate object.
        */
        _getFocalOffset: function (focus, scale) {
            let offset = {};
            let position;
            let frameCenterX = instance.el.getBoundingClientRect().width / 2;
            let frameCenterY = instance.el.getBoundingClientRect().height / 2;

            if (_.isElement(focus)) {
                // TODO: Handle Element
                position = {
                    x: 0, // TODO: logic to get centerX of element
                    y: 0  // TODO: logic to get centerY of element
                };
            }
            else {
                position = focus;
            }

            // TODO: handle setup of 'position' better so _.isFinite check isn't necessary here.
            if (_.isFinite(position.x) && _.isFinite(position.y)) {
                offset.x = frameCenterX + (position.x * scale * -1);
                offset.y = frameCenterY + (position.y * scale * -1);
            }

            return offset;
        },

        /**
        * Update camera to the current state.
        *
        * @private
        * @returns {CameraView} The view.
        */
        _update: function (model, value, options) {
            // TODO: Remove when development is complete
            console.log('_update');

            let focalOffset = instance._getFocalOffset(value.focus, value.scale);

            utils.setCssTransition(instance.content, value.transition);
            utils.setCssTransform(instance.content, {
                scale: value.scale,
                translateX: focalOffset.x,
                translateY: focalOffset.y
            });

            return instance;
        },
        
        /**
        * Focus the camera on a specific point.
        *
        * @param {Object|Element} focus - A camera {@link CameraModel.defaults.state.focus|focus} object.
        * @param {Object} [transition] - A camera {@link CameraModel.defaults.transition|transition} object.
        * @returns {CameraView} The view.
        */
        focus: function (focus, transition) {
            transition = transition || {};

            instance.model.setState({
                focus: focus
            }, transition);

            return instance;
        },

        /**
        * Called on the view instance when the view has been initialized.
        *
        * @returns {CameraView} The view.
        */
        onInitialize: function () {

            return instance;
        },

        /**
        * Zoom in/out at the current focus.
        *
        * @param {number} scale - A {@link CameraModel.defaults.state.scale|scale} ratio.
        * @param {Object} [transition] - A camera {@link CameraModel.defaults.transition|transition} object.
        * @returns {CameraView} The view.
        */
        zoom: function (scale, transition) {
            transition = transition || {};

            instance.model.setState({
                scale: scale
            }, transition);

            return instance;
        },

        /**
        * Zoom in/out at a specific point.
        *
        * @param {number} scale - A {@link CameraModel.defaults.state.scale|scale} ratio.
        * @param {Object|Element} focus - A camera {@link CameraModel.defaults.state.focus|focus} object.
        * @param {Object} [transition] - A camera {@link CameraModel.defaults.transition|transition} object.
        * @returns {CameraView} The view.
        */
        zoomAt: function (scale, focus, transition) {
            transition = transition || {};

            let state = instance.model.get('state');
            // TODO: Decide whether to use separate x/y variables or objects that have x/y properties.
            let deltaX = state.focus.x - focus.x;
            let deltaY = state.focus.y - focus.y;
            let scaleRatio = state.scale / scale;
            let newFocalPoint = {
                x: _.round(state.focus.x - deltaX + (deltaX * scaleRatio), constants.defaults.PIXEL_PRECISION),
                y: _.round(state.focus.y - deltaY + (deltaY * scaleRatio), constants.defaults.PIXEL_PRECISION)
            };

            instance.model.setState({
                scale: scale,
                focus: newFocalPoint
            }, transition);

            return instance;
        },

        /**
        * Zoom in/out and focus the camera on a specific point.
        *
        * @param {number} scale - A {@link CameraModel.defaults.state.scale|scale} ratio.
        * @param {Object|Element} focus - A camera {@link CameraModel.defaults.state.focus|focus} object.
        * @param {Object} [transition] - A camera {@link CameraModel.defaults.transition|transition} object.
        * @returns {CameraView} The view.
        */
        zoomTo: function (scale, focus, transition) {
            transition = transition || {};

            instance.model.setState({
                scale: scale,
                focus: focus
            }, transition);

            return instance;
        }
    };
    
    // Compose the object.
    let instance = Object.create(Object.assign(
        {},
        Backbone.View.prototype, 
        SizableView(), 
        prototype
    ));

    Object.assign(instance, options);

    instance.initialize = function () {
        instance.listenTo(instance.model, 'change:state', instance._update);
        
        if (instance.template) {
            instance.el.innerHTML = instance.template();
        }
        instance.content = instance.el.querySelector(':first-child');
        instance.content.setAttribute('draggable', false);
        
        instance.render();
        instance.onInitialize();
        
        return instance;
    };

    instance.render = function () {
        instance.setWidth(instance.width);
        instance.setHeight(instance.height);
        
        return instance;
    };

    instance.events = function () {
        return {
            'click'      : '_onClick',
            'mouseenter' : '_onMouseEnter',
            'mousedown'  : '_onMouseDown',
            'mouseleave' : '_onMouseLeave',
            'mousemove'  : '_onMouseMove',
            'mouseup'    : '_onMouseUp',
            'wheel'      : utils.throttleToFrame(instance._onWheel)
        };
    };

    // TODO: Refactor/clean up and move into prototype
    /**
    * Handle click event.
    *
    * @private
    * @param {MouseEvent} event - The mouse event.
    */
    instance._onClick = function (event) {
        console.log({ 
            x: event.clientX - instance.content.getBoundingClientRect().left + window.scrollX,
            y: event.clientY - instance.content.getBoundingClientRect().top + window.scrollX
        });
    };

    // TODO: Refactor/clean up and move into prototype
    /**
    * Prevent mousemove event from doing anything.
    *
    * @private
    */
    instance._stop = function () {
        instance.isActive = false;
    };

    // TODO: Refactor/clean up and move into prototype
    /**
    * Handle mousedown event.
    *
    * @private
    * @param {MouseEvent} event - The mouse event.
    */
    instance._onMouseDown = function (event) {
        //console.log(instance.el.getBoundingClientRect());
        //console.log('top: ', instance.el.getBoundingClientRect().top + window.scrollY);
        instance.moveStartX = event.clientX;
        instance.moveStartY = event.clientY;
        instance.contentStartX = instance.content.getBoundingClientRect().left + window.scrollX - instance.el.getBoundingClientRect().left + window.scrollX;
        instance.contentStartY = instance.content.getBoundingClientRect().top + window.scrollY - instance.el.getBoundingClientRect().top + window.scrollY;

        instance.isActive = true;

        //console.log('scrollTop: ', instance.el.scrollTop);
        //console.log('scrollLeft: ', instance.el.scrollLeft);
        //console.log('scrollWidth: ', instance.el.scrollWidth);
        //console.log('scrollHeight: ', instance.el.scrollHeight);
        //console.log('eventX: ', event.clientX);
        //console.log('eventY: ', event.clientY);
        //console.log('elX: ', instance.el.getBoundingClientRect());
        //console.log('elY: ', instance.el.getBoundingClientRect());
        //console.log('mouse startX: ', instance.startX);
        //console.log('mouse startY: ', instance.startY);
        //console.log('content startX: ', instance.content.getBoundingClientRect().left - instance.el.getBoundingClientRect().left);
        //console.log('content startY: ', instance.content.getBoundingClientRect().top - instance.el.getBoundingClientRect().top);
    };

    // TODO: Refactor/clean up and move into prototype
    /**
    * Handle mouseenter event.
    *
    * @private
    * @param {MouseEvent} event - The mouse event.
    */
    instance._onMouseEnter = function (event) {
        document.querySelector('body').style.overflow = 'hidden';
    };

    // TODO: Refactor/clean up and move into prototype
    /**
    * Handle mouseleave event.
    *
    * @private
    * @param {MouseEvent} event - The mouse event.
    */
    instance._onMouseLeave = function (event) {
        instance._stop();
        // TODO: Instead of reverting to 'auto' remove the inline style rule to let any applied stylesheet rule kick in. 
        document.querySelector('body').style.removeProperty('overflow');
    };

    // TODO: Refactor/clean up and move into prototype
    /**
    * Handle mousemove event.
    *
    * @private
    * @param {MouseEvent} event - The mouse event.
    */
    instance._onMouseMove = function (event) {
        // TODO: Refactor. Add drag-ability of content when zoomed in/out.
        if (instance.isActive) {
            console.log('move');
            // Handle vertical bounds
            if (instance.contentStartX + event.clientX - instance.moveStartX < 0) {
                instance.content.style.left = (instance.contentStartX + event.clientX - instance.moveStartX) + 'px';
            }
            if (instance.contentStartX + event.clientX - instance.moveStartX >= 0) {
                instance.moveStartX = event.clientX;
                instance.contentStartX = 0;
                instance.content.style.left = 0 + 'px';
            }
            if (instance.contentStartX + event.clientX - instance.moveStartX <= instance.el.clientWidth - instance.content.getBoundingClientRect().width) {
                instance.moveStartX = event.clientX;
                instance.contentStartX = instance.el.clientWidth - instance.content.getBoundingClientRect().width;
                instance.content.style.left = instance.el.clientWidth - instance.content.getBoundingClientRect().width + 'px';
            }

            // Handle horizontal bounds
            if (instance.contentStartY + event.clientY - instance.moveStartY < 0) {
                instance.content.style.top = (instance.contentStartY + event.clientY - instance.moveStartY) + 'px';
            }
            if (instance.contentStartY + event.clientY - instance.moveStartY >= 0) {
                instance.moveStartY = event.clientY;
                instance.contentStartY = 0;
                instance.content.style.top = 0 + 'px';
            }
            if (instance.contentStartY + event.clientY - instance.moveStartY <= instance.el.clientHeight - instance.content.getBoundingClientRect().height) {
                instance.moveStartY = event.clientY;
                instance.contentStartY = instance.el.clientHeight - instance.content.getBoundingClientRect().height;
                instance.content.style.top = instance.el.clientHeight - instance.content.getBoundingClientRect().height + 'px';
            }
        }
    };

    // TODO: Refactor/clean up and move into prototype
    /**
    * Handle mouseup event.
    *
    * @private
    * @param {MouseEvent} event - The mouse event.
    */
    instance._onMouseUp = function (event) {
        instance._stop();
    };

    // TODO: Refactor/clean up and move into prototype
    /**
    * Handle wheel event.
    *
    * @private
    * @param {WheelEvent} event - The wheel event.
    */
    instance._onWheel = function (event) {
        event.preventDefault();
        instance._wheelZoom(event);
    };

    // TODO: Refactor/clean up and move into prototype
    /**
    * Zoom in/out based on wheel input.
    *
    * @private
    * @param {MouseEvent} event - A MouseEvent object.
    */
    instance._wheelZoom = function (event) {
        // TODO: Figure out current scale and offset and set them here to stop the transition at this point in time.
        // Then add a transition duration to smooth out the zoom.
        if (event.deltaY) {
            var _precision = constants.defaults.PIXEL_PRECISION;
            var _direction = null;
            var _delta = 0;
            var _scale = instance.model.get('state').scale;
            var _newScale = _scale;
            var _increment = instance.model.get('increment');
            var _min = instance.model.get('minScale');
            var _max = instance.model.get('maxScale');
            var _originX = (event.clientX - instance.content.getBoundingClientRect().left) / _scale;
            var _originY = (event.clientY - instance.content.getBoundingClientRect().top) / _scale;

            if (event.deltaY) {
                _direction = event.deltaY > 0 ? constants.zoom.OUT : constants.zoom.IN;
            } 
            else if (event.wheelDelta) {
                _direction = event.deltaY > 0 ? constants.zoom.OUT : constants.zoom.IN;
            } 
            else if (event.detail) {
                _direction = event.detail > 0 ? constants.zoom.OUT : constants.zoom.IN;
            }

            // TODO: Use of '_delta' and 'increment' are sloppy and confusing. Clean up.
            // Limit max zoom speed
            _delta = Math.min(Math.abs(event.deltaY), 10) * (_direction === constants.zoom.IN ? 1 : -1);
            console.log(_delta);

            // TODO: Calculate a smoother progressive zoom increment: see https://github.com/fengyuanchen/viewerjs/blob/master/src/js/methods.js "zoom" method
            if (_scale <= 2) {
                _increment = _.round(_increment * _scale, _precision);
            }
            else {
                _increment = _.round(_increment + (Math.round(_scale) / 100), _precision);
            }

            console.log('zIncrement: ', _increment);

            // Determine zoom
            _newScale = _.round(_scale + _increment * _delta, _precision);

            if (_newScale < _min) {
                _newScale = _min;
            }
            else if (_newScale > _max) {
                _newScale = _max;
            }

            if (_scale !== _newScale) {
                instance.zoomAt(_newScale, {
                    x: _originX,
                    y: _originY
                }, {
                    duration: '0s'
                });
                
            }
        }
    };

    Backbone.View.call(instance, options);

    return instance;
};