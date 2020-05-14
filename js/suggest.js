(function () {
    "use strict";

    var TOKEN = "7fd18aaabd7d53ffa4846e4521c1f736c13490eb";

    /**
     * Объединяет элементы массива через разделитель. При этом игнорирует пустые элементы.
     * @param arr Массив
     * @param separator Разделитель. Необязательный параметр, по умолчанию - запятая
     * @returns {string}
     */
    function join(arr /*, separator */) {
        var separator = arguments.length > 1 ? arguments[1] : ", ";
        return arr
            .filter(function (n) {
                return n;
            })
            .join(separator);
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
        init: function ($el, parts, separator) {
            parts.forEach(function ($part) {
                $part.change(function () {
                    var partialValues = parts.map(function ($el) {
                        return $el.val();
                    });
                    $el.val(join(partialValues, separator));
                });
            });
        },
    };

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
        init: function ($el, parts) {
            var self = this;
            Suggestions.init.call(self, $el, parts, ", ");
            $el.suggestions({
                token: TOKEN,
                type: "ADDRESS",
                constraints: {
                    locations: {
                        kladr_id: "7700000000000",
                    },
                },
                formatResult: self.formatResult,
                onSelect: function (suggestion) {
                    if (suggestion.data) {
                        self.showSelected(suggestion);
                    }
                },
            });
        },

        /**
         * Форматирование элемента списка подсказок в две строки.
         * При отрисовке списка подсказок вызывается для каждого элемента списка.
         * @param suggestion   Подсказка
         * @param currentValue Введенный пользователем текст
         * @returns {string} HTML для элемента списка подсказок
         */
        formatResult: function (value, currentValue, suggestion, options) {
            suggestion.value = suggestion.value.replace("Россия, ", "");
            var address = suggestion.data;
            var city =
                (address.city !== address.region && join([address.city_type, address.city], " ")) ||
                "";
            // первая строка - регион, район, город
            var part1 = join([address.region, join([address.area_type, address.area], " "), city]);
            // вторая строка - населенный пункт, улица, дом, квартира
            var part2 = join([
                join([address.settlement_type, address.settlement], " "),
                join([address.street_type, address.street], " "),
                join([address.house_type, address.house], " "),
                join([address.block_type, address.block], " "),
                join([address.flat_type, address.flat], " "),
            ]);
            // подсветка введенного пользователем текста
            part1 = $.Suggestions.prototype.highlightMatches.call(
                this,
                part1,
                currentValue,
                suggestion,
                options
            );
            part2 = $.Suggestions.prototype.highlightMatches.call(
                this,
                part2,
                currentValue,
                suggestion,
                options
            );
            var suggestedValue = part2
                ? part2 + '<br><span class="suggestions-suggestion-region">' + part1 + "</span>"
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
            $("#address-region").val(join([address.region_type, address.region], " "));
            $("#address-city").val(
                join([
                    join([address.area_type, address.area], " "),
                    join([address.city_type, address.city], " "),
                    join([address.settlement_type, address.settlement], " "),
                ])
            );
            $("#address-street").val(join([address.street_type, address.street], " "));
            $("#address-house").val(
                join([
                    join([address.house_type, address.house], " "),
                    join([address.block_type, address.block], " "),
                ])
            );
            $("#address-flat").val(join([address.flat_type, address.flat], " "));
        }, // любите работать с кодом? У нас есть отличные вакансии http://hh.ru/employer/15589!
    };

    /**
     * Подсказки по email
     */
    var EmailSuggestions = {
        init: function ($el) {
            $el.suggestions({
                token: TOKEN,
                type: "EMAIL",
                suggest_local: false,
            });
        },
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
        init: function ($el, parts) {
            var self = this;
            Suggestions.init.call(self, $el, parts, " ");
            $el.suggestions({
                token: TOKEN,
                type: "NAME",
                onSelect: function (suggestion) {
                    if (suggestion.data) {
                        self.showSelected(suggestion);
                    }
                },
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
        },
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
        init: function ($surname, $name, $patronymic) {
            var self = this;
            self.$surname = $surname;
            self.$name = $name;
            self.$patronymic = $patronymic;
            var fioParts = ["SURNAME", "NAME", "PATRONYMIC"];
            // инициализируем подсказки на всех трех текстовых полях
            // (фамилия, имя, отчество)
            $.each([$surname, $name, $patronymic], function (index, $el) {
                $el.suggestions({
                    token: TOKEN,
                    type: "NAME",
                    hint: "",
                    noCache: true,
                    params: {
                        // каждому полю --- соответствующая подсказка
                        parts: [fioParts[index]],
                    },
                    onSearchStart: function (params) {
                        // если пол известен на основании других полей,
                        // используем его
                        var $el = $(this);
                        params.gender = self.isGenderKnown($el) ? self.gender : "UNKNOWN";
                    },
                    onSelect: function (suggestion) {
                        // определяем пол по выбранной подсказке
                        self.gender = suggestion.data.gender;
                    },
                });
            });
        },

        /**
         * Проверяет, известен ли пол на данный момент
         * @param $el элемент, в котором находится фокус курсора
         * @returns {boolean}
         */
        isGenderKnown: function ($el) {
            var self = this;
            var surname = self.$surname.val(),
                name = self.$name.val(),
                patronymic = self.$patronymic.val();
            if (
                ($el.attr("id") == self.$surname.attr("id") && !name && !patronymic) ||
                ($el.attr("id") == self.$name.attr("id") && !surname && !patronymic) ||
                ($el.attr("id") == self.$patronymic.attr("id") && !surname && !name)
            ) {
                return false;
            } else {
                return true;
            }
        },
    };

    window.AddressSuggestions = AddressSuggestions;
    window.EmailSuggestions = EmailSuggestions;
    window.FullnameSuggestions = FullnameSuggestions;
    window.GranularFullnameSuggestions = GranularFullnameSuggestions;
})();
