/* ===== 背景模块 ===== */
;(function() {
    var canvas = document.getElementById('geoBg');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W, H;
    var shapes = [];

    function resize() {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W;
        canvas.height = H;
    }

    function rand(a, b) { return a + Math.random() * (b - a); }

    var blues = ['#1a73e8','#4285f4','#5b9cf6','#7bb3f7','#a8c7fa','#1565c0','#1976d2','#2196f3'];

    function createShape() {
        var type = ['circle','triangle','hexagon','diamond','rect'][Math.floor(Math.random() * 5)];
        var size = rand(30, 90);
        var x = rand(-size, W + size);
        var y = rand(-size, H + size);
        return {
            type: type,
            x: x,
            y: y,
            size: size,
            rotation: rand(0, Math.PI * 2),
            rotSpeed: rand(-0.005, 0.005),
            dx: rand(-0.15, 0.15),
            dy: rand(-0.15, 0.15),
            color: blues[Math.floor(Math.random() * blues.length)],
            alpha: rand(0.15, 0.4),
            lineWidth: rand(1, 2.5)
        };
    }

    function drawShape(s) {
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rotation);
        ctx.strokeStyle = s.color;
        ctx.globalAlpha = s.alpha;
        ctx.lineWidth = s.lineWidth;

        ctx.beginPath();
        if (s.type === 'circle') {
            ctx.arc(0, 0, s.size / 2, 0, Math.PI * 2);
        } else if (s.type === 'triangle') {
            var r = s.size / 2;
            for (var i = 0; i < 3; i++) {
                var a = (i * 2 * Math.PI / 3) - Math.PI / 2;
                var px = r * Math.cos(a);
                var py = r * Math.sin(a);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
        } else if (s.type === 'hexagon') {
            var r = s.size / 2;
            for (var i = 0; i < 6; i++) {
                var a = i * Math.PI / 3 - Math.PI / 6;
                var px = r * Math.cos(a);
                var py = r * Math.sin(a);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
        } else if (s.type === 'diamond') {
            var r = s.size / 2;
            ctx.moveTo(0, -r);
            ctx.lineTo(r, 0);
            ctx.lineTo(0, r);
            ctx.lineTo(-r, 0);
            ctx.closePath();
        } else if (s.type === 'rect') {
            var r = s.size / 2;
            ctx.rect(-r, -r, s.size, s.size);
        }
        ctx.stroke();
        ctx.restore();
    }

    function update() {
        for (var i = 0; i < shapes.length; i++) {
            var s = shapes[i];
            s.x += s.dx;
            s.y += s.dy;
            s.rotation += s.rotSpeed;
            var margin = s.size * 2;
            if (s.x > W + margin) s.x = -margin;
            if (s.x < -margin) s.x = W + margin;
            if (s.y > H + margin) s.y = -margin;
            if (s.y < -margin) s.y = H + margin;
        }
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < shapes.length; i++) {
            drawShape(shapes[i]);
        }
    }

    function loop() {
        update();
        draw();
        requestAnimationFrame(loop);
    }

    function initShapes() {
        shapes = [];
        var count = Math.max(15, Math.floor((W * H) / 12000));
        for (var i = 0; i < count; i++) {
            shapes.push(createShape());
        }
    }

    function onResize() {
        resize();
        initShapes();
    }

    resize();
    initShapes();
    loop();

    window.addEventListener('resize', onResize);
})();