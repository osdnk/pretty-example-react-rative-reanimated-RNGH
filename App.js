/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import Animated from 'react-native-reanimated';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const {
  set,
  cond,
  eq,
  add,
  multiply,
  lessThan,
  abs,
  modulo,
  Extrapolate,
  block,
  round,
  interpolate,
  divide,
  sub,
  color,
  Value,
  event,
} = Animated;

function match(condsAndResPairs, offset = 0) {
  if (condsAndResPairs.length - offset === 1) {
    return condsAndResPairs[offset];
  } else if (condsAndResPairs.length - offset === 0) {
    return undefined;
  }
  return cond(
    condsAndResPairs[offset],
    condsAndResPairs[offset + 1],
    match(condsAndResPairs, offset + 2)
  );
}

function colorHSV(h /* 0 - 360 */, s /* 0 - 1 */, v /* 0 - 1 */) {
  // Converts color from HSV format into RGB
  // Formula explained here: https://www.rapidtables.com/convert/color/hsv-to-rgb.html
  const c = multiply(v, s);
  const hh = divide(h, 60);
  const x = multiply(c, sub(1, abs(sub(modulo(hh, 2), 1))));

  const m = sub(v, c);

  const colorRGB = (r, g, b) =>
    color(
      round(multiply(255, add(r, m))),
      round(multiply(255, add(g, m))),
      round(multiply(255, add(b, m)))
    );

  return match([
    lessThan(h, 60),
    colorRGB(c, x, 0),
    lessThan(h, 120),
    colorRGB(x, c, 0),
    lessThan(h, 180),
    colorRGB(0, c, x),
    lessThan(h, 240),
    colorRGB(0, x, c),
    lessThan(h, 300),
    colorRGB(x, 0, c),
    colorRGB(c, 0, x) /* else */,
  ]);
}

export default class App extends Component {
  constructor(props) {
    super(props);
    this.values = [];
    this._transX = new Value(0);
    this._transY = new Value(0);
    const offsetX = new Value(0);
    const offsetY = new Value(0);

    this._onGestureEvent = event([
      {
        nativeEvent: ({ translationX: x, translationY: y, state }) =>
          block([
            set(this._transX, add(x, offsetX)),
            set(this._transY, add(y, offsetY)),
            cond(eq(state, State.END), [
              set(offsetX, add(offsetX, x)),
              set(offsetY, add(offsetY, y)),
            ]),
          ]),
      },
    ]);
    for (let i = 0; i < 10; i++) {
      this.values[i] = [];
      for (let j = 0; j < 10; j++) {
        const sat = interpolate(multiply(i+5, this._transX), {
          inputRange: [-300, 300],
          outputRange: [0, 0.9]
        })
        this.values[i][j] = { s: sat, v: (j+1)/20, h: this._transY };
      }
    }
  }
  render() {
    return (
      <PanGestureHandler
        maxPointers={1}
        onGestureEvent={this._onGestureEvent}
        onHandlerStateChange={this._onGestureEvent}>
        <Animated.View style={styles.container}>
          <Animated.View style={{ position: 'absolute', width: '100%', height:'100%' }}>
            {this.values.map((m, i) =>
              <View key={i} style={{ flexDirection: 'row',  width: '100%', height: '10%' }}>
                {m.map(j => (
                  <Animated.View key={`${j.s}${j.v}`} style={{
                    width: '10%',
                    height: '100%',
                    backgroundColor: colorHSV(j.h, j.s, j.v) }}
                  />
                ))}
              </View>
            )}
          </Animated.View>
          <Animated.Text style={{fontSize: 20, letterSpacing: 12, fontStyle: 'italic', paddingBottom: 100}}>
            Gesture Handler
          </Animated.Text>
          <Animated.Text style={{fontSize: 30, letterSpacing: 12, paddingBottom: 100, transform: [{ rotate: divide(this._transY, 50) }]}}>
            REANIMATED
          </Animated.Text>
        </Animated.View>
      </PanGestureHandler>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
