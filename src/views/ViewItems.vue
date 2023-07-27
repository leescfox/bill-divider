<template>
    <v-card>
        <v-card-item>
            <div class="d-flex flex-column align-center">
                <v-card-title>Что и как делить?</v-card-title>
                <v-btn @click="addItem" class="text-none ma-2">
                    Добавить продукт
                </v-btn>
            </div>
        </v-card-item>
        <v-divider />
        <v-form
            v-model="isFormValid"
            ref="itemsForm"
            @submit.prevent="toResults"
        >
            <template v-if="areItems">
                <div
                    v-for="(item, index) in items"
                    :key="item.id"
                    class="item-container pa-2 mt-2"
                >
                    <div class="d-flex">
                        <div class="side-container">
                            <v-text-field
                                v-model.trim="item.name"
                                :rules="productNameValidation"
                                counter
                                maxlength="30"
                                variant="outlined"
                                placeholder="Продукт"
                                density="compact"
                                bg-color="inputBG"
                            />
                        </div>
                        <div class="d-flex side-container">
                            <v-text-field
                                v-model.trim="item.price"
                                :rules="priceValidation"
                                append-inner-icon="mdi-currency-rub"
                                type="number"
                                min="0"
                                variant="outlined"
                                placeholder="Цена"
                                density="compact"
                                bg-color="inputBG"
                            />
                            <v-btn
                                @click="deleteItem(index)"
                                icon="mdi-trash-can-outline"
                                elevation="1"
                            />
                        </div>
                    </div>
                    <v-select
                        v-model="item.payer"
                        :items="billStore.persons"
                        item-title="name"
                        return-object
                        :rules="payerValidation"
                        variant="outlined"
                        placeholder="Оплатил(а)"
                        density="compact"
                        bg-color="inputBG"
                        class="mt-2"
                    />
                    <v-select
                        v-model="item.consumers"
                        :items="billStore.persons"
                        item-title="name"
                        return-object
                        multiple
                        :rules="consumersValidation"
                        chips
                        variant="outlined"
                        placeholder="Пользовались"
                        density="compact"
                        bg-color="inputBG"
                        class="mt-2"
                    />
                </div>
            </template>
            <div
                v-else
                class="empty-list-wrapper d-flex flex-column align-center"
            >
                <v-icon icon="mdi-receipt-text-check-outline" size="100" />
                <span class="empty-list-text">
                    Добавьте то, что будем делить, а также тех, кто платил, и
                    тех, кто пользовался
                </span>
            </div>
            <v-btn type="submit" class="text-none mt-2" variant="tonal" block>
                Сохранить и продолжить
            </v-btn>
        </v-form>
    </v-card>
    <v-dialog v-model="showModal" width="auto">
        <v-card>
            <v-card-title>{{ itemsModalContent.title }}</v-card-title>
            <v-card-text>{{ itemsModalContent.text }}</v-card-text>
            <v-card-actions>
                <div class="action-btn-container d-flex justify-end">
                    <v-btn @click="hideModal" class="text-none"> Хорошо </v-btn>
                </div>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useBillStore } from '@/store/billStore'
import {
    ModalContent,
    Person,
    Item,
    ValidationRule,
    FormValidation,
    ErrorType,
} from '@/types'

export default defineComponent({
    setup() {
        const billStore = useBillStore()
        return { billStore }
    },
    created() {
        this.items = this.billStore.returnItemsClone()
    },
    data() {
        return {
            items: [] as Item[],
            isFormValid: null as FormValidation,
            productNameValidation: [
                (value: string): ValidationRule => {
                    return value.length > 0 ? true : 'Введите название!'
                },
            ],
            priceValidation: [
                (value: string | undefined): ValidationRule => {
                    return value !== undefined && value.length > 0
                        ? true
                        : 'Введите цену!'
                },
                (value: number): ValidationRule => {
                    return value > 0 ? true : 'Неверное значение!'
                },
            ],
            consumersValidation: [
                (value: Person[]): ValidationRule => {
                    return value.length > 0 ? true : 'Добавьте пользовавшихся!'
                },
            ],
            payerValidation: [
                (value: Person | null): ValidationRule => {
                    return value !== null ? true : 'Кто платил?'
                },
            ],
            showModal: false as boolean,
            error: 'UnknownError' as ErrorType,
        }
    },
    computed: {
        areItems(): boolean {
            return this.items.length > 0
        },
        itemsModalContent(): ModalContent {
            const content: ModalContent = {
                title: '',
                text: '',
            }
            switch (this.error) {
                case 'FewItemsError':
                    content.title = 'Слишком мало позиций!'
                    content.text = 'Должна быть хотя бы одна позиция!'
                    break
                case 'UnknownError':
                default:
                    content.title = 'Неизвестная ошибка!'
                    content.text = 'Произошла неизвестная ошибка!'
                    break
            }
            return content
        },
    },
    methods: {
        addItem(): void {
            this.items.unshift({
                name: '',
                consumers: [] as Person[],
                id: this.billStore.createId(),
            } as Item)
        },
        deleteItem(index: number): void {
            this.items.splice(index, 1)
        },
        async toResults(): Promise<void> {
            if (!this.areItems) {
                this.error = 'FewItemsError'
                this.showModal = true
                return
            }
            try {
                await (this.$refs['itemsForm'] as HTMLFormElement).validate()
                if (this.isFormValid) {
                    this.billStore.setItemsAndCalculate(this.items)
                    this.$router.push({ name: 'results' })
                }
            } catch {
                this.error = 'UnknownError'
                this.showModal = true
            }
        },
        hideModal(): void {
            this.showModal = false
        },
    },
})
</script>

<style lang="scss" scoped>
.item-container {
    border: 1px solid rgb(158, 158, 158);
    border-radius: 4px;
    background-color: #dbdbdb7a;
    .side-container {
        flex: 1;
    }
}

.empty-list-wrapper {
    width: 70%;
    margin: 0 auto;
    .empty-list-text {
        text-align: center;
    }
}

.action-btn-container {
    width: 100%;
}
</style>
