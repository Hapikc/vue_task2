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
    template: `
        <div id="app">
            <div v-for="(column, columnIndex) in columns" :key="columnIndex" class="column">
                <h2>{{ column.title }}</h2>
                <note-card 
                    v-for="(card, cardIndex) in column.cards" 
                    :key="cardIndex" 
                    :card="card" 
                    :column-index="columnIndex"
                    @update-item="updateItem"
                ></note-card>
                <button @click="addCard(columnIndex)" :disabled="columnIndex === 1 && columns[1].cards.length >= maxCardsInColumn2">
                    Добавить карточку
                </button>
            </div>
        </div>
    `,

    methods: {
        addCard(columnIndex) {


                if (columnIndex === 0 && this.columns[0].cards.length >= this.maxCardsInColumn1) {
                    alert('Первый столбец уже заполнен!');
                    return;
                }

                if (columnIndex === 1 && this.columns[1].cards.length >= this.maxCardsInColumn2) {
                    alert('Второй столбец уже заполнен!');
                    return;
                }


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
        },
    },

        moveCard(fromColumn, toColumn, cardIndex) {
            const card = this.columns[fromColumn].cards.splice(cardIndex, 1)[0];
            card.completedDate = toColumn === 2 ? new Date().toLocaleString() : null;
            this.columns[toColumn].cards.push(card);
        },

        updateItem(payload) {
            const { cardIndex, itemIndex, columnIndex } = payload;
            const card = this.columns[columnIndex].cards[cardIndex];
            card.items[itemIndex].completed = !card.items[itemIndex].completed;
            },

        checkLockState() {
            if (this.columns[1].cards.length >= this.maxCardsInColumn2) {
                this.isColumn1Locked = this.columns[0].cards.some(card =>
                    card.items.filter(item => item.completed).length / card.items.length > 0.5
                );
            }
            this.columns[0].cards.forEach(card => (card.locked = this.isColumn1Locked));
        },




});


Vue.component('note-card', {
    props: ['card', 'columnIndex'],
    template: `
        <div class="note-card" :class="{ locked: card.locked }">
            <h3>{{ card.title }}</h3>
            <ul>
                <li v-for="(item, index) in card.items" :key="index">
                    <input 
                        type="checkbox" 
                        :checked="item.completed" 
                        @change="toggleItem(index)" 
                        :disabled="card.locked"
                    />
                    {{ item.text }}
                </li>
            </ul>
            <p v-if="card.completedDate">Завершено: {{ card.completedDate }}</p>
        </div>
    `,
    methods: {
        toggleItem(index) {
            this.$emit('update-item', {
                cardIndex: this.card.index,
                itemIndex: index,
                columnIndex: this.columnIndex
            });
        }
    }

});