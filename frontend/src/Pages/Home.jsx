import React from "react"
import '../Components/components.css'
import { NavBar } from '../Components/Navbar.jsx'
import gang from '../assets/gang.png'
import bench from '../assets/bench.png'
import { motion } from 'motion/react'
import Card from '../Components/card.jsx'


export function Home()
{
    return(
    <>
        <NavBar/>
        <div style={{paddingTop: '161px', display: 'grid', justifyContent: 'center', textAlign: 'right'}}/> 
{/* Hero Text */}
            <motion.div
                initial={{opacity:0,  y:  -40}} 
                animate={{opacity:1, y: 0}}
                transition={{duration: 0.5, ease: 'easeInOut' }}
            >
                <h1 style={{fontSize: '50px'}}>Find your next Benchmark</h1>
            </motion.div>
{/* Hero Image */}
            <motion.div
              initial={{opacity:0,  y:  40}} 
              animate={{opacity:1, y: 0}}
              transition={{duration: 0.5, ease: 'easeInOut' }}
            >
                <img src={gang} alt="" style={{height: '53%', width: '53%', margin: '0', padding: '0'}}/>
            </motion.div>
{/* About Benches Flip-Able Cards */}
            <div className="homedividertwo"/>
            <h1 style={{fontSize: '50px'}}>About Benches</h1>
            <div style={{alignItems: 'center', display: 'flex', justifyContent: 'center', gap: '30px'}}>
                <Card Name="Bench Definition" info="A bench is a long seat designed for multiple people to sit on at once. It is typically made of wood, metal, or stone and can be with or without a backrest. (Oxford English Dictionary)">

                </Card>
                <Card Name="Bench Origins" info="The bench dates back to antiquity, with early roots in ancient civilizations like Rome and the Frankish Empire. Originally serving as communal seating, sleeping, and dining surfaces, it predates the single-occupancy chair, which was historically reserved for society's elite. Benches were never invented by a single person; rather, they evolved naturally from the earliest human needs. As one of the oldest forms of furniture, simple stone and wooden benches have been used by civilizations since around 3000 BCE in Ancient Egypt and Greece."/>
                <Card Name="Bench Fun Facts" info="In Geneva Switzerland, you can find a 120m long bench along Promenade de la Treille. Arguably noted as the world's longest bench, it is a popular tourist attraction."/>
            </div>
            <div style={{padding: "40px"}}/>
{/* Footer */}
            <div className="homedivider" style={{alignContent: 'left', alignItems: 'left'}}>
                <div style={{display: 'flex'}}>
                <img src={bench} alt="" style={{height: '53%', width: '53%', margin: '0', padding: '0', alignItems:'center'}}/>
                <div>
                    <p1>Benchmark @2026</p1>
                    <br/>
                    <p1>Created by</p1>
                    <br/>
                    <p1>Mark Burenko</p1>
                    <br/>
                    <p1>Jamey Rimawi</p1>
                    <br/>
                    <p1>Elise Chee</p1>
                    <br/>
                    <p1>Sophia Kim</p1>
                </div>

                </div>
            </div>
           
            
    </>
    )
}
/*
In Geneva Switzerland, you can find a 120m long bench along Promenade de la Treille. Arguably noted as the world's longest bench, it is a popular tourist attraction. 

*/