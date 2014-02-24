// require dadata.js
(function() {
    "use strict";

    /**
     * Объединяет элементы массива через разделитель. При этом игнорирует пустые элементы.
     * @param arr Массив
     * @param separator Разделитель. Необязательный параметр, по умолчанию - запятая
     * @returns {string}
     */
    function join(arr /*, separator */) {
        var separator = arguments.length > 1 ? arguments[1] : ", ";
        return arr.filter(function(n){return n}).join(separator);
    }

    /**
     * Подскази по адресу
     * @type {{init: Function, forceMoscow: Function, trimResults: Function, formatResult: Function, formatSelected: Function, showSelected: Function}}
     */
    var AddressSuggestions = {

        /**
         * @constructor
         */
        init: function($el) {
            var self = this;
            $el.suggestions({
                serviceUrl: DadataApi.DADATA_API_URL + "/suggest/address",
                token: DadataApi.TOKEN,
                selectOnSpace: true,
                maxHeight: 310,
                onSearchStart: self.forceMoscow,
                onSearchComplete: self.trimResults,
                formatResult: self.formatResult,
                onSelect: function(suggestion) {
                    if (suggestion.data) {
                        this.value = self.formatSelected(suggestion);
                        self.showSelected(suggestion);
                    }
                }
            });
        },

        /**
         * Ограничивает поиск конкретным Москвой
         * @param params
         */
        forceMoscow: function (params) {
            var query = params["query"];
            var pattern = /Москва/i;
            if (!pattern.test(query)) {
                query = "Москва " + query;
            }
            params["query"] = query;
        },

        /**
         * Фильтрует список подсказок
         * @param query       Введенный пользователем текст
         * @param suggestions Массив подсказок для введенного текста
         */
        trimResults: function (query, suggestions) {
            suggestions.splice(7,3);
            suggestions.forEach(function(suggestion) {
                suggestion.value = suggestion.value.replace("Россия, ", "");
            })
        },

        /**
         * Форматирование элемента списка подсказок в две строки.
         * При отрисовке списка подсказок вызывается для каждого элемента списка.
         * @param suggestion   Подсказка
         * @param currentValue Введенный пользователем текст
         * @returns {string} HTML для элемента списка подсказок
         */
        formatResult: function (suggestion, currentValue) {
            var address = suggestion.data;
            // первая строка - регион, город, населенный пункт
            var part1 = join([address.region, address.area, address.city, address.settlement]);
            // вторая строка - улица и дом
            var part2 = join([
                join([address.street_type, address.street], " "), 
                join([address.house_type, address.house], " ")
            ]);
            var suggestedValue = part2 ? part1 + "<br>&nbsp;&nbsp;" + part2 : part1;
            // подсветка введенного пользователем текста
            var pattern = '(^|\\s+)(' + $.Suggestions.utils.escapeRegExChars(currentValue) + ')';
            return suggestedValue.replace(new RegExp(pattern, 'gi'), '$1<strong>$2<\/strong>');
        },

        /**
         * Формирует текстовое представление подсказки, когда пользователь выбирает ее из списка
         * Возвращает все, кроме страны и индекса.
         * @param suggestion
         * @returns {string}
         */
        formatSelected: function (suggestion) {
            var address = suggestion.data;
            return join([
                join([address.region_type, address.region], " "), 
                join([address.area_type, address.area], " "),
                join([address.city_type, address.city], " "),
                join([address.settlement_type, address.settlement], " "), 
                join([address.street_type, address.street], " "),
                join([address.house_type, address.house], " ")
            ]);
        },

        /**
         * Заполняет поля формы гранулярными полями адреса из выбранной подсказки
         * @param suggestion Выбранная подсказка
         */
        showSelected: function (suggestion) {
            var address = suggestion.data;
            $("#address-postal_code").val(address.postal_code);
            $("#address-region").val(join([
                join([address.region_type, address.region], " "), 
                join([address.area_type, address.area], " ")
            ]));
            $("#address-city").val(join([
                join([address.city_type, address.city], " "), 
                join([address.settlement_type, address.settlement], " ")
            ]));
            $("#address-street").val(
                join([address.street_type, address.street], " ")
            );
            $("#address-house").val(
                join([address.house_type, address.house], " ")
            );
        }
    };

    /**
     * Подсказки по ФИО
     * @type {{init: Function, showSelected: Function}}
     */
    var FullnameSuggestions = {

        /**
         * @constructor
         */
        init: function($el) {
            var self = this;
            $el.suggestions({
                serviceUrl: DadataApi.DADATA_API_URL + "/suggest/fio",
                token: DadataApi.TOKEN,
                selectOnSpace: true,
                onSelect: function(suggestion) {
                    if (suggestion.data) {
                        self.showSelected(suggestion);
                    }
                }
            });
        },

        /**
         * Заполняет поля формы гранулярными полями ФИО из выбранной подсказки
         * @param suggestion Выбранная подсказка
         */
        showSelected: function (suggestion) {
            var fullname = suggestion.data;
            $("#fullname-surname").val(fullname.surname);
            $("#fullname-name").val(fullname.name);
            $("#fullname-patronymic").val(fullname.patronymic);
        }
    };

    window.AddressSuggestions = AddressSuggestions;
    window.FullnameSuggestions = FullnameSuggestions;

})();
