"use client"
import { ShoppingBag } from "@mui/icons-material"
const SecondCard = () =>{
    return(
        <>
        <div className="ring  flex  ring-gray-200 p-4 rounded  bg-white">
        <div className="w-full grid grid-rows-2">
            <div className=" h-full">
                     <ShoppingBag className="text-orange-400  text-xl" />
            </div>
            <div>
                     <h1>Weekly Sales</h1>
                     <p className="text-2xl font-black">5,000,000</p>
                 </div>
           
        </div>
            
        <div className="w-full flex justify-end items-end">
            <button>Sales</button>
        </div>

         </div>
        </>
    )
}

export default SecondCard



//                     


//  