import { motion } from "motion/react";
import React from "react";
import './components.css'
import {useState} from 'react'

// PLACEHOLDER
import toby from '../assets/toby.png';


export default function Card({
    Name,
    stiffness = 200,
    damping = 15,
    outline = '#3D77BF',
    info = 'NULL',
    
    
})
{
    const [flipped, setFlipped] = useState(false);
    
    
    
    return(
        <motion.button
            className = "card"
            animate={{ rotateY: flipped ? 180 : 0 }}
            whileHover={{
                scale: 1.05, y: -2,
                outlineWidth: "4px",
                outlineStyle: "solid",
                outlineColor: outline,
                outlineOffset: "0px"
            }}
            whileTap={{ y: 1}}
            transition={{type: "spring", stiffness, damping, ease: "easeInOut"}}
            onClick={() => setFlipped(!flipped)}
        >

        {/* front side of the card is here */}
            {!flipped &&(
                <div style={{display: 'grid', justifyContent: 'center', alignContent: 'center'}}>
                    <h1 style={{fontSize: '35px'}}>{Name}</h1>
                    
                </div>
            )
            }
        
        {/* card is flipped here */}
        {flipped &&(
        <div style={{transform: 'rotateY(180deg)'}}>
            <p>{info}</p>
            
        </div>
        )
        }
        </motion.button>
    )
}

