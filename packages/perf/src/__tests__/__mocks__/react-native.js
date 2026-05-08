const React = require('react')

const MockView = ({ children, style, ...props }) =>
  React.createElement('View', { style, ...props }, children)

const MockText = ({ children, style, ...props }) =>
  React.createElement('Text', { style, ...props }, children)

const StyleSheet = {
  create: (styles) => styles,
  flatten: (style) => style,
}

module.exports = { View: MockView, Text: MockText, StyleSheet }
