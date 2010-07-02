var Page = Class.create({  
  number : 0, 
  container_width : 980,
  initialize : function(a) {
    this.element = a;
    this.pages = this.element.select('div.page');
    this.total = this.pages.length;
  },      
  goto : function(number) {
    lpos = -(number * this.container_width);
    this.element.style.webkitTransform = "translate3d(" + lpos + "px, 0, 0)";
  },
  restart : function() {
    this.number = 0;
    this.goto(this.number);
  },
  next : function() {
    this.number += 1;
    if (this.number >= this.total) {
      this.restart();
    } else {
      this.goto(this.number);
    }
  },
  previous : function() {
    this.number -= 1;
    if (this.number < 0) {
      this.number = 0;
    } else {
      this.goto(this.number);      
    }
  }
});

var TrackTouchMove = Class.create( {
	touchstart : {
		x : false,
		y : false
	},
	touchmove : {
		x : false,
		y : false
	},
	touchend : {
		x : false,
		y : false
	},
	translatePos : 0,
	defaultCancelLimit : 30,
	defaultCancelLimitLarge : 100,
	rightLimit : 980 * 3,
	initialize : function(a) {
		this.cancelLimit = this.defaultCancelLimit;
		this.element = a;
    this.page = new Page(a);
		this.element.style.webkitTransform = "translate3d(0, 0, 0)";
		this.element.observe("touchstart", this.onStart.bind(this));
		this.element.observe("touchmove", this.onMove.bind(this));
		this.element.observe("touchend", this.onEnd.bind(this));
		this.element.observe("touchcancel", this.onEnd.bind(this));
	},
	onStart : function(a) {
		if (a.touches.length === 1) {		  
		  console.log("starpos: " + this.startPosition);
			this.startingPosition = this.page.number * -980;
			this.touchstart.x = a.touches[0].clientX;
			this.touchstart.y = a.touches[0].clientY;
			this.element.addClassName("dragging");
		}
	},
	onMove : function(d) {
		if (d.touches.length === 1 && !this.cancelX) {
			var b = d.touches[0].clientX;
			this.touchmove.x = (this.touchend.x !== false) ? b - this.touchend.x : b - this.touchstart.x;
			this.touchend.x = b;
			var a = d.touches[0].clientY;
			this.touchmove.y = (this.touchend.y !== false) ? a - this.touchend.y : a - this.touchstart.y;
			this.touchend.y = a;
			if (Math.abs(this.touchmove.y) <= 5) {
				d.stop();
			} else {
				if (Math.abs(this.touchmove.y) > (Math.abs(this.touchmove.x) + 70)) {
					this.cancelX = true;
				}
			}
			var c = Math.abs(b - this.touchstart.x);
			if (c > this.defaultCancelLimitLarge) {
				this.cancelLimit = this.defaultCancelLimitLarge;
			}
			if (!isNaN(this.touchmove.x)) {
				this.translatePos += this.touchmove.x;
				if (this.translatePos < 0 && this.translatePos >= -this.rightLimit) {
          this.element.style.webkitTransform = "translate3d(" + this.translatePos + "px, 0, 0)";
				} else {
					this.cancelEvent = true;
					this.translatePos = this.translatePos >= 0 ? 0 : -this.rightLimit;
				}
			}
		}
	},
	onEnd : function(a) {
		if (this.touchstart.x !== false && this.touchend.x !== false) {
			this.touchdiffx = this.touchend.x - this.touchstart.x;
			this.element.removeClassName("dragging");
			if (Math.abs(this.touchdiffx) <= this.cancelLimit) {
				a.stop();
				this.translatePos = this.startingPosition;
				this.element.style.webkitTransform = "translate3d(" + this.startingPosition + "px, 0, 0)";
			} else {
				if (!this.cancelEvent) {
					if (this.touchdiffx > 0) {
					  this.page.previous();
            this.translatePos = this.page.number * -980;            
					} else {
					  this.page.next();
            this.translatePos = this.page.number * -980;
					}
				} else {
					this.translatePos = this.startingPosition;
					this.element.style.webkitTransform = "translate3d(" + this.startingPosition + "px, 0, 0)";
				}
			}
		}
		this.touchstart.x = false;
		this.touchmove.x = false;
		this.touchend.x = false;
		this.cancelEvent = false;
		this.cancelX = false;
		this.cancelLimit = this.defaultCancelLimit;
	}
});