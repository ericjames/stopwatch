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