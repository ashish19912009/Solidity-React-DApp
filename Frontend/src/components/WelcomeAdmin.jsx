import React,{useContext} from 'react';
import {AiFillPlayCircle} from 'react-icons/ai';
import {SiEthereum} from 'react-icons/si';
import {BsInfoCircle} from 'react-icons/bs';

import {LotteryContext} from '../context/lotteryContext';
import Loader from './Loader';
import {shortenAddress} from '../utils/shortenAddress';
import CreateLottery from './CreateLottery';
import UserSignUp from './CreateUser';

const commonStyle = "min-h-[70px] sm:px-0 px-2 sm:min-w-[120px] flex justify-center items-center border-[0.5px] border-gray- 400 text-white";

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

const Welcome = ({formType}) => {
    const {connectWallet, currentAccount,formData, creatLotteryTicket, handleChange, isLoading} = useContext(LotteryContext);

    const onSubmit = (e) => {
      const {lotteryName, startDate, endDate, drawDate, ticketPrice} = formData; 
      e.preventDefault();

      if(!lotteryName || !startDate || !endDate || !drawDate || !ticketPrice){
        alert("No lottery details found")
      }

      creatLotteryTicket();
    }
    return (
        <React.Fragment>
        <div className='flex w-full justify-center items-center'>
            <div className='flex mf:flex-row flex-col items-start justify-between md:p-20 py-12 px-4'>
                <div className='flex flex-1 justify-start flex-col mf:mr-10'>
                <h1 className='text-2xl sm:text-5xl text-white py-1'>Welcome Admin</h1>
                    <p className='text-left mt-5 text-white font-light md:w-9/12 w-11/12 text-base'>
                        Create, View and manage lottery
                    </p>
                    {
                        !currentAccount && <button
                        type='button'
                        onClick={connectWallet}
                        className='flex flex-row justify-center items-center my-5 bg-[#2952e3] p-3 rounded-full cursor-pointer hover:bg[#2546bd]'
                        >
                        <p className='text-white text-base font-semibold'>Connect Wallet</p>
                        </button>
                    }
                </div>
            </div>
        </div>
        <div className='flex w-full justify-center items-center'>
        <div className='flex mf:flex-row flex-col items-start justify-between md:p-20 py-12 px-4'>
        <h3 className='text-2xl sm:text-5xl text-white py-3 mt-20'>Create Lottery</h3>
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
        </div>
        </React.Fragment>
    )
}

export default Welcome;