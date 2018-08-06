import React from 'react';
import {ScrollView,StyleSheet,TouchableOpacity,Text,View} from 'react-native';
import sha256 from 'crypto-js/sha256'

export default class App extends React.Component {
  constructor() {
    super();
    this.httpDevice = new HTTPDevice();
    this.state = {
      component: "QueuePage",
      path: [],
      items: [],
      nextComponent: ""
    }
  }
  render() {
    if ( this.state.component == "MainPage" ) {
      return (
        <View>
          <MainPage
            path={this.state.path}
            items={this.state.items}
            nextComponent={this.state.nextComponent}
            setParam={this._setParam.bind(this)}
            httpDevice={this.httpDevice}
          />
        </View>
      );
    } else if ( this.state.component == "NavigationPage" ) {
      return (
        <ScrollView>
          <NavigationPage
            path={this.state.path}
            items={this.state.items}
            nextComponent={this.state.nextComponent}
            setParam={this._setParam.bind(this)}
            httpDevice={this.httpDevice}
          />
        </ScrollView>
      );
    } else if ( this.state.component == "MusicSelectPage" ) {
      return (
        <ScrollView>
          <MusicSelectPage
            path={this.state.path}
            items={this.state.items}
            nextComponent={this.state.nextComponent}
            setParam={this._setParam.bind(this)}
            httpDevice={this.httpDevice}
          />
        </ScrollView>
      );
    } else if ( this.state.component == "PhotoSelectPage" ) {
      return (
        <View>
          <PhotoSelectPage
            path={this.state.path}
            items={this.state.items}
            nextComponent={this.state.nextComponent}
            setParam={this._setParam.bind(this)}
            httpDevice={this.httpDevice}
          />
        </View>
      );
    } else if ( this.state.component == "QueuePage" ) {
      return (
        <ScrollView>
          <QueuePage
            path={this.state.path}
            items={this.state.items}
            nextComponent={this.state.nextComponent}
            setParam={this._setParam.bind(this)}
            httpDevice={this.httpDevice}
          />
        </ScrollView>
      )
    }
  }
  _setParam(param,value) {
    var obj = {};
    obj[param] = value;
    this.setState(obj);
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

class Button extends React.Component {
  render() {
    return (
      <TouchableOpacity onPress={this.props.onPress} style={styles.fullWidth}>
        <Text style={this.props.style}>{this.props.text}</Text>
      </TouchableOpacity>
    );
  }
}

class MainPage extends React.Component {
  constructor() {
    super();
  }
  render() {
    return (
      <View>
        <Title text="Home" />
        <Text>{"\n"}</Text>
        <Button
          text="Music"
          onPress={_ => this._openPage("music","MusicSelectPage",true)}
          style={styles.blueText}
        />
        <Button
          text="Photos"
          onPress={_ => this._openPage("photos","PhotoSelectPage",true)}
          style={styles.blueText}
        />
        <Button
          text="Web"
          onPress={_ => this._openPage("web","WebSelectPage",false)}
          style={styles.blueText}
        />
        <Button
          text="Queue"
          onPress={_ => this._openPage("queue","QueuePage",false)}
          style={styles.blueText}
        />
        <Text>{`\nCurrently connected with ID ${this.props.httpDevice.connectionID}`}</Text>
      </View>
    );
  }
  _openPage(page,componentName,navPage) {
    this.props.setParam("nextComponent",componentName);
    this.props.setParam("path",[page]);
    this.props.setParam("component",navPage ? "NavigationPage" : componentName);
  }
}

class NavigationPage extends React.Component {
  constructor() {
    super();
  }
  componentWillMount() {
    this.props.httpDevice.transmit(`LIST /${this.props.path.join("/")}`,output => {
      this.props.setParam("items",output);
    });
  }
  render() {
    var path = capitalizeFirstLetter(this.props.path.join("/"));
    return (
      <View>
        <Title text={path} />
        {
          this.props.items.map((item,index) => (
            <Button
              text={item}
              onPress={_ => this._moveForward(item)} style={styles.blueText}
              key={sha256(item).toString()}
            />
          ))
        }
        <Text>{"\n"}</Text>
      </View>
    );
  }
  _moveForward(item) {
    this.props.httpDevice.transmit(`TYPE /${this.props.path.join("/")}`,output => {
      this.props.path.push(item);
      if ( output == "directory" ) {
        this.props.httpDevice.transmit(`LIST /${this.props.path.join("/")}`,output => {
          this.props.setParam("items",output);
          this.props.setParam("path",this.props.path);
        });
      } else {
        this.props.setParam("component",this.props.nextComponent);
      }
    });
  }
}

class MusicSelectPage extends React.Component {
  constructor() {
    super();
    this.state = {
      selected: []
    }
    this.hasAddedToQueue = false;
  }
  componentWillMount() {
    this.props.httpDevice.transmit(`LIST /${this.props.path.join("/")}`,output => {
      this.props.setParam("items",output);
    });
  }
  render() {
    var path = capitalizeFirstLetter(this.props.path.join("/"));
    return (
      <View>
        <Title text={path} />
        {
          this.props.items.map((item,index) => (
            <Button
              text={item}
              onPress={_ => this._toggleItem(index)}
              style={this.state.selected.indexOf(index) > -1 ? styles.greenText : styles.blueText}
              key={sha256(item).toString()}
            />
          ))
        }
        <View style={styles.hr} />
        <Button
          text={capitalizeFirstLetter(this._getState()) + " All"}
          onPress={_ => this._toggleAll()}
          style={styles.normalText}
        />
        <Button
          text="Add To Queue"
          onPress={_ => this._addToQueue()}
          style={styles.normalText}
        />
      </View>
    );
  }
  _toggleItem(index) {
    if ( this.state.selected.indexOf(index) > -1 ) {
      this.setState({
        selected: this.state.selected.filter(item => item != index)
      });
    } else {
      this.setState({
        selected: this.state.selected.concat([index])
      });
    }
  }
  _toggleAll() {
    if ( this._getState() == "select" ) {
      this.setState({
        selected: "x".repeat(this.props.items.length).split("").map((item,index) => index)
      });
    } else {
      this.setState({
        selected: []
      });
    }
  }
  _getState() {
    for ( var i = 0; i < this.props.items.length; i++ ) {
      if ( this.state.selected.indexOf(i) <= -1 ) return "select";
    }
    return "deselect";
  }
  _addToQueue() {
    if ( this.hasAddedToQueue ) return;
    this.hasAddedToQueue = true;
    this.props.httpDevice.transmit(`ADDTQ /${this.props.path.join("/")} ${this.state.selected.sort((a,b) => a - b).map(item => this.props.items[item]).join(" ")}`,output => {
      this.props.setParam("component","MainPage");
    });
  }
}

class PhotoSelectPage extends React.Component {
  constructor() {
    super();
    this.state = {
      picName: null,
      warnMode: 0
    }
  }
  componentWillMount() {
    this.props.httpDevice.transmit(`OPENP /${this.props.path.join("/")}`,output => {
      this.setState({
        picName: output
      });
    });
  }
  render() {
    var path = capitalizeFirstLetter(this.props.path.join("/"));
    return (
      <View>
        <Title text={path} />
        <View>
          <Text>{"\n"}</Text>
          <Button
            text={"\u25c0"}
            onPress={_ => this._movePicture("left")}
            style={styles.largeText}
          />
          <Text style={styles.largeText}>{this.state.picName}</Text>
          <Button
            text={"\u25b6"}
            onPress={_ => this._movePicture("right")}
            style={styles.largeText}
          />
          <Text style={styles.smallWarning}>{`\n${["First Picture","","Last Picture"][this.state.warnMode + 1]}`}</Text>
        </View>
      </View>
    );
  }
  _movePicture(direction) {
    if ( direction == "left" ) {
      this.props.httpDevice.transmit("PREVP",output => {
        var warnMode = 0;
        if ( output.endsWith("_first") ) {
          output = output.slice(0,-6);
          warnMode = -1;
        }
        this.setState({
          picName: output,
          warnMode: warnMode
        });
      });
    } else {
      this.props.httpDevice.transmit("NEXTP",output => {
        var warnMode = 0;
        if ( output.endsWith("_last") ) {
          output = output.slice(0,-5);
          warnMode = 1;
        }
        this.setState({
          picName: output,
          warnMode: warnMode
        });
      });
    }
  }
}

class QueuePage extends React.Component {
  constructor() {
    super();
    this.state = {
      playing: null,
      queue: []
    }
  }
  componentWillMount() {
    this.props.httpDevice.transmit("GETQ",output => {
      this.setState({
        playing: output[0] == "playing",
        queue: output.slice(1)
      });
    });
  }
  render() {
    return (
      <View>
        <Text style={styles.bigText}>MediaPlayer2</Text>
        <Text style={styles.titleText}>Now Playing: {this.state.queue[0] || "Nothing!"}</Text>
        <View style={styles.buttonPanel}>
          <TouchableOpacity style={styles.thirdButton} onPress={_ =>     this.props.httpDevice.transmit("RWIND",Function.prototype)}>
            <Text style={styles.titleText}>{"\u23ea"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.thirdButton} onPress={_ => this._togglePlay()}>
            <Text style={styles.boldCenterText}>{this.state.playing ? "||" : "\u25b6"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.thirdButton} onPress={_ => this._mapCommandToQueue("PNSNG")}>
            <Text style={styles.titleText}>{"\u23e9"}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonPanel}>
          <TouchableOpacity style={styles.thirdButton} onPress={_ => this._mapCommandToQueue("SHFLQ")}>
            <Text style={styles.titleText}>{"\ud83d\udd00"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.thirdButton} onPress={_ => this._mapCommandToQueue("CLRQ")}>
            <Text style={styles.redCenterText}>X</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.thirdButton} onPress={Function.prototype}>
            <Text style={styles.titleText}>Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.hr} />
        <Text style={styles.normalText}>This is the Queue</Text>
      </View>
    );
  }
  _togglePlay() {
    this.props.httpDevice.transmit("PLYPS",output => {
      this.setState({
        playing: ! this.state.playing
      });
    });
  }
  _mapCommandToQueue(command) {
    this.props.httpDevice.transmit(command,output => {
      this.setState({
        queue: output.slice(1)
      });
    });
  }
}

