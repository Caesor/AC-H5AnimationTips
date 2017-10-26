var windowHeight = window.screen.availHeight;
var windowWidth = window.screen.availWidth;
var FRAME = 20;
var NUM = 100;

// init dom constructure
var main = document.querySelector('#main');
var ul = document.createElement('ul');
var ulList = [];
main.appendChild(ul);
for( var i = 0; i < NUM; i++) {
    var each = document.createElement('li');
    each.style.display = 'block';
    each.style.width = '100px';
    each.style.height = '100px';
    each.style.position = 'absolute';
    each.style.top = '50%';
    each.style.left = '50%';
    each.style.marginLeft = '-50px';
    each.style.marginTop = '-50px';
    each.style.backgroundColor = ['red', 'yellow', 'green', 'blue'][(Math.floor(Math.random() * 10) + 1) % 4];
    ul.appendChild(each);
    ulList.push(each);
}
var startTime = Date.now();

// start DOM change animations
for( var j = 0; j < NUM; j++) {
    var element = ulList[j];
    (function(j, element, frame){
        let timer = null;

        function step(time) {
            frame++;
            var r = Math.random();
            var r1 = Math.random() * 2 - 1;
            var r2 = Math.random() * 2 - 1;
    
            element.style.opacity = r;
            
            element.style.transform = "scale(" + r + ") translate(" + windowWidth * r1 + "px, " + windowHeight * r2 + "px)";
            element.style.webkitTransform = "scale(" + r + ") translate(" + windowWidth * r1 + "px, " + windowHeight * r2 + "px)";
            element.style.MozTransform = "scale(" + r + ") translate(" + windowWidth * r1 + "px, " + windowHeight * r2 + "px)";
            element.style.msTransform = "scale(" + r + ") translate(" + windowWidth * r1 + "px, " + windowHeight * r2 + "px)";
            element.style.OTransform = "scale(" + r + ") translate(" + windowWidth * r1 + "px, " + windowHeight * r2 + "px)";
            
            if (frame >= FRAME) {
                clearInterval(timer);
                timer = null;

                if(j === NUM - 1){
                    var t = Date.now() - startTime;
                    var fps = 1000 * FRAME / t;
                    var score = Math.floor(10000 * fps / t)               
                    // console.log(document.querySelectorAll('ul li').length, t, fps, score);
                    document.querySelector('#result').innerHTML = "Num: " + NUM + " frame: " + frame + ", t: " + Math.round(t) + "ms , fps: " + Math.round(fps) + " score: " + score;
                }
            }
        }

        timer = setInterval(step, 1000/60);
    })(j, element, 0)   
}