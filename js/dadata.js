(function() {
    "use strict";

    /**
     * API стандартизации данных dadata.ru
     * * См. https://dadata.ru/api/
     * @type {{DADATA_API_URL: string, TOKEN: string, clean: Function}}
     */
    var DadataApi = {

        /**
         * URL публичного интерфейса dadata.ru
         */
        DADATA_API_URL: "https://dadata.ru/api/v1",

        /**
         * API-ключ для обращения к DaData
         */
        TOKEN: "5ef98f5781a106962077fb18109095f9f11ebac1",

        /**
         * Стандартизует данные через API
         * @param req Данные для стандартизации
         * @returns {*} Стандартизованные данные
         */
        clean: function(req) {
            return $.ajax({
                type: "POST",
                url: this.DADATA_API_URL + "/clean",
                headers: { "Authorization": "Token " + this.TOKEN },
                contentType: "application/json",
                dataType: "json",
                data: JSON.stringify(req)
            });
        }
    };

    /**
     * Обертка для текстового поля, которое должно валидироваться через Dadata.
     * @param el       DOM-элемент текстового поля
     * @param type     Тип данных поля
     * @param getValue Функция, возвращающая стандартизованное значение из полученного ответа
     */
    var ValidatedField = function(el, type, getValue) {
        var self = this;
        self.$el = $(el);
        self.$parent = self.$el.parent();
        self.type = type;
        self.getValue = getValue;

        /**
         * @constructor
         */
        self.init = function() {
            self.$el.change(function() {
                // нет значения - просто очищаем статус поля
                if (!self.$el.val()) {
                    self.clearState();
                // иначе стандартизуем его и показываем результат
                } else {
                    DadataApi
                        .clean({ structure: [self.type], data: [[ self.$el.val() ]]})
                        .done(function(resp) {
                            self.validate(resp.data[0][0]);
                    });
                }
            });
        };

        /**
         * Проводит валидацию поля, основываясь на стандартизованном ответе от Dadata
         * @param validatedObj Ответ от Dadata
         */
        self.validate = function (validatedObj) {
            // если код качества "Корректный", показываем статус ОК
            if (validatedObj.qc == 0) {
                self.$el.val(
                    self.getValue(validatedObj)
                );
                self.clearState();
                self.setOK();
            // иначе показываем статус Ошибка
            } else {
                self.setError();
            }
        };

        /**
         * Устанавливает статус Ошибка
         */
        self.setError = function () {
            self.$parent.addClass("has-error has-feedback");
            self.$parent.find("span").remove();
            self.$parent.append("<span class=\"glyphicon glyphicon-remove form-control-feedback\"></span>")
        };

        /**
         * Устанавливает статус ОК
         */
        self.setOK = function () {
            self.$parent.addClass("has-success has-feedback");
            self.$parent.append("<span class=\"glyphicon glyphicon-ok form-control-feedback\"></span>")
        };

        /**
         * Снимает статус
         */
        self.clearState = function () {
            self.$parent.removeClass("has-error has-success has-feedback");
            self.$parent.find("span").remove();
        };

        self.init();

    };

    window.DadataApi = DadataApi;
    window.ValidatedField = ValidatedField;

})();