class HTTPDevice { // mock device ONLY
  constructor() {
    this.connectionID = 91823;
    this.readyTick = 0;
    setInterval(_ => {
      this.readyTick = Math.max(this.readyTick - 1,0);
    },1);
    this._picIndex = 0;
    this._playingState = true;
    this._queue = ["somewhere/song_playing","somewhere/song1","somewhere_else/song2","somewhere/song3"];
  }
  transmit(message,callback) {
    message = message.split(" ");
    if ( message[0] == "LIST" ) {
      callback(["foldera","folderb","folderc","folderd"]);
    } else if ( message[0] == "TYPE" ) {
      callback("file");
    } else if ( message[0] == "ADDTQ" && this.readyTick <= 0 ) {
      this.readyTick = 100;
      callback("ok");
    } else if ( message[0] == "OPENP" ) {
      callback("0.JPG");
    } else if ( message[0] == "PREVP" ) {
      this._picIndex--;
      callback(this._picIndex + ".JPG" + (this._picIndex == 0 ? "_first" : ""));
    } else if ( message[0] == "NEXTP" ) {
      this._picIndex++;
      callback(this._picIndex + ".JPG" + (this._picIndex == 10 ? "_last" : ""));
    } else if ( message[0] == "GETQ" ) {
      callback([this._playingState ? "playing" : "paused"].concat(this._queue));
    } else if ( message[0] == "PLYPS" ) {
      this._playingState = ! this._playingState;
      callback("ok");
    } else if ( message[0] == "PNSNG" ) {
      this._queue = this._queue.slice(1);
      callback([this._playingState ? "playing" : "paused"].concat(this._queue));
    } else if ( message[0] == "RWIND" ) {
      callback("ok");
    } else if ( message[0] == "CLRQ" ) {
      this._queue = [];
      callback([this._playingState ? "playing" : "paused"].concat(this._queue));
    } else if ( message[0] == "SHFLQ" ) {
      // doesn't need to be implemented here
      this._queue.push("just/been/shuffled");
      callback([this._playingState ? "playing" : "paused"].concat(this._queue));
    }
  }
}

function capitalizeFirstLetter(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
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
  redCenterText: {
    fontSize: 25,
    color: "red",
    textAlign: "center"
  },
  thirdButton: {
    width: "33%"
  },
  buttonPanel: {
    flexDirection: "row"
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
