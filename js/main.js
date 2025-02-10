new Vue({
    el: '#app',
    data() {
        return {
            columns: [
                {title: 'В процессе', cards: []},
                {title: 'На проверке', cards: []},
                {title: 'Завершено', cards: []}
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
                        @add-subitem="addSubItem"
                    ></note-card>
                    <button 
                        v-if="columnIndex === 0" 
                        @click="addCard(columnIndex)" 
                        :disabled="columns[0].cards.length >= maxCardsInColumn1"
                    >
                        Добавить карточку
                    </button>
                </div>
            </div>
        `,
    methods: {
        addCard(columnIndex) {
            if (columnIndex === 0 && this.columns[0].cards.length >= this.maxCardsInColumn1) {
                alert('Первая колонка уже заполнена!');
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
                    completed: false,
                    hasSubItems: false, // Инициализация флага подпунктов
                    subItems: []
                });
            }

            let addMore = confirm('Хотите ли добавить ещё пункт?');
            while (addMore && newCard.items.length < 5) {
                let count = prompt('Сколько пунктов вы хотите добавить? (1 или 2)');
                count = parseInt(count, 10);

                if (count === 1 || count === 2) {
                    for (let i = 0; i < count; i++) {
                        if (newCard.items.length < 5) {
                            newCard.items.push({
                                text: prompt('Введите пункт списка:'),
                                completed: false,
                                hasSubItems: false, // Инициализация флага подпунктов
                                subItems: []
                            });
                        } else {
                            alert('Достигнуто максимальное количество пунктов (5).');
                            break;
                        }
                    }
                }
                addMore = confirm('Готово');
            }
            this.columns[columnIndex].cards.push(newCard);
        },

        addSubItem(payload) {
            const {cardId, itemIndex, columnIndex} = payload;
            const column = this.columns[columnIndex];
            const cardIndex = column.cards.findIndex(c => c.id === cardId);
            if (cardIndex === -1) return;

            const card = column.cards[cardIndex];
            const item = card.items[itemIndex];

            const subItemText = prompt('Введите текст подпункта:');
            if (subItemText) {
                item.subItems.push({
                    text: subItemText,
                    completed: false
                });
                item.hasSubItems = true;
            }
        },

        moveCard(fromColumn, toColumn, cardId) {
            if (toColumn === 1 && this.columns[1].cards.length >= this.maxCardsInColumn2) {
                alert('Вторая колонка уже заполнена!');
                return;
            }

            const cardIndex = this.columns[fromColumn].cards.findIndex(c => c.id === cardId);
            if (cardIndex === -1) return;

            const card = this.columns[fromColumn].cards.splice(cardIndex, 1)[0];
            card.completedDate = toColumn === 2 ? new Date().toLocaleString() : null;
            card.locked = false;
            this.columns[toColumn].cards.push(card);
        },

        checkLockState() {
            this.isColumn1Locked = this.columns[1].cards.length >= this.maxCardsInColumn2
                && this.columns[0].cards.some(card =>
                    card.items.filter(item => item.completed).length / card.items.length > 0.5
                );

            this.columns[0].cards.forEach(card => (card.locked = this.isColumn1Locked));
        },

        updateItem(payload) {
            const { cardId, itemIndex, columnIndex } = payload;
            const column = this.columns[columnIndex];
            const cardIndex = column.cards.findIndex(c => c.id === cardId);
            if (cardIndex === -1) return;

            const card = column.cards[cardIndex];
            const item = card.items[itemIndex];

            // Обновление состояния подпунктов
            if (item.hasSubItems) {
                const allSubItemsCompleted = item.subItems.every(sub => sub.completed);
                item.completed = allSubItemsCompleted;
            } else {
                // Если подпунктов нет, то основной пункт может быть выполнен независимо
                item.completed = !item.completed;
            }

            // Логика перемещения
            const completedCount = card.items.filter(i => i.completed).length;
            const totalItems = card.items.length;

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

            this.checkLockState();
        }
    },
    created() {
        const savedData = JSON.parse(localStorage.getItem('noteAppData'));
        if (savedData) this.columns = savedData.columns;
    },
    watch: {
        columns: {
            deep: true,
            handler() {
                localStorage.setItem('noteAppData', JSON.stringify({columns: this.columns}));
            }
        }
    },
});

Vue.component('note-card', {
    props: ['card', 'columnIndex'],
    template: `
        <div class="note-card" :class="{ locked: card.locked }">
            <h3>{{ card.title }}</h3>
            <ul>
                <li v-for="(item, index) in card.items" :key="index">
                    <div>
                        <input 
                            type="checkbox" 
                            :checked="item.completed" 
                            @change="toggleItem(index)" 
                            :disabled="card.locked || isItemDisabled(item)"
                        />
                        <div class="item-content">
                            <span>{{ item.text }}</span>
                            <button @click="$emit('add-subitem', { 
                                cardId: card.id, 
                                itemIndex: index, 
                                columnIndex: columnIndex 
                            })">
                                Добавить подпункт
                            </button>
                            <ul v-if="item.hasSubItems">
                                <li v-for="(subItem, subIndex) in item.subItems" :key="subIndex">
                                    <input 
                                        type="checkbox" 
                                        :checked="subItem.completed" 
                                        @change="toggleSubItem(index, subIndex)" 
                                        :disabled="card.locked"
                                    />
                                    <span>{{ subItem.text }}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </li>
            </ul>
            <p v-if="card.completedDate">Завершено: {{ card.completedDate }}</p>
        </div>
    `,
    computed: {
        isItemDisabled() {
            return (item) => {
                if (item.hasSubItems) {
                    return item.subItems.some(sub => !sub.completed);
                }
                return false;
            };
        }
    },
    methods: {
        toggleItem(index) {
            this.$emit('update-item', {
                cardId: this.card.id,
                itemIndex: index,
                columnIndex: this.columnIndex
            });
        },
        toggleSubItem(itemIndex, subIndex) {
            const item = this.card.items[itemIndex];
            item.subItems[subIndex].completed = !item.subItems[subIndex].completed;

            // Проверка выполнения всех подпунктов
            const allCompleted = item.subItems.every(sub => sub.completed);
            item.completed = allCompleted;

            this.$emit('update-item', {
                cardId: this.card.id,
                itemIndex: itemIndex,
                columnIndex: this.columnIndex
            });
        }
    }
})