// require suggest.js
(function() {
    "use strict";

    /**
     * Переводит base-64 представление в строку.
     * @param str
     * @returns {string}
     */
    function b64_to_utf8( str ) {
        return decodeURIComponent(window.atob(str));
    }

    /**
     * Показывает сообщение после отправки формы
     * @param $message jQuery-элемент сообщения
     */
    function showSubmitMessage($message) {
        var chance = Math.floor(Math.random()*5) + 1;
        // пасхалка :-)
        if (chance === 5) {
            var header = b64_to_utf8("JUQwJTk4JUQwJUI3JUQwJUIyJUQwJUI4JUQwJUJEJUQwJUI4JUQxJTgyJUQwJUI1JTJDJTIwJUQxJTgzJTIwJUQwJUJEJUQwJUIwJUQxJTgxJTIwJUQwJUJFJUQwJUIxJUQwJUI1JUQwJUI0");
            var message = b64_to_utf8("JUQwJTlGJUQxJTgwJUQxJThGJUQwJUJDJUQwJUJFJTIwJUQxJTgxJUQwJUI1JUQwJUI5JUQxJTg3JUQwJUIwJUQxJTgxJTIwJUQwJUJDJUQxJThCJTIwJUQwJUJEJUQwJUI1JTIwJUQwJUJDJUQwJUJFJUQwJUI2JUQwJUI1JUQwJUJDJTIwJUQwJUJGJUQxJTgwJUQwJUI4JUQwJUJEJUQxJThGJUQxJTgyJUQxJThDJTIwJUQwJUIyJUQwJUIwJUQxJTg4JUQwJUI1JTIwJUQwJUJFJUQwJUIxJUQxJTgwJUQwJUIwJUQxJTg5JUQwJUI1JUQwJUJEJUQwJUI4JUQwJUI1LiUzQ2JyJTNFJUQwJTlEJUQwJUJFJTIwJUQwJUIyJUQxJThCJTIwJUQwJUIyJUQxJTgxJUQwJUI1JUQwJUIzJUQwJUI0JUQwJUIwJTIwJUQwJUJDJUQwJUJFJUQwJUI2JUQwJUI1JUQxJTgyJUQwJUI1JTIwJUQwJUJFJUQxJTgyJUQwJUJGJUQxJTgwJUQwJUIwJUQwJUIyJUQwJUI4JUQxJTgyJUQxJThDJTIwJUQwJUI1JUQwJUIzJUQwJUJFJTIwJUQwJUJEJUQwJUJFJUQxJTgyJUQwJUIwJUQxJTgwJUQwJUI4JUQwJUIwJUQwJUJCJUQxJThDJUQwJUJEJUQwJUJFJTIwJUQwJUI3JUQwJUIwJUQwJUIyJUQwJUI1JUQxJTgwJUQwJUI1JUQwJUJEJUQwJUJEJUQxJTgzJUQxJThFJTIwJUQwJUJBJUQwJUJFJUQwJUJGJUQwJUI4JUQxJThFJTIwJUQwJTlGJUQwJUJFJUQxJTg3JUQxJTgyJUQwJUJFJUQwJUI5JTIwJUQwJUEwJUQwJUJFJUQxJTgxJUQxJTgxJUQwJUI4JUQwJUI4JTIwJUQwJUJGJUQwJUJFJTIwJUQwJUIwJUQwJUI0JUQxJTgwJUQwJUI1JUQxJTgxJUQxJTgzJTNBJTIwMTI1MDMyJTJDJTIwJUQwJTlDJUQwJUJFJUQxJTgxJUQwJUJBJUQwJUIyJUQwJUIwJTJDJTIwJUQxJTgzJUQwJUJCLiUyMCVEMCVBMiVEMCVCMiVEMCVCNSVEMSU4MCVEMSU4MSVEMCVCQSVEMCVCMCVEMSU4RiUyQyUyMDEzLiUzQyUyRnAlM0U=");
            $message.find("h4").text(header);
            $message.find("p[data-message]").html(message);
        } else {
            $message.find("h4").text("Это не настоящее правительство :-(");
            $message.find("p[data-message]").html("К сожалению, мы не можем принять ваше обращение.<br>Но вы всегда можете отправить его через <a href=\"https://www.mos.ru/authority/treatments/reception/individuals/\">электронную приемную</a> правительства Москвы.");
        }
        $message.show();
    }

    $(function() {
        AddressSuggestions.init(
            $("#address"),
            [$("#address-region"), $("#address-city"), $("#address-street"), $("#address-house"), $("#address-flat")]
        );
        FullnameSuggestions.init(
            $("#fullname"),
            [$("#fullname-surname"), $("#fullname-name"), $("#fullname-patronymic")]
        );
        GranularFullnameSuggestions.init(
            $("#fullname-surname"), $("#fullname-name"), $("#fullname-patronymic")
        );

        var $form = $("#feedback-form");
        var $btnSubmit = $form.find("button[type='submit']");
        var $progress = $("#feedback-progress");
        var $message = $("#feedback-message");

        var phoneField = new ValidatedField("#phone", "PHONE", function(validatedObj) {
            return validatedObj.phone;
        });

        var emailField = new ValidatedField("#email", "EMAIL", function(validatedObj) {
            return validatedObj.email;
        });

        $message.find("[data-action='ok']").click(function() {
            $message.hide();
        });

        $form.submit(function(e) {
            e.preventDefault();
            $btnSubmit.hide();
            $message.hide();
            $progress.parent().show();
            var progressVal = 5;
            var timer;
            var setProgress = function(val) {
                progressVal = val;
                $progress.css('width', val+'%');
            };
            var forward = function() {
                setProgress(progressVal+5);
                if(progressVal < 100) {
                    timer = setTimeout(forward, 100)
                } else {
                    $progress.parent().hide();
                    setProgress(0);
                    $btnSubmit.show();
                    showSubmitMessage($message);
                }
            };
            timer = setTimeout(forward, 100);

        });
    });

})();