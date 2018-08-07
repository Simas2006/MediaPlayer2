import {StyleSheet} from 'react-native'

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
  blueText: {
    fontSize: 25,
    color: "blue"
  },
  greenText: {
    fontSize: 25,
    color: "green"
  },
  smallWarning: {
    color: "red",
    textAlign: "center"
  },
  titleText: {
    fontSize: 25,
    textAlign: "center",
  },
  largeText: {
    fontSize: 40,
    textAlign: "center"
  },
  boldCenterText: {
    fontSize: 25,
    textAlign: "center",
    fontWeight: "bold"
  },
  blueCenterText: {
    fontSize: 25,
    color: "blue",
    textAlign: "center"
  },
  redCenterText: {
    fontSize: 25,
    color: "red",
    textAlign: "center"
  },
  inputBox: {
    width: "98%",
    fontSize: 25,
    borderWidth: 1,
    borderColor: "black"
  },
  redSmallText: {
    color: "red"
  },
  halfButton: {
    width: "50%"
  },
  thirdButton: {
    width: "33%"
  },
  quarterButton: {
    width: "25%"
  },
  buttonPanel: {
    flexDirection: "row"
  },
  centerItems: {
    alignItems: "center"
  },
  hr: {
    borderBottomColor: "black",
    borderBottomWidth: 1,
    paddingBottom: "1%"
  },
  fullWidth: {
    width: "100%"
  }
});

export default styles;
