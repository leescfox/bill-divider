import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { Person, Item, Debt } from '@/types'

export const useBillStore = defineStore('billStore', () => {
    const persons = ref<Person[]>([])
    const hasPersons = computed(() => persons.value.length > 0)

    function addPerson() {
        persons.value.unshift({
            name: '',
            id: createId(),
        })
    }
    function deletePerson(id: symbol) {
        persons.value = persons.value.filter((person) => person.id !== id)
        for (const item of items.value) {
            if (item.payer !== undefined && item.payer.id === id) {
                item.payer = undefined
            }
            item.consumers = item.consumers.filter(
                (consumer) => consumer.id !== id
            )
        }
    }

    const items = ref<Item[]>([])
    const hasItems = computed(() => items.value.length > 0)

    function addItem() {
        items.value.unshift(<Item>{
            name: '',
            consumers: <Person[]>[],
            id: createId(),
        })
    }
    function deleteItem(id: symbol) {
        items.value = items.value.filter((item) => item.id !== id)
    }

    const results = ref<Debt[][]>([])
    const hasResults = computed(() => results.value.length > 0)
    const debtsFromPersons = computed(() =>
        results.value.reduce((result, current) => {
            const filteredDebtsRow = current.filter(
                (element) => element.amount > 0
            )
            if (filteredDebtsRow.length > 0) {
                result.push(filteredDebtsRow)
            }
            return result
        }, <Debt[][]>[])
    )
    const debtsToPersons = computed(() => {
        const transformedResults = <Debt[][]>[]
        for (let i = 0; i < results.value.length; i++) {
            const newDebtsRow = <Debt[]>[]
            for (let j = 0; j < results.value.length; j++) {
                const item = results.value[j][i]
                if (item.amount > 0) {
                    newDebtsRow.push(item)
                }
            }
            if (newDebtsRow.length > 0) {
                transformedResults.push(newDebtsRow)
            }
        }
        return transformedResults
    })
    const hasDebts = computed(
        () =>
            debtsFromPersons.value.length > 0 && debtsToPersons.value.length > 0
    )
    function calculateResults() {
        results.value = []
        for (let i = 0; i < persons.value.length; i++) {
            results.value.push([])
            for (let j = 0; j < persons.value.length; j++) {
                results.value[i].push({
                    from: persons.value[i],
                    to: persons.value[j],
                    amount: 0,
                })
            }
        }
        for (const item of items.value) {
            const payerIndex = persons.value.findIndex(
                (person) =>
                    item.payer !== undefined && item.payer.id === person.id
            )
            const priceSplit = item.price / item.consumers.length
            let consumersFound = 0
            for (
                let i = 0;
                i < persons.value.length &&
                consumersFound < item.consumers.length;
                i++
            ) {
                for (let j = 0; j < item.consumers.length; j++) {
                    if (persons.value[i].id !== item.consumers[j].id) {
                        continue
                    }
                    consumersFound++
                    if (i !== payerIndex) {
                        results.value[i][payerIndex].amount += priceSplit
                    }
                    break
                }
            }
        }
        for (let i = 0; i < results.value.length; i++) {
            for (let j = i + 1; j < results.value[i].length; j++) {
                const lowest = Math.min(
                    results.value[i][j].amount,
                    results.value[j][i].amount
                )
                results.value[i][j].amount = +(
                    results.value[i][j].amount - lowest
                ).toFixed(2)
                results.value[j][i].amount = +(
                    results.value[j][i].amount - lowest
                ).toFixed(2)
            }
        }
    }

    function createId() {
        return Symbol('id')
    }

    function resetData() {
        persons.value = []
        items.value = []
        results.value = []
    }

    return {
        persons,
        hasPersons,
        addPerson,
        deletePerson,
        items,
        hasItems,
        addItem,
        deleteItem,
        results,
        hasResults,
        debtsFromPersons,
        debtsToPersons,
        hasDebts,
        calculateResults,
        createId,
        resetData,
    }
})
