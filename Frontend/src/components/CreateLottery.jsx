import React,{useContext} from 'react';
import {LotteryContext} from '../context/LotteryContext';
import Loader from './Loader';

const Input = ({placeholder, name, type, value, handleChange}) => (
    <input
        placeholder={placeholder}
        type={type}
        step="0.0001"
        value={value}
        onChange={(e)=> handleChange(e,name)}
        className="my-2 w-full rounded-sm p-2 outline-none bg-transparent text-white text-sm white-glassmorphism"
    />
)

const createLottery = () => {
    const {formData, creatLotteryTicket, handleChange, isLoading} = useContext(LotteryContext);

    const onSubmit = (e) => {
      const {lotteryName, startDate, endDate, drawDate, ticketPrice} = formData; 
      e.preventDefault();

      if(!lotteryName || !startDate || !endDate || !drawDate || !ticketPrice){
        alert("No lottery details found")
      }

      creatLotteryTicket();
    }
    return (
        <div className='flex flex-col flex-1 items-center justify-start w-full mf:mt-0 mt-10'>
                
             <h3 className='text-2xl sm:text-5xl text-white py-3'>Register to Play</h3>
                <div className='p-5 sw:w-96 w-full flex flex-col justify-start items-cetner blue-glassmorphism'>
                    <Input placeholder='Lottery Name' name="lotteryName" type="text" handleChange={handleChange} />
                    <Input placeholder='Start Date' name="startDate" type="datetime-local" handleChange={handleChange} />
                    <Input placeholder='End Date' name="endDate" type="datetime-local" handleChange={handleChange} />
                    <Input placeholder='Draw Date' name="drawDate" type="datetime-local" handleChange={handleChange} />
                    <Input placeholder='Ticket Price' name="ticketPrice" type="text" handleChange={handleChange} />

                    <div className='h-[1px] w-full bg-gray-400 my-2' />
                    {isLoading ? (<Loader/>) : (
                    <button
                    className='text-white w-full mt-2 border-[1px] p-2 border-[#3d4f7c] rounded-full cursor-pointer'
                    type="button" 
                    onClick={onSubmit}>
                        Create Now
                    </button>)}
                </div>  

            </div>
    )
}

export default createLottery;