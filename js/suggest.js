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
     * Базовый объект подсказок
     * Синхронизирует изменение гранулярных полей с полем "одной строкой"
     */
    var Suggestions = {
        /**
         * Инициализирует подсказки на указанном элементе
         * @param $el   jQuery-элемент ввода одной строкой
         * @param parts Массив jQuery-элементов для гранулярных частей
         * @param separator Разделитель, через который нужно объединять гранулярные части
         * @constructor
         */
        init: function($el, parts, separator) {
            parts.forEach(function($part) {
                $part.change(function() {
                    var partialValues = parts.map(
                        function($el) { return $el.val() }
                    );
                    $el.val(
                        join(partialValues, separator)
                    );
                });
            });
        }
    };

    $.Suggestions.dadataConfig.url = DadataApi.DADATA_API_URL + "/clean";

    /**
     * Подскази по адресу
     */
    var AddressSuggestions = {

        /**
         * Инициализирует подсказки по адресу на указанном элементе
         * @param $el   jQuery-элемент ввода адреса одной строкой
         * @param parts Массив jQuery-элементов для гранулярных частей адреса
         * @constructor
         */
        init: function($el, parts) {
            var self = this;
            Suggestions.init.call(self, $el, parts, ", ");
            $el.suggestions({
                serviceUrl: DadataApi.DADATA_API_URL + "/suggest/address",
                token: DadataApi.TOKEN,
                type: "ADDRESS",
                useDadata: true,
                maxHeight: 340,
                onSearchStart: self.forceMoscow,
                transformResult: self.trimResults,
                formatResult: self.formatResult,
                onSelect: function(suggestion) {
                    if (suggestion.data) {
                        self.showSelected(suggestion);
                    }
                }
            });
        },

        /**
         * Ограничивает поиск Москвой
         * @param params Параметры ajax-запроса
         */
        forceMoscow: function (params) {
            var pattern = /Москва/i;
            if (!pattern.test(params.query)) {
                params.query = "Москва " + params.query;
            }
        },

        /**
         * Фильтрует список подсказок
         * @param response Ответ от сервера подсказок
         */
        trimResults: function (response) {
            response.suggestions.splice(7,3);
            return response;
        },

        /**
         * Форматирование элемента списка подсказок в две строки.
         * При отрисовке списка подсказок вызывается для каждого элемента списка.
         * @param suggestion   Подсказка
         * @param currentValue Введенный пользователем текст
         * @returns {string} HTML для элемента списка подсказок
         */
        formatResult: function (suggestion, currentValue) {
            suggestion.value = suggestion.value.replace("Россия, ", "");
            var address = suggestion.data;
            // первая строка - регион, район, город
            var part1 = join([
                address.region,
                join([address.area_type, address.area], " "),
                join([address.city_type, address.city], " ")
            ]);
            // вторая строка - населенный пункт, улица, дом, квартира
            var part2 = join([
                join([address.settlement_type, address.settlement], " "),
                join([address.street_type, address.street], " "),
                join([address.house_type, address.house], " "),
                join([address.block_type, address.block], " "),
                join([address.flat_type, address.flat], " ")
            ]);
            // подсветка введенного пользователем текста
            var pattern = '(^|\\s+)(' + $.Suggestions.utils.escapeRegExChars(currentValue) + ')';
            part2 = part2.replace(new RegExp(pattern, 'gi'), '$1<strong>$2<\/strong>')
            var suggestedValue = part2 ?
                "<span class=\"suggestions-suggestion-region\">" + part1 + "</span>" + "<br>&nbsp;&nbsp;" + part2
                : part1;
            return suggestedValue;
        },

        /**
         * Заполняет поля формы гранулярными полями адреса из выбранной подсказки
         * @param suggestion Выбранная подсказка
         */
        showSelected: function (suggestion) {
            var address = suggestion.data;
            $("#address-postal_code").val(address.postal_code);
            $("#address-region").val(
                join([address.region_type, address.region], " ")
            );
            $("#address-city").val(join([
                join([address.area_type, address.area], " "),
                join([address.city_type, address.city], " "),
                join([address.settlement_type, address.settlement], " ")
            ]));
            $("#address-street").val(
                join([address.street_type, address.street], " ")
            );
            $("#address-house").val(join([
                join([address.house_type, address.house], " "),
                join([address.block_type, address.block], " ")
            ]));
            $("#address-flat").val(
                join([address.flat_type, address.flat], " ")
            );
        }  // любите работать с кодом? У нас есть отличные вакансии http://hh.ru/employer/15589!
    };

    /**
     * Подсказки по ФИО
     */
    var FullnameSuggestions = {

        /**
         * Инициализирует подсказки по ФИО на указанном элементе
         * @param $el   jQuery-элемент ввода ФИО одной строкой
         * @param parts Массив jQuery-элементов для гранулярных частей ФИО
         * @constructor
         */
        init: function($el, parts) {
            var self = this;
            Suggestions.init.call(self, $el, parts, " ");
            $el.suggestions({
                serviceUrl: DadataApi.DADATA_API_URL + "/suggest/fio",
                token: DadataApi.TOKEN,
                type: "NAME",
                useDadata: true,
                maxHeight: 340,
                transformResult: self.trimResults,
                onSelect: function(suggestion) {
                    if (suggestion.data) {
                        self.showSelected(suggestion);
                    }
                }
            });
        },

        /**
         * Фильтрует список подсказок
         * @param response Ответ от сервера подсказок
         */
        trimResults: function (response) {
            response.suggestions.splice(7,3);
            return response;
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

    /**
     * Гранулярные подсказки по ФИО
     */
    var GranularFullnameSuggestions = {

        /**
         * Инициализирует подсказки по ФИО на указанном элементе
         * @param $surname jQuery-элемент для текстового поля с фамилией
         * @param $name jQuery-элемент для текстового поля с именем
         * @param $patronymic jQuery-элемент для текстового поля с отчеством
         * @constructor
         */
        init: function($surname, $name, $patronymic) {
            var self = this;
            self.$surname = $surname;
            self.$name = $name;
            self.$patronymic = $patronymic;
            var fioParts = ["SURNAME", "NAME", "PATRONYMIC"];
            // инициализируем подсказки на всех трех текстовых полях
            // (фамилия, имя, отчество)
            $.each([$surname, $name, $patronymic], function(index, $el) {
                $el.suggestions({
                    serviceUrl: DadataApi.DADATA_API_URL + "/suggest/fio",
                    token: DadataApi.TOKEN,
                    hint: "",
                    noCache: true,
                    params: {
                        // каждому полю --- соответствующая подсказка
                        parts: [fioParts[index]]
                    },
                    onSearchStart: function(params) {
                        // если пол известен на основании других полей,
                        // используем его
                        var $el = $(this);
                        params.gender = self.isGenderKnown($el) ? self.gender : "UNKNOWN";
                    },
                    onSelect: function(suggestion) {
                        // определяем пол по выбранной подсказке
                        self.gender = suggestion.data.gender;
                    }
                });
            });
        },

        /**
         * Проверяет, известен ли пол на данный момент
         * @param $el элемент, в котором находится фокус курсора
         * @returns {boolean}
         */
        isGenderKnown: function($el) {
            var self = this;
            var surname = self.$surname.val(),
                name = self.$name.val(),
                patronymic = self.$patronymic.val();
            if (($el.attr('id') == self.$surname.attr('id') && !name && !patronymic) ||
                ($el.attr('id') == self.$name.attr('id') && !surname && !patronymic) ||
                ($el.attr('id') == self.$patronymic.attr('id') && !surname && !name)) {
                return false;
            } else {
                return true;
            }
        }
    };

    window.AddressSuggestions = AddressSuggestions;
    window.FullnameSuggestions = FullnameSuggestions;
    window.GranularFullnameSuggestions = GranularFullnameSuggestions;

})();
