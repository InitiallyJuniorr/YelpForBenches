import { Link } from "react-router-dom"
import "./components.css"
import React from "react"

export const NavBar = () => {
    return(
        <>
        <nav className="navbar">
            <ul>
                <li><Link to="/home">Home</Link></li>
                <li><Link to="/app">Map</Link></li>
                <li><Link to="/profile">Profile</Link></li>
            
            </ul>
        </nav>
        </>
    )
}