import React from 'react'
import './fooLogin.css'
import '../Components/components.css'


export default function LoginFoo() {
    return(
        <>
        <div style={{justifyContent: 'right', display: 'flex'}}>
        <div className="loginCard" style={{paddingTop: '8%'}}>
            <h1>BenchMark</h1>
            <p1>In a world of Benches, be sure to find the right one for you.</p1>
            <button className="button">Login</button>
        </div>
        </div>

        </>
    )
}
