import { defineStore } from 'pinia'
import { Person, Item, Debt } from '@/types'

export const useBillStore = defineStore('billStore', {
    state: () => ({
        persons: [] as Person[],
        items: [] as Item[],
        results: [] as Debt[][],
    }),
    getters: {
        hasPersons(state): boolean {
            return state.persons.length > 0
        },
        hasItems(state): boolean {
            return state.items.length > 0
        },
        hasResults(): boolean {
            return (
                this.debtsFromPersons.length > 0 &&
                this.debtsToPersons.length > 0
            )
        },
        debtsFromPersons(state): Debt[][] {
            return state.results.reduce<Debt[][]>(
                (result: Debt[][], current: Debt[]): Debt[][] => {
                    const filteredDebtsRow: Debt[] = current.filter(
                        (element: Debt): boolean => element.amount > 0
                    )
                    if (filteredDebtsRow.length > 0) {
                        result.push(filteredDebtsRow)
                    }
                    return result
                },
                []
            )
        },
        debtsToPersons(state): Debt[][] {
            const transformedResults: Debt[][] = []
            for (let i = 0; i < state.results.length; i++) {
                const newDebtsRow: Debt[] = []
                for (let j = 0; j < state.results.length; j++) {
                    const item: Debt = state.results[j][i]
                    if (item.amount > 0) {
                        newDebtsRow.push(item)
                    }
                }
                if (newDebtsRow.length > 0) {
                    transformedResults.push(newDebtsRow)
                }
            }
            return transformedResults
        },
    },
    actions: {
        createId(): symbol {
            return Symbol('id')
        },
        addPerson(): void {
            this.persons.unshift({
                name: '',
                id: this.createId(),
            } as Person)
        },
        deletePerson(id: symbol): void {
            const deletePersonIndex: number = this.persons.findIndex(
                (person: Person): boolean => person.id === id
            )
            this.persons.splice(deletePersonIndex, 1)
            for (const item of this.items) {
                if (item.payer !== undefined && item.payer.id === id) {
                    item.payer = undefined
                }
                for (let i = 0; i < item.consumers.length; i++) {
                    if (item.consumers[i].id === id) {
                        item.consumers.splice(i, 1)
                        break
                    }
                }
            }
        },
        addItem(): void {
            this.items.unshift({
                name: '',
                consumers: [] as Person[],
                id: this.createId(),
            } as Item)
        },
        deleteItem(id: symbol): void {
            const deleteItemIndex: number = this.items.findIndex(
                (item: Item): boolean => item.id === id
            )
            this.items.splice(deleteItemIndex, 1)
        },
        calculateResults(): void {
            this.results = []
            for (let i = 0; i < this.persons.length; i++) {
                this.results.push([])
                for (let j = 0; j < this.persons.length; j++) {
                    this.results[i].push({
                        from: this.persons[i],
                        to: this.persons[j],
                        amount: 0,
                    })
                }
            }
            for (const item of this.items) {
                const payerIndex: number = this.persons.findIndex(
                    (person: Person): boolean =>
                        item.payer !== undefined && item.payer.id === person.id
                )
                const priceSplit: number = item.price / item.consumers.length
                let consumersFound: number = 0
                for (
                    let i = 0;
                    i < this.persons.length &&
                    consumersFound < item.consumers.length;
                    i++
                ) {
                    for (let j = 0; j < item.consumers.length; j++) {
                        if (this.persons[i].id !== item.consumers[j].id) {
                            continue
                        }
                        consumersFound++
                        if (i !== payerIndex) {
                            this.results[i][payerIndex].amount += priceSplit
                        }
                        break
                    }
                }
            }
            for (let i = 0; i < this.results.length; i++) {
                for (let j = i + 1; j < this.results[i].length; j++) {
                    const lowest: number = Math.min(
                        this.results[i][j].amount,
                        this.results[j][i].amount
                    )
                    this.results[i][j].amount = +(
                        this.results[i][j].amount - lowest
                    ).toFixed(2)
                    this.results[j][i].amount = +(
                        this.results[j][i].amount - lowest
                    ).toFixed(2)
                }
            }
        },
        resetData(): void {
            this.persons = []
            this.items = []
            this.results = []
        },
    },
})
