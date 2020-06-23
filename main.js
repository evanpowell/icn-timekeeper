var cvs = document.getElementById('canvas')
var ctx = setUpCanvas();
ctx.lineWidth = 23;

function setUpCanvas () {
    // Get the device pixel ratio, falling back to 1.
    var dpr = window.devicePixelRatio || 1;

    // Get the size of the canvas in CSS pixels.
    var rect = cvs.getBoundingClientRect();

    // Give the canvas pixel dimensions of their CSS
    // size * the device pixel ratio.
    cvs.width = rect.width * dpr;
    cvs.height = rect.height * dpr;

    var ctx = canvas.getContext('2d');

    // Scale all drawing operations by the dpr, so you
    // don't have to worry about the difference.
    ctx.scale(dpr, dpr);

    return ctx;
}

/**
 * @closure
 */
var draw = (function () {
    var start = 1.5 * Math.PI; // Start circle from top
    var end = (2 * Math.PI) / 100; // One percent of circle

    /**
     * Draw percentage of a circle
     *
     * @param {number} r Radius
     * @param {number} p Percentage of circle
     * @param {string} c Stroke color
     * @return void
     */
    return function (r, p, c) {
        p = p || 100;
        ctx.strokeStyle = c;
        ctx.beginPath();
        ctx.arc(250, 250, r, start, p * end + start, false);
        ctx.stroke();
    };
}());

/**
 * @closure
 */
var drawFinisher = (function () {
    var start = 1.5 * Math.PI; // Start circle from top
    var end = (2 * Math.PI) / 100; // One percent of circle

    /**
     * Draw percentage of a circle
     *
     * @param {number} r Radius
     * @param {number} p Percentage of circle
     * @param {string} c Stroke color
     * @param {number} finalPercent final percent
     * @return void
     */
    return function (r, p, c, finalPercent) {
        var endOfPath = p * end + start;
        var newStart = start + (p / finalPercent) * 100 * end;
        ctx.strokeStyle = c;
        ctx.beginPath();
        ctx.arc(250, 250, r, newStart, endOfPath, false);
        ctx.stroke();
    };
}());

var clock = function () {
    requestAnimationFrame(clock);

    var date = new Date;
    var monthDayObj = getMonthAndDay();
    var month = monthDayObj.month;
    var day = monthDayObj.day;
    var h = date.getHours();
    var m = date.getMinutes();
    var s = date.getSeconds();
    var ms = date.getMilliseconds();
    // Calculate percentage to be drawn
    var minuteUnit = 60 * 1000;
    var hourUnit = 60 * minuteUnit;
    var dayUnit = 24 * hourUnit;
    var monthUnit = 28 * dayUnit;
    var yearUnit = 13 * monthUnit;

    // monthP, dayP, hp, mp, and sp are the percentages each path (100 is full circle)
    var monthP;
    var dayP;

    if (!month) {
        monthP = 0;
        dayP = 0;
    } else {
        monthP = 100 / yearUnit * (month * monthUnit + (day * dayUnit + (h * hourUnit + (m * minuteUnit) + (s * 1000) + ms)));
        dayP = 100 / monthUnit * (day * dayUnit + (h * hourUnit + (m * minuteUnit) + (s * 1000) + ms));
    }

    var hp = 100 / dayUnit * (h * hourUnit + (m * minuteUnit) + (s * 1000) + ms);
    var mp = 100 / hourUnit * (m * minuteUnit + (s * 1000) + ms);
    var sp = 100 / minuteUnit * (s * 1000 + ms);


    // Ensure double digits
    h = h < 10 ? '0' + h : h;
    m = m < 10 ? '0' + m : m;
    s = s < 10 ? '0' + s : s;

    ctx.clearRect(0, 0, 500, 500);

    draw(225, monthP, '#826c7f');
    
    var sThreshold = 5;
    var mThreshold = sThreshold / 60;
    var hThreshold = mThreshold / 60;
    var dThreshold = hThreshold / 24;
    var monthThreshold = hThreshold / 28;
    
    
    if (sp < sThreshold && sp > 0) {
        drawFinisher(125, sp, '#dbfe87', sThreshold);
    } else {
        draw(125, sp, '#dbfe87');
    }
    
    if (mp < mThreshold && mp > 0) {
        drawFinisher(150, mp, '#fac053', mThreshold);
    } else {
        draw(150, mp, '#fac053');
    }

    if (hp < hThreshold && hp > 0) {
        drawFinisher(175, hp, '#22aaa1', hThreshold);
    } else {
        draw(175, hp, '#22aaa1');
    }
    
    if (dayP < dThreshold && dayP > 0) {
        drawFinisher(200, dayP, '#233d4d', dThreshold);
    } else if (day !== 0) {
        draw(200, dayP, '#233d4d');
    }

    if (monthP < monthThreshold && monthP > 0) {
        drawFinisher(225, monthP, '#826c7f', monthThreshold);
    } else if (month !== 0) {
        draw(225, monthP, '#826c7f');
    }

    document.getElementById('timeString').innerHTML = h + ':' + m + ':' + s;
};

clock()

function getMonthAndDay() {
    var now = new Date();
    var startOfYear = new Date(now.getFullYear(), 0, 0);
    var diff = (now - startOfYear) + ((startOfYear.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    var oneDay = 1000 * 60 * 60 * 24;
    var gdoy = Math.floor( diff / oneDay);
    var year = getHorizonsYear();
    var isLeapYear = getIsLeapYear();
    var monthAndDate = getHorizonsMonthAndDate();
    var isDriftDay = monthAndDate.isDriftDay;
    var month = monthAndDate.month;
    var day = monthAndDate.day;

    function getHorizonsYear() {
        var gYear = now.getFullYear();
        if (gdoy > 353) {
            return gYear + 1791; 
        }
        return gYear + 1790;
    }
    
    function getIsLeapYear() {
        return !((year % 4) && (year % 100) || !(year % 400));
    }
    
    function getHorizonsMonthAndDate() {
        var hdoy = gdoy + 11;
        if (isLeapYear && hdoy > 366) {
            hdoy -= 366;
        } else if (hdoy > 365) {
            hdoy -= 365;
        }
    
        if (hdoy - 1 === 0) {
            return {
                month: 0,
                day: 0
            };
        }
    
        if (hdoy === 366) {
            return {
                month: 0,
                day: 0,
                isDriftDay: true
            };
        }
    
        return {
            month: Math.floor((hdoy - 1) / 28) + 1,
            day: (hdoy - 1) % 28
        };
    }
    
    var dateString = year;
    
    if (isDriftDay) {
        dateString += ' -- Drift Day';
    } else {
        dateString +='.' + month + '.' + day;
    }

    document.getElementById('dateString').innerHTML = dateString;

    if (isDriftDay || month === 0) {
        return {
            day: 0,
            month: 0
        }
    }

    return {
        day: day,
        month: month
    }
}

