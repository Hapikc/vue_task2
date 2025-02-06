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
    },

    methods: {
        addCard(columnIndex) {
            const newCard = {
                title: prompt('Введите заголовок:'),
                items: Array.from({ length: 3 }, () => ({
                    text: prompt('Введите пункт:'),
                    completed: false
                })),
                index: this.columns[columnIndex].cards.length,
                completedDate: null,
                locked: false
            };
            this.columns[columnIndex].cards.push(newCard);
        }
    }
});


Vue.component('note-card', {
    props: ['card', 'columnIndex'],
    template: `
        <div class="note-card">
            <h3>{{ card.title }}</h3>
            <ul>
                <li v-for="(item, index) in card.items" :key="index">
                    <input type="checkbox"/>
                    {{ item.text }}
                </li>
            </ul>
        </div>
    `,

});