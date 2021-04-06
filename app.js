$(document).ready(function () {
    var audio = new Audio('tap.mp3');
    var entered = [0, 0, 0, 0];
    var timer, mstimer, paused;
    options = {
        repeat: 0,
        intervalperiod: 0,
        startvalue: 0,
        invert: false
    };
    var clock = $("#clock");
    var digits = $("#clock .active");
    var mscounter = ("#mscounter");
    $("button").click(function (e) {
        e.preventDefault();
    })
    $("#inputpad").on("click", ".number", function () {
        var number = $(this).text();
        pushToClock(number);
        enableButtons();
    });
    $("#clear").on("click", function () {
        disableButtons();
        resetMs();
        pushToClock(0);
        pushToClock(0);
        pushToClock(0);
        pushToClock(0);
    });
    $(document).keypress(function (event) {
        if ($(event.target).is('input, textarea, select')) {
            return;
        };
        var keymap = {
            48: 0,
            49: 1,
            50: 2,
            51: 3,
            52: 4,
            53: 5,
            54: 6,
            55: 7,
            56: 8,
            57: 9,
            8: "delete",
            46: "delete",
            13: "enter"
        };
        if (keymap[event.which]) {
            var command = keymap[event.which];
            if (command == "delete") {
                pushToClock(0);
            } else if (command == "enter") {
                if ($("#start").hasClass("active")) {
                    $("#stop").click();
                    $("#start").removeClass("active");
                } else {
                    $("#start").click();
                    $("#stop").removeClass("active");
                }
            } else {
                pushToClock(command);
                enableButtons();
            }
        }
    });
    $("#feedback").on("click", function () {
        $("#feedbackbox").addClass("active");
    })
    $("#feedbackbox").on("submit", function (e) {
        e.preventDefault();
        var formdata = $(this).serialize();
        console.log(formdata);
        $.ajax({
            method: "post",
            url: "feedback.php",
            data: formdata
        }).done(function (data) {
            if (data == "success") {
                alert("Thanks");
            } else {
                alert("Oops, try again another time.");
            }
            console.log(data);
        }).fail(function (msg) {
            alert("Oops, try again another time.");
            console.log(fail);
        });
    });
    $("#theme").on("change", function () {
        var theme = $(this).val();
        $("link[role='theme']").attr("href", theme);
    });

    function fireNotifier(e) {
        var ele = $("#notifier");
        if (e == "repeat" || e == "interval") {
            ele.css({
                "background": "#0066ff"
            });
        } else {
            ele.css({
                "background": "#cc0000"
            });
        }
        $("#notifier").addClass("play").delay(800).queue(function (next) {
            $(this).removeClass("play");
            next();
        });
    }

    function enableButtons() {
        if ($("#start, #stop").attr("disabled")) {
            $("#start, #stop").attr("disabled", false);
            $("#start, #stop").addClass("ready");
        }
    }

    function disableButtons() {
        $("#start, #stop").removeClass("ready");
        $("#start, #stop").attr("disabled", true);
    }
    $("#start").on("click", function () {
        paused = false;
        notifyClock(function () {
            if (options.repeat) {
                options.startvalue = entered;
            };
            startCountdown();
        });
    });
    $("#stop").on("click", function () {
        paused = true;
        notifyClock(function () {
            pauseCountdown()
        });
    });
    $("#start, #stop").on("click", function () {
        if ($(this).hasClass("active")) {
            $(this).removeClass("active");
        } else {
            $(this).addClass("active");
        }
    });
    $(".option button").on("click", function () {
        var attr = $(this).attr('data-attr');
        if ($(this).hasClass("active")) {
            $(this).removeClass("active");
            options[attr] = false;
        } else {
            $(this).addClass("active");
            options[attr] = true;
        }
    });
    $("#intervalperiod").on("change", function () {
        intervalperiod = $(this).val();
        console.log(intervalperiod);
    });
    /* Presentation */
    function notifyClock(callback) {
        if (getCurrentTime() > 0) {
            callback();
        }
    }

    function pushToClock(number) {
        entered.push(parseInt(number));
        if (entered.length > digits.length) {
            entered.shift();
        }
        updateDigits(entered);
    }

    function resetClock() {
        for (var i = 0; i < options.startvalue.length; i++) {
            pushToClock(options.startvalue[i]);
        };
    }

    function updateDigits(digitsarray) {
        for (var i = 0; i < digitsarray.length; i++) {
            $(digits[i]).html(digitsarray[i]);
        };
    }

    function updateMs(msdigits) {
        if (msdigits < 10) {
            $(mscounter).html("0" + msdigits);
        } else {
            $(mscounter).html(msdigits);
        };
    }
    /* Logic */
    function getCurrentTime() {
        return parseInt(entered.join(""));
    }
    // Expect it to countdown clock
    function startCountdown() {
        // Save starting value
        options.startvalue = entered;
        // If starting from 1 have countdown start early
        updateCurrentTime(getCurrentTime() + 1);
        // Add one second so that it will countdown from the second prior
        // entered[3] = entered[3] + 1;
        timer = setInterval(function () {
            //            console.log("running");
            var countdown = updateClock();
            if (countdown <= 1) {
                stopCountdown();
                // If paused reset clock and start
                if (options.repeat) {
                    repeatClock();
                }
            }
        }, 1000);
    };

    function repeatClock() {
        setTimeout(function () {
            fireNotifier("repeat");
            resetClock();
            startCountdown();
        }, 1000);
    }

    function fireIntervalSound(intervalperiod, currentvalue) {
        // -1 fires it upon arriving at that value
        var remainder = (currentvalue - 1) % intervalperiod;
        remainder = Math.round(remainder);
        if (remainder == 0) {
            audio.play();
            fireNotifier("interval");
        }
    };

    function updateCurrentTime(value) {
        newvalue = pad(value, 4);
        entered = newvalue.split("");
        return entered;
    }
    // Expect it to countdown from current clock
    function updateClock() {
        var currentValue = getCurrentTime();
        fireIntervalSound(intervalperiod, currentValue);
        // Dont let it count at 0 or will goto -1
        if (currentValue > 0) {
            var digitsarray = updateCurrentTime(currentValue - 1);
            updateDigits(digitsarray);
            // Let it cycle at 1 to count to 0
            if (currentValue > 1) {
                cycleMs();
            }
        }
        return currentValue;
    }
    // Expect it to pause countdown
    function pauseCountdown() {
        fireNotifier();
        clearInterval(timer);
        clearInterval(mstimer);
    };
    // Expect it to pause and reset countdown
    function stopCountdown() {
        fireNotifier();
        clearInterval(timer);
        clearInterval(mstimer);
        timer = null;
        mstimer = null;
    }

    function cycleMs() {
        clearInterval(mstimer);
        var safeguard = 0;
        var count = 99;
        mstimer = setInterval(function () {
            safeguard++;
            count = count - 1;
            updateMs(count);
            if (count <= 0 || safeguard == 110) {
                resetMs();
            };
        }, 10);
    };

    function resetMs() {
        $(mscounter).html("00");
        clearInterval(mstimer);
        mstimer = null;
    };

    function pad(num, size) {
        var s = num + "";
        while (s.length < size) s = "0" + s;
        return s;
    }
})