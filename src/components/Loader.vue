<template>
    <div class="loader">
        <div class="loader__wrapper">
            <p class="loader__content"></p>
        </div>
    </div>
</template>

<style lang="scss">
    @import '../../static/scss/_variables.scss';

    .loader {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        vertical-align: middle;
        background-color: rgba($dark-color, .25);

        .loader__wrapper {
            position: relative;
            width: 100%;
            height: 100%;

            .loader__content {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate3d(-50%, -50%, 0);
                border: 6px solid rgba($black-color, .25);
                // border-top-color: $main-color;
                width: 60px;
                height: 60px;
                border-radius: 60px;
                // animation: rotate 1.7s infinite;

                &::before {
                    content: '';
                    position: absolute;
                    box-sizing: border-box;
                    top: -6px;
                    right: -6px;
                    bottom: -6px;
                    left: -6px;
                    border-radius: 50%;
                    width: inherit;
                    height: inherit;
                    border: 6px solid transparent;
                    border-top-color: $main-color;
                    animation: rotate 1.7s infinite;
                }
            }
        }
    }
    @keyframes rotate {
        from { transform: rotate(0) }
        to { transform: rotate(360deg) }
    }
</style>

