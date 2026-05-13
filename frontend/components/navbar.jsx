import React from "react";
import { Link } from "react-router-dom"
import "./components.css"

export const NavBar = () =>
{
    return (
        <>
            <nav className="navbar">
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li>
                        text
                    </li>
                </ul>

            </nav>
        </>
    )
}