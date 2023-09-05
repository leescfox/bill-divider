<template>
    <v-card>
        <v-card-item>
            <div class="d-flex flex-column align-center">
                <v-card-title>Между кем делить?</v-card-title>
                <v-btn @click="billStore.addPerson()" class="text-none ma-2">
                    Добавить человека
                </v-btn>
            </div>
        </v-card-item>
        <v-divider />
        <v-form
            v-model="isFormValid"
            ref="personsForm"
            @submit.prevent="redirectToItems()"
        >
            <template v-if="billStore.hasPersons">
                <div
                    v-for="person in billStore.persons"
                    :key="person.id"
                    class="d-flex mb-2"
                >
                    <v-text-field
                        v-model.trim="person.name"
                        :rules="nameValidation"
                        counter
                        maxlength="15"
                        autofocus
                        placeholder="Имя человека"
                        density="comfortable"
                    />
                    <v-btn
                        @click="billStore.deletePerson(person.id)"
                        icon="mdi-trash-can-outline"
                        elevation="1"
                    />
                </div>
            </template>
            <div
                v-else
                class="empty-list-wrapper d-flex flex-column align-center"
            >
                <v-icon icon="mdi-account-multiple-plus" size="100" />
                <span class="empty-list-text">
                    Добавьте тех, между кем будем делить счёт
                </span>
            </div>
            <v-btn type="submit" class="text-none mt-2" variant="tonal" block>
                Продолжить
            </v-btn>
        </v-form>
    </v-card>
    <v-dialog v-model="showModal" width="auto">
        <v-card>
            <v-card-title> {{ personsModalContent.title }} </v-card-title>
            <v-card-text> {{ personsModalContent.text }} </v-card-text>
            <v-card-actions>
                <div class="action-btn-container d-flex justify-end">
                    <v-btn @click="hideModal()" class="text-none">
                        Хорошо
                    </v-btn>
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
    ValidationRule,
    FormValidation,
    ErrorType,
} from '@/types'

export default defineComponent({
    setup() {
        const billStore = useBillStore()
        return { billStore }
    },
    data() {
        return {
            isFormValid: null as FormValidation,
            nameValidation: [
                (value: string): ValidationRule => {
                    return value.length > 0 ? true : 'Введите имя!'
                },
                (value: string): ValidationRule => {
                    const store = useBillStore()
                    const compareFunc = (person: Person): boolean =>
                        person.name === value
                    const findIndex: number =
                        store.persons.findIndex(compareFunc)
                    const findLastIndex: number =
                        store.persons.findLastIndex(compareFunc)
                    return findIndex === findLastIndex
                        ? true
                        : 'Имена не могут повторяться!'
                },
            ],
            showModal: false as boolean,
            error: 'UnknownError' as ErrorType,
        }
    },
    computed: {
        personsModalContent(): ModalContent {
            const content: ModalContent = {
                title: '',
                text: '',
            }
            switch (this.error) {
                case 'FewPositionsError':
                    content.title = 'Слишком мало людей!'
                    content.text = 'Должно быть добавлено хотя бы два человека!'
                    break
                case 'InvalidDataError':
                    content.title = 'Данные введены неверно!'
                    content.text =
                        'Пожалуйста, проверьте корректность введённых данных.'
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
        async validateForm(): Promise<boolean> {
            if (this.billStore.persons.length < 2) {
                this.error = 'FewPositionsError'
            } else {
                try {
                    await (
                        this.$refs['personsForm'] as HTMLFormElement
                    ).validate()
                    if (this.isFormValid) {
                        return true
                    }
                    this.error = 'InvalidDataError'
                } catch {
                    this.error = 'UnknownError'
                }
            }
            return false
        },
        redirectToItems(): void {
            this.$router.push({ name: 'items' })
        },
        hideModal(): void {
            this.showModal = false
        },
    },
    async beforeRouteLeave(to) {
        if (to.name !== 'items') return true
        if (!(await this.validateForm())) {
            this.showModal = true
            return false
        }
    },
})
</script>

<style lang="scss" scoped>
.empty-list-wrapper {
    width: 50%;
    margin: 0 auto;
    .empty-list-text {
        text-align: center;
    }
}

.action-btn-container {
    width: 100%;
}
</style>
