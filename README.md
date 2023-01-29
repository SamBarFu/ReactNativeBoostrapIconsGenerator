# React Native Bootstrap Icons Generator
A tool that allows you to quickly and easily convert [Bootstrap Icons](https://icons.getbootstrap.com/) into [React Native SVG](https://github.com/software-mansion/react-native-svg) compatible icons with TypeScript support. The generated icons are in PascalCase format, making them easy to use in your React Native project.

The repository also includes a template file for the icons, making it easy to customize the generated icons to fit your project's needs. Overall, this tool is a time saver for any React Native developer looking to include Bootstrap Icons in their project.

## Install

```
npm install react-native-bootstrap-icons
```

## Generate
1. Generate all the bootstrap icons

```
node generate-icons.js
```
2. Generate a single or multiple icons _(separated by a space; not case sensitive)_

```
node generate-icons.js alarm alarm-fill
```
## Usage 
Just copy the generated icons into your project and import them as you would any other React Native component.

Example below is the `alarm-fill` icon.
``` tsx
<BootstrapIconAlarmFill width="20" height="20" fill="#7ee383" />
```