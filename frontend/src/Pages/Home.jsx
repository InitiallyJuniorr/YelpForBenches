import React from "react"
import '../Components/components.css'
import { NavBar } from '../Components/Navbar.jsx'
import gang from '../assets/gang.png'


export function Home()
{
    return(
    <>
        <NavBar/>
        <div style={{paddingTop: '161px', display: 'grid', justifyContent: 'center', textAlign: 'right'}}/>
            {/* adds padding */}
            {/* <div style={{paddingTop: '435px'}}/> */}
            {/* <h2 style={{textAlign: 'center'}}>FYI This is Home</h2> */}
            <h1>Find your next Benchmark</h1>
            <img src={gang} alt="" style={{height: '53%', width: '53%', margin: '0', padding: '0'}}/>
      
            {/* placehodler text to test navbar's fixed position
            <p1 style={{fontSize:'50px'}}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas velit, laudantium corrupti magni eaque assumenda, vero, pariatur maxime dignissimos qui possimus accusantium. Quasi doloribus ipsa ratione maiores maxime cumque aut!</p1>

            {/* <RevButton>Make a Review</RevButton> */}
            
            <div className="homedivider"/>
            {/* <p1>Work in Progress</p1> */}

            {/* placehodler text to test navbar's fixed position */}
            {/* <p1 style={{fontSize:'50px'}}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas velit, laudantium corrupti magni eaque assumenda, vero, pariatur maxime dignissimos qui possimus accusantium. Quasi doloribus ipsa ratione maiores maxime cumque aut!</p1>
            <p1 style={{fontSize:'50px'}}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas velit, laudantium corrupti magni eaque assumenda, vero, pariatur maxime dignissimos qui possimus accusantium. Quasi doloribus ipsa ratione maiores maxime cumque aut!</p1>
            <p1 style={{fontSize:'50px'}}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas velit, laudantium corrupti magni eaque assumenda, vero, pariatur maxime dignissimos qui possimus accusantium. Quasi doloribus ipsa ratione maiores maxime cumque aut!</p1>
            <p1 style={{fontSize:'50px'}}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas velit, laudantium corrupti magni eaque assumenda, vero, pariatur maxime dignissimos qui possimus accusantium. Quasi doloribus ipsa ratione maiores maxime cumque aut!</p1>
            <p1 style={{fontSize:'50px'}}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas velit, laudantium corrupti magni eaque assumenda, vero, pariatur maxime dignissimos qui possimus accusantium. Quasi doloribus ipsa ratione maiores maxime cumque aut!</p1>
            <p1 style={{fontSize:'50px'}}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas velit, laudantium corrupti magni eaque assumenda, vero, pariatur maxime dignissimos qui possimus accusantium. Quasi doloribus ipsa ratione maiores maxime cumque aut!</p1>
            <p1 style={{fontSize:'50px'}}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas velit, laudantium corrupti magni eaque assumenda, vero, pariatur maxime dignissimos qui possimus accusantium. Quasi doloribus ipsa ratione maiores maxime cumque aut!</p1>
            */}
           
            <div className="bottomtab"/>
    </>
    )
}