/* polyfill */
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

class FrameAnimate {

    constructor(canvas, opts, callback) {
        this.canvas = canvas;

        this.screenWith = window.screen.availWidth;
        this.screenHeight = window.screen.availHeight;
        this.width = opts.width || window.screen.availWidth;
        this.height = opts.height || window.screen.availHeight;
        this.frame = opts.frame;
        this.fps = opts.fps || 60;
        this.loop = opts.loop || 1;
        this.pixelRatio = opts.pixelRatio || 1;
        this.source = opts.source;
        this.singleMode = opts.singleMode || false;
        this.callback = callback;

        this.timer;
        this.start = null;
        this.onloadLength = 0;
        this.currentFrame = 0;
        this.picNum = opts.singleMode ? 1 : opts.frame;
        this.frameArray = [];

        this.init();
    }

    init() {
        this.canvas.width = this.screenWith;
        this.canvas.height = this.screenHeight;
        this.ctx = this.canvas.getContext('2d');
        this.loadResource(this.singleMode);
    }

    loadResource(single) {
        if(single) {
            console.log('single mode');
            this._img = new Image();
            this._img.src = this.source[0];
            this._img.onload = () => {
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
            };
        }else {
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

    play() {
        this.pause();
        if (this.onloadLength < this.picNum) {
            this.checkLoad('play');
        } else {
            window.requestAnimationFrame(this.draw.bind(this));
        }
    }

    checkLoad(next, n) {
        this.timer = setInterval(() => {
            if (this.onloadLength === this.picNum) {
            console.log("pics load complete");
                clearInterval(this.timer);
                switch (next) {
                    case 'draw':
                        this.draw();
                        break;
                    case 'seekTo':
                        this.seekTo(n);
                        break;
                    default:
                        this.play();
                }
            }
        }, 1000 / this.fps);
    }

    draw(timestamp) {
        !this.start && (this.start = timestamp);

        // 如果没有限定帧率，使用 RAF 自有发挥
        let raf = this.fps === 60 ? true : (timestamp - this.start > 1000 / this.fps);
        
        if (raf) {
            this.ctx.clearRect(0, 0, this.width, this.height);
            const f = this.frameArray[this.currentFrame];
            const {x, y} = f;
            if (this.singleMode) {
                this.ctx.drawImage(this._img, x, y, this.width, this.height, (this.screenWith - this.width/2)/2, (this.screenHeight - this.height/2)/2, this.width/2, this.height/2);
            } else {
                let pic_width = parseInt(f.width / 2, 10);
                let pic_height = parseInt(f.height / 2, 10);
                this.ctx.drawImage(f, (this.width - pic_width) / 2, (this.height - pic_height) / 2, pic_width, pic_height);
            }
            this.start = timestamp;
            this.currentFrame++;
        }

        if (this.currentFrame === this.frame - 1) {
            this.currentFrame = 0;
            this.loop--;
            if (this.loop === 0) {
                this.pause();
                this.callback && this.callback();
            }
        } else {
            this.rafTimer = window.requestAnimationFrame(this.draw.bind(this));
        }
    }

    replay() {
        this.pause();
        this.seekTo(0);
        this.play();
    }

    stop() {
        this.pause();
        this.seekTo(this.frame - 1);
    }

    pause() {
        this.timer && clearInterval(this.timer);
        this.rafTimer && window.cancelAnimationFrame(this.rafTimer);
    }

    seekTo(n) {
        this.pause();
        this.currentFrame = n;
        if (this.onloadLength < this.frame) {
            this.checkLoad('seekTo', n);
        } else {
            this.draw();
        }
    }

}