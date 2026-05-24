import { Link } from "react-router-dom"
import "./components.css"
import React from "react"

export const NavBar = () => {
    return(
        <>
        <nav className="navbar">
            <ul>
                <li><Link to="/home">Home</Link></li>
                {/* PLACEHOLDER */}
                <li><Link to="/app">Map</Link></li>
            
            </ul>
        </nav>
        </>
    )
}