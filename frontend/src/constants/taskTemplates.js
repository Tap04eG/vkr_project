/**
 * @file taskTemplates.js
 * @description Хранит предустановленные шаблоны заданий для учителей.
 * 
 * Структура шаблона:
 * {
 *   title: "Заголовок",
 *   desc: "Краткое описание для выбора учителем",
 *   reward: 10,  // Награда XP
 *   type: "selection" | "ordering" | "input" | "fill_blanks",
 *   data: { ...специфичные данные игры... }
 * }
 */
export const TASK_TEMPLATES = [
    {
        title: "Найди букву А",
        desc: "Найди все буквы 'А' в словах: АРБУЗ, ДОМ, АИСТ.",
        reward: 10,
        type: "selection",
        data: {
            gameTitle: "Найди все буквы А",
            items: ["А", "Р", "Б", "У", "З", "Д", "О", "М", "А", "И", "С", "Т"],
            correctItems: ["А", "А"]
        }
    },
    {
        title: "Собери слово ДОМ",
        desc: "Расставь буквы в правильном порядке.",
        reward: 15,
        type: "ordering",
        data: {
            targetWord: "ДОМ",
            scrambled: ["О", "М", "Д"]
        }
    },
    {
        title: "Азбука: А, Б, В",
        desc: "Расставь буквы по алфавиту.",
        reward: 10,
        type: "ordering",
        data: {
            targetWord: "АБВ",
            scrambled: ["Б", "А", "В"]
        }
    },
    {
        title: "Посчитай звуки",
        desc: "Посчитай, сколько звуков в слове 'Ель'.",
        reward: 20,
        type: "input",
        data: {
            question: "Сколько звуков в слове 'Ель'?",
            correctAnswer: "3"
        }
    },
    {
        title: "Ж_знь и Ш_на",
        desc: "Вставь пропущенные буквы И/Ы.",
        reward: 15,
        type: "fill_blanks",
        data: {
            text: "В лесу кипит ж__знь. Машина проколола ш__ну.",
            blanks: [
                { index: 0, correct: "и" },
                { index: 1, correct: "и" }
            ]
        }
    },
    {
        title: "Эссе о природе",
        desc: "Напиши небольшое сочинение. (Ручная проверка)",
        reward: 50,
        type: "essay",
        data: {
            question: "Напиши 3-4 предложения о том, почему нужно беречь природу."
        }
    }
];
