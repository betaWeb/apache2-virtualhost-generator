<template>
  <div id="app" class="wrapper">
    <div class="container">
      <h1 class="app-title">Apache2 VHosts manager</h1>
      <router-view/>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'App'
  }
</script>

<style lang="scss">
  @import '../static/scss/_variables.scss';

  * {
    box-sizing: border-box;
  }

  p {
    color: $text-color;
  }

  a {
    color: $main-color;
    text-decoration: none;

    &:hover {
      text-decoration: none;
      color: rgba($main-color, .667);
    }
  }

  html, body {
    position: relative;
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    min-height: 100vh;
    font-family: 'Ubuntu';
  }

  .success-color {
    color: $success-color;
  }

  .error-color {
    color: $error-color;
  }

  .wrapper {
    position: absolute;
    width: 100%;
    min-height: 100%;
    top: 0;
    right: 0;
    bottom: auto;
    left: 0;
    padding: 2em;
    background-color: $bg-color;

    .container {
      position: relative;
      width: 900px;
      height: 100%;
      margin: 0 auto;
      overflow-x: hidden;
      overflow-y: auto;
      // padding: 2em;
      background-color: rgba($white-color,.9);
      margin-top: 3em;
      border-radius: 8px;
      box-shadow: 0 0 16px -2px rgba($black-color,.05);
    }
  }

  .app-title {
    position: relative;
    display: block;
    float: left;
    width: 100%;
    text-align: center;
    font-size: 1.667em;
    color: $text-color;
    font-weight: 500;
    margin-bottom: 1em;
    padding-bottom: .334em;

    &::before {
      position: absolute;
      content: '';
      bottom: 0;
      background-color: rgba($main-color, .7);
      left: 50%;
      width: 3em;
      height: 3px;
      transform: translateX(-50%);
    }
  }

  .toolbar, .info {
      float: left;
      display: block;
      width: 100%;
  }
  .toolbar {
      padding: 0 2em;
      height: 50px;
      line-height: 50px;

      .toolbar__link {
          float: right;
          font-weight: bold;

          &.back__link {
              float: left;
          }
      }
  }

  .icon {
    width: 24px;
    height: 24px;
    vertical-align: middle;
    padding: 4px;
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke: rgba($text-color, .7);

    &.success-color {
      stroke: $success-color;
    }

    &.error-color {
      stroke: $error-color;
    }
  }

  input, select, textarea {
    background-color: rgba($dark-color, .1);
    border: none;
    border-bottom: 2px solid rgba($main-color, .3334);
    padding: .25em .5em;
    margin-bottom: 1em;
    width: 100%;

    &:focus {
      outline: none;
      box-shadow: none;
      border-bottom-color: rgba($main-color, 1);
    }
  }

  input:not([type="checkbox"]):not([type="radio"]), select {
    height: 36px;
    line-height: 36px;
  }

  textarea {
    resize: vertical;
    min-height: 300px;
    max-height: 600px;
  }

  .input-group, .checkable-group {
    width: 100%;
    float: left;
    display: block;
  }

  .input-group label {
      position: relative;
      width: 100%;
      float: left;
      display: block;
      margin: .5em 0;
  }

  .checkable-group label {
      position: relative;
      display: inline-block;
      margin: 1em 0;
      user-select: none;
      padding-left: 40px;
      cursor: pointer;

      &::before {
        position: absolute;
        vertical-align: middle;
        content: '';
        width: 32px;
        height: 16px;
        left: 0;
        border-radius: 16px;
        background-color: rgba($dark-color, .3);
      }
      &::after {
        position: absolute;
        content: '';
        width: 16px;
        height: 16px;
        left: 0;
        border-radius: 50%;
        transition: transform .3s;
      }
  }

  input[type="checkbox"], input[type="radio"] {
    display: inline-block;
    width: auto;
    display:none;

    & + label::after {
      background-color: rgba($dark-color, .3);
    }

    &:checked + label::after {
      background-color: $main-color;
      transform: translateX(16px);
    }
  }

  [type="submit"] {
    float: right;
    display: block;
    background-color: transparent;
    border: none;
    color: $main-color;
    font-weight: 600;
    font-size: 1em;
    padding: .667em 1em;
    cursor: pointer;

    &:hover {
      color: rgba($main-color, .667);
    }

    &:focus, &:active {
      box-shadow: none;
      outline: none;
    }
  }

  .btn {
      font-size: .85em;
      align-self: center;
      background-color: transparent;
      border: none;
      width: 36px;
      height: 36px;
      padding: 0;
      text-align: center;
      line-height: 36px;
      cursor: pointer;

      &:hover .action__icon {
        stroke: $main-color;
      }
      &:focus, &:active {
        box-shadow: none;
        outline: none;
      }
  }
</style>
