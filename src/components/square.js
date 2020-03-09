import React from 'react';

class square extends React.Component {

    constructor(props){
        super(props);
  
        this.state = {
            value: props.value,
            selected : false,
            x : props.x,
            y : props.y,
            sendSelection : props.sendSelection.bind(this),
            king : props.king
        };
    }

    select = async () =>{
      this.setState({selected:true});
      this.state.sendSelection(this.state.x,this.state.y);
    }

    renderPiece = () => {
      
      if(this.state.king ===  true){
        return this.state.value === "r" ? "R" : "W";
      }else{
        return this.state.value;
      }
    }


    render() {
      return (
        <button className="square" 
        onClick={this.select}
        >
          {this.renderPiece()}
    
        </button>
      );
    }
} 

export default square;