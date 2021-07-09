import Board from "./board"
import Controls from "./controls"
import React from "react"
import controls from "./controls";

class App extends React.Component {
    constructor() {
        super();

        this.state = {

        }

    }

    render() {
        return (
            <div>
                <div className="game" >
                    <Board />
                </div>

            </div>

        )
    }
}

export default App;
