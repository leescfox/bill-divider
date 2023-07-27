import { defineStore } from 'pinia'
import { Person, Item, Debt } from '@/types'

export const useBillStore = defineStore('billStore', {
    state: () => ({
        persons: [] as Person[],
        items: [] as Item[],
        results: [] as Debt[][],
    }),
    getters: {
        arePersons(state): boolean {
            return state.persons.length > 1
        },
        areResults(state): boolean {
            return state.results.length > 0
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
        areTransformedResults(): boolean {
            return (
                this.debtsFromPersons.length > 0 &&
                this.debtsToPersons.length > 0
            )
        },
    },
    actions: {
        createId(): symbol {
            return Symbol('id')
        },
        returnPersonsClone(personsArray?: Person[]): Person[] {
            const personsClone: Person[] = []
            if (personsArray === undefined) {
                personsArray = this.persons
            }
            for (let i = 0; i < personsArray.length; i++) {
                personsClone.push({ ...personsArray[i] })
            }
            return personsClone
        },
        setPersons(personsArray: Person[]): void {
            this.persons = this.returnPersonsClone(personsArray)
            this.items = []
            this.results = []
        },
        returnItemsClone(itemsArray?: Item[]): Item[] {
            const itemsClone: Item[] = []
            if (itemsArray === undefined) {
                itemsArray = this.items
            }
            for (let i = 0; i < itemsArray.length; i++) {
                itemsClone.push({
                    name: itemsArray[i].name,
                    price: itemsArray[i].price,
                    payer: { ...itemsArray[i].payer },
                    consumers: itemsArray[i].consumers.reduce<Person[]>(
                        (result: Person[], current: Person): Person[] => {
                            result.push({ ...current })
                            return result
                        },
                        []
                    ),
                    id: itemsArray[i].id,
                })
            }
            return itemsClone
        },
        setItemsAndCalculate(itemsArray: Item[]): void {
            this.items = this.returnItemsClone(itemsArray)
            this.calculateResults()
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
                    (person: Person): boolean => person.id === item.payer.id
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
