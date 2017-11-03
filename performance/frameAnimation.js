/* eslint no-magic-numbers:0 */
/* polyfill */
function RAF() {
    let lastTime = 0;
    const vendors = ['ms', 'moz', 'webkit', 'o'];
    for (let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            let currTime = new Date().getTime();
            let timeToCall = Math.max(0, 16 - (currTime - lastTime));
            let id = window.setTimeout(function() { callback(currTime + timeToCall) }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
}
RAF();

const STANDARDFPS = 60;
const SECOND = 1000;

class FrameAnimate {

    constructor(canvas, opts, callback) {
        this.canvas = canvas;

        this.screenWith = window.screen.availWidth;
        this.screenHeight = window.screen.availHeight;
        this.width = opts.width || window.screen.availWidth;
        this.height = opts.height || window.screen.availHeight;
        this.frame = opts.frame;
        this.fps = opts.fps || STANDARDFPS;
        this.loop = opts.loop || 1;
        this.pixelRatio = opts.pixelRatio || 1;
        this.source = opts.source;
        this.singleMode = opts.singleMode || false;
        this.config = opts.config;
        this.callback = callback;
        this.parallel = opts.parallel;

        this.timer;
        this.start = null;
        this.onloadLength = 0;
        this.currentFrame = 0;
        this.picNum = opts.singleMode ? 1 : opts.frame;
        this.frameArray = [];

        this.init();
    }

    init() {
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d');
        this.loadResource(this.singleMode);
    }

    loadResource(single) {
        if (single) {
            console.log('single mode');
            this._img = new Image();
            this._img.src = this.source[0];
            this._img.onload = () => {
                // normal single model and config single model
                if (this.config) {
                    for (let i = 0; i < this.config.length; i++) {
                        this.frameArray.push(this.config[i]);
                    }
                    this.onloadLength++;
                    this.frame = this.config.length;
                    // debugger
                } else {
                    const img_WIDTH = this._img.width / this.width;
                    const img_HEIGHT = this._img.height / this.height;
                    for (let i = 0; i < img_HEIGHT; i++) {
                        for (let j = 0; j < img_WIDTH; j++) {
                            this.frameArray.push({
                                x: (j % img_WIDTH) * this.width,
                                y: i * this.height
                            });
                        }
                    }
                    this.onloadLength++;
                    this.frame = img_HEIGHT * img_WIDTH;
                }
            };
        } else {
            console.log('frame mode');
            for (let i = 0; i < this.frame; i++) {
                let _img = new Image();
                _img.src = this.source[i];

                _img.onload = () => {
                    this.onloadLength++;
                    this.frameArray.push(_img);
                };
            }
        }
    }

    play(n = 0) {
        this.pause();
        n && (this.currentFrame = n);
        if (this.onloadLength < this.picNum) {
            this.checkLoad(n);
        } else {
            this.parallel && this.parallel();
            this.canvas.style.backgroundImage = 'none';
            window.requestAnimationFrame(this.draw.bind(this));
        }
    }

    drawOneFrame(nth) {
        this.pause();
        this.currentFrame = nth;
        if (this.onloadLength < this.frame) {
            this.checkLoad(nth, false);
        } else {
            this.canvas.style.backgroundImage = 'none';
            this.oneFrame = true;
            this.draw(nth);
        }
    }

    checkLoad(n = 0, autoPlay = true) {
        this.timer = setInterval(() => {
            if (this.onloadLength === this.picNum) {
                clearInterval(this.timer);
                if (autoPlay) {
                    this.play(n);
                } else {
                    this.drawOneFrame(n);
                }
            }
        }, SECOND / this.fps);
    }

    draw(timestamp, func) {
        !this.start && (this.start = timestamp);

        // 如果没有限定帧率，使用 RAF 自有发挥
        let raf = this.fps === STANDARDFPS ? true : (timestamp - this.start > SECOND / this.fps);
        if (raf || this.oneFrame) {
            this.ctx.clearRect(0, 0, this.width, this.height);
            const f = this.frameArray[this.currentFrame];
            const { x, y, w = this.width, h = this.height, offX = 0, offY = 0, sW = this.width, sH = this.height } = f;
            if (this.singleMode) {
                const dx = offX * (this.width / sW);
                const dy = offY * (this.height / sH);
                const dw = w * (this.width / sW);
                const dh = h * (this.height / sH);
                this.ctx.drawImage(this._img, x, y, w, h, dx, dy, dw, dh);
            } else {
                let pic_width = parseInt(f.width / 2, 10);
                let pic_height = parseInt(f.height / 2, 10);
                this.ctx.drawImage(f, (this.width - pic_width) / 2, (this.height - pic_height) / 2, pic_width, pic_height);
            }
            this.start = timestamp;
            this.currentFrame++;
        }

        // 只绘制指定一帧
        if (this.oneFrame) {
            return;
        }

        func && func();

        if (this.currentFrame === this.frame - 1) {
            this.currentFrame = 0;
            if (typeof this.loop === 'number') {
                this.loop--;
                if (this.loop === 0) {
                    this.pause();
                    this.callback && this.callback();
                    return;
                }
            } else if (this.loop === 'infinity') {
                this.rafTimer = window.requestAnimationFrame(this.draw.bind(this));
            } else {
                this.pause();
                this.callback && this.callback();
                return;
            }
        } else {
            this.rafTimer = window.requestAnimationFrame(this.draw.bind(this));
        }
    }

    replay() {
        this.pause();
        this.play(0);
    }

    stop() {
        this.pause();
        this.play(this.frame - 1);
    }

    pause() {
        this.timer && clearInterval(this.timer);
        this.rafTimer && window.cancelAnimationFrame(this.rafTimer);
    }
}