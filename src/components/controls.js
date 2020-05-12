import React from 'react'

class controls extends React.Component{

    render(){
        return(
       <nav className = "float-left text-center ml-5">
           <div>
            <button
            className = {"btn btn-danger font-weight-bold text-dark m-2"}
            >
               RESET
            </button>
           </div>
       </nav>
        )
    }

}

export default controls
