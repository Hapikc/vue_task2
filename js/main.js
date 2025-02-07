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
                <button v-if="columnIndex === 0" @click="addCard(columnIndex)" :disabled="columnIndex === 1 && columns[1].cards.length >= maxCardsInColumn2">
                    Добавить карточку
                </button>
            </div>
        </div>
    `,
    methods: {
        // добавление карточки
        addCard(columnIndex) {
            if (columnIndex === 0 && this.columns[0].cards.length >= this.maxCardsInColumn1) {
                alert('Первый столбец уже заполнен!');
                return;
            }

            const newCard = {
                id: Date.now() + Math.random(),
                title: prompt('Введите заголовок карточки:'),
                items: [],
                index: this.columns[columnIndex].cards.length,
                completedDate: null,
                locked: false
            };
            for (let i = 0; i < 3; i++) {
                newCard.items.push({
                    text: prompt('Введите пункт списка:'),
                    completed: false
                });
            }
            let addMore = confirm('Хотите ли добавить ещё пункт?');
            while (addMore && newCard.items.length < 5) {
                // Пользователь может добавить 1 или 2 пункта
                let count = prompt('Сколько пунктов вы хотите добавить? (1 или 2)');
                count = parseInt(count, 10);

                if (count === 1 || count === 2) {
                    for (let i = 0; i < count; i++) {
                        if (newCard.items.length < 5) {
                            newCard.items.push({
                                text: prompt('Введите пункт списка:'),
                                completed: false

                            });
                        } else {
                            alert('Достигнуто максимальное количество пунктов (5).');
                            break;
                        }
                    }
                } else {
                    alert('Пожалуйста, введите 1 или 2.');
                }


                addMore = confirm('Готово');
                break
            }
            this.columns[columnIndex].cards.push(newCard);
        },


        // перемещение карточки
        moveCard(fromColumn, toColumn, cardId) {
            // Находим карточку по ID
            const cardIndex = this.columns[fromColumn].cards.findIndex(c => c.id === cardId);
            if (cardIndex === -1) return;

            const card = this.columns[fromColumn].cards.splice(cardIndex, 1)[0];
            card.completedDate = toColumn === 2 ? new Date().toLocaleString() : null;
            card.locked = false;
            this.columns[toColumn].cards.push(card);
        },

        // обновление состояния
        checkLockState() {
            if (this.columns[1].cards.length >= this.maxCardsInColumn2) {
                this.isColumn1Locked = this.columns[0].cards.some(card =>
                    card.items.filter(item => item.completed).length / card.items.length > 0.5
                );
            } else {
                this.isColumn1Locked = false;
            }
            this.columns[0].cards.forEach(card => (card.locked = this.isColumn1Locked));
        },

        // проверка на блокировку колонок
        updateItem(payload) {
            const { cardId, itemIndex, columnIndex } = payload;

            // Находим карточку в текущей колонке
            const column = this.columns[columnIndex];
            const cardIndex = column.cards.findIndex(c => c.id === cardId);
            if (cardIndex === -1) return;

            const card = column.cards[cardIndex];

            // Изменяем состояние пункта
            card.items[itemIndex].completed = !card.items[itemIndex].completed;

            // Считаем количество выполненных пунктов
            const completedCount = card.items.filter(item => item.completed).length;
            const totalItems = card.items.length;

            // Логика перемещения карточки
            if (columnIndex === 0) {
                if (completedCount / totalItems > 0.5) {
                    this.moveCard(0, 1, card.id);
                } else if (completedCount === totalItems) {
                    this.moveCard(0, 2, card.id);
                }
            } else if (columnIndex === 1) {
                if (completedCount === totalItems) {
                    this.moveCard(1, 2, card.id);
                } else if (completedCount / totalItems <= 0.5) {
                    this.moveCard(1, 0, card.id);
                }
            } else if (columnIndex === 2) {
                if (completedCount < totalItems) {
                    this.moveCard(2, 1, card.id);
                }
            }

            // Проверка состояния блокировки
            this.checkLockState();
        }
    },

    // Это для загрузки из локалки при старте прилажуки
    created() {
        const savedData = JSON.parse(localStorage.getItem('noteAppData'));
        if (savedData) {
            this.columns = savedData.columns;
        }
    },

    // сохранение в локалке при изменениях
    //  watch - устанавливает наблюдения за изменениями в файле или папки
    watch: {
        columns: {
            deep: true,
            handler() {
                localStorage.setItem('noteAppData', JSON.stringify({ columns: this.columns }));
            }
        }
    },
});

// логика карточки, проверки чек боксов и т.п
Vue.component('note-card', {
    props: ['card', 'columnIndex'],
    template: `
        <div class="note-card" :class="{ locked: card.locked }">
            <h3>{{ card.title }}</h3>
            <ul>
                <li v-for="(item, index) in card.items" :key="item.id">
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
            this.$emit('update-item', { cardId: this.card.id, itemIndex: index, columnIndex: this.columnIndex });
        } // через $emit данные уходят родительскому элементу из дочернего
    }
});