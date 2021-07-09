import React from 'react'

class controls extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            threads : 10,
            iterations : 1000,
        }
    }

    readThreads(input){

        this.setState({threads:input.target.value})
        this.props.getThreads(input.target.value)
    }

    readIterations(input){

        this.setState({iterations:input.target.value})

        this.props.getIterations(input.target.value)

    }


    render(){
        return(
       <div style={{display:"flex", flexDirection:"column", justifyContent:"center" ,width:"60px"}}>
           <input onInput={this.readThreads.bind(this)} value={this.state.threads} type="number" id = "threads" min='1'/>
           <label htmlFor="threads">Threads</label>

           <input onInput={this.readIterations.bind(this)} value={this.state.iterations} type="number" id="Iterations" min='1'/>
           <label htmlFor="threads">Iterations</label>

           <button onClick={this.props.reset}>reset</button>
       </div>
        )
    }

}

export default controls
