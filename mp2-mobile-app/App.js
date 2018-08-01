import React from 'react';
import {StyleSheet,Text,View} from 'react-native';

export default class App extends React.Component {
  render() {
    return (
      <View>
        <Title text="Photos" />
        <Text style={styles.normalText}>ohi</Text>
      </View>
    );
  }
}

class Title extends React.Component {
  render() {
    return (
      <View>
        <Text style={styles.bigText}>MediaPlayer2</Text>
        <Text style={styles.titleText}>{this.props.text}</Text>
        <View style={styles.hr} />
      </View>
    );
  }
}

var styles = StyleSheet.create({
  bigText: {
    fontSize: 50,
    textAlign: "center",
    paddingTop: "6%",
    paddingBottom: 0
  },
  normalText: {
    fontSize: 25
  },
  titleText: {
    fontSize: 30,
    textAlign: "center",
  },
  hr: {
    borderBottomColor: "black",
    borderBottomWidth: 1,
    paddingBottom: "1%"
  }
});
