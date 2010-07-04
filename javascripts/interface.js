var Page = Class.create({  
  number : 0,   
  total : -1,
  element : false,
  initialize : function(a) {
    this.element = a;
    this.pages = this.element.select('div.page');
    this.total = this.pages.length;
  },      
  goto : function(number) {
    this.number = number;
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
	container_x : 0,
	container_target_x : 0,	
	cancelLimit : -1,
	defaultCancelLimitLarge : 600,
	container_width : 768,
	defaultCancelLimit : 300,
	rightLimit : -1,
	element : false,
	page : false,
	is_touching : false,
	animation_timer : false,
	frame_rate : 1000/30,
	initialize : function(a) {
		this.cancelLimit = this.defaultCancelLimit;
		this.element = a;
    this.page = new Page(a);
		this.element.style.webkitTransform = "translate3d(0, 0, 0)";
		this.rightLimit = this.container_width * (this.page.total - 1);
		this.element.observe("touchstart", this.onStart.bind(this));
		this.element.observe("touchmove", this.onMove.bind(this));
		this.element.observe("touchend", this.onEnd.bind(this));
		this.element.observe("touchcancel", this.onEnd.bind(this));		
		this.runTimer(this);
	},
	runTimer : function() {
	  if (!this.is_touching && this.container_x !== this.container_target_x) {
      if (Math.abs(this.container_x - this.container_target_x) <= 0.5 ) {        
        this.container_x = this.container_target_x;
      }
      this.container_x -= ( ( this.container_x - this.container_target_x ) / 6 );
      this.element.style.webkitTransform = "translate3d(" + this.container_x + "px, 0, 0)";      
	  }	  
	  setTimeout( function(t) { t.runTimer(); } , this.frame_rate, this);
	},
	setTargetToPage : function() {
	  this.container_target_x = this.page.number * -this.container_width;
	  console.log(this.container_target_x);
	  console.log(this.is_touching);
	},
	slideToPage : function(number) {
	  this.page.goto(number);
	  this.setTargetToPage();
	},
	slideNext : function() {
	  this.page.next();
	  this.setTargetToPage();
	},
	slidePrevious : function() {
	  this.page.previous();
	  this.setTargetToPage();
	},
	onStart : function(a) {
		if (a.touches.length === 1) {		
		  this.is_touching = true;  
			this.startingPosition = this.page.number * -this.container_width;
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
				this.container_x += this.touchmove.x;
				if (this.container_x < 0 && this.container_x >= -this.rightLimit) {
          this.element.style.webkitTransform = "translate3d(" + this.container_x + "px, 0, 0)";
				} else {
					this.cancelEvent = true;
					this.container_x = this.container_x >= 0 ? 0 : -this.rightLimit;
				}
			}
		}
	},
	onEnd : function(a) {
	  this.is_touching = false;
		if (this.touchstart.x !== false && this.touchend.x !== false) {		  
			this.touchdiffx = this.touchend.x - this.touchstart.x;
			this.element.removeClassName("dragging");
			if (Math.abs(this.touchdiffx) <= this.cancelLimit) {
				a.stop();
				this.container_target_x = this.startingPosition;
			} else {
				if (!this.cancelEvent) {
					if (this.touchdiffx > 0) {
					  this.page.previous();            
					} else {
					  this.page.next();            
					}
					this.setTargetToPage();            
				} else {
					this.container_target_x = this.startingPosition;
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