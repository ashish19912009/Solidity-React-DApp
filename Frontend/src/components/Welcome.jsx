import React,{useContext, useEffect} from 'react';
import {AiFillPlayCircle} from 'react-icons/ai';
import {SiEthereum} from 'react-icons/si';
import {BsInfoCircle} from 'react-icons/bs';

import {UserContext} from '../context/userContext';
import Loader from './Loader';
import {shortenAddress} from '../utils/shortenAddress';

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

const Welcome = () => {
    const {isUserRegistered, userSignup, currentAccount, connectWallet, formData, handleChange, isLoading} = useContext(UserContext);

    const onSubmit = (e) => {
      const {userName, age, mobileNo} = formData; 
      e.preventDefault();

      if(!userName || !age || !mobileNo){
        alert("No User details found")
      }

      userSignup();
    }

    useEffect(()=>{
        //console.log("isUserRegistered",isUserRegistered);
    },[isUserRegistered])
    return (
        <div className='flex w-full justify-center items-center'>
            <div className='flex mf:flex-row flex-col items-start justify-between md:p-20 py-12 px-4'>
                <div className='flex flex-1 justify-start flex-col mf:mr-10'>
                <h1 className='text-2xl sm:text-5xl text-white text-gradient py-1'>Lotto365</h1>
                    <h1 className='text-3xl sm:text-5xl text-white text-gradient py-1'>Play anywhere, anytime.</h1>
                    <p className='text-left mt-5 text-white font-light md:w-9/12 w-11/12 text-base'>
                        Explore the luck world. Buy lottery online on Lotto365 and bet on your luck today.
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
                    <div className='grid sm:grid-cols-3 grid-cols-2 w-full mt-10'>
                        <div className={`rounded-tl-2xl ${commonStyle}`}>
                            Trustworthy
                        </div>
                        <div className={commonStyle}>Security</div>
                        <div className={`rounded-tr-2xl ${commonStyle}`}>Ethereum</div>
                        <div className={`rounded-bl-2xl ${commonStyle}`}>Web 3.0</div>
                        <div className={commonStyle}>Low Fees</div>
                        <div className={`rounded-br-2xl ${commonStyle}`}>Blockchain</div>
                    </div>
                </div>
                {
                    !isUserRegistered && (
                        <div className='flex flex-col flex-1 items-center justify-start w-full mf:mt-0 mt-10'>
                
                    <h3 className='text-2xl sm:text-5xl text-white py-3'>Register to Play</h3>
                        <div className='p-5 sw:w-96 w-full flex flex-col justify-start items-cetner blue-glassmorphism'>
                            <Input placeholder='User Name' name="userName" type="text" handleChange={handleChange} />
                            <Input placeholder='Age' name="age" type="number" handleChange={handleChange} />
                            <Input placeholder='Mobile No' name="mobileNo" type="number" handleChange={handleChange} />
                            
                            <div className='h-[1px] w-full bg-gray-400 my-2' />
                            {isLoading ? (<Loader/>) : (
                            <button
                            className='text-white w-full mt-2 border-[1px] p-2 border-[#3d4f7c] rounded-full cursor-pointer'
                            type="button" 
                            onClick={onSubmit}>
                                Sign Up
                            </button>)}
                        </div>  
            
                    </div>
                    )}
            </div>
        </div>
    )
}

export default Welcome;