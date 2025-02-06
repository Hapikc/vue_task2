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
    `
});