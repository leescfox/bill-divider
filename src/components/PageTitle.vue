<template>
    <div class="title">
        <div class="title__text">
            <slot></slot>
        </div>
        <div v-if="$slots.button" class="title__button">
            <slot name="button"></slot>
        </div>
    </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.title {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px;
    font-size: 20px;
    font-weight: 500;
}
.title__button {
    margin: 8px;
}
</style>
