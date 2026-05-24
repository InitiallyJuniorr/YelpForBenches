import { Link } from "react-router-dom"
import "./components.css"
import React from "react"

export const NavBar = () => {
    return(
        <>
        <nav className="navbar">
            <ul>
                <li><Link to="/Home">Home</Link></li>
            </ul>
        </nav>
        </>
    )
}