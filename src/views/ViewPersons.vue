<template>
    <v-card>
        <PageTitle>
            <template #default> Между кем делить? </template>
            <template #button>
                <v-btn @click="billStore.addPerson()" class="text-none">
                    Добавить человека
                </v-btn>
            </template>
        </PageTitle>
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
            <PageDescription v-else>
                <template #icon>
                    <v-icon icon="mdi-account-multiple-plus" size="100" />
                </template>
                <template #default>
                    Добавьте тех, между кем будем делить счёт
                </template>
            </PageDescription>
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

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import router from '@/router'
import { useBillStore } from '@/store/billStore'
import {
    ModalContent,
    Person,
    ValidationRule,
    FormValidation,
    ErrorType,
} from '@/types'
import PageTitle from '@/components/PageTitle.vue'
import PageDescription from '@/components/PageDescription.vue'

const billStore = useBillStore()

const nameValidation = reactive([
    (value: string): ValidationRule => {
        return value.length > 0 ? true : 'Введите имя!'
    },
    (value: string): ValidationRule => {
        const store = useBillStore()
        const compareFunc = (person: Person): boolean => person.name === value
        const findIndex: number = store.persons.findIndex(compareFunc)
        const findLastIndex: number = store.persons.findLastIndex(compareFunc)
        return findIndex === findLastIndex
            ? true
            : 'Имена не могут повторяться!'
    },
])

const personsForm = ref<HTMLFormElement | null>(null)
const isFormValid = ref<FormValidation>(null)
const error = ref<ErrorType>('UnknownError')
async function validateForm() {
    try {
        if (billStore.persons.length < 2) {
            error.value = 'FewPositionsError'
            return false
        }
        if (!personsForm.value) {
            error.value = 'UnknownError'
            return false
        }
        await personsForm.value.validate()
        if (isFormValid.value) {
            return true
        }
        error.value = 'InvalidDataError'
    } catch {
        error.value = 'UnknownError'
    }
    return false
}

const personsModalContent = computed(() => {
    const content: ModalContent = {
        title: '',
        text: '',
    }
    switch (error.value) {
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
})
const showModal = ref(false)
function hideModal() {
    showModal.value = false
}

function redirectToItems() {
    router.push({ name: 'items' })
}

onBeforeRouteLeave(async (to) => {
    if (to.name !== 'items') return true
    if (!(await validateForm())) {
        showModal.value = true
        return false
    }
})
</script>

<style lang="scss" scoped>
.action-btn-container {
    width: 100%;
}
</style>
