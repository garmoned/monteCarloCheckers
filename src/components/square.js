import React from 'react';

class square extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
      selected: props.selected,
      x: props.x,
      y: props.y,
      sendSelection: props.sendSelection.bind(this),
      king: props.king,
      playerColor: props.playerColor
    };
  }

  select = async () => {
      if(this.state.value === this.state.playerColor || this.state.value === null)
      this.state.sendSelection(this.state.x, this.state.y);
  }

  renderPiece = () => {

    return <span className={this.state.value}>{this.renderking()}</span>
  }

  renderking = () => {
    if (this.state.king == true) {
      return "K"
    }
  }

  render() {

    let className = this.state.selected;

    return (
      <button className={"square " + className}
        onClick={this.select}
      >
        {this.renderPiece()}

      </button>
    );
  }
}

export default square;