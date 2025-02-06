new Vue({
    el: '#app',
    data() {
        return {
            columns: [
                { title: 'В процессе', cards: [] },
                { title: 'На проверке', cards: [] },
                { title: 'Завершено', cards: [] }
            ],
            maxCardsInColumn1: 3,
            maxCardsInColumn2: 5,
            isColumn1Locked: false
        };
    }
});